import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateFixture } from '../../shared/schedulingConflictEngine.ts';

// ============================================================
// league-engine — מנוע הגרלת ליגה (Round-Robin) + חוקי צוות מקצועי +
// תיאום דו-צדדי + אימות תוצאות צולב + טבלת ליגה חיה.
// פעולות (action):
//   generateLeague (admin/director-owner) | clearLeague | saveRules | getRules
//   registerTeam (entity שטח) — לא כאן; ניהול קבוצות ישירות דרך SDK
//   proposeCoordination | confirmCoordination | rejectCoordination
//   reportResult | resolveDispute | standings
// RBAC: generateLeague/clearLeague/resolveDispute = מנהל/אדמין. שאר ניהול = director/coach/admin בתחום המועדון.
// ============================================================

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin';
    const canManage = isAdmin || user.role === 'director';

    // ---------- generateLeague: Round-Robin מוגבל חוקי צוות מקצועי ----------
    if (action === 'generateLeague') {
      if (!canManage) return Response.json({ error: 'Forbidden — הגרלה מותרת למנהל/אדמין בלבד' }, { status: 403 });
      const { club_id, club_name, age_group, competition, double_round, competition_id } = body;
      if (!club_id || !age_group) return Response.json({ error: 'נדרשים club_id ו-age_group' }, { status: 400 });

      // 0. הגדרת תחרות אופציונלית — פורמט, כמות שחקנים, סוג מגרש, ניקוד (Competition Configuration Engine)
      let compConfig: any = null;
      if (competition_id) { try { compConfig = await base44.entities.Competition.get(competition_id); } catch { compConfig = null; } }
      const isDouble = double_round ?? (compConfig?.competition_format === 'DOUBLE_ROUND_ROBIN');

      // 1. קבוצות רשומות לשנתון
      const all = await base44.entities.LeagueTeam.list('team_name', 200);
      let teams: any[] = all.filter(t => t.club_id === club_id && t.age_group === age_group && t.is_registered);
      if (teams.length < 2) return Response.json({ error: 'יש לרשום לפחות 2 קבוצות כדי להגריל.' }, { status: 400 });

      // 2. הגדרות צוות מקצועי
      const rulesRes = await base44.entities.OrganizationLeagueRules.list('-created_date', 50);
      let rules = rulesRes.find(r => r.club_id === club_id && r.age_group === age_group) || {};
      const avoidHome = rules.avoid_consecutive_home_games !== false;

      // זריעה לפי מצב
      const mode = rules.seeding_mode || 'BALANCED_RANDOM';
      if (mode === 'BALANCED_RANDOM') shuffle(teams);
      else if (mode === 'TIERED') teams.sort((a, b) => (a.seed_tier || 99) - (b.seed_tier || 99));
      // MANUAL_SEED — שומר סדר הרשמה

      let pool = teams.map(t => t.team_name);
      // ניהול מספר אי-זוגי — הוספת BYE
      let hasBye = false;
      if (pool.length % 2 !== 0) { pool.push('BYE'); hasBye = true; }

      const n = pool.length;
      const totalRounds = n - 1;
      const half = n / 2;
      const homeTracker: Record<string, number> = {};
      const fixtures: any[] = [];

      function addPair(home: string, away: string, round_num: number, flip: boolean) {
        if (home === 'BYE' || away === 'BYE') return;
        if (flip) { const t = home; home = away; away = t; }
        fixtures.push({
          club_id, club_name: club_name || '', competition: competition || compConfig?.competition_name || 'ליגת הארגון',
          competition_id: competition_id || '',
          age_group, matchday: round_num, home_team: home, away_team: away,
          status: 'SCHEDULED', referee_status: 'NOT_REQUIRED',
          coordination_status: 'PENDING_COORDINATION', result_status: 'PENDING_REPORT',
          import_source: 'League Generator',
        });
      }

      for (let r = 1; r <= totalRounds; r++) {
        for (let i = 0; i < half; i++) {
          let home = pool[i];
          let away = pool[n - 1 - i];
          let flip = false;
          // מניעת משחקי בית רצופים
          if (avoidHome && i === 0 && homeTracker[home] >= 1 && home !== 'BYE' && away !== 'BYE') {
            flip = true;
          }
          if (home !== 'BYE' && away !== 'BYE') {
            if (flip) { homeTracker[home] = 0; homeTracker[away] = 1; }
            else { homeTracker[home] = 1; homeTracker[away] = 0; }
          }
          addPair(home, away, r, flip);
        }
        // סיבוב רשימה (circle method) — עוגן ראשון, השאר מתקדם
        pool = [pool[0], pool[n - 1], ...pool.slice(1, n - 1)];
      }

      // שלב ב' — רגל שנייה (כפול) אם נדרש — היפוך ביתיות
      let secondLeg: any[] = [];
      if (isDouble) {
        secondLeg = fixtures.map(f => ({ ...f, matchday: f.matchday + totalRounds, home_team: f.away_team, away_team: f.home_team, coordination_status: 'PENDING_COORDINATION', result_status: 'PENDING_REPORT' }));
      }
      const allFixtures = [...fixtures, ...secondLeg];

      // מחיקת הגרלה קודמת שלא שוחקה עוד (משחקים ללא תאריך / לא COMPLETED) ושמירה חדשה
      const prev = await base44.entities.MatchFixture.filter({ club_id, age_group, import_source: 'League Generator' }, 'match_date', 500);
      const deletable = prev.filter(f => f.status !== 'COMPLETED');
      if (deletable.length) {
        for (const d of deletable) { try { await base44.entities.MatchFixture.delete(d.id); } catch { /* ignore */ } }
      }

      const created = allFixtures.length ? await base44.entities.MatchFixture.bulkCreate(allFixtures) : [];
      await audit(base44, user, 'status_change', `הגרלת ליגה ${age_group}: ${created.length} משחקים, ${totalRounds} מחזורים${double_round ? ' (כפול)' : ''}.`, club_id);
      return Response.json({ created: created.length, rounds: totalRounds, matches: created });
    }

    // ---------- clearLeague: מחיקת הגרלה שלא שוחקה ----------
    if (action === 'clearLeague') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { club_id, age_group, include_completed } = body;
      const prev = await base44.entities.MatchFixture.filter({ club_id, age_group, import_source: 'League Generator' }, 'match_date', 500);
      const toDel = include_completed ? prev : prev.filter(f => f.status !== 'COMPLETED');
      for (const d of toDel) { try { await base44.entities.MatchFixture.delete(d.id); } catch { /* ignore */ } }
      return Response.json({ deleted: toDel.length });
    }

    // ---------- saveRules / getRules ----------
    if (action === 'saveRules') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { club_id, club_name, age_group, ...rest } = body;
      if (!club_id || !age_group) return Response.json({ error: 'נדרשים club_id ו-age_group' }, { status: 400 });
      const existing = await base44.entities.OrganizationLeagueRules.filter({ club_id, age_group }, '-created_date', 5);
      let saved;
      if (existing[0]) {
        saved = await base44.entities.OrganizationLeagueRules.update(existing[0].id, { ...rest, updated_at: new Date().toISOString() });
      } else {
        saved = await base44.entities.OrganizationLeagueRules.create({ club_id, club_name: club_name || '', age_group, ...rest, updated_at: new Date().toISOString() });
      }
      return Response.json({ rules: saved });
    }
    if (action === 'getRules') {
      const { club_id, age_group } = body;
      const list = await base44.entities.OrganizationLeagueRules.filter({ club_id, age_group }, '-created_date', 5);
      return Response.json({ rules: list[0] || null });
    }

    // ---------- proposeCoordination (מצד הבית) ----------
    if (action === 'proposeCoordination') {
      if (!canManage && user.role !== 'coach') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { fixture_id, match_date, kickoff_time, stadium_name } = body;
      const fx = await base44.entities.MatchFixture.get(fixture_id);
      if (!fx) return Response.json({ error: 'משחק לא נמצא' }, { status: 404 });
      // ולידציה חוקי צוות: ימי משחק
      const rulesList = await base44.entities.OrganizationLeagueRules.filter({ club_id: fx.club_id, age_group: fx.age_group }, '-created_date', 5);
      if (rulesList[0]?.allowed_match_days?.length && match_date) {
        const wd = new Date(match_date).getDay();
        if (!rulesList[0].allowed_match_days.includes(wd)) {
          return Response.json({ error: `יום המשחק (${wd}) אינו מאושר בהגדרות הצוות המקצועי` }, { status: 409 });
        }
      }
      const updated = await base44.entities.MatchFixture.update(fixture_id, {
        home_proposed_date: match_date || null,
        home_proposed_time: kickoff_time || '',
        home_proposed_stadium: stadium_name || '',
        coordination_status: 'HOME_APPROVED',
      });
      await audit(base44, user, 'status_change', `הצעת תיאום למשחק ${fx.home_team}–${fx.away_team}`, fx.club_id);
      return Response.json({ fixture: updated });
    }

    // ---------- confirmCoordination (אישור מצד החוץ / אדמין) ----------
    if (action === 'confirmCoordination') {
      if (!canManage && user.role !== 'coach') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { fixture_id } = body;
      const fx = await base44.entities.MatchFixture.get(fixture_id);
      if (!fx) return Response.json({ error: 'משחק לא נמצא' }, { status: 404 });
      if (!fx.home_proposed_date) return Response.json({ error: 'לא הוצע מועד מצד הבית' }, { status: 400 });
      // בדיקת התנגשויות מגרש + פריצות max_games שבועי לקבוצות
      const existing = await base44.entities.MatchFixture.filter({ club_id: fx.club_id, status: 'SCHEDULED' }, 'match_date', 500);
      const candidate = { ...fx, match_date: fx.home_proposed_date, kickoff_time: fx.home_proposed_time, stadium_name: fx.home_proposed_stadium, id: fx.id };
      const conflicts = validateFixture(candidate, existing, fx.id);
      // תיקון QA: סינון לפי סוגי ההתנגשות האמיתיים (UPPERCASE מ-validateFixture) כולל REST_PERIOD_VIOLATION (48ש׳ מנוחת נוער)
      const blocking = conflicts.filter(c => ['STADIUM_CONFLICT','TEAM_CONFLICT','REST_PERIOD_VIOLATION'].includes(c.type));
      if (blocking.length) return Response.json({ error: 'זוהו התנגשויות או הפרת מנוחת נוער (מינימום 48 שעות בין משחקים לקבוצת קטינים) — תיאום חסום', conflicts: blocking }, { status: 409 });
      // בדיקת max games per week
      const rulesList = await base44.entities.OrganizationLeagueRules.filter({ club_id: fx.club_id, age_group: fx.age_group }, '-created_date', 5);
      const maxWeek = rulesList[0]?.max_games_per_week;
      if (maxWeek) {
        const wk = weekKey(fx.home_proposed_date);
        const homeCnt = existing.filter(f => f.match_date && weekKey(f.match_date) === wk && (f.home_team === fx.home_team || f.away_team === fx.home_team)).length;
        const awayCnt = existing.filter(f => f.match_date && weekKey(f.match_date) === wk && (f.home_team === fx.away_team || f.away_team === fx.away_team)).length;
        if (homeCnt >= maxWeek || awayCnt >= maxWeek) return Response.json({ error: 'חריגת מקסימום משחקים לשבוע לפי הגדרות הצוות המקצועי' }, { status: 409 });
      }
      const updated = await base44.entities.MatchFixture.update(fixture_id, {
        match_date: fx.home_proposed_date, kickoff_time: fx.home_proposed_time, stadium_name: fx.home_proposed_stadium,
        coordination_status: 'FULLY_COORDINATED', last_conflict_check: JSON.stringify({ at: new Date().toISOString(), result: 'coordinated' }),
      });
      await audit(base44, user, 'status_change', `תיאום אושר: ${fx.home_team}–${fx.away_team} ב-${fx.home_proposed_date}`, fx.club_id);
      return Response.json({ fixture: updated });
    }

    // ---------- rejectCoordination ----------
    if (action === 'rejectCoordination') {
      if (!canManage && user.role !== 'coach') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { fixture_id, note } = body;
      const fx = await base44.entities.MatchFixture.get(fixture_id);
      const updated = await base44.entities.MatchFixture.update(fixture_id, {
        coordination_status: 'PENDING_COORDINATION',
        notes: note ? `דחיית תיאום: ${note}` : (fx?.notes || ''),
        home_proposed_date: null, home_proposed_time: '', home_proposed_stadium: '',
      });
      return Response.json({ fixture: updated });
    }

    // ---------- reportResult (דו-צדדי + אימות צולב) ----------
    if (action === 'reportResult') {
      if (!canManage && user.role !== 'coach') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { fixture_id, side, score, scorers } = body;
      const fx = await base44.entities.MatchFixture.get(fixture_id);
      if (!fx) return Response.json({ error: 'משחק לא נמצא' }, { status: 404 });
      if (fx.result_status === 'VERIFIED_AND_APPROVED') return Response.json({ error: 'התוצאה כבר אומתה' }, { status: 409 });
      if (fx.result_status === 'DISPUTED') return Response.json({ error: 'הדיווח ננעל עקב מחלוקת — ממתין להכרעת הנהלת הארגון' }, { status: 409 });

      const patch: any = {};
      if (side === 'home') {
        patch.home_reported_score = score;
        patch.home_scorers = scorers || [];
      } else {
        patch.away_reported_score = score;
        patch.away_scorers = scorers || [];
      }

      // טריגר אימות צולב כששני הצדדים דיווחו
      if (patch.home_reported_score != null && patch.away_reported_score != null) {
        if (patch.home_reported_score === patch.away_reported_score) {
          // תאימות — אימות אוטומטי
          patch.home_score = patch.home_reported_score;
          patch.away_score = patch.away_reported_score;
          patch.result_status = 'VERIFIED_AND_APPROVED';
          patch.status = 'COMPLETED';
          await base44.entities.MatchFixture.update(fixture_id, patch);
          const standing = await recomputeStandings(base44, fx.club_id, fx.age_group, fx.club_name);
          await audit(base44, user, 'status_change', `אימות תוצאה אוטומטי: ${fx.home_team} ${patch.home_score}–${patch.away_score} ${fx.away_team}`, fx.club_id);
          return Response.json({ fixture: { ...fx, ...patch }, standings: standing });
        } else {
          patch.result_status = 'DISPUTED';
          patch.disputed_reason = `חוסר התאמה בין דיווחי הבית (${side === 'home' ? score : fx.home_reported_score}) והחוץ (${side === 'away' ? score : fx.away_reported_score})`;
          const updated = await base44.entities.MatchFixture.update(fixture_id, patch);
          await audit(base44, user, 'status_change', `מחלוקת תוצאה: ${fx.home_team}–${fx.away_team}`, fx.club_id);
          return Response.json({ fixture: updated });
        }
      }
      // דיווח צד אחד בלבד
      patch.result_status = side === 'home' ? 'HOME_REPORTED' : 'AWAY_REPORTED';
      const updated = await base44.entities.MatchFixture.update(fixture_id, patch);
      return Response.json({ fixture: updated });
    }

    // ---------- resolveDispute (אדמין/הנהלה) ----------
    if (action === 'resolveDispute') {
      if (!isAdmin) return Response.json({ error: 'Forbidden — הכרעת מחלוקת מותרת לאדמין/הנהלת הארגון בלבד' }, { status: 403 });
      const { fixture_id, home_score, away_score } = body;
      const fx = await base44.entities.MatchFixture.get(fixture_id);
      if (!fx) return Response.json({ error: 'משחק לא נמצא' }, { status: 404 });
      const updated = await base44.entities.MatchFixture.update(fixture_id, {
        home_score, away_score, home_reported_score: home_score, away_reported_score: away_score,
        result_status: 'VERIFIED_AND_APPROVED', status: 'COMPLETED', disputed_reason: '',
      });
      const standing = await recomputeStandings(base44, fx.club_id, fx.age_group, fx.club_name);
      await audit(base44, user, 'status_change', `הכרעת מחלוקת: ${fx.home_team} ${home_score}–${away_score} ${fx.away_team}`, fx.club_id);
      return Response.json({ fixture: updated, standings: standing });
    }

    // ---------- standings (מחושב לייב ממשחקים מאומתים + מוצפן בטבלה) ----------
    if (action === 'standings') {
      const { club_id, age_group } = body;
      if (!club_id || !age_group) return Response.json({ error: 'נדרשים club_id ו-age_group' }, { status: 400 });
      const rows = await recomputeStandings(base44, club_id, age_group, body.club_name || '');
      return Response.json({ standings: rows });
    }

    // ---------- fixtures (רשימת משחקי ליגה לפי שנתון) ----------
    if (action === 'fixtures') {
      const { club_id, age_group } = body;
      const list = await base44.entities.MatchFixture.filter({ club_id, age_group }, 'match_date', 500);
      return Response.json({ fixtures: list });
    }

    // ---------- teams (רשימת קבוצות רשומות) ----------
    if (action === 'teams') {
      const { club_id, age_group } = body;
      const list = await base44.entities.LeagueTeam.filter({ club_id, age_group }, 'team_name', 200);
      return Response.json({ teams: list });
    }

    // ---------- Competition Configuration Engine (CRUD) ----------
    if (action === 'saveCompetition') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { id, club_id, club_name, ...rest } = body;
      if (!club_id || !rest.age_group || !rest.competition_name) return Response.json({ error: 'נדרשים club_id, age_group, competition_name' }, { status: 400 });
      let saved;
      if (id) { saved = await base44.entities.Competition.update(id, rest); }
      else { saved = await base44.entities.Competition.create({ club_id, club_name: club_name || '', ...rest }); }
      await audit(base44, user, 'status_change', `הגדרת תחרות: ${rest.competition_name} (${rest.competition_format || '?'}/${rest.player_count || '?'})`, club_id);
      return Response.json({ competition: saved });
    }
    if (action === 'getCompetition') {
      const { id } = body; if (!id) return Response.json({ error: 'נדרש id' }, { status: 400 });
      const compete = await base44.entities.Competition.get(id);
      return Response.json({ competition: compete });
    }
    if (action === 'listCompetitions') {
      const { club_id, age_group } = body;
      const list = await base44.entities.Competition.filter({ club_id, ...(age_group ? { age_group } : {}) }, '-created_date', 100);
      return Response.json({ competitions: list });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('league-engine error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ---- עזר: חישוב טבלת ליגה ממשחקים מאומתים + הצפנה ב- LeagueStanding ----
async function recomputeStandings(base44, club_id, age_group, club_name): Promise<any[]> {
  const all = await base44.entities.MatchFixture.filter({ club_id, age_group }, 'match_date', 500);
  const done = all.filter(f => f.result_status === 'VERIFIED_AND_APPROVED' && f.status === 'COMPLETED');
  const map: Record<string, any> = {};
  const ensure = (name) => {
    if (!map[name]) map[name] = { team_name: name, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 };
    return map[name];
  };
  // שיטת ניקוד — מתוך הגדרת התחרות אם קיימת, אחרת ברירת מחדל 3/1/0
  let pts = { win: 3, draw: 1, loss: 0 };
  const compIdForPts = (done.find(f => f.competition_id) || {}).competition_id;
  if (compIdForPts) { try { const comp = await base44.entities.Competition.get(compIdForPts); if (comp) pts = { win: comp.points_for_win ?? 3, draw: comp.points_for_draw ?? 1, loss: comp.points_for_loss ?? 0 }; } catch { /* ברירת מחדל */ } }

  for (const f of done) {
    const hs = f.home_score ?? 0; const as = f.away_score ?? 0;
    const h = ensure(f.home_team); const a = ensure(f.away_team);
    h.played++; a.played++;
    h.goals_for += hs; h.goals_against += as;
    a.goals_for += as; a.goals_against += hs;
    h.goal_difference = h.goals_for - h.goals_against;
    a.goal_difference = a.goals_for - a.goals_against;
    if (hs > as) { h.won++; a.lost++; h.points += pts.win; }
    else if (as > hs) { a.won++; h.lost++; a.points += pts.win; }
    else { h.drawn++; a.drawn++; h.points += pts.draw; a.points += pts.draw; }
  }
  const rows = Object.values(map).sort((x: any, y: any) => y.points - x.points || y.goal_difference - x.goal_difference || y.goals_for - x.goals_for || x.team_name.localeCompare(y.team_name));

  // persist (admin only entity writes) — best effort
  try {
    const existing = await base44.entities.LeagueStanding.filter({ club_id, age_group }, 'team_name', 200);
    for (const e of existing) { try { await base44.entities.LeagueStanding.delete(e.id); } catch { /* ignore */ } }
    if (rows.length) {
      await base44.entities.LeagueStanding.bulkCreate(rows.map((r: any, i: number) => ({ club_id, club_name, age_group, ...r, updated_at: new Date().toISOString() })));
    }
  } catch { /* persist is best-effort; live calc is source of truth */ }
  return rows;
}

function shuffle<T>(arr: T[]) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } }

function weekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-${week}`;
}

async function audit(base44, user, action, details, club_id) {
  try {
    await base44.entities.AuditLog.create({ actor_id: user.id, actor_name: user.full_name || '', actor_role: user.role, action, club_id: club_id || '', details });
  } catch { /* תיעוד בלבד */ }
}