// ============================================================
// formFallbackResolver.js — Fallback Logic: בנק תבניות ↔ הצהרה דיגיטלית
// ============================================================
// שלב 1: סריקת בנק התבניות המוסדי (IFA_FORM_CATALOG → IFA_OFFICIAL_FORMS).
// שלב 2: אם הטופס אינו קיים — יצירה דינמית של הצהרה משפטית דיגיטלית,
//         עם שדות אוטומטיים מתיק השחקן + היקף הסכמה למילוי האפוטרופוס,
//         ומנגנון חתימה דיגיטלית מובנה (IP + timestamp + audit).
// מטרה: לאפשר לאפוטרופוס החוקי למלא ולחתום על כל טופס נדרש גם אם
// אין תבנית רשמית ייעודית בבנק המוסדי — תקנון ההתאחדות לכדורגל.
// ============================================================

import {
  IFA_FORM_CATALOG, getFormFieldSchema, deriveActionFromCategory,
} from '@/lib/ifaFormRegistry';
import { IFA_OFFICIAL_FORMS } from '@/lib/ifaOfficialForms';

/**
 * שלב 1: סריקת בנק התבניות המוסדי.
 * מחזיר { source: 'catalog' | 'official', form, schema } או null.
 */
export function resolveFormTemplate(formKey) {
  if (!formKey) return null;
  if (IFA_FORM_CATALOG[formKey]) {
    return { source: 'catalog', form: IFA_FORM_CATALOG[formKey], schema: getFormFieldSchema(formKey) };
  }
  if (IFA_OFFICIAL_FORMS[formKey]) {
    return { source: 'official', form: IFA_OFFICIAL_FORMS[formKey], schema: getFormFieldSchema(formKey) || [] };
  }
  return null;
}

/**
 * שלב 2: מחולל הצהרות דיגיטליות אוטומטי (Fallback).
 * מייצר הצהרה משפטית מותאמת כשאין תבנית בבנק המוסדי.
 * ההצהרה כוללת נתונים אוטומטיים מתיק השחקן + היקף הסכמה לחתימת אפוטרופוס.
 */
export function buildDynamicDeclaration({ formKey, player, transfer, club }) {
  const action = deriveActionFromCategory(transfer?.transfer_category) || 'transfer';
  const actionLabel = action === 'loan' ? 'השאלה' : 'העברה';
  const playerName = player?.full_name || '—';
  const playerId = player?.id_number || '—';
  const guardianName = player?.guardian_name || '—';
  const guardianId = player?.guardian_id || '—';
  const clubTo = transfer?.club_to || '—';
  const clubFrom = transfer?.club_from || '—';
  const cat = transfer?.transfer_category || '';
  const loanPeriod = action === 'loan' && (transfer?.loan_start_date || transfer?.loan_end_date)
    ? `\nתקופת ההשאלה: ${transfer.loan_start_date || '—'} עד ${transfer.loan_end_date || '—'}.`
    : '';

  const declarationText =
`הצהרה משפטית דיגיטלית — ${actionLabel} שחקן קטין

בזאת מצהיר/ה החתום/מה למטה, בתוקף אפוטרופוס חוקי של השחקן ${playerName} (ת.ז. ${playerId}), אפוטרופוס: ${guardianName} (ת.ז. ${guardianId}), כי אני מסכים/ה ל${actionLabel} השחקן מהמועדון ${clubFrom} אל המועדון ${clubTo}${cat ? ` (קטגוריה: ${cat})` : ''}.${loanPeriod}

ההסכמה ניתנה בהסכמה מלאה, לאחר שעיינתי בתנאי ההצעה ובטפסים הנדרשים, בהתאם לתקנון ההתאחדות לכדורגל בישראל ולחוק הגנת הפרטיות של קטינים.

מסמך זה הופק דיגיטלית כהצהרה רגולטורית מותאמת (Fallback) בשל היעדר תבנית רשמית ייעודית בבנק התבניות המוסדי. החתימה הדיגיטלית להלן מהווה הצהרה משפטית בתוקף בכפוף לאימות OTP מול מייל האפוטרופוס.`;

  const form = {
    label: `הצהרה דיגיטלית מותאמת — ${actionLabel} קטין`,
    category: action,
    age_group: 'minor',
    ifa_form_reference: 'הצהרה דיגיטלית מותאמת (Fallback — פגת-תוקף)',
    is_dynamic_declaration: true,
    requires_guardian: true,
    required_signatures: ['guardian'],
  };
  const schema = [
    { key: 'player_full_name', label: 'שם השחקן הקטין', kind: 'auto', source: 'player.full_name' },
    { key: 'guardian_name', label: 'שם האפוטרופוס', kind: 'auto', source: 'player.guardian_name' },
    { key: 'guardian_id', label: 'ת.ז. אפוטרופוס', kind: 'auto', source: 'player.guardian_id' },
    { key: 'club_from', label: 'מועדון מעביר', kind: 'auto', source: 'transfer.club_from' },
    { key: 'club_to', label: 'מועדון קולט', kind: 'auto', source: 'transfer.club_to' },
    { key: 'consent_scope', label: 'היקף ההסכמה', kind: 'editable_user', default: 'מסכים/ה לפעולה המתוארת בהצהרה לעיל במלואה' },
  ];
  return { source: 'dynamic', form, schema, declarationText };
}

/**
 * נקודת כניסה אחידה: מחזיר תמיד { form, schema, source, declarationText? }.
 * source: 'catalog' | 'official' | 'dynamic'.
 */
export function resolveFormOrDeclaration(formKey, ctx = {}) {
  const tmpl = resolveFormTemplate(formKey);
  if (tmpl) return tmpl;
  return buildDynamicDeclaration({ formKey, ...ctx });
}