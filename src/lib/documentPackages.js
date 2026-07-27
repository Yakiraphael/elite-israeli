// חבילות מסמכים רשמיות מול ההתאחדות לכדורגל בישראל (IFA) בלבד.
// המערכת מחולקת לשני מסלולי חובה:
// (א) חבילות מוסדיות (Club-level) — רישום עונתי מוסדי + בקרת משמעת והעברות (כולל דמי העברה 5,000 ₪ + Sell-On).
// (ב) חבילות אישיות (Per-person) — תיק שחקן רשמי + תיק צוות מקצועי/מאמן.
// כל החבילות נשענות אך ורק על תקנון ההתאחדות ובנק התבניות הרשמי (ifaOfficialForms.js).
// מסלול עצמאי/חלופי הוסר — אין מסגרת פעילות מחוץ לרגולציה של IFA.

import { getOfficialForm } from '@/lib/ifaOfficialForms';

// ============================================================
// חלק א': חבילות מוסדיות — חובת רישום עונתי ובקרת העברות מול IFA
// ============================================================

export const IFA_CLUB_PACKAGES = [
  {
    key: 'ifa_season_institutional',
    label: 'חבילת רישום עונתי מוסדי מול ההתאחדות',
    description: 'תנאי מקדים והכרחי לפתיחת עונת המשחקים ורישום סגלים במערכות ההתאחדות',
    audience: 'קבוצות בוגרים, נוער וליגות חובבניות — רשומות מול ההתאחדות לכדורגל',
    color: '#10B981',
    icon: 'Calendar',
    kind: 'ifa_club',
    gate_label: 'חסימת רישום סגלים למשחקים',
    gate_description: 'המועדון לא יכול לרשום סגלים למשחקים רשמיים עד להשלמת החבילה ואישורה',
    documents: [
      {
        role: 'protocol',
        alternatives: ['protocol_youth_company', 'protocol_youth_association', 'protocol_adults_company', 'protocol_adults_association'],
        label: 'פרוטוקול מוסדי רשמי — אישור רישום המועדון לעונה ומורשי חתימה',
      },
      { role: 'signatories', key: 'signatory_change_form', label: 'הודעת מורשי חתימה, חברי הנהלה ובעלי תפקידים מאושרים' },
      {
        role: 'insurance',
        alternatives: ['insurance_declaration_26_27', 'insurance_approval_form'],
        label: 'אישור ביטוח מקיף תקף (הפרדה בין שחקנים מעל גיל 20 לעד גיל 20)',
      },
      { role: 'home_field', key: 'amateur_home_field_declaration', label: 'הצהרת מגרש ביתי תקין לאירוח משחקים רשמיים', optional: true },
    ],
  },
  {
    key: 'ifa_discipline_transfer',
    label: 'חבילת בקרת משמעת והעברות — דמי העברה והשבחה',
    description: 'טפסי הסגר, הודעות מעבר של קטינים/בגירים וגריעות שחקנים — כולל חובת תשלום דמי העברה (5,000 ₪) ועיגון חוזה דמי השבחה (Sell-On) כתנאי הכרחי לסגירת העברה רשמית',
    audience: 'שחקני נוער ובוגרים במועדונים רשומים מול ההתאחדות',
    color: '#3B82F6',
    icon: 'Repeat',
    kind: 'ifa_club',
    gate_label: 'חסימת סגירת העברה רשמית',
    gate_description: 'לא ניתן לסגור העברה רשמית מול ההתאחדות ללא תשלום דמי העברה הקבועים (5,000 ₪) וללא חוזה דמי השבחה (Sell-On) כתנאי הכרחי',
    documents: [
      { role: 'transfer_notice', alternatives: ['player_transfer_notice_minor', 'player_transfer_notice_adult'], label: 'טופס הודעת מעבר — קטין / בוגר' },
      { role: 'release', key: 'player_removal_he', label: 'טופס גריעת שחקן / שחרור מהמועדון המשחרר' },
      { role: 'cancellation', key: 'player_cancellation_en', label: 'טופס ביטול רישום (Cancelation of Player Registration)' },
      { role: 'transfer_fee', label: 'אישור תשלום דמי העברה הקבועים — 5,000 ₪', is_finance: true },
      { role: 'sell_on', label: 'חוזה דמי השבחה (Sell-On) — עיגון סעיפים עתידיים', is_sell_on: true },
    ],
  },
];

// ============================================================
// חלק ב': חבילות אישיות — תיק שחקן ותיק צוות מקצועי מול IFA
// ============================================================

export const IFA_PERSONAL_PACKAGES = [
  {
    key: 'ifa_player_compliance',
    label: 'תיק השחקן הרשמי מול ההתאחדות',
    description: 'פרופיל מסמכים מלא ומאושר לכל שחקן הכלול בסגל רשמי — רישום IFA + אישור רפואי + טפסי מעבר/הסגרה + הסכם שחקן עונתי',
    audience: 'כל שחקן בסגל רשמי של קבוצה במסגרת ההתאחדות (נוער ובוגרים)',
    color: '#FBBF24',
    icon: 'User',
    kind: 'ifa_personal',
    gate_label: 'חסימת הוספה לטופס משחק רשמי',
    gate_description: 'שחקן שלא השלים את תיק ה-IFA (רישום פעיל / אישור רפואי תקף / הסכם שחקן חתום) חסום אוטומטית מהסגל הרשמי',
    documents: [
      { role: 'ifa_registration', label: 'כרטיס שחקן פעיל (IFA Player Registration) — מספר מזהה רשמי', data_key: 'ifa_id' },
      { role: 'medical', label: 'אישור רפואי חתום וביטוח תקף (חוק הספורט)', data_key: 'medical_certificate_url' },
      {
        role: 'transfer_forms',
        alternatives: ['player_transfer_notice_minor', 'player_transfer_notice_adult', 'player_removal_he', 'player_cancellation_en'],
        label: 'טפסי מעבר, הסגרה, גריעה או ביטול רישום (במידת הצורך)',
        optional: true,
      },
      {
        role: 'player_agreement',
        alternatives: ['player_agreement_youth', 'player_agreement_he', 'player_agreement_amateur', 'player_agreement_en'],
        label: 'הסכם שחקן עונתי רשמי מאושר התאחדות',
      },
    ],
  },
  {
    key: 'ifa_staff_coach',
    label: 'תיק הצוות המקצועי והמאמן מול ההתאחדות',
    description: 'הסכם מאמן רשמי + תעודת הסמכה ותצהיר רפואי — עמידה בתנאי הסף להעסקת אנשי צוות מקצועי ורפואי',
    audience: 'מאמנים, אנשי צוות מקצועי וכוח אדם רפואי בקבוצות רשומות מול ההתאחדות',
    color: '#6366F1',
    icon: 'Briefcase',
    kind: 'ifa_personal',
    gate_label: 'חסימת פעילות מקצועית בסגל',
    gate_description: 'איש צוות/מאמן שלא חתם הסכם רשמי ולא הציג תצהיר רפואי/הסמכה — חסום מפעילות בסגל הרשמי',
    documents: [
      {
        role: 'coach_agreement',
        alternatives: ['coach_agreement_youth', 'coach_agreement_he', 'coach_agreement_en'],
        label: 'הסכם מאמן רשמי לפי מתווה ההתאחדות לעונה',
      },
      {
        role: 'medical_declaration',
        key: 'medical_staff_declaration',
        label: 'תצהיר רפואי ותעודת הסמכה (עמידה בתנאי הסף להעסקת כוח אדם רפואי/מקצועי)',
      },
    ],
  },
];

// רשימה מאוחדת — לתאימות לאחור לרכיבים שעדיין צורכים מערך שטוח.
export const DOCUMENT_PACKAGES = [...IFA_CLUB_PACKAGES, ...IFA_PERSONAL_PACKAGES];

// חישוב סטטוס חבילה מוסדית — אילו מסמכים חתומים / ממתינים / חסרים. נשען על רשימת Contract.
export function computePackageStatus(pkg, contracts = []) {
  const docsStatus = pkg.documents.map(doc => {
    const possibleKeys = doc.alternatives || (doc.key ? [doc.key] : []);
    let status = 'missing';
    let matchedContract = null;
    if (possibleKeys.length > 0) {
      matchedContract = contracts.find(c => possibleKeys.includes(c.ifa_template_key));
      if (matchedContract) {
        status = matchedContract.status === 'חתום' ? 'signed' : 'pending';
      }
    }
    return { role: doc.role, label: doc.label, status, contractId: matchedContract?.id, optional: !!doc.optional, is_finance: !!doc.is_finance, is_sell_on: !!doc.is_sell_on };
  });
  const requiredDocs = docsStatus.filter(d => !d.optional && !d.is_finance && !d.is_sell_on);
  const requiredSellOn = docsStatus.filter(d => d.is_sell_on);
  const completedDocs = requiredDocs.filter(d => d.status === 'signed');
  const pendingDocs = requiredDocs.filter(d => d.status === 'pending');
  // דמי העברה (finance) + Sell-On נספרים כתנאי סגירה נפרד אך חובה.
  const feeDone = docsStatus.filter(d => d.is_finance && d.status === 'signed').length;
  const sellOnDone = requiredSellOn.filter(d => d.status === 'signed').length;
  const completionPct = requiredDocs.length > 0
    ? Math.round((completedDocs.length / requiredDocs.length) * 100)
    : 0;
  const isReady = requiredDocs.length > 0
    && completedDocs.length === requiredDocs.length
    && feeDone === docsStatus.filter(d => d.is_finance).length
    && requiredSellOn.length > 0
    ? sellOnDone === requiredSellOn.length
    : true;
  return {
    docsStatus,
    completionPct,
    isReady,
    completedCount: completedDocs.length,
    pendingCount: pendingDocs.length,
    requiredCount: requiredDocs.length,
    feeDone,
    sellOnDone,
  };
}

// ============================================================
// תיק שחקן רשמי מול IFA — חישוב פרופיל מסמכים מלא (כל שחקן, נוער ובוגרים)
// ============================================================

export function computePlayerIfaCompliance(player, contracts = []) {
  const today = new Date();
  const medValid = !!player.medical_certificate_url
    && (!player.medical_expiry_date || new Date(player.medical_expiry_date) > today);
  const ifaRegistered = !!(player.ifa_id || player.ifa_player_id)
    && player.ifa_registration_status !== 'Unverified';
  const hasAgreement = contracts.some(c =>
    String(c.ifa_template_key || '').includes('player_agreement') && c.status === 'חתום'
  );
  const checks = [
    { key: 'ifa_registration', label: 'כרטיס שחקן פעיל (IFA)', passed: ifaRegistered },
    { key: 'medical', label: 'אישור רפואי וביטוח תקף', passed: medValid },
    { key: 'player_agreement', label: 'הסכם שחקן עונתי חתום', passed: hasAgreement },
  ];
  const completed = checks.filter(c => c.passed).length;
  const pct = Math.round((completed / checks.length) * 100);
  return { checks, completed, total: checks.length, pct, isReady: pct === 100 };
}

// ============================================================
// תיק צוות מקצועי/מאמן מול IFA — חישוב פרופיל מסמכים
// ============================================================

export function computeStaffIfaCompliance(staff, contracts = []) {
  const hasCoachAgreement = contracts.some(c =>
    String(c.ifa_template_key || '').includes('coach_agreement') && c.status === 'חתום'
  );
  const hasMedicalDecl = contracts.some(c =>
    String(c.ifa_template_key || '') === 'medical_staff_declaration' && c.status === 'חתום'
  );
  const hasCertification = (staff.certificates || []).length > 0 || hasMedicalDecl;
  const checks = [
    { key: 'coach_agreement', label: 'הסכם מאמן רשמי חתום', passed: hasCoachAgreement },
    { key: 'medical_cert', label: 'תצהיר רפואי ותעודת הסמכה', passed: hasCertification },
  ];
  const completed = checks.filter(c => c.passed).length;
  const pct = Math.round((completed / checks.length) * 100);
  return { checks, completed, total: checks.length, pct, isReady: pct === 100 };
}

// תאימות לאחור — שם ישן שהיה מותאם לנוער בלבד; מוסב לפונקציה הכללית.
export function computeYouthPlayerProfile(player, contracts = []) {
  return computePlayerIfaCompliance(player, contracts);
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