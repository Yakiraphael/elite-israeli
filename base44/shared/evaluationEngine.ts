// ============================================================
// Player Evaluation Aggregation Engine (Server-Side / Shared)
//
// מנוע חישוב ממוצע משוקלל — מחשב את הציון המשוקלל של שחקן
// על בסיס רמת ההיכרות של כל מעריך (confidence_level).
//
// רמות משקל:
//   1 = מלווה מעל חצי שנה → משקל 1.0 (מלא)
//   2 = ראה מעט משחקים (<5) → משקל 0.5 (חלקי)
//   3 = לא ראה → משקל 0.0 (מבוטל — נשמר לתיעוד בלבד)
//
// 5 קטגוריות חובה: technique, game_intelligence, physicality,
// decision_making, mentality (סולם 1-5)
// ============================================================

export const CONFIDENCE_WEIGHTS: Record<number, number> = {
  1: 1.0,
  2: 0.5,
  3: 0.0,
};

export const EVALUATION_CATEGORIES = [
  'technique',
  'game_intelligence',
  'physicality',
  'decision_making',
  'mentality',
] as const;

export type EvaluationCategory = typeof EVALUATION_CATEGORIES[number];

export interface PlayerEvaluation {
  id?: string;
  player_id: string;
  player_name?: string;
  club_id?: string;
  age_group?: string;
  evaluator_id: string;
  evaluator_name?: string;
  evaluator_role?: string;
  technique_score?: number;
  game_intelligence_score?: number;
  physicality_score?: number;
  decision_making_score?: number;
  mentality_score?: number;
  confidence_level: number;
  notes?: string;
  created_date?: string;
}

export interface AggregatedEvaluation {
  categoryScores: Record<EvaluationCategory, number>;
  overall: number;
  tier: string;
  evaluationCount: number;
  effectiveCount: number;
  zeroWeightCount: number;
}

/**
 * מחשב ממוצע משוקלל לקטגוריה בודדת.
 * הערכות עם משקל 0 (רמת היכרות 3) אינן משפיעות על החישוב.
 */
export function computeWeightedAverage(
  evaluations: PlayerEvaluation[],
  category: string
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const ev of evaluations) {
    const weight = CONFIDENCE_WEIGHTS[ev.confidence_level] ?? 0;
    const score = (ev as any)[`${category}_score`];
    if (typeof score === 'number' && weight > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * מחשב את ההערכה המצטברת של שחקן מכל הדוחות שלו.
 * הממוצע הכללי הוא ממוצע הממוצעים המשוקללים של 5 הקטגוריות.
 */
export function computeAggregatedEvaluation(
  evaluations: PlayerEvaluation[]
): AggregatedEvaluation {
  const categoryScores = {} as Record<EvaluationCategory, number>;
  for (const cat of EVALUATION_CATEGORIES) {
    categoryScores[cat] = computeWeightedAverage(evaluations, cat);
  }
  // Overall = average of all category weighted averages (only non-zero categories count)
  const validScores = Object.values(categoryScores).filter(s => s > 0);
  const overall = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;

  return {
    categoryScores,
    overall,
    tier: scoreToTier(overall),
    evaluationCount: evaluations.length,
    effectiveCount: evaluations.filter(
      e => (CONFIDENCE_WEIGHTS[e.confidence_level] ?? 0) > 0
    ).length,
    zeroWeightCount: evaluations.filter(
      e => (CONFIDENCE_WEIGHTS[e.confidence_level] ?? 0) === 0
    ).length,
  };
}

/**
 * ממיר ציון (0-5) לדירוג רמה איכותי (A5 עד B1).
 * A = רמה עליונה, B = רמה בסיסית. מספר = תת-דרג (5=גבוה, 1=נמוך).
 */
export function scoreToTier(score: number): string {
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

/**
 * ממיר ציון (0-5) לתצוגת כדורים (חצאי כדורים או כדורים מלאים).
 */
export function scoreToBalls(score: number): {
  fullBalls: number;
  hasHalf: boolean;
  total: number;
} {
  const rounded = Math.round(score * 2) / 2;
  return {
    fullBalls: Math.floor(rounded),
    hasHalf: rounded % 1 !== 0,
    total: 5,
  };
}