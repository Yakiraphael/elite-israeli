/**
 * Youth-Only Enforcement Guard (Client-Side)
 *
 * החוק העליון והבלתי מתפשר: הפלטפורמה כולה — בסיס הנתונים, שרת ה-API,
 * לוחות הניהול הפנימיים, והאתר הרשמי הציבורי — מוקדשת אך ורק למחלקות נוער,
 * צעירים וקבוצות עתודה (Youth & U21 Developmental Ecosystem).
 *
 * כל נתון הקשור לכדורגל בוגרים (Senior/Adult Professional or Amateur) אסור בהחלט.
 */

// שנתונים מותרים בלבד — U10 עד U21
export const ALLOWED_AGE_GROUPS = ['U10', 'U12', 'U14', 'U16', 'U18', 'U21'];

// סמנים המעידים על תוכן בוגרים אסור
const ADULT_MARKERS = [
  'בוגר', 'בוגרים', 'adult', 'senior', 'adults', 'seniors',
  'מקצועי', 'professional', 'ליגת העל', 'top league',
];

// סמנים עבריים המעידים על שנתון נוער (תאימות לאחור לרשומות קיימות)
const YOUTH_HEBREW_HINTS = ['ילד', 'טרום', 'נוער', 'נער', 'קטין', 'ילדות', 'צעיר', 'עתודה'];

/**
 * בודק האם שנתון נמצא ברשימה המותרת (U10–U21) או מכיל סמן נוער עברי מוכר.
 * @returns true אם השנתון מותר במערכת נוער-בלבד.
 */
export function isYouthAgeGroup(ageGroup) {
  if (!ageGroup) return false;
  const normalized = String(ageGroup).trim().toUpperCase();
  if (ALLOWED_AGE_GROUPS.includes(normalized)) return true;
  if (YOUTH_HEBREW_HINTS.some(h => String(ageGroup).includes(h))) return true;
  return false;
}

/**
 * בודק האם רשומה מכילה סמני בוגרים שאסורים במערכת.
 * משמש לסינון הגנתי בכל שכבות הלקוח.
 */
export function isAdultRecord(record) {
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
 * כל רשומה המכילה סמן בוגרים מוסרת אוטומטית.
 */
export function filterYouthOnly(records) {
  if (!Array.isArray(records)) return [];
  return records.filter(r => !isAdultRecord(r));
}

/**
 * מאמת שנתון מול הרשימה המותרת — זורק שגיאה אם לא תקין.
 * משמש כשכבת הגנה לפני שמירת רשומות חדשות.
 */
export function assertYouthAgeGroup(ageGroup) {
  if (!isYouthAgeGroup(ageGroup)) {
    throw new Error(
      `שנתון אסור: "${ageGroup}" — מערכת נוער-בלבד. שנתונים מותרים: ${ALLOWED_AGE_GROUPS.join(', ')}`
    );
  }
  return true;
}