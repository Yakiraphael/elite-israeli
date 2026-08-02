// ============================================================
// templateWorkflowEngine.js — מנוע חיבור בנק-תבניות ↔ תהליכי העברה
// ============================================================
// המקור היחיד לאמת ל"תאמת מסמכים דינמית" (Dynamic Document Matching).
// מזהה עבור כל TransferProposal אילו מסמכים נדרשים מ-TransferDocumentRequirements,
// מצליבה אותם מול מסמכים שהועלו לכספת (TransferDocument), ומסווג ל:
//   - missing   : מסמך חובה שחסר
//   - unsigned  : מסמך חובה שהועלה אך לא נחתם/אושר (status not in SIGNED_OK)
//   - extra     : מסמך שהועלה אך אינו שייך לקטגוריית ההעברה
//   - mismatched: מסמך עם אי-התאמת פרופיל (קטין העלה טופס בוגרים ולהפך)
// המנוע מאוכלף את computeTransferReadiness ואת שער האישור הסופי של המנהל המקצועי.
// ============================================================

import {
  REQUIRED_DOCS,
  isLoanCategory,
} from '@/lib/transferDocumentRequirements';

// סיווג פרופיל לכל סוג מסמך — מאפשר זיהוי אי-התאמת קטין↔בוגר
const DOC_PROFILE = {
  // ייחודי קטינים
  player_transfer_form: 'minor',
  minor_departure_notice: 'minor',
  guardian_id_copy: 'minor',
  guardianship_order: 'minor',
  guardian_consent_form: 'minor',
  // ייחודי בוגרים
  release_form: 'adult',
  employment_contract: 'adult',
  professional_contract: 'adult',
  work_visa: 'adult',
  player_passport: 'adult',
  training_compensation_agreement: 'adult',
  // משותף
  player_registration_form: 'all',
  player_card_transfer: 'all',
  debt_clearance: 'all',
  itc: 'all',
  insurance_certificate: 'all',
  player_contract: 'all',
  loan_period_attachment: 'all',
  player_loan_form: 'all', // קטגוריית השאלה קובעת את הפרופיל, לא סוג המסמך
};

// סטטוסי חתימה/אישור שנחשבים "מושלמים" רגולטורית
const SIGNED_OK = new Set(['נחתם דיגיטלית', 'אושר']);

/**
 * פרופיל השחקן לפי קטגוריית ההעברה ודגל is_adult.
 * 'minor' | 'adult'
 */
export function getProfileForCategory(category, isAdult) {
  if (isAdult === true) return 'adult';
  if (isAdult === false) return 'minor';
  // ניסיון גיבוי משם הקטגוריה
  return String(category || '').includes('נוער') ? 'minor' : 'adult';
}

/**
 * פרופיל של סוג מסמך — 'minor' | 'adult' | 'all'
 */
export function getDocProfile(docType) {
  return DOC_PROFILE[docType] || 'all';
}

/**
 * ליבת המנוע: תאמת מסמכים דינמית ל-TransferProposal.
 *
 * @param {object} proposal — TransferProposal (with transfer_category + is_adult)
 * @param {array}  uploadedDocs — TransferDocument[] שהועלו לכספת להעברה זו
 * @returns {{
 *   category: string,
 *   profile: 'minor'|'adult',
 *   required: array,
 *   optional: array,
 *   missing: array,        // חובה + חסר
 *   unsigned: array,       // חובה + הועלה + לא נחתם/אושר
 *   extra: array,           // הועלה אך לא שייך לקטגוריה
 *   mismatched: array,      // פרופיל לא תואם (קטין↔בוגר)
 *   ready: boolean,        // true רק כשאין missing/unsigned/mismatched
 *   coverage: number,      // 0..1 אחוז חובות מצויין וחתום
 * }}
 */
export function matchDocsToWorkflow(proposal, uploadedDocs = []) {
  const category = proposal.transfer_category ||
    (proposal.is_adult ? 'בוגרים - תוך ארצי' : 'העברת נוער');
  const profile = getProfileForCategory(category, proposal.is_adult);
  const spec = REQUIRED_DOCS[category] || [];
  const required = spec.filter(d => !d.optional);
  const optional = spec.filter(d => !!d.optional);

  const expectedTypes = new Set(spec.map(d => d.doc_type));

  const findDoc = (docType) => uploadedDocs.find(sd => sd.doc_type === docType);

  const missing = required.filter(d => !findDoc(d.doc_type));
  const unsigned = required.filter(d => {
    const sd = findDoc(d.doc_type);
    return sd && !SIGNED_OK.has(sd.status);
  });
  const extra = uploadedDocs.filter(sd => !expectedTypes.has(sd.doc_type));
  const mismatched = uploadedDocs.filter(sd => {
    const dp = getDocProfile(sd.doc_type);
    return dp !== 'all' && dp !== profile;
  });

  const completedRequired = required.filter(d => {
    const sd = findDoc(d.doc_type);
    return sd && SIGNED_OK.has(sd.status);
  });
  const coverage = required.length ? completedRequired.length / required.length : 1;

  const ready = missing.length === 0 && unsigned.length === 0 && mismatched.length === 0;

  return { category, profile, required, optional, missing, unsigned, extra, mismatched, ready, coverage };
}

/**
 * בונה רשימת בדיקות בקרה לשער האישור הסופי — משלב את המנוע עם אישורי מאמן/אפוטרופוס/תשלום.
 * תואם לחוזה הישן של computeTransferReadiness אך מוסיף בדיקות unsigned/mismatched/extra.
 */
export function buildApprovalChecks(proposal, uploadedDocs = []) {
  const m = matchDocsToWorkflow(proposal, uploadedDocs);
  const loan = isLoanCategory(m.category);

  const checks = [
    {
      key: 'coach',
      label: `אישור מאמן ל${loan ? 'השאלה' : 'העברה'}`,
      passed: proposal.coach_approval_status === 'אושר על ידי מאמן',
      blocking: true,
    },
    proposal.is_adult
      ? { key: 'player', label: 'הסכמת השחקן (ניהול עצמי)', passed: !!proposal.player_consent, blocking: true }
      : { key: 'guardian', label: 'חתימת אפוטרופוס (דיגיטלית + OTP)', passed: !!proposal.guardian_otp_verified, blocking: true },
    {
      key: 'docs',
      label: `מסמכים נדרשים חתומים (${m.required.length - m.missing.length - m.unsigned.length}/${m.required.length})`,
      passed: m.missing.length === 0 && m.unsigned.length === 0,
      blocking: true,
      detail: { missing: m.missing, unsigned: m.unsigned },
    },
  ];

  if (m.mismatched.length > 0) {
    checks.push({
      key: 'mismatch',
      label: `אי-התאמת פרופיל — הועלו ${m.mismatched.length} מסמכי ${m.profile === 'minor' ? 'בוגרים' : 'קטינים'} (פרופיל: ${m.profile})`,
      passed: false,
      blocking: true,
      detail: { mismatched: m.mismatched },
    });
  }

  if (loan) {
    checks.push({
      key: 'loan_dates',
      label: 'תאריכי תקופת השאלה (תחילה + סיום)',
      passed: !!(proposal.loan_start_date && proposal.loan_end_date),
      blocking: true,
    });
  }

  if (proposal.is_adult && proposal.contract_value > 0 && !loan) {
    checks.push({
      key: 'payment',
      label: 'תשלום עמלת IEFA אושר',
      passed: proposal.payment_status === 'PAID',
      blocking: true,
    });
  }

  const blockingChecks = checks.filter(c => c.blocking);
  const ready = blockingChecks.every(c => c.passed);
  return { category: m.category, profile: m.profile, coverage: m.coverage, checks, ready, matching: m };
}

export const DOC_PROFILE_LABEL = {
  minor: 'קטין',
  adult: 'בוגר',
  all: 'משותף',
};