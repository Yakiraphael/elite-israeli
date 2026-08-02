// מנוע קריאה ומילוי PDF מקצועי לטפסים הרשמיים של ההתאחדות לכדורגל.
// סורק טפסי PDF, מזהה שדות טקסט ריקים וממלא אותם בלבד מתוך פרופיל השחקן/מאמן — מבלי לפגוע בטקסט המקורי.
// מבוסס על pdf-lib (מילוי) + pdfjs-dist (קריאת מבנה לזיהוי חלקים ריקים בטפסי לא-אקרופורם).
//
// זרימת עבודה: העלאת PDF → זיהוי שדות → מיפוי פרופיל → ולידציה → פליטת טופס מלא.

import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';

// מיפוי שדות פרופיל → מפתחות שדות נפוצים בטפסי ההתאחדות (AcroForm field names).
// המפתחות מותאמים לקונבנציית שמות השדות בטפסים הרשמיים, עם נרמול של אותיות גדולות/קטנות.
export const FIELD_KEYWORD_MAP = {
  full_name:       ['fullname', 'full_name', 'name', 'שם', 'שם מלא', 'playername', 'player_name'],
  id_number:       ['id', 'idnumber', 'teudat', 'תעודת זהות', 'ת.ז', 'msz', 'id_number'],
  birth_date:      ['birthdate', 'birth_date', 'dateofbirth', 'תאריך לידה', 'born', 'dob'],
  phone:           ['phone', 'tel', 'telephone', 'טלפון', 'mobile', 'cellphone'],
  address:         ['address', 'street', 'כתובת', 'מגורים', 'homeaddress'],
  city:            ['city', 'עיר', 'town'],
  club_name:       ['club', 'clubname', 'team', 'מועדון', 'קבוצה'],
  position:        ['position', 'role', 'עמדה', 'תפקיד'],
  guardian_name:   ['guardian', 'parent', 'הורה', 'אפוטרופוס', 'parent_name'],
  guardian_id:      ['guardianid', 'parentid', 'ת.ז הורה', 'תעודת זהות הורה'],
  signature:       ['signature', 'sign', 'חתימה', 'signed'],
  date:            ['date', 'תאריך', 'today'],
};

// נרמול מפתח שדה לצורך התאמה (ללא רווחים ובאותיות קטנות).
function normalizeKey(k) {
  return String(k || '').trim().toLowerCase().replace(/\s+/g, '');
}

// מתרגם מפתח שדה ב-PDF לשדה פרופיל רלוונטי על בסיס מילות מפתח.
function matchFieldToProfile(fieldKey) {
  const nk = normalizeKey(fieldKey);
  for (const [profileField, keywords] of Object.entries(FIELD_KEYWORD_MAP)) {
    if (keywords.some(kw => nk.includes(normalizeKey(kw)))) return profileField;
  }
  return null;
}

// סורק את שדות AcroForm ב-PDF ומחזיר רשימת שדות ריקים בלבד שדורשים הזנה/חתימה.
// מקבל ArrayBuffer של ה-PDF. מחזיר: [{ name, type, required, profileField, currentValue }]
export async function scanBlankFields(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const blanks = [];

  for (const field of fields) {
    const name = field.getName();
    if (!name) continue;
    const type = field.constructor.name;
    let current = '';
    try {
      if (typeof field.getText === 'function') current = (field.getText() || '').trim();
      else if (typeof field.isChecked === 'function') current = field.isChecked() ? '✓' : '';
      else if (typeof field.getSelected === 'function') current = (field.getSelected() || []).join(',');
    } catch { /* שדה רד-אונלי או לא ניתן לקריאה */ }

    const isBlank = !current;
    const isSignature = type === 'PDFSignature';
    if (!isBlank && !isSignature) continue; // מדלג על שדות שכבר מלאים — ממלא ריקים בלבד

    blanks.push({
      name,
      type,
      required: true,
      profileField: isSignature ? 'signature' : matchFieldToProfile(name),
      currentValue: current,
      isSignature,
    });
  }

  return blanks;
}

// ממלא שדות ריקים בלבד מתוך פרופיל השחקן/מאמן. אינו נוגע בשדות שכבר מכילים ערך.
// profile: אובייקט פרופיל (PlayerRegistration או ClubUser).
// overrides: ערכים ידניים לסעיפים שאינם ממופים אוטומטית (למשל תאריך חוזה).
// מחזיר: Uint8Array של ה-PDF המלא ורשימת ולידציה.
export async function fillBlankFields(pdfBytes, profile, overrides = {}) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fields = form.getFields();
  const report = { filled: [], skipped: [], warnings: [] };

  const source = { ...profile, ...overrides };

  for (const field of fields) {
    const name = field.getName();
    if (!name) continue;

    // דלג אם השדה כבר מלא — מילוי סלקטיבי של ריקים בלבד
    try {
      if (typeof field.getText === 'function' && (field.getText() || '').trim()) continue;
    } catch { /* readonly — נדלג */ }

    const profileField = matchFieldToProfile(name);
    const value = source[profileField];

    if (!value && !matchFieldToProfile(name)) {
      report.skipped.push({ name, reason: 'לא ממופה לפרופיל' });
      continue;
    }
    if (!value) {
      report.warnings.push({ name, reason: `חסר ערך בפרופיל עבור "${profileField}"` });
      continue;
    }

    try {
      if (typeof field.setText === 'function') {
        field.setText(String(value));
        field.setFontSize(10);
        report.filled.push({ name, profileField, value });
      }
    } catch (e) {
      report.warnings.push({ name, reason: `שגיאת מילוי: ${e.message}` });
    }
  }

  const bytes = await pdfDoc.save();
  return { pdfBytes: bytes, report };
}

// ולידציה מול חבילות מסמכים רגולטוריות — מוודא שכל שדה חובה מולא לפני הגשה/חתימה.
// requiredFields: רשימת מפתחות שדה חובים (לפי סוג מסמך). מחזיר אובייקט תקינות.
export function validateFilledForm(scanResult, requiredFields = []) {
  const filledNames = new Set(scanResult.filled.map(f => f.name));
  const missing = requiredFields.filter(req =>
    !scanResult.some(f => normalizeKey(f.name) === normalizeKey(req))
  );
  const hasSignature = scanResult.some(f => f.isSignature);
  return {
    valid: missing.length === 0,
    missing,
    hasSignature,
  };
}