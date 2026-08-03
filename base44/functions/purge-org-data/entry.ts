import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ============================================================
// purge-org-data — איפוס/מחיקת נתונים של מועדון או קבוצה בודדת.
// נגיש ל-admin בלבד. דורש אישור מילת קסם "DELETE".
// היקף:
//   club (club_id בלבד) — מוחק את כל נתוני הליגה/תחרויות/קבוצות/משחקים/טבלאות של המועדון.
//   team  (club_id + team_name) — מוחק נתוני קבוצה בודדת בלבד (משחקים, רישום ליגה, קבוצה, שורת טבלה).
// נתוני שחקנים (PlayerRegistration) אינם נמחקים בפעולה זו — ניתן למחוק שחקן ישירות מפאנל הניהול.
// כל פעולה נרשמת ביומן ביקורת (AuditLog).
// ============================================================

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — איפוס נתונים מותר לאדמין בלבד' }, { status: 403 });

    const { club_id, team_name, confirm } = body;
    if (!club_id) return Response.json({ error: 'נדרש club_id' }, { status: 400 });
    if (confirm !== 'DELETE') return Response.json({ error: 'נדרש אישור מילת קסם: confirm=DELETE' }, { status: 400 });

    const counts: Record<string, number> = {};

    if (team_name) {
      // ---- איפוס קבוצה בודדת בתוך מועדון ----
      const homeFx = await base44.entities.MatchFixture.filter({ club_id, home_team: team_name }, 'match_date', 500);
      const awayFx = await base44.entities.MatchFixture.filter({ club_id, away_team: team_name }, 'match_date', 500);
      const fxIds = [...new Set([...homeFx.map(f => f.id), ...awayFx.map(f => f.id)])];
      let dFx = 0; for (const id of fxIds) { try { await base44.entities.MatchFixture.delete(id); dFx++; } catch { /* ignore */ } }
      counts.fixtures = dFx;

      const lt = await base44.entities.LeagueTeam.filter({ club_id, team_name }, 'team_name', 200);
      let dLt = 0; for (const t of lt) { try { await base44.entities.LeagueTeam.delete(t.id); dLt++; } catch { /* ignore */ } }
      counts.leagueTeams = dLt;

      const teams = await base44.entities.Team.filter({ club_id, name: team_name }, 'name', 50);
      let dTeam = 0; for (const t of teams) { try { await base44.entities.Team.delete(t.id); dTeam++; } catch { /* ignore */ } }
      counts.teams = dTeam;

      const st = await base44.entities.LeagueStanding.filter({ club_id, team_name }, 'team_name', 50);
      let dSt = 0; for (const s of st) { try { await base44.entities.LeagueStanding.delete(s.id); dSt++; } catch { /* ignore */ } }
      counts.standings = dSt;
    } else {
      // ---- איפוס מלא של נתוני המועדון (ליגה/תחרויות/קבוצות/משחקים/טבלאות) ----
      let dFx = 0;
      try { const all = await base44.entities.MatchFixture.filter({ club_id }, 'match_date', 1000); for (const f of all) { try { await base44.entities.MatchFixture.delete(f.id); dFx++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.fixtures = dFx;

      let dLt = 0;
      try { const all = await base44.entities.LeagueTeam.filter({ club_id }, 'team_name', 500); for (const t of all) { try { await base44.entities.LeagueTeam.delete(t.id); dLt++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.leagueTeams = dLt;

      let dTeam = 0;
      try { const all = await base44.entities.Team.filter({ club_id }, 'name', 500); for (const t of all) { try { await base44.entities.Team.delete(t.id); dTeam++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.teams = dTeam;

      let dComp = 0;
      try { const all = await base44.entities.Competition.filter({ club_id }, '-created_date', 200); for (const c of all) { try { await base44.entities.Competition.delete(c.id); dComp++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.competitions = dComp;

      let dRules = 0;
      try { const all = await base44.entities.OrganizationLeagueRules.filter({ club_id }, '-created_date', 50); for (const r of all) { try { await base44.entities.OrganizationLeagueRules.delete(r.id); dRules++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.rules = dRules;

      let dSt = 0;
      try { const all = await base44.entities.LeagueStanding.filter({ club_id }, 'team_name', 200); for (const s of all) { try { await base44.entities.LeagueStanding.delete(s.id); dSt++; } catch { /* ignore */ } } } catch { /* ignore */ }
      counts.standings = dSt;
    }

    // ---- תיעוד ביומן ביקורת ----
    try {
      await base44.entities.AuditLog.create({
        actor_id: user.id,
        actor_name: user.full_name || '',
        actor_role: user.role,
        action: 'status_change',
        club_id,
        details: `איפוס נתונים (${team_name ? `קבוצה: ${team_name}` : 'מועדון מלא'}) · ${JSON.stringify(counts)}`,
      });
    } catch { /* תיעוד בלבד */ }

    return Response.json({ ok: true, scope: team_name ? 'team' : 'club', counts });
  } catch (error) {
    console.error('purge-org-data error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}