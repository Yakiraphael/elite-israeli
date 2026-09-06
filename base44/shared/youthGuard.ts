// ============================================================
// Youth-Only Enforcement Guard (Server-Side / Shared Module)
//
// החוק העליון: הפלטפורמה כולה מוקדשת אך ורק למחלקות נוער, צעירים
// וקבוצות עתודה (Youth & U21 Developmental Ecosystem).
//
// מודל שיתוף זה נטען על ידי כל פונקציות ה-backend הזקוקות לאכיפת
// נוער-בלבד: public-league-data, fixtures-engine, league-engine,
// bridge-engine, evaluateInterClubTransfer ועוד.
// ============================================================

export const ALLOWED_AGE_GROUPS = ['U10', 'U12', 'U14', 'U16', 'U18', 'U21'] as const;
export type AgeGroup = typeof ALLOWED_AGE_GROUPS[number];

const ADULT_MARKERS = [
  'בוגר', 'בוגרים', 'adult', 'senior', 'adults', 'seniors',
  'מקצועי', 'professional', 'ליגת העל', 'top league',
];

const YOUTH_HEBREW_HINTS = ['ילד', 'טרום', 'נוער', 'נער', 'קטין', 'ילדות', 'צעיר', 'עתודה'];

/**
 * בודק האם שנתון נמצא ברשימה המותרת (U10–U21) או מכיל סמן נוער עברי.
 * @returns true אם השנתון מותר במערכת נוער-בלבד.
 */
export function isYouthAgeGroup(ageGroup: string | undefined | null): boolean {
  if (!ageGroup) return false;
  const normalized = String(ageGroup).trim().toUpperCase();
  if ((ALLOWED_AGE_GROUPS as readonly string[]).includes(normalized)) return true;
  if (YOUTH_HEBREW_HINTS.some(h => String(ageGroup).includes(h))) return true;
  return false;
}

/**
 * בודק האם רשומה מכילה סמני בוגרים שאסורים במערכת.
 */
export function isAdultRecord(record: any): boolean {
  if (!record) return false;
  if (record.is_adult === true) return true;
  if (record.age_group && ADULT_MARKERS.some(m =>
    String(record.age_group).toLowerCase().includes(m.toLowerCase())
  )) return true;
  if (record.transfer_category && ADULT_MARKERS.some(m =>
    String(record.transfer_category).includes(m)
  )) return true;
  if (record.contract_type && ADULT_MARKERS.some(m =>
    String(record.contract_type).includes(m)
  )) return true;
  if (record.club_tier && ADULT_MARKERS.some(m =>
    String(record.club_tier).includes(m)
  )) return true;
  return false;
}

/**
 * מסנן רשימת רשומות — מחזיר אך ורק רשומות נוער תקינות.
 */
export function filterYouthOnly<T>(records: T[]): T[] {
  if (!Array.isArray(records)) return [];
  return records.filter(r => !isAdultRecord(r as any));
}

/**
 * מאמת שנתון מול הרשימה המותרת — זורק שגיאה אם לא תקין.
 */
export function assertYouthAgeGroup(ageGroup: string): boolean {
  if (!isYouthAgeGroup(ageGroup)) {
    throw new Error(
      `שנתון אסור: "${ageGroup}" — מערכת נוער-בלבד. שנתונים מותרים: ${(ALLOWED_AGE_GROUPS as readonly string[]).join(', ')}`
    );
  }
  return true;
}

/**
 * מסנן שדות רשומה לפי whitelist — משמש ליצירת DTO ציבורי.
 * כל שדה שאינו ברשימה מוסר לפני החזרת התגובה לציבור.
 */
export function sanitizeToPublicDto<T extends Record<string, any>>(record: T, allowedFields: string[]): Partial<T> {
  const out: Record<string, any> = {};
  for (const f of allowedFields) {
    if (record[f] !== undefined) out[f] = record[f];
  }
  return out as Partial<T>;
}