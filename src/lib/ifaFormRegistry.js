// רגיסטר טפסי ההתאחדות לכדורגל (IFA) — נקודת מקור אחידה לכל סוגי המסמכים הרשמיים.
// מנוע זה ממפה כל סוג של פעולה (רישום, העברה, השאלה, חוזה) אל טופס המקור של ההתאחדות,
// ומסווג את הדרישות לפי גיל (קטין/בוגר) וסוג המועדון (רשום / עמותה).
// מטרה: לייצר ZIP "מוכן" שהמנהל המקצועי שולח להתאחדות, כשכל מסמך מבוסס על תבנית המקור.

export const IFA_FORM_CATALOG = {
  // --- רישום שחקן חדש ---
  player_registration_minor: {
    label: 'טופס רישום שחקן קטין',
    category: 'registration',
    age_group: 'minor',
    ifa_form_reference: 'טופס רישום שחקן — קטין (התאחדות לכדורגל)',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: true,
    requires_medical: true,
    requires_id_copy: true,
    requires_id_suffix: true, // ספח ת.ז — הוכחת שיוך הורה-קטין
    requires_photo: true,
    required_signatures: ['club', 'guardian'],
    postgres_to_pdf_fields: ['player_full_name', 'id_number', 'birth_date', 'guardian_name', 'guardian_id', 'club_name'],
  },
  player_registration_adult: {
    label: 'טופס רישום שחקן בוגר',
    category: 'registration',
    age_group: 'adult',
    ifa_form_reference: 'טופס רישום שחקן — בוגר (התאחדות לכדורגל)',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: false,
    requires_medical: true,
    requires_id_copy: true,
    requires_id_suffix: false,
    requires_photo: true,
    required_signatures: ['club', 'player'],
    postgres_to_pdf_fields: ['player_full_name', 'id_number', 'club_name', 'ifa_id'],
  },

  // --- העברת שחקן בין מועדונים ---
  player_transfer_minor: {
    label: 'טופס העברת שחקן קטין',
    category: 'transfer',
    age_group: 'minor',
    ifa_form_reference: 'טופס העברת שחקן קטין — תקנון מעמד והעברות',
    reference_url: 'https://www.football.org.il/files/takanon/4.25/',
    requires_guardian: true,
    requires_medical: true,
    requires_id_copy: true,
    requires_id_suffix: true,
    required_signatures: ['club_sending', 'club_receiving', 'guardian'],
    postgres_to_pdf_fields: ['player_full_name', 'ifa_id', 'club_from', 'club_to', 'guardian_name', 'guardian_id'],
  },
  player_transfer_adult_domestic: {
    label: 'טופס העברת שחקן בוגר (תוך ארצי)',
    category: 'transfer',
    age_group: 'adult',
    transfer_sub_type: 'domestic',
    ifa_form_reference: 'טופס העברת שחקן בוגר — תוך ארצי',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: false,
    requires_medical: true,
    requires_id_copy: true,
    required_signatures: ['club_sending', 'club_receiving', 'player'],
    postgres_to_pdf_fields: ['player_full_name', 'ifa_id', 'club_from', 'club_to'],
  },
  player_transfer_adult_international: {
    label: 'טופס העברת שחקן בוגר (בינלאומי / ITC)',
    category: 'transfer',
    age_group: 'adult',
    transfer_sub_type: 'international',
    ifa_form_reference: 'ITC — International Transfer Certificate (FIFA TMS)',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: false,
    requires_medical: true,
    requires_passport: true,
    requires_work_visa: true,
    required_signatures: ['club_sending', 'club_receiving', 'player', 'fifa_tms'],
    postgres_to_pdf_fields: ['player_full_name', 'ifa_id', 'passport_number', 'club_from', 'club_to'],
  },

  // --- השאלת שחקן ---
  player_loan_minor: {
    label: 'טופס השאלת שחקן קטין',
    category: 'loan',
    age_group: 'minor',
    ifa_form_reference: 'טופס השאלה — תקנון מעמד והעברות (קטינים)',
    reference_url: 'https://www.football.org.il/files/takanon/4.25/',
    requires_guardian: true,
    requires_medical: true,
    required_signatures: ['club_owner', 'club_loan', 'guardian'],
  },
  player_loan_adult: {
    label: 'טופס השאלת שחקן בוגר',
    category: 'loan',
    age_group: 'adult',
    ifa_form_reference: 'טופס השאלה — תקנון מעמד והעברות (בוגרים)',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: false,
    requires_medical: true,
    required_signatures: ['club_owner', 'club_loan', 'player'],
  },

  // --- חוזים ---
  contract_minor: {
    label: 'חוזה שחקן קטין (נוער)',
    category: 'contract',
    age_group: 'minor',
    ifa_form_reference: 'תקנון מעמד והעברות של שחקנים קטינים',
    reference_url: 'https://www.football.org.il/files/takanon/4.25/',
    requires_guardian: true,
    requires_medical: true,
    required_signatures: ['club', 'player', 'guardian'],
  },
  contract_amateur: {
    label: 'חוזה שחקן חובבני (בוגר)',
    category: 'contract',
    age_group: 'adult',
    ifa_form_reference: 'טופס הסכם שחקן חובב',
    reference_url: 'https://www.football.org.il/files/forms/',
    requires_guardian: false,
    required_signatures: ['club', 'player'],
  },
  contract_professional: {
    label: 'חוזה שחקן מקצועי (בוגר)',
    category: 'contract',
    age_group: 'adult',
    ifa_form_reference: 'נספח א׳ לתקנון בקרת תקציבים — טופס הסכם שחקן (61317)',
    reference_url: 'https://www.football.org.il/files/forms/a85dz36fw9.pdf',
    requires_guardian: false,
    requires_budget_control: true,
    required_signatures: ['club', 'player'],
  },

  // --- אישור אפוטרופוס נפרד ---
  guardian_consent_form: {
    label: 'טופס הסכמת אפוטרופוס (כל פעולה רגולטורית לקטין)',
    category: 'guardian_consent',
    age_group: 'minor',
    ifa_form_reference: 'טופס הסכמת אפוטרופוס — התאחדות לכדורגל',
    reference_url: 'https://www.football.org.il/forms/',
    requires_guardian: true,
    requires_guardianship_order: true, // צו מינוי אפוטרופוס אם רלוונטי
    required_signatures: ['guardian'],
  },

  // --- מסמכי תמיכה (אינם טפסי IFA אך נדרשים להגשה) ---
  medical_certificate: {
    label: 'אישור רפואי בתוקף',
    category: 'supporting_doc',
    ifa_form_reference: 'אישור בדיקה רפואית (חוק הספורט)',
  },
  insurance_certificate: {
    label: 'אישור ביטוח (חוק הספורט)',
    category: 'supporting_doc',
    ifa_form_reference: 'פוליסת ביטוח ספורטאים',
  },
  id_document: {
    label: 'צילום תעודת זהות',
    category: 'supporting_doc',
    ifa_form_reference: 'ת.ז. של השחקן / האפוטרופוס',
  },
  id_suffix: {
    label: 'ספח תעודת זהות (הוכחת שיוך הורה-קטין)',
    category: 'supporting_doc',
    ifa_form_reference: 'ספח ת.ז. — שיוך משפחתי',
  },
};

// מיפוי פעולה → טפסים נדרשים. מנוע ה-Compliance משתמש בו כדי להרכיב את ה-ZIP.
export function formsForAction({ action, age_group, transfer_sub_type }) {
  const age = age_group === 'adult' ? 'adult' : 'minor';
  const results = [];
  for (const [key, form] of Object.entries(IFA_FORM_CATALOG)) {
    if (form.category !== action) continue;
    if (form.age_group && form.age_group !== age) continue;
    if (form.transfer_sub_type && form.transfer_sub_type !== transfer_sub_type) continue;
    results.push({ key, ...form });
  }
  return results;
}

// נגזרת סוג הפעולה ותת-הסוג מתוך קטגוריית ההעברה/השאלה.
export function deriveActionFromCategory(category = '') {
  return String(category).startsWith('השאל') ? 'loan' : 'transfer';
}
export function deriveTransferSubType(category = '') {
  return String(category).includes('בינלאומי') ? 'international' : 'domestic';
}
export function loanCategoryToAgeGroup(category = '') {
  return String(category).includes('נוער') ? 'minor' : 'adult';
}

// סכמת שדות לכל טופס IFA. מתארת איזה שדה ממולא אוטומטית (auto),
// איזה שדה המשתמש יכול למלא ידנית (editable_user), ואיזה שדה מנהל מקצועי נדרש למלא (editable_director).
// המערכת משתמשת בזה כדי להחליט מה ניתן "לשמר" (auto) ומה דורש התערבות אנושית.
export const FORM_FIELD_SCHEMAS = {
  player_transfer_minor: [
    { key: 'player_full_name', label: 'שם השחקן', kind: 'auto', source: 'player.full_name' },
    { key: 'id_number', label: 'ת.ז.', kind: 'auto', source: 'player.id_number' },
    { key: 'birth_date', label: 'תאריך לידה', kind: 'auto', source: 'player.birth_date' },
    { key: 'ifa_id', label: 'מס׳ כרטיס', kind: 'auto', source: 'player.ifa_id' },
    { key: 'club_from', label: 'מועדון מעביר', kind: 'auto', source: 'transfer.club_from' },
    { key: 'club_to', label: 'מועדון קולט', kind: 'auto', source: 'transfer.club_to' },
    { key: 'guardian_name', label: 'שם האפוטרופוס', kind: 'auto', source: 'player.guardian_name' },
    { key: 'guardian_id', label: 'ת.ז. אפוטרופוס', kind: 'auto', source: 'player.guardian_id' },
    { key: 'transfer_date', label: 'תאריך העברה מבוקש', kind: 'editable_director', required: true },
    { key: 'notes', label: 'הערות נוספות', kind: 'editable_user' },
  ],
  player_transfer_adult_domestic: [
    { key: 'player_full_name', label: 'שם השחקן', kind: 'auto', source: 'player.full_name' },
    { key: 'id_number', label: 'ת.ז.', kind: 'auto', source: 'player.id_number' },
    { key: 'ifa_id', label: 'מס׳ כרטיס', kind: 'auto', source: 'player.ifa_id' },
    { key: 'club_from', label: 'מועדון מעביר', kind: 'auto', source: 'transfer.club_from' },
    { key: 'club_to', label: 'מועדון קולט', kind: 'auto', source: 'transfer.club_to' },
    { key: 'contract_value', label: 'שווי חוזה שנתי (₪)', kind: 'editable_director', required: true },
    { key: 'transfer_date', label: 'תאריך העברה מבוקש', kind: 'editable_director', required: true },
  ],
  player_transfer_adult_international: [
    { key: 'player_full_name', label: 'שם השחקן', kind: 'auto', source: 'player.full_name' },
    { key: 'ifa_id', label: 'מס׳ כרטיס', kind: 'auto', source: 'player.ifa_id' },
    { key: 'passport_number', label: 'מספר דרכון', kind: 'editable_director', required: true },
    { key: 'club_from', label: 'מועדון מעביר', kind: 'auto', source: 'transfer.club_from' },
    { key: 'club_to', label: 'מועדון קולט', kind: 'auto', source: 'transfer.club_to' },
    { key: 'contract_value', label: 'שווי חוזה שנתי (₪)', kind: 'editable_director', required: true },
    { key: 'transfer_date', label: 'תאריך העברה מבוקש', kind: 'editable_director', required: true },
  ],
  player_loan_minor: [
    { key: 'player_full_name', label: 'שם השחקן', kind: 'auto', source: 'player.full_name' },
    { key: 'id_number', label: 'ת.ז.', kind: 'auto', source: 'player.id_number' },
    { key: 'guardian_name', label: 'שם האפוטרופוס', kind: 'auto', source: 'player.guardian_name' },
    { key: 'club_owner', label: 'מועדון בעלים', kind: 'editable_director', required: true },
    { key: 'club_loan', label: 'מועדון שואל', kind: 'editable_director', required: true },
    { key: 'loan_start_date', label: 'תחילת השאלה', kind: 'auto', source: 'transfer.loan_start_date' },
    { key: 'loan_end_date', label: 'סיום השאלה', kind: 'auto', source: 'transfer.loan_end_date' },
    { key: 'notes', label: 'הערות נוספות', kind: 'editable_user' },
  ],
  player_loan_adult: [
    { key: 'player_full_name', label: 'שם השחקן', kind: 'auto', source: 'player.full_name' },
    { key: 'club_owner', label: 'מועדון בעלים', kind: 'editable_director', required: true },
    { key: 'club_loan', label: 'מועדון שואל', kind: 'editable_director', required: true },
    { key: 'loan_start_date', label: 'תחילת השאלה', kind: 'auto', source: 'transfer.loan_start_date' },
    { key: 'loan_end_date', label: 'סיום השאלה', kind: 'auto', source: 'transfer.loan_end_date' },
    { key: 'contract_value', label: 'שווי השאלה (₪)', kind: 'editable_director', required: false },
  ],
  guardian_consent_form: [
    { key: 'player_full_name', label: 'שם השחקן הקטין', kind: 'auto', source: 'player.full_name' },
    { key: 'player_birth_date', label: 'תאריך לידה', kind: 'auto', source: 'player.birth_date' },
    { key: 'guardian_name', label: 'שם האפוטרופוס', kind: 'auto', source: 'player.guardian_name' },
    { key: 'guardian_id', label: 'ת.ז. אפוטרופוס', kind: 'auto', source: 'player.guardian_id' },
    { key: 'consent_scope', label: 'היקף ההסכמה', kind: 'editable_user', default: 'הסכמה להעברת/השאלת השחקן למועדון אחר בהתאם לתקנון ההתאחדות' },
  ],
};

// פתרון ערך שדה מתוך הקונטקסט. מחזיר את הערך שמקורו ב-path מנוקד.
export function resolveFieldValue(field, ctx) {
  if (field.kind !== 'auto' || !field.source) return field.default || '';
  const parts = field.source.split('.');
  let val = ctx[parts[0]] ?? {};
  for (let i = 1; i < parts.length; i++) val = val?.[parts[i]];
  if (val === undefined || val === null || val === '') return field.default || '';
  return val;
}

// מחזיר את סכמת השדות לפי form_key, או מערך ריק אם אין.
export function getFormFieldSchema(form_key) {
  return FORM_FIELD_SCHEMAS[form_key] || [];
}

// שליפת כל המסמכים הנדרשים ל-ZIP המוגש להתאחדות, לפי סוג פעולה.
// תומך בהעברה ובהשאלה — מבוסס על קטגוריית המקור.
export function buildSubmissionBundle({ action, age_group, transfer_sub_type, is_international, transfer_category }) {
  if (!action && transfer_category) action = deriveActionFromCategory(transfer_category);
  if (age_group === undefined && transfer_category) age_group = loanCategoryToAgeGroup(transfer_category);

  const mainForms = formsForAction({ action, age_group, transfer_sub_type });
  const supporting = [
    IFA_FORM_CATALOG.medical_certificate,
    IFA_FORM_CATALOG.id_document,
  ];
  if (age_group !== 'adult') {
    supporting.push(IFA_FORM_CATALOG.id_suffix);
    supporting.push(IFA_FORM_CATALOG.guardian_consent_form);
  }
  if (is_international) {
    supporting.push({ key: 'itc_certificate', label: 'ITC — תעודת שחרור בינלאומית', category: 'supporting_doc' });
  }
  return { mainForms, supporting };
}