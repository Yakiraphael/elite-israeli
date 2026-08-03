import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateFixture, validateBatch, renderRefereeTemplate } from '../../shared/schedulingConflictEngine.ts';

// ============================================================
// fixtures-engine — מנוע לוחות זמנים ושיבוצי משחקים.
// פעולות (action): validate | create | update | import | assignReferee | list | export
// RBAC: יצירה/עריכה/ייבוא/שיבוץ שופט = director/admin בלבד. list/export = כל משתמש מאומת בתחום המועדון שלו (RLS מגן ברמת הישות).
// ============================================================

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const canManage = user.role === 'admin' || user.role === 'director';

    // ---------- validate (בדיקת התנגשויות טרם שמירה) ----------
    if (action === 'validate') {
      const fixture = body.fixture;
      const existing = await base44.entities.MatchFixture.filter(
        { club_id: fixture.club_id, status: 'SCHEDULED' },
        '-match_date', 500
      );
      const conflicts = validateFixture(fixture, existing, body.excludeId);
      return Response.json({ conflicts });
    }

    // ---------- create ----------
    if (action === 'create') {
      if (!canManage) return Response.json({ error: 'Forbidden — נדרש תפקיד מנהל מקצועי/אדמין' }, { status: 403 });
      const f = body.fixture;
      const existing = await base44.entities.MatchFixture.filter(
        { club_id: f.club_id, status: 'SCHEDULED' }, '-match_date', 500
      );
      const conflicts = validateFixture(f, existing);
      if (conflicts.length) {
        return Response.json({
          error: 'זוהו התנגשויות — המשחק לא נשמר',
          conflicts,
        }, { status: 409 });
      }
      const saved = await base44.entities.MatchFixture.create({
        ...f,
        status: 'SCHEDULED',
        referee_status: f.referee_assigned_id ? 'PENDING' : 'NOT_REQUIRED',
        last_conflict_check: JSON.stringify({ at: new Date().toISOString(), result: 'clean' }),
      });
      return Response.json({ fixture: saved });
    }

    // ---------- update (עדכון שעה/מגרש/תאריך עם בדיקת התנגשויות) ----------
    if (action === 'update') {
      if (!canManage) return Response.json({ error: 'Forbidden — נדרש תפקיד מנהל מקצועי/אדמין' }, { status: 403 });
      const f = body.fixture;
      const existing = await base44.entities.MatchFixture.filter(
        { club_id: f.club_id, status: 'SCHEDULED' }, '-match_date', 500
      );
      const conflicts = validateFixture(f, existing, f.id);
      if (conflicts.length) {
        return Response.json({
          error: 'זוהו התנגשויות — העדכון נחסם',
          conflicts,
        }, { status: 409 });
      }
      const updated = await base44.entities.MatchFixture.update(f.id, {
        ...f,
        last_conflict_check: JSON.stringify({ at: new Date().toISOString(), result: 'clean' }),
      });
      return Response.json({ fixture: updated });
    }

    // ---------- import (ייבוא קובץ חיצוני + מיפוי לסכמה) ----------
    if (action === 'import') {
      if (!canManage) return Response.json({ error: 'Forbidden — ייבוא מותר למנהל מקצועי/אדמין' }, { status: 403 });
      const { file_url, club_id, club_name } = body;
      if (!file_url) return Response.json({ error: 'נדרש file_url' }, { status: 400 });

      const extract = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  age_group: { type: 'string' },
                  home_team: { type: 'string' },
                  away_team: { type: 'string' },
                  match_date: { type: 'string' },
                  kickoff_time: { type: 'string' },
                  stadium_name: { type: 'string' },
                  competition: { type: 'string' },
                  round: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const rawRows: any[] = (extract.output && extract.output.rows) || [];
      const candidates = rawRows.map(r => ({
        ...r,
        club_id,
        club_name,
        status: 'SCHEDULED',
        referee_status: 'NOT_REQUIRED',
        import_source: 'Excel/CSV',
      }));

      const existing = await base44.entities.MatchFixture.filter({ club_id }, '-match_date', 500);
      const { valid, conflicts, duplicates } = validateBatch(candidates, existing);

      let created: any[] = [];
      if (valid.length) {
        created = await base44.entities.MatchFixture.bulkCreate(valid);
      }

      // תיעוד ביקורת
      if (user.id) {
        await base44.entities.AuditLog.create({
          actor_id: user.id,
          actor_name: user.full_name || '',
          actor_role: user.role,
          action: 'export_data',
          club_id,
          details: `ייבוא לו"ז: ${created.length} נשמרו, ${conflicts.length} נחסמו (התנגשויות), ${duplicates.length} כפילות.`,
        });
      }

      return Response.json({
        totalParsed: candidates.length,
        imported: created.length,
        blockedByConflict: conflicts.length,
        duplicates: duplicates.length,
        conflicts,
        duplicatesPreview: duplicates.slice(0, 20),
      });
    }

    // ---------- assignReferee (שליפת תבנית + יצירת זימון) ----------
    if (action === 'assignReferee') {
      if (!canManage) return Response.json({ error: 'Forbidden — שיבוץ שופט מותר למנהל מקצועי/אדמין' }, { status: 403 });
      const { fixture_id, referee_id, referee_name } = body;
      if (!fixture_id) return Response.json({ error: 'נדרש fixture_id' }, { status: 400 });

      const fx = await base44.entities.MatchFixture.get(fixture_id);
      if (!fx) return Response.json({ error: 'משחק לא נמצא' }, { status: 404 });

      const tpls = await base44.entities.RefereeInvitationTemplate.filter(
        { club_id: fx.club_id, is_active: true }, '-created_date', 1
      );
      const tpl = tpls[0] || null;
      const message = tpl ? renderRefereeTemplate(tpl.message_body, fx) : null;

      const updated = await base44.entities.MatchFixture.update(fixture_id, {
        referee_assigned_id: referee_id || null,
        referee_name: referee_name || '',
        referee_status: 'PENDING',
        referee_invited_at: new Date().toISOString(),
      });

      // תיעוד הזימון — השליחה בפועל לשופט נעשית בערוץ החיצוני של המועדון; כאן שומרים את נוסח הזימון וההיסטוריה.
      if (user.id) {
        await base44.entities.AuditLog.create({
          actor_id: user.id,
          actor_name: user.full_name || '',
          actor_role: user.role,
          action: 'status_change',
          club_id: fx.club_id,
          details: `זימון שופט ${referee_name || ''} למשחק ${fx.home_team} נגד ${fx.away_team} ב-${fx.match_date} ${fx.kickoff_time}.`,
        });
      }

      return Response.json({ fixture: updated, template: tpl, renderedMessage: message });
    }

    // ---------- list (לפי מועדון ואופציונלי שנתון; למאמן מחזיר רק את השנתונים שלו מול RLS) ----------
    if (action === 'list') {
      const { club_id, age_group } = body;
      const filter: any = { club_id };
      if (age_group) filter.age_group = age_group;
      const list = await base44.entities.MatchFixture.filter(filter, 'match_date', 500);
      return Response.json({ fixtures: list });
    }

    // ---------- export (מחזיר רשימה מסוננת; המסמך הסופי — PDF/Excel/ICS — נבנה בקליינט) ----------
    if (action === 'export') {
      if (!canManage) return Response.json({ error: 'Forbidden — ייצוא מותר למנהל מקצועי/אדמין' }, { status: 403 });
      const { club_id, age_group, from_date, to_date } = body;
      const filter: any = { club_id };
      if (age_group) filter.age_group = age_group;
      const list = await base44.entities.MatchFixture.filter(filter, 'match_date', 1000);
      const sliced = list.filter(f => {
        if (from_date && f.match_date < from_date) return false;
        if (to_date && f.match_date > to_date) return false;
        return true;
      });
      return Response.json({ fixtures: sliced });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('fixtures-engine error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}