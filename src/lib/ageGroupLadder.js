// סולם שכבות גיל לפי התאחדות — מגדיר את הקפיצות ההגיוניות בין קבוצות.
// חוקי: שחקן יכול לעבור רק שכבה אחת למעלה (או להישאר בשכבת גילו) — אסור לרדת שכבה.
// דוגמה: בן 16 (נוער) יכול לעלות לבוגרים; בן 11 (צעירים) לא יכול לקפוץ לבוגרים.

export const AGE_LADDER = [
  { level: 0, keyword: 'ילדים', min: 8, max: 10, label: 'ילדים (8-10)' },
  { level: 1, keyword: 'צעירים', min: 11, max: 13, label: 'צעירים (11-13)' },
  { level: 2, keyword: 'נוער', min: 14, max: 16, label: 'נוער (14-16)' },
  { level: 3, keyword: 'בוגרים', min: 17, max: 99, label: 'בוגרים (17+)' },
];

export function ageFromBirth(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function parseTeamTier(ageGroup = '') {
  // זהה שכבה לפי מילת מפתח במחרוזת הגיל (לדוגמה "נוער (14-16)").
  const byKey = AGE_LADDER.find(g => ageGroup.includes(g.keyword));
  if (byKey) return byKey;
  // ניתן להסיק מטווח מספרי בסוגריים
  const m = ageGroup.match(/(\d+)\s*-\s*(\d+)/);
  if (m) {
    const min = parseInt(m[1], 10);
    const max = parseInt(m[2], 10);
    const level = min >= 17 ? 3 : min >= 14 ? 2 : min >= 11 ? 1 : 0;
    return { level, keyword: '', min, max, label: ageGroup };
  }
  // ברירת מחדל — בוגרים פתוח
  return { ...AGE_LADDER[3] };
}

export function playerTierForAge(age) {
  if (age == null) return { ...AGE_LADDER[3] };
  return AGE_LADDER.find(g => age >= g.min && age <= g.max) || (age > 16 ? AGE_LADDER[3] : AGE_LADDER[0]);
}

// מחשב זכאות לכל קבוצת יעד עבור שחקן.
export function eligibilityForPlayer(player, teams = []) {
  const age = ageFromBirth(player.birth_date);
  const pTier = playerTierForAge(age);
  const currentId = player.team_id;
  return teams.map(t => {
    const tTier = parseTeamTier(t.age_group);
    const gap = tTier.level - pTier.level;
    const isCurrent = t.id === currentId;
    let eligible = gap === 0 || gap === 1;
    let reason = '';
    if (isCurrent) { eligible = false; reason = 'הקבוצה הנוכחית של השחקן'; }
    else if (gap < 0) { eligible = false; reason = 'אסור לרדת שכבה — יעד צעיר משכבת הגיל'; }
    else if (gap > 1) { eligible = false; reason = 'קפיצה רחוקה מדי — מותרת רק רמה אחת למעלה'; }
    return { team: t, tier: tTier, gap, eligible, reason, isCurrent };
  }).sort((a, b) => a.tier.level - b.tier.level);
}

export function eligibilitySummary(player) {
  const age = ageFromBirth(player.birth_date);
  const pTier = playerTierForAge(age);
  return { age, tierLabel: pTier.label, tierLevel: pTier.level };
}