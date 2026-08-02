// מנוע פרופיל שחקן/סקאוטינג מותאם-הקשר ארגוני (Org-Contextual Scouting).
// הסיווג הארגוני של המועדון (Club.org_classification) קובע אילו מדדים וחלקי פרופיל
// יוצגו בכרטיס השחקן ובמסך הסקאוטינג — כדי ששחקן בליגת חובבנים יציג נתוני
// טורניר/השתתפות, ואילו שחקן במועדון מאומת יציג הופעות רשמיות, דמי השבחה ומעקב חוזים.

export const ORG_CLASSIFICATIONS = [
  { id: 'IFA_VERIFIED', label: 'מועדון מאומת התאחדות', tier: 'professional' },
  { id: 'YOUTH_DEPARTMENT', label: 'מחלקת נוער / ליגת נוער', tier: 'youth' },
  { id: 'AMATEUR_LEAGUE', label: 'ליגת חובבנים', tier: 'amateur' },
  { id: 'ASSOCIATION', label: 'עמותה / איגוד מקומי', tier: 'community' },
];

export const DEFAULT_CLASSIFICATION = 'YOUTH_DEPARTMENT';

export const CLASSIFICATION_LABEL = ORG_CLASSIFICATIONS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {}
);

// מיפוי תפקידי האפיון (RBAC) לתפקידי המערכת הנוכחיים.
// מתועד במסמך הפריסה — הפלטפורמה ממפה את RBAC האפיון ל-role המובנה של User.
export const RBAC_ROLE_MAP = {
  SUPER_ADMIN: 'admin',
  CLUB_OWNER: 'director',
  SPORT_DIRECTOR: 'director',
  COACH: 'coach',
  PLAYER: 'player',
  GUARDIAN: 'guardian',
};

// resolveOrgContext(classification) -> עצם שמתאר מה מוצג בכרטיס השחקן.
// IFA_VERIFIED: הופעות רשמיות + דמי השבחה + מעקב חוזים + בדיקת כרטיס IFA.
// YOUTH_DEPARTMENT: סקאוטינג פנימי גמיש + נתוני טורניר + השתתפות.
// AMATEUR_LEAGUE / ASSOCIATION: נתוני טורניר + השתתפות בלבד.
export function resolveOrgContext(classification) {
  const c = classification || DEFAULT_CLASSIFICATION;
  const isPro = c === 'IFA_VERIFIED';
  const isYouth = c === 'YOUTH_DEPARTMENT';
  const isAmateur = c === 'AMATEUR_LEAGUE' || c === 'ASSOCIATION';

  return {
    classification: c,
    label: CLASSIFICATION_LABEL[c] || CLASSIFICATION_LABEL[DEFAULT_CLASSIFICATION],
    isProfessional: isPro,
    isYouth,
    isAmateur,
    show: {
      officialAppearances: isPro,
      sellOnContribution: isPro,
      contractTracking: isPro,
      ifaCardCheck: isPro,
      medicalLaw: isPro,
      tournamentMetrics: isYouth || isAmateur,
      participation: isYouth || isAmateur,
      internalScouting: isYouth || isAmateur,
    },
  };
}