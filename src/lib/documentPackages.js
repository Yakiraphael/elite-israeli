// חבילות מסמכים משפטיים ומועדוניים — Document Packages & Legal Workflows.
// ארבע חבילות רגולטוריות המסדירות פעולות רגישות במועדון, בהתאם לתקנוני ההתאחדות לכדורגל
// ולמדריכי caduregel.com. כל חבילה דורשת מכלול מסמכי חובה ומפעילה חסימת מערכת (Gate)
// עד להשלמת המסמכים ואישורם.

import { getOfficialForm } from '@/lib/ifaOfficialForms';

export const DOCUMENT_PACKAGES = [
  {
    key: 'season_onboarding',
    label: 'חבילת רישום עונתי למועדון',
    description: 'פתיחת עונת משחקים חדשה — הסדרת המבנה המשפטי והביטוחי מול ההתאחדות לעונה הנוכחית',
    audience: 'קבוצות בוגרים, נוער וליגות חובבניות',
    color: '#10B981',
    icon: 'Calendar',
    gate_label: 'חסימת רישום סגלים למשחקים',
    gate_description: 'המועדון לא יכול לרשום סגלים למשחקים רשמיים כל עוד חבילת הרישום העונתי לא הושלמה ואושרה',
    documents: [
      {
        role: 'protocol',
        alternatives: ['protocol_youth_company', 'protocol_youth_association', 'protocol_adults_company', 'protocol_adults_association'],
        label: 'פרוטוקול מוסדי — חברה / עמותה המאשר את רישום המועדון לעונה',
      },
      {
        role: 'signatories',
        key: 'signatory_change_form',
        label: 'טופס הודעה על שינוי בעלי זכות חתימה / חברי הנהלה / בעלי תפקידים',
      },
      {
        role: 'insurance',
        alternatives: ['insurance_declaration_26_27', 'insurance_approval_form'],
        label: 'אישור ביטוח מקיף לעונת המשחקים (הפרדה בין שחקנים מעל גיל 20 לבין עד גיל 20)',
      },
      {
        role: 'home_field',
        key: 'amateur_home_field_declaration',
        label: 'טופס התחייבות והצהרת קבוצה על מגרש ביתי מאושר (חובבניות / נוער)',
        optional: true,
      },
    ],
  },

  {
    key: 'player_transfer',
    label: 'חבילת מעבר / העברת שחקן',
    description: 'הסדרה חוקית של מעבר שחקן ממועדון אחד למועדון אחר — מניעת תביעות משפטיות והפרות תקנון מעמד',
    audience: 'שחקני נוער ובוגרים',
    color: '#3B82F6',
    icon: 'Repeat',
    gate_label: 'חסימת זימון לסגל רשמי',
    gate_description: 'המאמן אינו יכול לזמן את השחקן לסגל הרשמי עד שכל טפסי ההסגר, הגריעה והאישור מהקבוצה הקודמת יסונכרנו ויקבלו אישור',
    documents: [
      {
        role: 'transfer_notice',
        alternatives: ['player_transfer_notice_minor', 'player_transfer_notice_adult'],
        label: 'הודעת פרישה / רצון מעבר — קטין (מחייב חתימת אפוטרופוס) או בוגר מעל גיל 17 (הסגר)',
      },
      {
        role: 'removal',
        key: 'player_removal_he',
        label: 'טופס גריעת שחקן / טופס החלפת שחקן — מטעם המועדון המשחרר',
      },
      {
        role: 'cancellation',
        key: 'player_cancellation_en',
        label: 'טופס ביטול רישום (Cancelation of Player Registration) — הסרת שחקן מהמצבת הקודמת',
      },
      {
        role: 'new_contract',
        alternatives: ['player_agreement_he', 'player_agreement_en', 'player_agreement_youth', 'player_agreement_amateur'],
        label: 'חוזה שחקן/ית חדש — הסכם רשמי חתום ומאושר לעונת המשחקים הנוכחית',
      },
    ],
  },

  {
    key: 'staff_contracts',
    label: 'חבילת הסכמי עובדים וצוות מקצועי',
    description: 'עמידה בדרישות הרגולטוריות והחוזיות של ההתאחדות לגבי תנאי העסקה של שחקנים ומאמנים',
    audience: 'מאמנים, אנשי צוות רפואי ושחקנים מקצוענים / חצי-מקצוענים',
    color: '#6366F1',
    icon: 'Briefcase',
    gate_label: 'חסימת הופעה בדו"ח שופט',
    gate_description: 'איש צוות או שחקן שלא הועלה תיק החוזה שלהם למערכת לא יוכלו להופיע בדו"ח שופט רשמי ביום המשחק',
    documents: [
      {
        role: 'coach_contract',
        alternatives: ['coach_agreement_he', 'coach_agreement_en', 'coach_agreement_youth'],
        label: 'הסכם מאמן/ת רשמי — טופס IFA Coach Agreement לעונת המשחקים',
      },
      {
        role: 'player_contract',
        alternatives: ['player_agreement_he', 'player_agreement_en', 'player_agreement_youth', 'player_agreement_amateur'],
        label: 'הסכם שחקן/ית רשמי — טופס IFA Player Agreement לעונת המשחקים',
      },
      {
        role: 'medical_staff',
        key: 'medical_staff_declaration',
        label: 'תצהיר כוח אדם רפואי — חובה בקבוצות נוער וליגות פיתוח לאימות נוכחות איש צוות רפואי מוסמך',
      },
      {
        role: 'conflict_of_interest',
        key: 'signatory_change_form',
        label: 'נוהל ניגוד עניינים — טופס חתום לחברי הנהלה ובעלי תפקידים במועדון',
      },
    ],
  },

  {
    key: 'special_exceptions',
    label: 'חבילת חריגים ואישורים מיוחדים',
    description: 'טיפול במצבים מבצעיים חריגים במהלך העונה — שיתוף צעירים בבוגרים, חריגי גיל, משחקי שישי',
    audience: 'שחקני נוער המשתלבים בבוגרים, קבוצות ללא קבוצת אם, שומרי שבת',
    color: '#F97316',
    icon: 'AlertTriangle',
    gate_label: 'חסימת הכללת חריג בסגל',
    gate_description: 'המערכת לא תאפשר הכללת שחקן חריג בסגל אלא אם כן צורפה החבילה המאושרת והתקבלה חותמת רגולטורית',
    documents: [
      {
        role: 'youth_in_adults',
        key: 'age_exception_adults_to_youth',
        label: 'טופס שיתוף שחקני נוער בקבוצת הבוגרים — היתר בהתאם לתקנון',
      },
      {
        role: 'age_exception',
        key: 'age_exception_youth_not_affiliated',
        label: 'טופס שיתוף חריג גיל — קבוצות נוער שאינן מסונפות לקבוצת בוגרים',
      },
      {
        role: 'special_request',
        alternatives: ['shabbat_team_registration', 'friday_games_request', 'player_friday_affidavit'],
        label: 'בקשה לקיום משחקים בימי שישי / הצהרת שחקן שומר שבת',
        optional: true,
      },
    ],
  },
];

// חישוב סטטוס חבילה — עבור כל role, מאתר את החוזה התואם ומחזיר סטטוס מפורט (signed/pending/missing).
export function computePackageStatus(pkg, contracts = []) {
  const docsStatus = pkg.documents.map(doc => {
    const possibleKeys = doc.alternatives || (doc.key ? [doc.key] : []);
    const matchedContract = contracts.find(c =>
      possibleKeys.includes(c.ifa_template_key) || possibleKeys.includes(c.ifa_template_key)
    );
    let status = 'missing';
    let contractId = null;
    if (matchedContract) {
      status = matchedContract.status === 'חתום' ? 'signed' : 'pending';
      contractId = matchedContract.id;
    }
    return { role: doc.role, label: doc.label, status, contractId, optional: !!doc.optional };
  });
  const requiredDocs = docsStatus.filter(d => !d.optional);
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

// זיהוי אם טופס מסוים שייך לתהליך העברה/השאלה (דורש פתיחת תיק במקביל).
export function isTransferOrLoanForm(formKey = '') {
  const form = getOfficialForm(formKey);
  if (!form) return false;
  return form.category === 'transfer'
    || formKey.includes('player_transfer')
    || formKey.includes('player_loan')
    || formKey.includes('player_removal')
    || formKey.includes('player_cancellation');
}