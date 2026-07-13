// Document + workflow configuration per transfer category, per the club regulatory-transfer spec.
export const TRANSFER_CATEGORIES = ['העברת נוער', 'בוגרים - תוך ארצי', 'בוגרים - בינלאומי'];

export const REQUIRED_DOCS = {
  'העברת נוער': [
    { doc_type: 'player_transfer_form', label: 'טופס העברת שחקן (חתימות מועדון קולט, מועדון מעביר ואפוטרופוס)' },
    { doc_type: 'minor_departure_notice', label: 'טופס הודעת קטין על רצון לעבור (במקרה של הסגר)', optional: true },
    { doc_type: 'guardian_id_copy', label: 'צילום ת״ז אפוטרופוס + ספח עם פרטי השחקן' },
    { doc_type: 'guardianship_order', label: 'צו מינוי אפוטרופוס (אם רלוונטי)', optional: true },
    { doc_type: 'insurance_certificate', label: 'אישור ביטוח בהתאם לחוק הספורט (מועדון קולט)' },
    { doc_type: 'player_contract', label: 'הסכם שחקן חתום לעונה' },
    { doc_type: 'debt_clearance', label: 'אישור סגירת התחשבנות מול המועדון המעביר', optional: true },
  ],
  'בוגרים - תוך ארצי': [
    { doc_type: 'release_form', label: 'טופס שחרור (Release Form) חתום ע״י המועדון המעביר' },
    { doc_type: 'employment_contract', label: 'הסכם העסקה (חוזה שחקן) עם המועדון הקולט' },
    { doc_type: 'player_registration_form', label: 'טופס רישום שחקן — עדכון פרטים וסטטוס רפואי' },
    { doc_type: 'debt_clearance', label: 'מסמך העדר חובות / הסדר פיננסי', optional: true },
    { doc_type: 'player_card_transfer', label: 'העברת כרטיס שחקן במרשם ההתאחדות' },
  ],
  'בוגרים - בינלאומי': [
    { doc_type: 'itc', label: 'ITC — תעודת שחרור בינלאומית (TMS פיפ״א)' },
    { doc_type: 'professional_contract', label: 'חוזה מקצועני חתום ומתורגם' },
    { doc_type: 'training_compensation_agreement', label: 'הסכם דמי השבחה (Training Compensation)', optional: true },
    { doc_type: 'work_visa', label: 'אישור עבודה / ויזה ממשרד הפנים' },
    { doc_type: 'player_passport', label: 'מסמך היסטוריית שחקן (Player Passport)' },
  ],
};

// Approval workflow order per category
export const WORKFLOW_STAGES = {
  'העברת נוער': ['מועדון קולט', 'מועדון מעביר', 'אפוטרופוס', 'הושלם'],
  'בוגרים - תוך ארצי': ['מועדון מעביר', 'מועדון קולט', 'הושלם'],
  'בוגרים - בינלאומי': ['מועדון מעביר', 'מועדון קולט', 'ITC/התאחדות', 'הושלם'],
};

export function getNextStage(category, currentStage) {
  const stages = WORKFLOW_STAGES[category] || WORKFLOW_STAGES['העברת נוער'];
  const idx = stages.indexOf(currentStage);
  if (idx === -1 || idx >= stages.length - 1) return null;
  return stages[idx + 1];
}

// Smart validation gate for TransferProposal final approval — checks every regulatory
// rule the professional manager needs before signing off on a transfer to the federation.
export function computeTransferReadiness(proposal, docs = []) {
  const category = proposal.transfer_category || (proposal.is_adult ? 'בוגרים - תוך ארצי' : 'העברת נוער');
  const requiredDocs = (REQUIRED_DOCS[category] || []).filter(d => !d.optional);
  const missingDocs = requiredDocs.filter(d => !docs.some(sd => sd.doc_type === d.doc_type));

  const checks = [
    { label: 'אישור מאמן להעברה', passed: proposal.coach_approval_status === 'אושר על ידי מאמן' },
    proposal.is_adult
      ? { label: 'הסכמת השחקן (ניהול עצמי)', passed: !!proposal.player_consent }
      : { label: 'חתימת אפוטרופוס (OTP)', passed: !!proposal.guardian_otp_verified },
    { label: `מסמכים נדרשים (${requiredDocs.length - missingDocs.length}/${requiredDocs.length})`, passed: missingDocs.length === 0, missingDocs },
  ];
  if (proposal.is_adult && proposal.contract_value > 0) {
    checks.push({ label: 'תשלום עמלת IEFA אושר', passed: proposal.payment_status === 'PAID' });
  }

  return { category, checks, ready: checks.every(c => c.passed) };
}