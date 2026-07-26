// ספריית תבניות חוזים חכמות מבוססות טפסי ההתאחדות לכדורגל בישראל (football.org.il/forms).
// כל תבנית מייצרת תוכן משפטי מובנה הניתן לחתימה דיגיטלית של שחקן ו/או אפוטרופוס.
// מטרה: מנגנון משפטי מלא ויעיל לשחקן ולקבוצה — לייעול כל תהליכי ההתקשרות.

export const IFA_TEMPLATES = [
  {
    key: 'ifa_minor_agreement',
    label: 'חוזה שחקן קטין (נוער)',
    contract_type: 'חוזה נוער',
    ifa_form_reference: 'תקנון מעמד והעברות של שחקנים קטינים — ההתאחדות לכדורגל בישראל',
    reference_url: 'https://www.football.org.il/files/takanon/4.25/',
    requires_guardian: true,
    description: 'מבוסס על תקנון מעמד והעברות שחקנים קטינים של ההתאחדות. נדרשת חתימת שחקן + אפוטרופוס.',
  },
  {
    key: 'ifa_amateur_agreement',
    label: 'חוזה שחקן חובבני (בוגר)',
    contract_type: 'חוזה חובבני',
    ifa_form_reference: 'טופס הסכם שחקן חובב — ההתאחדות לכדורגל בישראל',
    reference_url: 'https://www.football.org.il/files/forms/',
    requires_guardian: false,
    description: 'מבוסס על טופס הסכם שחקן חובב. נדרשת חתימת שחקן בוגר בלבד.',
  },
  {
    key: 'ifa_professional_agreement',
    label: 'חוזה שחקן מקצועי (בוגר)',
    contract_type: 'חוזה מקצועי',
    ifa_form_reference: 'נספח א׳ לתקנון בקרת תקציבים — טופס הסכם שחקן (61317)',
    reference_url: 'https://www.football.org.il/files/forms/a85dz36fw9.pdf',
    requires_guardian: false,
    description: 'מבוסס על נספח א׳ לתקנון בקרת תקציבים — טופס הסכם שחקן. נדרשת חתימת שחקן בוגר בלבד.',
  },
];

export function getTemplate(key) {
  return IFA_TEMPLATES.find(t => t.key === key) || IFA_TEMPLATES[0];
}

function fmtDate(d) {
  if (!d) return '____';
  try { return new Date(d).toLocaleDateString('he-IL'); } catch { return d; }
}

// יצירת תוכן חוזה דיגיטלי המותאםן לחתימה על בסיס תבנית ההתאחדות.
export function buildContractDocument(template, data) {
  const tpl = typeof template === 'string' ? getTemplate(template) : template;
  const {
    player_name, id_number, team_name, club_name,
    start_date, end_date, salary_monthly, season_label,
  guardian_name, is_adult, player_phone, ifa_id, notes,
  contract_type,
  created_by_club,
  issued_by_name,
  issued_by_role,
  issued_at,
  created_date,
  contract_id,
  contract_origin,
    // signed reservation for document creation (prefilled)
  } = data || {};

  const season = season_label || 'עונה נוכחית';
  const club = club_name || team_name || 'המועדון החתום';
  const issuedDate = fmtDate(issued_at || created_date);

  const header = [
    `הסכם שחקן — ${contract_type || tpl.contract_type}`,
    `מסמך ייחוס: ${tpl.ifa_form_reference}`,
    `מספר חוזה פנימי: ${contract_id || created_date || '—'}`,
    `תאריך הנפקה: ${issuedDate}`,
    '',
  ].join('\n');

  const parties = [
    'צדדים להסכם:',
    `1. המועדון: ${club} (להלן "המועדון").`,
    `   נציג המועדון החתום: ${issued_by_name || '—'} — תפקיד: ${issued_by_role || '—'}.`,
    `2. השחקן: ${player_name || '—'}${ifa_id ? ` · מס׳ כרטיס שחקן ${ifa_id}` : ''}.`,
    is_adult === false && guardian_name
      ? `   באמצעות האפוטרופוס: ${guardian_name} (להלן "האפוטרופוס").`
      : '',
  ].filter(Boolean).join('\n');

  const clauses = [
    '',
    'סעיפים עיקריים:',
    `1. תחולה והסכמה מלאה לתקנון הרישום ותקנון מעמד והעברות של ההתאחדות לכדורגל בישראל${tpl.reference_url ? ` (${tpl.reference_url})` : ''}.`,
    `2. תקופת החוזה: מ-${fmtDate(start_date)} ועד ${fmtDate(end_date)} (לרבות עונת ${season}).`,
    salary_monthly ? `3. שכר חודשי: ₪${Number(salary_monthly).toLocaleString('he-IL')} (בכפוף לתקנון בקרת תקציבים).` : '3. שכר: חובב / ללא תמורה כספית (חוזה חובבני).',
    '4. זכויות וחובות השחקן: הקפדה על נוהלי התאחדות, ביטוח, בדיקות רפואיות בתוקף ומשמעת ספורטיבית.',
    '5. העברה: כל העברה תעשה בהתאם לתקנון ההעברות של ההתאחדות ובכפוף לאישורי הגורמים הרלוונטיים.',
    '6. ביטוח: המועדון מתחייב לבטח את השחקן בהתאם לחוק הספורט ותקנות ההתאחדות.',
    '7. מחלוקות: יעברו בירור מול בית הדין של ההתאחדות לכדורגל בישראל.',
  ].join('\n');

  const signatureBlock = [
    '',
    'מקום לחתימה דיגיטלית — בעת החתימה מתועדים שם, תאריך, שעה וכתובת IP:',
    '— חתימת נציג המועדון (נחתמת על ידי המנפיק בעת יצירת החוזה).',
    tpl.requires_guardian ? '— חתימת השחקן הקטין + חתימת האפוטרופוס (שני חותמים — סטטוס "חתום" יינעץ לאחר שני החותמים).' : '— חתימת השחקן הבוגר.',
    '',
    notes ? `הערות נוספות: ${notes}` : '',
  ].filter(Boolean).join('\n');

  const account_note =
    `— לייעול תהליכים: חוזה זה נוצר, נשלח ונחתם אוטומטית דרך המערכת${created_by_club ? ` על ידי ${created_by_club}` : ''}. מערכת שמירת החוזה תעדכן את הסטטוס בפרופיל השחקן והמועדון לאחר השלמת כל החתימות הנדרשות.`;

  return [header, parties, clauses, signatureBlock, '', account_note].join('\n').trim();
}

// סטטוס חתימה נדרש לפי תבנית ושחקן
export function requiredSignatures(contract) {
  const tpl = getTemplate(contract.ifa_template_key);
  const needsGuardian = contract.requires_guardian ?? tpl.requires_guardian;
  return needsGuardian ? ['player', 'guardian'] : ['player'];
}

// האם כל החתימות הנדרשות הושלמו
export function isFullySigned(contract) {
  const req = requiredSignatures(contract);
  if (req.includes('player') && !contract.player_signed_at) return false;
  if (req.includes('guardian') && !contract.guardian_signed_at) return false;
  return true;
}

// תוויות סטטוס חתימה לתצוגה
export function signatureStatus(contract) {
  const req = requiredSignatures(contract);
  const res = {};
  if (req.includes('player')) {
    res.player = contract.player_signed_at
      ? { label: `✓ נחתם ע״י ${contract.player_signature_name || '—'}`, cls: 'text-green-400', at: contract.player_signed_at }
      : { label: '⏳ ממתין לחתימת שחקן', cls: 'text-amber-400', at: null };
  }
  if (req.includes('guardian')) {
    res.guardian = contract.guardian_signed_at
      ? { label: `✓ נחתם ע״י ${contract.guardian_signature_name || '—'}`, cls: 'text-green-400', at: contract.guardian_signed_at }
      : { label: '⏳ ממתין לחתימת אפוטרופוס', cls: 'text-amber-400', at: null };
  }
  res.ready = isFullySigned(contract);
  res.requires_guardian = req.includes('guardian');
  return res;
}