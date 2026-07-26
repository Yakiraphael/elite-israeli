/**
 * ספריית טפסים רשמיים של ההתאחדות לכדורגל בישראל — עונת 26/27.
 * כל ערך מפנה לקובץ ה-PDF המקורי שהועלה, ומגדיר מי מורשה לחתום.
 * מחליף את ifaFormRegistry.js לגבי טפסי חוזים — המערכת מציגה את ה-PDF
 * המקורי ומאפשרת מילוי + חתימה דיגיטלית מעליו.
 */

export const IFA_OFFICIAL_FORMS = {
  // ========= חוזי שחקנים ========= //
  player_agreement_en: {
    key: 'player_agreement_en',
    label: 'Player Agreement Form 2026/2027 (English)',
    category: 'player_contract',
    league_type: 'professional', // ליגות מקצועניות
    language: 'en',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/b85c2f56b_PLAYERAGREEMENTFORM26-7.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'Monthly Salary (ILS)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'Base Salary (ILS)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'Signing Fee (ILS)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'Championship Bonus (ILS)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'Contract Start Date', type: 'date', clause: '5' },
      { key: 'season_end', label: 'Contract End Date', type: 'date', clause: '5' },
      { key: 'agent_name', label: 'Football Agent Name', type: 'text', clause: '12' },
      { key: 'agent_license', label: 'FIFA Agent License No.', type: 'text', clause: '12' },
      { key: 'supplementary_provisions', label: 'Supplementary Provisions (§9)', type: 'textarea', clause: '9' },
    ],
  },

  player_agreement_he: {
    key: 'player_agreement_he',
    label: 'טופס הסכם שחקן 2026/2027 (עברית)',
    category: 'player_contract',
    league_type: 'amateur', // ליגות חובבניות ונוער
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/efea5a7f1_26-27.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'משכורת חודשית (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'cup_bonus', label: 'מענק גביע (₪)', type: 'number', clause: '6.2' },
      { key: 'travel_expenses', label: 'תשלומי אש"ל/נסיעות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5' },
      { key: 'rest_day', label: 'יום מנוחה שבועי', type: 'select', options: ['שישי', 'שבת', 'ראשון'], clause: '6.1' },
      { key: 'agent_name', label: 'שם הסוכן', type: 'text', clause: '12' },
      { key: 'agent_license', label: 'מספר רישיון סוכן פיפ"א', type: 'text', clause: '12' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 9)', type: 'textarea', clause: '9' },
    ],
  },

  player_agreement_amateur: {
    key: 'player_agreement_amateur',
    label: 'טופס הסכם שחקן חובבני (Form Amateur)',
    category: 'player_contract',
    league_type: 'amateur',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/201805564_Form_Amateur_11.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'משכורת חודשית (₪)', type: 'number', clause: '6.1' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות', type: 'textarea', clause: '9' },
    ],
  },

  // ========= חוזי מאמנים ========= //
  coach_agreement_en: {
    key: 'coach_agreement_en',
    label: 'Coach Agreement Form 2026/2027 (English)',
    category: 'coach_contract',
    league_type: 'professional',
    language: 'en',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/026746fcc_COACHAGREEMENTFORM26-7.pdf',
    requires_guardian: false,
    signers: ['coach', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'Monthly Salary (ILS)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'Base Salary (ILS)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'Signature Fee (ILS)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'Championship Bonus (ILS)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'Contract Start Date', type: 'date', clause: '5.1' },
      { key: 'season_end', label: 'Contract End Date', type: 'date', clause: '5.1' },
      { key: 'supplementary_provisions', label: 'Supplementary Provisions (§8)', type: 'textarea', clause: '8' },
    ],
  },

  coach_agreement_he: {
    key: 'coach_agreement_he',
    label: 'טופס הסכם מאמן 2026/2027 (עברית)',
    category: 'coach_contract',
    league_type: 'amateur',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/687588293_26-27.pdf',
    requires_guardian: false,
    signers: ['coach', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'משכורת חודשית (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 8)', type: 'textarea', clause: '8' },
    ],
  },

  // ========= טפסי העברה / מעבר ========= //
  player_transfer_notice_minor: {
    key: 'player_transfer_notice_minor',
    label: 'הודעת שחקן קטין על רצונו לעבור',
    category: 'transfer',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/ae8103d34_202.pdf',
    requires_guardian: true,
    signers: ['player', 'guardian'],
    negotiable_fields: [],
  },

  player_transfer_notice_adult: {
    key: 'player_transfer_notice_adult',
    label: 'הודעת כניסה להסגר — שחקן מעל גיל 17',
    category: 'transfer',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/5c7b17fee_17.pdf',
    requires_guardian: false,
    signers: ['player'],
    negotiable_fields: [],
  },

  player_cancellation_en: {
    key: 'player_cancellation_en',
    label: 'Cancellation of Player Registration',
    category: 'transfer',
    league_type: 'all',
    language: 'en',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/deba03917_Cancelation_of_player_registration.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [],
  },

  player_removal_he: {
    key: 'player_removal_he',
    label: 'טופס גריעת שחקן',
    category: 'transfer',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/42f0d4e74_.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [],
  },

  // ========= טפסי ביטוח ========= //
  insurance_declaration_26_27: {
    key: 'insurance_declaration_26_27',
    label: 'הצהרה, התחייבות ואישור בדבר קיום ביטוח לעונת 2026/27 (נספח ה\'1)',
    category: 'insurance',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/02d962951_2026-27.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
  },

  // ========= טפסים נוספים ========= //
  friday_games_request: {
    key: 'friday_games_request',
    label: 'בקשה לקיים משחקים בימי שישי',
    category: 'other',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/a55795b04_.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
  },

  player_friday_affidavit: {
    key: 'player_friday_affidavit',
    label: 'תצהיר שחקן — שומר שבת (לבקשת משחקי שישי)',
    category: 'other',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/f1fbaa86c_.pdf',
    requires_guardian: false,
    signers: ['player'],
    negotiable_fields: [],
  },

  medical_staff_declaration: {
    key: 'medical_staff_declaration',
    label: 'הצהרת כוח אדם רפואי',
    category: 'medical',
    league_type: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/8961ae21b_-.pdf',
    requires_guardian: false,
    signers: ['medical_staff'],
    negotiable_fields: [],
  },
};

/**
 * קבלת טפסי חוזה לפי קטגוריה (חוזי שחקנים / מאמנים)
 */
export function getContractForms() {
  return Object.values(IFA_OFFICIAL_FORMS).filter(f =>
    f.category === 'player_contract' || f.category === 'coach_contract'
  );
}

/**
 * קבלת טופס לפי מפתח
 */
export function getOfficialForm(key) {
  return IFA_OFFICIAL_FORMS[key] || null;
}

/**
 * האם הטופס דורש חתימת שחקן (לא רק קבוצה/מאמן)
 */
export function requiresPlayerSignature(formKey) {
  const form = getOfficialForm(formKey);
  if (!form) return false;
  return form.signers.includes('player') || form.signers.includes('coach');
}

/**
 * האם הטופס דורש חתימת הורה/אפוטרופוס
 */
export function requiresGuardianSignature(formKey) {
  const form = getOfficialForm(formKey);
  return form?.requires_guardian || false;
}