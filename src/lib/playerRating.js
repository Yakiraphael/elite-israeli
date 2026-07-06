// Explainable player rating — every point added must trace back to real, stored data
// (core attributes, mental assessment, verified Transfermarkt career facts, certificates).
// No arbitrary/estimated numbers are used.

const CORE_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];

function round1(n) { return Math.round(n * 10) / 10; }

export function buildRatingBreakdown(player, tmData) {
  const stats = player.stats || {};
  const coreVals = CORE_KEYS.map(k => stats[k]).filter(v => typeof v === 'number');
  const factors = [];

  if (coreVals.length === 0) {
    return { overall: null, factors: [{ label: 'אין עדיין נתוני יכולות', points: 0, reason: 'לא הוזנו נתוני PAC/SHO/PAS/DRI/DEF/PHY עבור השחקן.' }] };
  }

  const base = coreVals.reduce((a, b) => a + b, 0) / coreVals.length;
  factors.push({
    label: 'בסיס יכולות טכניות ופיזיות',
    points: round1(base),
    reason: `ממוצע ${coreVals.length} מדדי יכולת שהוזנו בפועל (מהירות, בעיטה, מסירה, כדרור, הגנה, פיזיות).`,
  });

  let total = base;

  if (typeof stats.mental === 'number') {
    const mentalBonus = round1((stats.mental - base) * 0.15);
    total += mentalBonus;
    factors.push({
      label: 'חוסן מנטלי',
      points: mentalBonus,
      reason: `ציון חוסן מנטלי ${stats.mental}/99 ${mentalBonus >= 0 ? 'הוסיף' : 'הפחית'} לציון הכולל ביחס לבסיס הטכני.`,
    });
  }

  const achievements = tmData?.achievements || [];
  if (achievements.length > 0) {
    const bonus = round1(Math.min(achievements.length * 0.5, 4));
    total += bonus;
    factors.push({
      label: 'הישגים מאומתים (Transfermarkt)',
      points: bonus,
      reason: `${achievements.length} תארים/הישגים מתועדים ומאומתים מול Transfermarkt (${achievements.slice(0, 3).map(a => `${a.title} ${a.year || ''}`.trim()).join(', ')}${achievements.length > 3 ? '...' : ''}).`,
    });
  }

  const nationalMatches = (tmData?.national_team || []).reduce((sum, t) => sum + (t.matches || 0), 0);
  if (nationalMatches > 0) {
    const bonus = round1(Math.min(nationalMatches / 50, 3));
    total += bonus;
    factors.push({
      label: 'הופעות בנבחרת',
      points: bonus,
      reason: `${nationalMatches} הופעות מתועדות במדים נבחרים לפי Transfermarkt.`,
    });
  }

  const certCount = (player.certificates || []).length;
  if (certCount > 0) {
    const bonus = round1(Math.min(certCount * 0.3, 2));
    total += bonus;
    factors.push({
      label: 'תעודות והישגים מאומתים',
      points: bonus,
      reason: `${certCount} תעודות/אישורי הצטיינות שהועלו לתיק השחקן.`,
    });
  }

  const overall = Math.round(Math.max(0, Math.min(99, total)));
  return { overall, factors };
}