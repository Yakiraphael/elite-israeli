/**
 * ספריית טפסים רשמיים של ההתאחדות לכדורגל בישראל — עונת 26/27.
 * כל ערך מפנה לקובץ ה-PDF המקורי שהועלה, ומגדיר מי מורשה לחתום.
 */

export const IFA_OFFICIAL_FORMS = {

  // ==========================================
  // קטגוריה: חוזי שחקנים (מקצועניות / חובבניות)
  // ==========================================

  player_agreement_en: {
    key: 'player_agreement_en',
    label: 'הסכם שחקן 2026/2027 (אנגלית — מקצועניות)',
    category: 'player_contract',
    league_type: 'professional',
    age_group: 'adult',
    language: 'en',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/b85c2f56b_PLAYERAGREEMENTFORM26-7.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת חוזה', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום חוזה', type: 'date', clause: '5' },
      { key: 'agent_represented', label: 'יוצג ע"י סוכן?', type: 'select', options: ['לא', 'כן'], clause: '12', default: 'לא' },
      { key: 'agent_name', label: 'שם הסוכן', type: 'text', clause: '12', depends_on: { field: 'agent_represented', value: 'כן' } },
      { key: 'agent_license', label: 'מספר רישיון סוכן פיפ"א', type: 'text', clause: '12', depends_on: { field: 'agent_represented', value: 'כן' } },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 9)', type: 'textarea', clause: '9' },
    ],
  },

  player_agreement_he: {
    key: 'player_agreement_he',
    label: 'הסכם שחקן 2026/2027 (עברית — חובבניות)',
    category: 'player_contract',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/efea5a7f1_26-27.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'cup_bonus', label: 'מענק גביע (₪)', type: 'number', clause: '6.2' },
      { key: 'travel_expenses', label: 'תשלומי אש"ל/נסיעות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5' },
      { key: 'rest_day', label: 'יום מנוחה שבועי', type: 'select', options: ['שישי', 'שבת', 'ראשון'], clause: '6.1' },
      { key: 'agent_represented', label: 'יוצג ע"י סוכן?', type: 'select', options: ['לא', 'כן'], clause: '12', default: 'לא' },
      { key: 'agent_name', label: 'שם הסוכן', type: 'text', clause: '12', depends_on: { field: 'agent_represented', value: 'כן' } },
      { key: 'agent_license', label: 'מספר רישיון סוכן פיפ"א', type: 'text', clause: '12', depends_on: { field: 'agent_represented', value: 'כן' } },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 9)', type: 'textarea', clause: '9' },
    ],
  },

  player_agreement_amateur: {
    key: 'player_agreement_amateur',
    label: 'הסכם שחקן חובבני (Form Amateur)',
    category: 'player_contract',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/e28363a92_Form_Amateur_11.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות', type: 'textarea', clause: '9' },
    ],
  },

  // ==========================================
  // קטגוריה: חוזי נוער (קטינים) — מערך ייעודי
  // ==========================================

  player_agreement_youth: {
    key: 'player_agreement_youth',
    label: 'הסכם שחקן נוער 2025/26 + תקנון משמעת אחיד (קטין)',
    category: 'player_contract',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://www.football.org.il/files/%D7%A0%D7%A7%D7%99%20%D7%94%D7%A1%D7%9B%D7%9D%20%D7%A9%D7%97%D7%A7%D7%A0%D7%99%D7%9D%20+%20%D7%AA%D7%A7%D7%A0%D7%95%D7%9F%20%D7%9E%D7%A9%D7%9E%D7%A2%D7%AA%20%D7%90%D7%97%D7%99%D7%93%20%D7%9C%D7%A2%D7%95%D7%A0%D7%AA%202025-26%2024.8.2025.pdf',
    requires_guardian: true,
    signers: ['player', 'guardian', 'club'],
    negotiable_fields: [
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5' },
      { key: 'training_schedule', label: 'מערך אימונים (ימים/שעות)', type: 'text', clause: '7' },
      { key: 'travel_expenses', label: 'השתתפות בהוצאות נסיעה (₪)', type: 'number', clause: '6.2' },
      { key: 'scholarship_grant', label: 'מלגה / תמיכה לימודית (₪)', type: 'number', clause: '6.2' },
      { key: 'rest_day', label: 'יום מנוחה שבועי', type: 'select', options: ['שישי', 'שבת', 'ראשון'], clause: '6.1' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות', type: 'textarea', clause: '9' },
    ],
    director_fillable_fields: [
      { key: 'club_name', label: 'שם המועדון', type: 'text', required: true },
      { key: 'team_name', label: 'שם הקבוצה / שנתון', type: 'text', required: true },
      { key: 'season', label: 'עונה', type: 'text', required: true, default: '2025/26' },
      { key: 'coach_name', label: 'שם המאמן הראשי', type: 'text', required: true },
      { key: 'training_location', label: 'מיקום אימונים', type: 'text', required: false },
    ],
  },

  player_training_agreement_youth: {
    key: 'player_training_agreement_youth',
    label: 'הסכם הכשרה — שחקן קטין (תקנון מעמד והעברות קטינים)',
    category: 'player_contract',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://www.football.org.il/files/takanon/4.25/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F%20%D7%9E%D7%A2%D7%9E%D7%93%20%D7%95%D7%94%D7%A2%D7%91%D7%A8%D7%95%D7%AA%20%D7%A9%D7%9C%20%D7%A9%D7%97%D7%A7%D7%A0%D7%99%D7%9D%20%D7%A7%D7%98%D7%99%D7%A0%D7%99%D7%9D%207.4.2025%20(%D7%A1%D7%95%D7%A4%D7%99).pdf',
    requires_guardian: true,
    signers: ['player', 'guardian', 'club'],
    negotiable_fields: [
      { key: 'training_start', label: 'תחילת תקופת ההכשרה', type: 'date', clause: 'פרק 4' },
      { key: 'training_end', label: 'סיום תקופת ההכשרה', type: 'date', clause: 'פרק 4' },
      { key: 'training_compensation', label: 'פיצוי קידום ואימון (₪)', type: 'number', clause: 'פרק 4' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות', type: 'textarea', clause: 'פרק 4' },
    ],
    director_fillable_fields: [
      { key: 'club_name', label: 'שם המועדון (קבוצה מעבירה)', type: 'text', required: true },
      { key: 'team_name', label: 'שם הקבוצה / שנתון', type: 'text', required: true },
      { key: 'season', label: 'עונה', type: 'text', required: true, default: '2025/26' },
    ],
  },

  coach_agreement_youth: {
    key: 'coach_agreement_youth',
    label: 'הסכם מאמן נוער 2025/26 (קטין)',
    category: 'coach_contract',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/687588293_26-27.pdf',
    requires_guardian: false,
    signers: ['coach', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'team_age_group', label: 'שנתון קבוצת הנוער', type: 'text', clause: '2' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 8)', type: 'textarea', clause: '8' },
    ],
    director_fillable_fields: [
      { key: 'club_name', label: 'שם המועדון', type: 'text', required: true },
      { key: 'team_name', label: 'שם הקבוצה / שנתון', type: 'text', required: true },
      { key: 'season', label: 'עונה', type: 'text', required: true, default: '2025/26' },
    ],
  },

  // ==========================================
  // קטגוריה: חוזי מאמנים
  // ==========================================

  coach_agreement_en: {
    key: 'coach_agreement_en',
    label: 'הסכם מאמן 2026/2027 (אנגלית — מקצועניות)',
    category: 'coach_contract',
    league_type: 'professional',
    age_group: 'adult',
    language: 'en',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/026746fcc_COACHAGREEMENTFORM26-7.pdf',
    requires_guardian: false,
    signers: ['coach', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת חוזה', type: 'date', clause: '5.1' },
      { key: 'season_end', label: 'סיום חוזה', type: 'date', clause: '5.1' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 8)', type: 'textarea', clause: '8' },
    ],
  },

  coach_agreement_he: {
    key: 'coach_agreement_he',
    label: 'הסכם מאמן 2026/2027 (עברית — חובבניות)',
    category: 'coach_contract',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/687588293_26-27.pdf',
    requires_guardian: false,
    signers: ['coach', 'club'],
    negotiable_fields: [
      { key: 'monthly_salary', label: 'שכר חודשי (₪)', type: 'number', clause: '6.1' },
      { key: 'base_salary', label: 'שכר בסיס (₪)', type: 'number', clause: '6.1.1' },
      { key: 'signing_fee', label: 'דמי חתימה (₪)', type: 'number', clause: '6.2' },
      { key: 'championship_bonus', label: 'מענק אליפות (₪)', type: 'number', clause: '6.2' },
      { key: 'season_start', label: 'תחילת עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'season_end', label: 'סיום עונת המשחקים', type: 'date', clause: '5.1' },
      { key: 'supplementary_provisions', label: 'הוראות משלימות (סעיף 8)', type: 'textarea', clause: '8' },
    ],
  },

  // ==========================================
  // קטגוריה: טפסי העברה / מעבר
  // ==========================================

  player_transfer_notice_minor: {
    key: 'player_transfer_notice_minor',
    label: 'הודעת שחקן קטין על רצונו לעבור לקבוצה אחרת',
    category: 'transfer',
    league_type: 'all',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/b5bb6196d_202.pdf',
    requires_guardian: true,
    signers: ['player', 'guardian'],
    negotiable_fields: [],
  },

  player_transfer_notice_adult: {
    key: 'player_transfer_notice_adult',
    label: 'הודעת כניסה להסגר — שחקן מעל גיל 17',
    category: 'transfer',
    league_type: 'all',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/79aba1ee9_-20.pdf',
    requires_guardian: false,
    signers: ['player'],
    negotiable_fields: [],
  },

  player_cancellation_en: {
    key: 'player_cancellation_en',
    label: 'ביטול רישום שחקן (Cancellation of Player Registration)',
    category: 'transfer',
    league_type: 'all',
    age_group: 'adult',
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
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/42f0d4e74_.pdf',
    requires_guardian: false,
    signers: ['player', 'club'],
    negotiable_fields: [],
  },

  // ==========================================
  // קטגוריה: ביטוח
  // ==========================================

  insurance_declaration_26_27: {
    key: 'insurance_declaration_26_27',
    label: 'הצהרה, התחייבות ואישור בדבר קיום ביטוח לעונת 2026/27 (נספח א׳)',
    category: 'insurance',
    league_type: 'all',
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/2045e005d_26-27.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
  },

  insurance_approval_form: {
    key: 'insurance_approval_form',
    label: 'אישור קיום ביטוח — נספח א׳ עד גיל 20',
    category: 'insurance',
    league_type: 'all',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/79aba1ee9_-20.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
  },

  // ==========================================
  // קטגוריה: פרוטוקולים — נוער (חברה ועמותה)
  // ==========================================

  protocol_youth_company: {
    key: 'protocol_youth_company',
    label: 'פרוטוקול נוער וילדים 2025/26 — חברה',
    category: 'protocol',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/8b88b9d9f_-25-26.pdf',
    requires_guardian: false,
    signers: ['club', 'lawyer'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'company_name', label: 'שם החברה', type: 'text', required: true },
      { key: 'company_id', label: 'מס׳ ח.פ.', type: 'text', required: true },
      { key: 'meeting_date', label: 'תאריך הישיבה', type: 'date', required: true },
      { key: 'chairman_name', label: 'שם יו"ר', type: 'text', required: true },
      { key: 'signer_1_name', label: 'מורשה חתימה 1 — שם', type: 'text', required: true },
      { key: 'signer_1_id', label: 'מורשה חתימה 1 — ת.ז.', type: 'text', required: true },
      { key: 'signer_2_name', label: 'מורשה חתימה 2 — שם', type: 'text', required: true },
      { key: 'signer_2_id', label: 'מורשה חתימה 2 — ת.ז.', type: 'text', required: true },
      { key: 'board_member_1', label: 'חבר הנהלה 1 — שם', type: 'text', required: true },
      { key: 'board_member_2', label: 'חבר הנהלה 2 — שם', type: 'text', required: true },
      { key: 'board_member_3', label: 'חבר הנהלה 3 — שם', type: 'text', required: true },
      { key: 'medical_staff_name', label: 'איש צוות רפואי — שם', type: 'text', required: true },
      { key: 'medical_staff_role', label: 'איש צוות רפואי — תפקיד', type: 'select', options: ['רופא', 'חובש', 'אח', 'פיזיותרפיסט'], required: true },
      { key: 'lawyer_name', label: 'שם עו"ד המאשר', type: 'text', required: true },
      { key: 'lawyer_license', label: 'מ.ר. עו"ד', type: 'text', required: true },
    ],
  },

  protocol_youth_association: {
    key: 'protocol_youth_association',
    label: 'פרוטוקול נוער וילדים 2025/26 — עמותה',
    category: 'protocol',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/2563a4f67_-25-26.pdf',
    requires_guardian: false,
    signers: ['club', 'lawyer'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'association_name', label: 'שם העמותה', type: 'text', required: true },
      { key: 'association_id', label: 'מס׳ עמותה', type: 'text', required: true },
      { key: 'meeting_date', label: 'תאריך הישיבה', type: 'date', required: true },
      { key: 'chairman_name', label: 'שם יו"ר', type: 'text', required: true },
      { key: 'signer_1_name', label: 'מורשה חתימה 1 — שם', type: 'text', required: true },
      { key: 'signer_1_id', label: 'מורשה חתימה 1 — ת.ז.', type: 'text', required: true },
      { key: 'signer_2_name', label: 'מורשה חתימה 2 — שם', type: 'text', required: true },
      { key: 'signer_2_id', label: 'מורשה חתימה 2 — ת.ז.', type: 'text', required: true },
      { key: 'board_member_1', label: 'חבר הנהלה 1 — שם', type: 'text', required: true },
      { key: 'board_member_2', label: 'חבר הנהלה 2 — שם', type: 'text', required: true },
      { key: 'board_member_3', label: 'חבר הנהלה 3 — שם', type: 'text', required: true },
      { key: 'medical_staff_name', label: 'איש צוות רפואי — שם', type: 'text', required: true },
      { key: 'medical_staff_role', label: 'איש צוות רפואי — תפקיד', type: 'select', options: ['רופא', 'חובש', 'אח', 'פיזיותרפיסט'], required: true },
      { key: 'lawyer_name', label: 'שם עו"ד המאשר', type: 'text', required: true },
      { key: 'lawyer_license', label: 'מ.ר. עו"ד', type: 'text', required: true },
    ],
  },

  // ==========================================
  // קטגוריה: פרוטוקולים — בוגרים (חברה ועמותה)
  // ==========================================

  protocol_adults_company: {
    key: 'protocol_adults_company',
    label: 'פרוטוקול בוגרים 2025/26 — חברה',
    category: 'protocol',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/fcf6ba481_-25-26.pdf',
    requires_guardian: false,
    signers: ['club', 'lawyer'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'company_name', label: 'שם החברה', type: 'text', required: true },
      { key: 'company_id', label: 'מס׳ ח.פ.', type: 'text', required: true },
      { key: 'meeting_date', label: 'תאריך הישיבה', type: 'date', required: true },
      { key: 'chairman_name', label: 'שם יו"ר', type: 'text', required: true },
      { key: 'signer_1_name', label: 'מורשה חתימה 1 — שם', type: 'text', required: true },
      { key: 'signer_1_id', label: 'מורשה חתימה 1 — ת.ז.', type: 'text', required: true },
      { key: 'signer_2_name', label: 'מורשה חתימה 2 — שם', type: 'text', required: true },
      { key: 'signer_2_id', label: 'מורשה חתימה 2 — ת.ז.', type: 'text', required: true },
      { key: 'lawyer_name', label: 'שם עו"ד המאשר', type: 'text', required: true },
      { key: 'lawyer_license', label: 'מ.ר. עו"ד', type: 'text', required: true },
    ],
  },

  protocol_adults_association: {
    key: 'protocol_adults_association',
    label: 'פרוטוקול בוגרים 2025/26 — עמותה',
    category: 'protocol',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/c8d2bca63_-25-26.pdf',
    requires_guardian: false,
    signers: ['club', 'lawyer'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'association_name', label: 'שם העמותה', type: 'text', required: true },
      { key: 'association_id', label: 'מס׳ עמותה', type: 'text', required: true },
      { key: 'meeting_date', label: 'תאריך הישיבה', type: 'date', required: true },
      { key: 'chairman_name', label: 'שם יו"ר', type: 'text', required: true },
      { key: 'signer_1_name', label: 'מורשה חתימה 1 — שם', type: 'text', required: true },
      { key: 'signer_1_id', label: 'מורשה חתימה 1 — ת.ז.', type: 'text', required: true },
      { key: 'signer_2_name', label: 'מורשה חתימה 2 — שם', type: 'text', required: true },
      { key: 'signer_2_id', label: 'מורשה חתימה 2 — ת.ז.', type: 'text', required: true },
      { key: 'lawyer_name', label: 'שם עו"ד המאשר', type: 'text', required: true },
      { key: 'lawyer_license', label: 'מ.ר. עו"ד', type: 'text', required: true },
    ],
  },

  // ==========================================
  // קטגוריה: טפסים מיוחדים — נוער
  // ==========================================

  age_exception_youth_not_affiliated: {
    key: 'age_exception_youth_not_affiliated',
    label: 'שיתוף חריג גיל — קבוצת נוער שאינה מסונפת לבוגרים',
    category: 'special',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/01fa7cce3_.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'club_name', label: 'שם מועדון הכדורגל', type: 'text', required: true },
      { key: 'player_1_first', label: 'שחקן 1 — שם פרטי', type: 'text', required: true },
      { key: 'player_1_last', label: 'שחקן 1 — שם משפחה', type: 'text', required: true },
      { key: 'player_1_birth', label: 'שחקן 1 — תאריך לידה', type: 'date', required: true },
      { key: 'player_1_id', label: 'שחקן 1 — ת.ז.', type: 'text', required: true },
    ],
  },

  age_exception_adults_to_youth: {
    key: 'age_exception_adults_to_youth',
    label: 'שיתוף שחקני בוגרים המורשים לשחק בנוער',
    category: 'special',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/dcb112ddf_.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'club_name', label: 'שם מועדון הכדורגל', type: 'text', required: true },
      { key: 'player_1_first', label: 'שחקן 1 — שם פרטי', type: 'text', required: true },
      { key: 'player_1_last', label: 'שחקן 1 — שם משפחה', type: 'text', required: true },
      { key: 'player_1_birth', label: 'שחקן 1 — תאריך לידה', type: 'date', required: true },
      { key: 'player_1_id', label: 'שחקן 1 — ת.ז.', type: 'text', required: true },
    ],
  },

  shabbat_team_registration: {
    key: 'shabbat_team_registration',
    label: 'בקשה לרישום קבוצת "צו פיוס" (שומרי שבת) — נוער',
    category: 'special',
    league_type: 'youth',
    age_group: 'minor',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/ac3ed2eb1_.pdf',
    requires_guardian: true,
    signers: ['club', 'parents'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'team_name', label: 'שם הקבוצה', type: 'text', required: true },
      { key: 'age_group', label: 'שנתון', type: 'text', required: true },
      { key: 'season', label: 'עונה', type: 'text', required: true },
    ],
  },

  player_substitution_form: {
    key: 'player_substitution_form',
    label: 'טופס החלפת שחקן במשחק',
    category: 'match',
    league_type: 'all',
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/062e0aa57_.pdf',
    requires_guardian: false,
    signers: ['club', 'medical_staff'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'match_date', label: 'תאריך המשחק', type: 'date', required: true },
      { key: 'league', label: 'ליגה', type: 'text', required: true },
      { key: 'home_team', label: 'קבוצה ביתית', type: 'text', required: true },
      { key: 'away_team', label: 'קבוצת חוץ', type: 'text', required: true },
    ],
  },

  referee_invitation_form: {
    key: 'referee_invitation_form',
    label: 'הזמנת שופטים לליגה — איגוד השופטים',
    category: 'match',
    league_type: 'youth',
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/3dcca44ad_.pdf',
    requires_guardian: false,
    signers: ['club'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'home_team', label: 'שם הקבוצה הביתית', type: 'text', required: true },
      { key: 'invitation_date', label: 'תאריך הזמנת השופטים', type: 'date', required: true },
    ],
  },

  // ==========================================
  // קטגוריה: טפסים מיוחדים — חובבניות (בוגרים)
  // ==========================================

  amateur_home_field_declaration: {
    key: 'amateur_home_field_declaration',
    label: 'הצהרת קבוצת בוגרים (חובבניות) על מגרש ביתי 2025/26',
    category: 'registration',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/4896dec58_2025-26.pdf',
    requires_guardian: false,
    signers: ['club', 'field_owner'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'team_name', label: 'שם הקבוצה', type: 'text', required: true },
      { key: 'league_name', label: 'שם הליגה', type: 'text', required: true },
      { key: 'representative_name', label: 'שם ב"כ הקבוצה', type: 'text', required: true },
      { key: 'field_name', label: 'שם המגרש', type: 'text', required: true },
      { key: 'season', label: 'עונה', type: 'text', required: true, default: '2025/26' },
    ],
  },

  player_substitution_form_adults: {
    key: 'player_substitution_form_adults',
    label: 'טופס החלפת שחקן במשחק — בוגרים',
    category: 'match',
    league_type: 'amateur',
    age_group: 'adult',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/28add27e5_.pdf',
    requires_guardian: false,
    signers: ['club', 'medical_staff'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'match_date', label: 'תאריך המשחק', type: 'date', required: true },
      { key: 'league', label: 'ליגה', type: 'text', required: true },
      { key: 'home_team', label: 'קבוצה ביתית', type: 'text', required: true },
      { key: 'away_team', label: 'קבוצת חוץ', type: 'text', required: true },
    ],
  },

  // ==========================================
  // קטגוריה: טפסים אדמיניסטרטיביים
  // ==========================================

  signatory_change_form: {
    key: 'signatory_change_form',
    label: 'טופס הודעה על שינוי בעלי זכות חתימה / חבר הנהלה / כ"א רפואי',
    category: 'admin',
    league_type: 'all',
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/eac6eba73_.pdf',
    requires_guardian: false,
    signers: ['club', 'lawyer'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'team_name', label: 'שם הקבוצה', type: 'text', required: true },
      { key: 'team_type', label: 'סוג קבוצה', type: 'select', options: ['בוגרים', 'נוער', 'נשים'], required: true },
      { key: 'old_signatory_name', label: 'שם בעל זכות החתימה המוחלף', type: 'text', required: true },
      { key: 'old_signatory_id', label: 'ת.ז. המוחלף', type: 'text', required: true },
      { key: 'old_signatory_role', label: 'תפקיד המוחלף', type: 'text', required: true },
      { key: 'new_signatory_name', label: 'שם בעל זכות החתימה החדש', type: 'text', required: true },
      { key: 'new_signatory_id', label: 'ת.ז. החדש', type: 'text', required: true },
      { key: 'new_signatory_role', label: 'תפקיד החדש', type: 'text', required: true },
      { key: 'lawyer_name', label: 'שם עו"ד המאשר', type: 'text', required: true },
    ],
  },

  medical_staff_declaration: {
    key: 'medical_staff_declaration',
    label: 'הצהרת כוח אדם רפואי (לכל משחק)',
    category: 'medical',
    league_type: 'all',
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/9c67f84f3_-.pdf',
    requires_guardian: false,
    signers: ['medical_staff'],
    negotiable_fields: [],
    director_fillable_fields: [
      { key: 'match_date', label: 'תאריך המשחק', type: 'date', required: true },
      { key: 'home_team', label: 'קבוצה ביתית', type: 'text', required: true },
      { key: 'away_team', label: 'קבוצה אורחת', type: 'text', required: true },
      { key: 'framework', label: 'מסגרת משחקים (ליגה/גביע)', type: 'text', required: true },
      { key: 'age_group_label', label: 'שנתון', type: 'text', required: true },
      { key: 'medical_name', label: 'שם מלא (איש הצוות הרפואי)', type: 'text', required: true },
      { key: 'medical_role', label: 'תפקיד', type: 'select', options: ['רופא', 'חובש', 'אח'], required: true },
    ],
  },

  // ==========================================
  // קטגוריה: ישן — לתאימות לאחור
  // ==========================================

  friday_games_request: {
    key: 'friday_games_request',
    label: 'בקשה לקיים משחקים בימי שישי',
    category: 'other',
    league_type: 'all',
    age_group: 'all',
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
    age_group: 'all',
    language: 'he',
    pdf_url: 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/f1fbaa86c_.pdf',
    requires_guardian: false,
    signers: ['player'],
    negotiable_fields: [],
  },
};

// ==========================================
// פונקציות עזר
// ==========================================

/** כל הטפסים כמערך */
export function getAllForms() {
  return Object.values(IFA_OFFICIAL_FORMS);
}

/** טפסי חוזה בלבד (שחקנים ומאמנים) */
export function getContractForms() {
  return getAllForms().filter(f => f.category === 'player_contract' || f.category === 'coach_contract');
}

/** טפסי חוזה נוער בלבד (קטינים) */
export function getYouthContractForms() {
  return getContractForms().filter(f => f.age_group === 'minor');
}

/** טפסים לפי קטגוריה וגיל (שילוב) */
export function getFormsByLeagueAndAge(league_type, age_group) {
  return getAllForms().filter(f =>
    (f.league_type === league_type || f.league_type === 'all' || (league_type === 'youth' && f.league_type === 'amateur')) &&
    (f.age_group === age_group || f.age_group === 'all')
  );
}

/** טפסים לפי קטגוריה */
export function getFormsByCategory(category) {
  return getAllForms().filter(f => f.category === category);
}

/** טפסים לפי קבוצת גיל ('minor' | 'adult' | 'all') */
export function getFormsByAgeGroup(age_group) {
  return getAllForms().filter(f => f.age_group === age_group || f.age_group === 'all');
}

/** שליפת טופס לפי מפתח */
export function getOfficialForm(key) {
  return IFA_OFFICIAL_FORMS[key] || null;
}

/** האם הטופס דורש חתימת שחקן */
export function requiresPlayerSignature(formKey) {
  const form = getOfficialForm(formKey);
  if (!form) return false;
  return form.signers.includes('player') || form.signers.includes('coach');
}

/** האם הטופס דורש חתימת הורה/אפוטרופוס */
export function requiresGuardianSignature(formKey) {
  const form = getOfficialForm(formKey);
  return form?.requires_guardian || false;
}

/** האם לטופס יש שדות למילוי על ידי מנהל מקצועי */
export function hasDirectorFields(formKey) {
  const form = getOfficialForm(formKey);
  return !!(form?.director_fillable_fields?.length || form?.negotiable_fields?.length);
}

/**
 * החזר טופס חוזה מתאים לפי:
 * - is_adult: בוגר / קטין
 * - league_type: 'professional' | 'amateur'
 * - language: 'he' | 'en'
 * - role: 'player' | 'coach'
 */
export function recommendContractForm({ is_adult, league_type = 'amateur', language = 'he', role = 'player' }) {
  const category = role === 'coach' ? 'coach_contract' : 'player_contract';
  const forms = getContractForms().filter(f => f.category === category);

  if (!is_adult) {
    // קטין — הסכם נוער ייעודי (מאמן או שחקן)
    if (role === 'coach') return IFA_OFFICIAL_FORMS['coach_agreement_youth'] || forms[0];
    if (league_type === 'youth' && IFA_OFFICIAL_FORMS['player_agreement_youth']) return IFA_OFFICIAL_FORMS['player_agreement_youth'];
    return IFA_OFFICIAL_FORMS['player_agreement_youth'] || IFA_OFFICIAL_FORMS['player_agreement_amateur'] || forms[0];
  }

  const byLeagueAndLang = forms.find(f =>
    f.league_type === league_type && f.language === language && f.age_group === 'adult'
  );
  if (byLeagueAndLang) return byLeagueAndLang;

  const byLeague = forms.find(f => f.league_type === league_type && f.age_group === 'adult');
  return byLeague || forms[0];
}