// ============================================================
// Player Evaluation Aggregation Engine (Client-Side)
//
// מנוע חישוב ממוצע משוקלל — מחשב את הציון המשוקלל של שחקן
// על בסיס רמת ההיכרות של כל מעריך (confidence_level).
//
// רמות משקל:
//   1 = מלווה מעל חצי שנה → משקל 1.0 (מלא)
//   2 = ראה מעט משחקים (<5) → משקל 0.5 (חלקי)
//   3 = לא ראה → משקל 0.0 (מבוטל — נשמר לתיעוד בלבד)
// ============================================================

export const CONFIDENCE_WEIGHTS = { 1: 1.0, 2: 0.5, 3: 0.0 };

export const EVALUATION_CATEGORIES = [
  'technique',
  'game_intelligence',
  'physicality',
  'decision_making',
  'mentality',
];

export function computeWeightedAverage(evaluations, category) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const ev of evaluations) {
    const weight = CONFIDENCE_WEIGHTS[ev.confidence_level] ?? 0;
    const score = ev[`${category}_score`];
    if (typeof score === 'number' && weight > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function computeAggregatedEvaluation(evaluations) {
  const categoryScores = {};
  for (const cat of EVALUATION_CATEGORIES) {
    categoryScores[cat] = computeWeightedAverage(evaluations, cat);
  }
  const validScores = Object.values(categoryScores).filter(s => s > 0);
  const overall = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;
  return {
    categoryScores,
    overall,
    tier: scoreToTier(overall),
    evaluationCount: evaluations.length,
    effectiveCount: evaluations.filter(e => (CONFIDENCE_WEIGHTS[e.confidence_level] ?? 0) > 0).length,
    zeroWeightCount: evaluations.filter(e => (CONFIDENCE_WEIGHTS[e.confidence_level] ?? 0) === 0).length,
  };
}

export function scoreToTier(score) {
  if (score >= 4.5) return 'A5';
  if (score >= 4.0) return 'A4';
  if (score >= 3.5) return 'A3';
  if (score >= 3.0) return 'A2';
  if (score >= 2.5) return 'A1';
  if (score >= 2.0) return 'B5';
  if (score >= 1.5) return 'B4';
  if (score >= 1.0) return 'B3';
  if (score >= 0.5) return 'B2';
  return 'B1';
}

export function scoreToBalls(score) {
  const rounded = Math.round(score * 2) / 2;
  return {
    fullBalls: Math.floor(rounded),
    hasHalf: rounded % 1 !== 0,
    total: 5,
  };
}