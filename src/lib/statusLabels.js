/**
 * מיפוי תגי סטטוס אנגליים (ערכי enum) לתצוגה בעברית תקינה ומקצועית.
 * ערכי ה-enum נשארים באנגלית בשמירה, כדי לא לשבור לוגיקה ורשומות קיימות;
 * ההצגה ב-UI נעשית דרך הפונקציות המסייעות כאן.
 */

// TransferTracker.status
export const TRACKER_STATUS_LABELS = {
  Trialist: 'בוחן',
  'Contract Pending': 'חוזה ממתין',
  Signed: 'חתום',
  Rejected: 'נדחה',
  Cancelled: 'בוטל',
  'ITC Required': 'נדרש ITC',
  'Loan Active': 'השאלה פעילה',
  'Loan Ended': 'השאלה הסתיימה',
};

// Payment.status
export const PAYMENT_STATUS_LABELS = {
  Paid: 'שולם',
  Pending: 'ממתין',
  Overdue: 'באיחור',
};

// PlayerRegistration.ifa_registration_status
export const IFA_REG_STATUS_LABELS = {
  'Under Contract': 'תחת חוזה',
  'Free Agent': 'שחקן חופשי',
  Unverified: 'לא מאומת',
};

// PlayerRegistration.account_status
export const ACCOUNT_STATUS_LABELS = {
  'לא מאומת': 'לא מאומת',
  'ממתין לאישור': 'ממתין לאישור',
  'מאושר': 'מאושר',
  'מושעה': 'מושעה',
};

// תוויות ממשק (UI labels) שמופיעות באנגלית בקוד
export const UI_LABELS = {
  'Director Dashboard': 'דשבורד מנהל מקצועי',
  'Action Queue': 'תור פעולות',
  'Free Agents': 'שחקנים חופשיים',
  'Contract Pending': 'חוזה ממתין',
  'IFA Ready': 'מוכן להתאחדות',
  Compliance: 'תאימות רגולטורית',
  'Compliance Matrix': 'מטריצת תאימות רגולטורית',
};

export function trackerStatusLabel(s) { return TRACKER_STATUS_LABELS[s] || s; }
export function paymentStatusLabel(s) { return PAYMENT_STATUS_LABELS[s] || s; }
export function ifaRegStatusLabel(s) { return IFA_REG_STATUS_LABELS[s] || s; }
export function accountStatusLabel(s) { return ACCOUNT_STATUS_LABELS[s] || s; }