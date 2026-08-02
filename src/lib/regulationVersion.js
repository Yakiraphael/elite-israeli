// ============================================================
// regulationVersion.js — מקור יחיד לגרסת התקנון הרגולטורי הפעיל
// ============================================================
// כל חתימת הסכמה דיגיטלית (אפוטרופוס/שחקן/מנהל מקצועי) מתעדת את
// גרסת התקנון שהיתה בתוקף בעת החתימה, ונשמרת בישות AuditLog תחת
// terms_version + consent_fields. כך ניתן להוכיח בפני רשויות / התאחדות
// באיזו גרסת תקנון אישר המשתמש — גם אם התקנון התעדכן מאז (Versioning).

export const CURRENT_REGULATION_VERSION = 'IFA-REG-2026.1';
export const REGULATION_EFFECTIVE_DATE = '2026-01-01';

// מפת תיאור גרסאות — לתיעוד היסטורי והצגה בממשק ניהול
export const REGULATION_HISTORY = [
  { version: 'IFA-REG-2026.1', effective_date: '2026-01-01', notes: 'תקנון מורחב — אישור מדיה, OTP, שער אפוטרופוס מרכזי (minorGuard)' },
  { version: 'IFA-REG-2025.3', effective_date: '2025-06-01', notes: 'תקנון בסיסי — חתימה דיגיטלית, הצפנת מסמכים' },
];

// רשימת סעיפי הסכמה סטנדרטיים הנכללים בחתימת אפוטרופוס לקטין
export const CONSENT_CLAUSES = [
  'platform_terms',
  'digital_power_of_attorney',
  'medical_waiver',
  'digital_representation',
  'payment_pre_auth',
  'media_consent',
  'club_bylaws',
];

export function getRegulationSnapshot() {
  return {
    version: CURRENT_REGULATION_VERSION,
    effective_date: REGULATION_EFFECTIVE_DATE,
    clauses: CONSENT_CLAUSES,
  };
}

/**
 * בונה אובייקט מטא-נתונים לתיעוד ב-AuditLog בעת חתימת הסכמה.
 * מיובא ע"י כל זרימת חתימה כדי להבטיח רישום אחיד של גרסת התקנון.
 */
export function consentSnapshot(clausesAccepted = CONSENT_CLAUSES) {
  return {
    terms_version: CURRENT_REGULATION_VERSION,
    consent_fields: clausesAccepted,
  };
}