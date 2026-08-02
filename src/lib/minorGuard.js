// ============================================================
// minorGuard.js — שכבת אכיפת תקינות מרכזית לפעולות על שחקן קטין
// תקנון ההתאחדות לכדורגל בישראל — חתימת אפוטרופוס חוקי כתנאי סף
// ============================================================
// רכיב זה הוא ה"מקור היחיד לאמת" (Single Source of Truth) לכל השערים
// הרגולטוריים הנוגעים לקטינים. כל זרימה (העברה, חוזה, זימון סגל,
// רישום, אישור מדיה) מייבאת מכאן את לוגיקת השערים כדי למנוע כפילות
// ולהבטיח אכיפה אחידה בכל נקודות המגע במערכת.

const DAYS_SOON = 30;

/**
 * בודק האם שחקן הוא קטין (מתחת לגיל 18).
 * מסתמך על דגל is_adult המחושב מתאריך לידה; אם חסר — ברירת מחדל קטין (זהירות).
 */
export function isMinor(player) {
  if (!player) return false;
  // אם יש דגל מפורש — השתמש בו
  if (typeof player.is_adult === 'boolean') return !player.is_adult;
  // חישוב גיבוי מתאריך לידה
  if (player.birth_date) {
    const age = (Date.now() - new Date(player.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age < 18;
  }
  // ברירת מחדל זהירה — נתייחס כקטין כדי לא לעקוף את השער
  return false;
}

/**
 * מצב תוקף אישור רפואי — ירוק/צהוב/אדום.
 */
export function medicalStatus(player) {
  if (!player) return 'red';
  const isExpired = player.medical_expiry_date && new Date(player.medical_expiry_date) < new Date();
  const isSoon = !isExpired && player.medical_expiry_date &&
    (new Date(player.medical_expiry_date) - new Date()) < DAYS_SOON * 24 * 60 * 60 * 1000;
  if (!player.medical_certificate_url) return 'red';
  if (isExpired) return 'red';
  if (isSoon) return 'yellow';
  return 'green';
}

/**
 * בונה את מערך השערים הרגולטוריים לפעולה על קטין.
 * כל שער: { key, label, status: 'green'|'yellow'|'red', detail, href }
 *
 * שערי חובה (אדום = חוסם):
 *  - תעודת זהות הקטין
 *  - ספח ת"ז (הוכחת שייכות הורה-קטין)
 *  - פרטי אפוטרופוס חוקי (שם + ת"ז)
 *  - אישור רפואי בתוקף
 *  - אישור מדיה (media_consent) — נדרש לכל פרסום/שידור של תמונות הקטין
 *  - OTP (אימות חד-פעני) — מוזן דרך ה-UI; מצבו נקבע חיצונית
 *
 * @param {object} player — רשומת PlayerRegistration
 * @param {object} [otpState] — { verified: bool, sent: bool } מצב OTP נוכחי
 */
export function guardianGatesForPlayer(player, otpState = {}) {
  if (!player) return [];

  const med = medicalStatus(player);
  const guardianProofOk = !!(player.guardian_name && player.guardian_id);
  const idSuffixOk = !!player.id_suffix_url;
  const mediaConsentOk = !!(player.legal_terms_accepted && player.legal_terms_accepted.media_consent);

  const medDetail =
    med === 'green' ? 'תקין' :
    med === 'yellow' ? `בתוקף עד ${player.medical_expiry_date}` :
    player.medical_certificate_url ? 'פג תוקף — נדרש חידוש' : 'חסר אישור רפואי';

  return [
    {
      key: 'id_doc',
      label: 'תעודת זהות השחקן',
      status: player.id_document_url ? 'green' : 'red',
      detail: player.id_document_url ? 'הועלתה' : 'חסרה — פנה למועדון להעלאת תעודת הזהות',
      href: player.id_document_url || null,
    },
    {
      key: 'id_suffix',
      label: 'ספח תעודת זהות (הוכחת שייכות הורה-קטין)',
      status: idSuffixOk ? 'green' : 'red',
      detail: idSuffixOk ? 'הועלה' : 'חסר — נדרש ספח תעודת הזהות של ההורה',
      href: player.id_suffix_url || null,
    },
    {
      key: 'guardian_proof',
      label: 'פרטי אפוטרופוס חוקי',
      status: guardianProofOk ? 'green' : 'red',
      detail: guardianProofOk ? `${player.guardian_name} · ${player.guardian_id}` : 'חסרים שם/ת"ז אפוטרופוס בטופס הרישום',
      href: null,
    },
    {
      key: 'medical',
      label: 'אישור רפואי בתוקף',
      status: med,
      detail: medDetail,
      href: player.medical_certificate_url || null,
    },
    {
      key: 'media_consent',
      label: 'אישור שימוש במדיה (תקנון הגנת הפרטיות של קטינים)',
      status: mediaConsentOk ? 'green' : 'red',
      detail: mediaConsentOk ? 'ניתן ע"י האפוטרופוס' : 'חסר — נדרש אישור מפורש לפרסום תמונות/וידאו',
      href: null,
    },
    {
      key: 'otp',
      label: 'אימות OTP (מייל לאפוטרופוס)',
      status: otpState.verified ? 'green' : otpState.sent ? 'yellow' : 'red',
      detail: otpState.verified ? 'מאומת' : otpState.sent ? 'הוזן קוד — ממתין לאימות' : 'נדרש אימות חד-פעני במייל',
      href: null,
    },
  ];
}

/**
 * מסנן את השערים החוסמים (אדומים, לא כולל OTP שמטופל נפרד).
 */
export function blockingGates(gates) {
  return (gates || []).filter(g => g.key !== 'otp' && g.status === 'red');
}

/**
 * האם כל השערים התיעודיים מוכנים (ללא אדומים, לא כולל OTP).
 */
export function docsReady(gates) {
  return blockingGates(gates).length === 0;
}

/**
 * בודק האם ניתן לבצע פעולה על קטין בהתאם לתקנון.
 * לקטין — נדרשת חתימת אפוטרופוס + OTP + כל השערים באורח ירוק/צהוב.
 * לבוגר — מאושר אוטומטית (השחקן חותם בעצמו).
 *
 * @param {object} player
 * @param {object} otpState — { verified, sent }
 * @returns {{ allowed: boolean, blockedBy: array, gates: array }}
 */
export function canPerformMinorAction(player, otpState = {}) {
  const gates = guardianGatesForPlayer(player, otpState);
  const blocked = blockingGates(gates);
  const otpGate = gates.find(g => g.key === 'otp');

  // בוגר — לא נדרש שער אפוטרופוס
  if (!isMinor(player)) {
    return { allowed: true, blockedBy: [], gates };
  }

  const otpOk = otpGate && otpGate.status === 'green';
  const allowed = blocked.length === 0 && otpOk;
  return { allowed, blockedBy: blocked, gates };
}

/**
 * מפה של סוגי פעולות הדורשות חתימת אפוטרופוס לקטין.
 * משמש לתיוג הפעולה ביומן הביקורת ובהתראות.
 */
export const MINOR_ACTION_TYPES = {
  TRANSFER: 'transfer',          // הודעת מעבר/הסגר
  LOAN: 'loan',                  // השאלה
  CONTRACT_SIGN: 'contract_sign', // חתימת חוזה נוער
  REGISTRATION: 'registration',   // טופס רישום קטין
  MEDIA_RELEASE: 'media_release', // אישור מדיה
  MEDICAL_PROCEDURE: 'medical',   // טיפול רפואי חירום
};

/**
 * תווית תצוגה לסוג פעולה (ליומן ביקורת / התראות).
 */
export const ACTION_LABELS = {
  [MINOR_ACTION_TYPES.TRANSFER]: 'העברת שחקן',
  [MINOR_ACTION_TYPES.LOAN]: 'השאלת שחקן',
  [MINOR_ACTION_TYPES.CONTRACT_SIGN]: 'חתימת חוזה נוער',
  [MINOR_ACTION_TYPES.REGISTRATION]: 'רישום קטין',
  [MINOR_ACTION_TYPES.MEDIA_RELEASE]: 'אישור מדיה',
  [MINOR_ACTION_TYPES.MEDICAL_PROCEDURE]: 'טיפול רפואי',
};