// חבילות מסמכים משפטיים ומועדוניים — מפוצלות לשני סוגים:
// (א) חבילות אישיות — נבנות אוטומטית לפי נתוני שחקן/מאמן ונשלחות ישירות לחצי הדיגיטלי האישי.
// (ב) חבילות מועדוניות — מותאמות אוטומטית למודל הניהול: רשום מול ההתאחדות לכדורגל (IFA)
//     או עצמאי תחת מסגרות חינוכיות-קהילתיות (עילית ישראלית / ארגון החלוץ).

import { getOfficialForm } from '@/lib/ifaOfficialForms';

// ============================================================
// חלק א': חבילות אישיות (Per-Person Packages) — להפקה ושליחה ישירה
// ============================================================

export const PERSONAL_PACKAGES = [
  {
    key: 'youth_player_onboarding',
    label: 'חבילת קליטת שחקן נוער',
    description: 'שחקן נוער חדש שמצטרף למערכת — הפקה ושליחה ישירה לחצי הדיגיטלי האישי',
    audience: 'שחקן נוער חדש (קטין)',
    color: '#FBBF24',
    icon: 'Baby',
    kind: 'personal',
    outcome: 'לינק דיגיטלי מאובטח למילוי + חתימה דיגיטלית של הורה / אפוטרופוס',
    documents: [
      { role: 'registration', label: 'טופס רישום פנימי ופרטי קשר — Elite ID (שלב א\')' },
      { role: 'medical', label: 'הצהרת בריאות ואישור רפואי (תוקף ברמזור 🟢)' },
      { role: 'guardian_consent', label: 'אישור הורים / אפוטרופוס — לרבות אישור שימוש במדיה ופרסום תמונות / סרטונים מטורנירים' },
      { role: 'discipline_regulations', label: 'תקנון משמעת והתנהלות ספורטיבית של הארגון' },
    ],
  },
  {
    key: 'coach_employment',
    label: 'חבילת חוזה ומעטפת למאמן',
    description: 'מאמן חדש ששויך לקבוצות / שנתונים — חבילת חוזה ונהלים לחתימה בכניסה הראשונה',
    audience: 'מאמן חדש ששויך לקבוצות / שנתונים במערכת',
    color: '#6366F1',
    icon: 'Briefcase',
    kind: 'personal',
    outcome: 'מסמך מרוכז לחתימת המאמן בכניסתו הראשונה למערכת',
    documents: [
      {
        role: 'coach_contract',
        alternatives: ['coach_agreement_he', 'coach_agreement_en', 'coach_agreement_youth'],
        label: 'הסכם התקשרות / חוזה עבודה עונתי למאמן',
      },
      { role: 'team_assignment', label: 'נספח שיוך שנתונים וקבוצות (בהתאם לבחירת המנהל המקצועי)' },
      { role: 'pedagogical_guidelines', label: 'הנחיות פדגוגיות ונהלי מוגנות בספורט (עמידה בסטנדרטים של ספורט חינוכי)' },
    ],
  },
];

// ============================================================
// חלק ב' — מסלול 1: חבילות מועדוניות מול ההתאחדות הרשמית (IFA Mandatory)
// ============================================================

export const IFA_PACKAGES = [
  {
    key: 'ifa_season_institutional',
    label: 'חבילת רישום עונתי מוסדי',
    description: 'פתיחת עונת משחקים חדשה — הסדרת המבנה המשפטי והביטוחי מול ההתאחדות לעונה הנוכחית',
    audience: 'קבוצות בוגרים, נוער וליגות חובבניות — רשומות מול ההתאחדות לכדורגל',
    color: '#10B981',
    icon: 'Calendar',
    kind: 'ifa',
    gate_label: 'חסימת רישום סגלים למשחקים',
    gate_description: 'המועדון לא יכול לרשום סגלים למשחקים רשמיים עד להשלמת החבילה ואישורה',
    documents: [
      {
        role: 'protocol',
        alternatives: ['protocol_youth_company', 'protocol_youth_association', 'protocol_adults_company', 'protocol_adults_association'],
        label: 'פרוטוקול עמותה / חברה המאשר את פעילות המועדון לעונה',
      },
      { role: 'signatories', key: 'signatory_change_form', label: 'הודעה על מורשי חתימה, חברי הנהלה ובעלי תפקידים מאושרים' },
      {
        role: 'insurance',
        alternatives: ['insurance_declaration_26_27', 'insurance_approval_form'],
        label: 'אישור ביטוח מקיף תקף (הפרדה בין שחקנים מעל גיל 20 לבין עד גיל 20)',
      },
      { role: 'home_field', key: 'amateur_home_field_declaration', label: 'הצהרת קבוצה על מגרש ביתי מאושר', optional: true },
    ],
  },
  {
    key: 'ifa_discipline_transfer',
    label: 'חבילת בקרת משמעת והעברות',
    description: 'טפסי הסגר, הודעות מעבר של קטינים/בגירים וגריעות שחקנים — כולל דמי העברה (5,000 ₪) וחוזה Sell-On כתנאי הכרחי לסגירת העברה רשמית מול ההתאחדות',
    audience: 'שחקני נוער ובוגרים במועדונים רשומים מול ההתאחדות',
    color: '#3B82F6',
    icon: 'Repeat',
    kind: 'ifa',
    gate_label: 'חסימת סגירת העברה רשמית',
    gate_description: 'לא ניתן לסגור העברה רשמית מול ההתאחדות ללא תשלום דמי העברה הקבועים (5,000 ₪) וללא חוזה דמי השבחה (Sell-On) כתנאי הכרחי',
    documents: [
      { role: 'transfer_notice', alternatives: ['player_transfer_notice_minor', 'player_transfer_notice_adult'], label: 'טופס הודעת מעבר — קטין / בוגר' },
      { role: 'release', key: 'player_removal_he', label: 'טופס גריעת שחקן / שחרור מהמועדון המשחרר' },
      { role: 'cancellation', key: 'player_cancellation_en', label: 'טופס ביטול רישום (Cancelation of Player Registration)' },
      { role: 'transfer_fee', label: 'אישור תשלום דמי העברה הקבועים — 5,000 ₪', is_finance: true },
      { role: 'sell_on', label: 'חוזה דמי השבחה (Sell-On)', optional: true },
    ],
  },
];

// ============================================================
// חלק ב' — מסלול 2: חבילות מועדוניות עצמאיות / עילית ישראלית
// ============================================================

export const INDEPENDENT_PACKAGES = [
  {
    key: 'elite_partnership',
    label: 'חבילת שותפות ופעילות קהילתית',
    description: 'מסגרת חינוכית-קהילתית עצמאית — פטורה מתקנוני ההתאחדות לכדורגל. מתמקדת בערכים חינוכיים, ניהול ליגות פנימיות ומדדי פדגוגיה',
    audience: 'עמותות / ארגונים חינוכיים (עילית ישראלית, ארגון החלוץ) — ללא תלות במערכות השיפוט והרישום של ההתאחדות',
    color: '#8B5CF6',
    icon: 'Heart',
    kind: 'independent',
    gate_label: 'חסימת פעילות עד להשלמת אמנה',
    gate_description: 'הפעילות המסגרתית החינוכית מותנית בחתימת אמנת ספורט-חינוכי מול השותפות המקומיות',
    documents: [
      { role: 'municipal_partnership', label: 'הסכם שותפות שוויונית במימון מול הרשות המקומית / המתנ"ס (חברתית, קהילתית)' },
      { role: 'educational_charter', label: 'אמנת ספורט-חינוכי ופיתוח נוער (מדדי מנהיגות, ערכים, סדנאות עיבוד)' },
      { role: 'internal_approvals', label: 'אישורי פעילות פנימיים וביטוח קבוצתי בסיסי (מסגרות פנאי / פיתוח)' },
    ],
  },
];

// רשימה מאוחדת — לתאימות לאחור לרכיבים שעדיין צורכים מערך שטוח.
export const DOCUMENT_PACKAGES = [...PERSONAL_PACKAGES, ...IFA_PACKAGES, ...INDEPENDENT_PACKAGES];

// זיהוי מסלול המועדון לפי organization_type (Club entity).
// 'מועדון רשום (חברה / עמותה)' → IFA path; 'עמותה / איגוד המפעיל ליגות' → Independent path.
export function getClubPath(organizationType = '') {
  if (!organizationType) return 'IFA_Registered';
  if (organizationType.includes('מועדון רשום')) return 'IFA_Registered';
  return 'Independent_Elite_Haluze';
}

// חישוב סטטוס חבילה — אילו מסמכים חתומים / ממתינים / חסרים. נשען על רשימת Contract.
export function computePackageStatus(pkg, contracts = []) {
  const docsStatus = pkg.documents.map(doc => {
    const possibleKeys = doc.alternatives || (doc.key ? [doc.key] : []);
    let status = 'missing';
    let matchedContract = null;
    if (possibleKeys.length > 0) {
      matchedContract = contracts.find(c =>
        possibleKeys.includes(c.ifa_template_key) || possibleKeys.includes(c.ifa_template_key)
      );
      if (matchedContract) {
        status = matchedContract.status === 'חתום' ? 'signed' : 'pending';
      }
    }
    return { role: doc.role, label: doc.label, status, contractId: matchedContract?.id, optional: !!doc.optional, is_finance: !!doc.is_finance };
  });
  const requiredDocs = docsStatus.filter(d => !d.optional && !d.is_finance);
  const completedDocs = requiredDocs.filter(d => d.status === 'signed');
  const pendingDocs = requiredDocs.filter(d => d.status === 'pending');
  const completionPct = requiredDocs.length > 0
    ? Math.round((completedDocs.length / requiredDocs.length) * 100)
    : 0;
  const isReady = requiredDocs.length > 0 && completedDocs.length === requiredDocs.length;
  return {
    docsStatus,
    completionPct,
    isReady,
    completedCount: completedDocs.length,
    pendingCount: pendingDocs.length,
    requiredCount: requiredDocs.length,
  };
}

// חישוב פרופיל מסמכים מלא לשחקן נוער: ארבעה רכיבי חובה (רישום Elite ID + אישור רפואי + אישור אפוטרופוס + חוזה שחקן).
export function computeYouthPlayerProfile(player, contracts = []) {
  const checks = [
    { key: 'elite_id', label: 'רישום Elite ID', passed: !!(player.elite_id || player.ifa_id || player.ifa_player_id) },
    { key: 'medical', label: 'אישור רפואי (תקף)', passed: !!player.medical_certificate_url && (!player.medical_expiry_date || new Date(player.medical_expiry_date) > new Date()) },
    { key: 'guardian', label: 'אישור אפוטרופוס + מדיה', passed: !!player.guardian_name && !!player.guardian_id && !!player.legal_terms_accepted?.digital_power_of_attorney && !!player.legal_terms_accepted?.media_consent },
    {
      key: 'youth_agreement',
      label: 'הסכם שחקן נוער חתום',
      passed: contracts.some(c => String(c.ifa_template_key || '').includes('player_agreement_youth') && c.status === 'חתום')
        || contracts.some(c => String(c.ifa_template_key || '').includes('player_agreement_amateur') && c.status === 'חתום'),
    },
  ];
  const completed = checks.filter(c => c.passed).length;
  const pct = Math.round((completed / checks.length) * 100);
  return { checks, completed, total: checks.length, pct, isReady: pct === 100 };
}

export function isTransferOrLoanForm(formKey = '') {
  const form = getOfficialForm(formKey);
  if (!form) return false;
  return form.category === 'transfer'
    || formKey.includes('player_transfer')
    || formKey.includes('player_loan')
    || formKey.includes('player_removal')
    || formKey.includes('player_cancellation');
}