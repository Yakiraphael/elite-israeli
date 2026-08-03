// ============================================================
// מנוע מניעת התנגשויות (Conflict Resolution & Validation Engine)
// משמש את כל פעולות השיבוץ: יצירה, עדכון, וייבוא קבצים.
// בלתי-תלוי במסד הנתונים — מקבל רשימת משחקים קיימים ומועמד חדש ומחזיר התנגשויות.
// ============================================================

export interface Fixture {
  id?: string;
  club_id?: string;
  age_group: string;
  home_team: string;
  away_team: string;
  match_date: string;       // YYYY-MM-DD
  kickoff_time: string;     // HH:MM
  stadium_name: string;
  status?: string;
}

export interface ConflictResult {
  type: 'STADIUM_CONFLICT' | 'TEAM_CONFLICT' | 'REST_PERIOD_VIOLATION';
  message: string;
  conflictingFixtures: any[];
}

// חלון מוגן: 30 דקות חימום לפני, ~120 דקות משחק/ניקוי.
const BUFFER_BEFORE_MIN = 30;
const GAME_DURATION_MIN = 120;
const BUFFER_AFTER_MIN = 30;
const YOUTH_REST_HOURS = 48;

// שנתונים הנחשבים קטינים לעניין תקנון המנוחה.
const YOUTH_HINTS = ['ילד', 'טרום', 'נוער', 'נער', 'קטין', 'ילדות', 'צעיר'];

export function isYouth(ageGroup: string): boolean {
  if (!ageGroup) return true; // ברירת מחדל — להחמיר.
  const g = String(ageGroup).trim();
  if (!g) return true;
  return YOUTH_HINTS.some(h => g.includes(h));
}

function toEpochMinutes(dateStr: string, timeStr: string): number {
  const t = timeStr || '00:00';
  const d = new Date(`${dateStr}T${t}:00`);
  return Math.floor(d.getTime() / 60000);
}

function windowsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function sameTeam(a: Fixture, b: Fixture): boolean {
  const teamsA = [a.home_team, a.away_team];
  return teamsA.includes(b.home_team) || teamsA.includes(b.away_team);
}

function active(f: Fixture): boolean {
  return !f.status || f.status === 'SCHEDULED' || f.status === 'POSTPONED';
}

// בדיקה יחידה: מועמד מול רשימת משחקים קיימים (עם אופציונלי excludeId לעדכון).
export function validateFixture(
  candidate: Fixture,
  existing: Fixture[],
  excludeId?: string
): ConflictResult[] {
  const conflicts: ConflictResult[] = [];

  if (!candidate.match_date || !candidate.kickoff_time || !candidate.stadium_name || !candidate.home_team || !candidate.away_team) {
    return conflicts; // בדיקת שלמות נעשית בסכמה; כאן מתעלמים משדות חסרים.
  }

  const start = toEpochMinutes(candidate.match_date, candidate.kickoff_time);
  const bufferedStart = start - BUFFER_BEFORE_MIN;
  const bufferedEnd = start + GAME_DURATION_MIN + BUFFER_AFTER_MIN;
  const activeList = (existing || []).filter(f => active(f));

  // 1. התנגשות מגרש
  const stadiumHits = activeList.filter(f =>
    f.id !== excludeId &&
    f.stadium_name === candidate.stadium_name &&
    windowsOverlap(
      bufferedStart, bufferedEnd,
      toEpochMinutes(f.match_date, f.kickoff_time) - BUFFER_BEFORE_MIN,
      toEpochMinutes(f.match_date, f.kickoff_time) + GAME_DURATION_MIN + BUFFER_AFTER_MIN
    )
  );
  if (stadiumHits.length) {
    conflicts.push({
      type: 'STADIUM_CONFLICT',
      message: `המגרש "${candidate.stadium_name}" תפוס בחלון הזמן המבוקש (כולל חימום/ניקוי).`,
      conflictingFixtures: stadiumHits,
    });
  }

  // 2. התנגשות קבוצה/שנתון
  const teamHits = activeList.filter(f =>
    f.id !== excludeId &&
    sameTeam(candidate, f) &&
    windowsOverlap(
      bufferedStart, bufferedEnd,
      toEpochMinutes(f.match_date, f.kickoff_time) - BUFFER_BEFORE_MIN,
      toEpochMinutes(f.match_date, f.kickoff_time) + GAME_DURATION_MIN + BUFFER_AFTER_MIN
    )
  );
  if (teamHits.length) {
    conflicts.push({
      type: 'TEAM_CONFLICT',
      message: `אחת הקבוצות (${candidate.home_team} / ${candidate.away_team}) משובצת למשחק נוסף באותו חלון זמן.`,
      conflictingFixtures: teamHits,
    });
  }

  // 3. תקנון מנוחה לקטינים (48 שעות בין משחקים לאותה קבוצה/שנתון קטין)
  if (isYouth(candidate.age_group)) {
    const restWindowMin = YOUTH_REST_HOURS * 60;
    const restHits = activeList.filter(f => {
      if (f.id === excludeId) return false;
      if (!sameTeam(candidate, f)) return false;
      const fStart = toEpochMinutes(f.match_date, f.kickoff_time);
      const gapMin = Math.abs(start - fStart);
      return gapMin < restWindowMin;
    });
    if (restHits.length) {
      conflicts.push({
        type: 'REST_PERIOD_VIOLATION',
        message: `הפרת תקנון מנוחת נוער: פחות מ-${YOUTH_REST_HOURS} שעות בין משחקים לקבוצה בשנתון קטינים.`,
        conflictingFixtures: restHits,
      });
    }
  }

  return conflicts;
}

// בדיקת אצווה לייבוא: מאמת כל מועמד מול הקיימים ומול מועמדים שכבר אושרו באצווה.
export function validateBatch(candidates: Fixture[], existing: Fixture[]): {
  valid: Fixture[];
  conflicts: { fixture: Fixture; conflicts: ConflictResult[] }[];
  duplicates: Fixture[];
} {
  const valid: Fixture[] = [];
  const conflicts: { fixture: Fixture; conflicts: ConflictResult[] }[] = [];
  const duplicates: Fixture[] = [];

  for (const c of candidates) {
    // זיהוי כפילות מול קיימים (אותן קבוצות, תאריך, שעה)
    const dup = existing.find(f =>
      f.home_team === c.home_team &&
      f.away_team === c.away_team &&
      f.match_date === c.match_date &&
      f.kickoff_time === c.kickoff_time
    );
    if (dup) {
      duplicates.push(c);
      continue;
    }
    const conf = validateFixture(c, [...existing, ...valid]);
    if (conf.length) {
      conflicts.push({ fixture: c, conflicts: conf });
    } else {
      valid.push(c);
    }
  }

  return { valid, conflicts, duplicates };
}

// מילוי תבנית זימון שופט במשתנים דינמיים.
export function renderRefereeTemplate(messageBody: string, f: Fixture): string {
  return (messageBody || '')
    .replace(/{home_team}/g, f.home_team || '')
    .replace(/{away_team}/g, f.away_team || '')
    .replace(/{match_date}/g, f.match_date || '')
    .replace(/{kickoff_time}/g, f.kickoff_time || '')
    .replace(/{stadium_name}/g, f.stadium_name || '')
    .replace(/{age_group}/g, f.age_group || '')
    .replace(/{competition}/g, (f as any).competition || '');
}