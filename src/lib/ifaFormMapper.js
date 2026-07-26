/**
 * ifaFormMapper — מנגנון מיפוי נתונים חכם
 * ממלא אוטומטית טפסי ההתאחדות בנתוני שחקן/מועדון/העברה מתוך מסד הנתונים,
 * ומייצר תוכן חוזה תקני + אזהרות תקינות לכל חוזה שנוצר.
 */

import { getOfficialForm } from './ifaOfficialForms';

// מפת שדות נפוצים → מקור נתונים אוטומטי
const FIELD_AUTO_SOURCE = {
  // שחקן
  full_name: 'player.full_name',
  player_name: 'player.full_name',
  name: 'player.full_name',
  id_number: 'player.id_number',
  player_id_number: 'player.id_number',
  birth_date: 'player.birth_date',
  player_birth_date: 'player.birth_date',
  position: 'player.position',
  player_position: 'player.position',
  phone: 'player.phone',
  player_phone: 'player.phone',
  address: 'playerAddress',
  player_address: 'playerAddress',
  ifa_id: 'player.ifa_id',
  team_name: 'player.team_name',
  // הורה/אפוטרופוס
  guardian_name: 'player.guardian_name',
  parent_name: 'player.guardian_name',
  guardian_id: 'player.guardian_id',
  parent_id: 'player.guardian_id',
  guardian_phone: 'player.parent_phone',
  guardian_email: 'player.parent_email',
  // מועדון
  club_name: 'clubName',
  club: 'clubName',
  club_contact: 'club.contact_name',
  contact_name: 'club.contact_name',
  league_name: 'club.league_name',
  // העברה
  club_from: 'transferFrom',
  club_to: 'transferTo',
  transfer_category: 'transfer.transfer_category',
  contract_value: 'transfer.contract_value',
  loan_start_date: 'transfer.loan_start_date',
  loan_end_date: 'transfer.loan_end_date',
};

function getNested(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function resolveAuto(key, ctx) {
  const source = FIELD_AUTO_SOURCE[key];
  if (!source) return undefined;
  if (source === 'playerAddress') return [ctx.player?.street_address, ctx.player?.city].filter(Boolean).join(', ');
  if (source === 'clubName') return ctx.club?.club_name || ctx.player?.team_name || '';
  if (source === 'transferFrom') return ctx.transfer?.club_from || ctx.player?.team_name || '';
  if (source === 'transferTo') return ctx.transfer?.club_to || ctx.transfer?.club_name || '';
  const [root, ...rest] = source.split('.');
  const rootObj = root === 'player' ? ctx.player : root === 'club' ? ctx.club : root === 'transfer' ? ctx.transfer : null;
  return rest.length ? getNested(rootObj, rest.join('.')) : rootObj;
}

/**
 * מיפוי ראשי: מקבל טופס + הקשר נתונים ומחזיר ערכים ממולאים + אזהרות
 * @param {object} opts
 * @param {string} opts.formKey — מפתח טופס מ-ifaOfficialForms
 * @param {object} opts.player — רשומת PlayerRegistration
 * @param {object} opts.club — רשומת Club (אופציונלי)
 * @param {object} opts.transfer — רשומת TransferProposal (אופציונלי)
 * @param {object} opts.contract — רשומת Contract (אופציונלי)
 * @param {object} opts.savedFilled — JSON שמור של filled_fields מהחוזה (אופציונלי)
 * @returns {{ values: object, warnings: Array, documentContent: string, autoMappedCount: number }}
 */
export function mapFormData({ formKey, player, club, transfer, contract, savedFilled = {} }) {
  const form = getOfficialForm(formKey);
  if (!form) return { values: {}, warnings: [{ key: 'form', label: 'טופס לא נמצא', reason: 'critical' }], documentContent: '', autoMappedCount: 0 };

  const ctx = { player: player || {}, club: club || {}, transfer: transfer || {} };
  const values = {};
  const warnings = [];
  let autoMappedCount = 0;

  // עריכת ערכים שכבר שמורים בחוזה (עדיפות גבוהה)
  if (savedFilled && typeof savedFilled === 'object') {
    Object.keys(savedFilled).forEach(k => {
      if (savedFilled[k] !== undefined && savedFilled[k] !== '') values[k] = savedFilled[k];
    });
  }

  // סעיפים ניתנים למשא ומתן
  (form.negotiable_fields || []).forEach(field => {
    const resolution = resolveField(field, ctx, contract, values);
    if (resolution.value !== undefined && resolution.value !== '') {
      values[field.key] = resolution.value;
      if (resolution.source === 'auto') autoMappedCount++;
    }
    if (resolution.source === 'missing' && field.required !== false) {
      warnings.push({ key: field.key, label: field.label, clause: field.clause, reason: 'missing_value', source: 'negotiable' });
    }
  });

  // שדות מנהל מקצועי / פרוטוקול
  (form.director_fillable_fields || []).forEach(field => {
    const resolution = resolveField(field, ctx, contract, values);
    if (resolution.value !== undefined && resolution.value !== '') {
      values[field.key] = resolution.value;
      if (resolution.source === 'auto') autoMappedCount++;
    } else if (field.default) {
      values[field.key] = field.default;
    }
    if (resolution.source === 'missing' && field.required) {
      warnings.push({ key: field.key, label: field.label, reason: 'missing_value', source: 'director' });
    }
  });

  // וידוא תקינות משפטית
  validateLegal(form, values, warnings);

  const documentContent = buildDocumentContent(form, values, ctx);

  return { values, warnings, documentContent, autoMappedCount };
}

function resolveField(field, ctx, contract, values) {
  // 1. ערך שכבר הוזן ידנית
  if (values[field.key] !== undefined && values[field.key] !== '') {
    return { value: values[field.key], source: 'manual' };
  }
  // 2. משדה מתאים בחוזה
  if (contract?.[field.key] !== undefined && contract[field.key] !== '' && contract[field.key] !== null) {
    return { value: contract[field.key], source: 'contract' };
  }
  // 3. מיפוי אוטומטי
  const autoVal = resolveAuto(field.key, ctx);
  if (autoVal !== undefined && autoVal !== '' && autoVal !== null) {
    return { value: autoVal, source: 'auto' };
  }
  return { value: undefined, source: 'missing' };
}

function validateLegal(form, values, warnings) {
  // קטין — חובה שם אפוטרופוס
  if (form.requires_guardian && !values.guardian_name && !values.parent_name) {
    warnings.push({ key: 'guardian', label: 'אפוטרופוס', reason: 'minor_requires_guardian', severity: 'critical' });
  }
  // חוזה — חובה תאריך סיום
  if (form.category === 'player_contract' || form.category === 'coach_contract') {
    if (!values.season_end && !values.end_date) {
      warnings.push({ key: 'end_date', label: 'תאריך סיום חוזה', reason: 'missing_end_date', severity: 'critical' });
    }
  }
}

function buildDocumentContent(form, values, ctx) {
  const header = `מסמך רשמי: ${form.label}\nמקור התאחדות: ${form.pdf_url || ''}\nהופק ע"י מערכת עילית ישראלית · ${new Date().toLocaleString('he-IL')}\n`;
  const parties = `\n--- פרטי הצדדים ---\nשחקן/מאמן: ${ctx.player?.full_name || '—'}\nת.ז.: ${ctx.player?.id_number || '—'}\nעמדה: ${ctx.player?.position || '—'}\nמועדון: ${values.club_name || ctx.club?.club_name || '—'}\n`;
  
  const fieldsBlock = (form.negotiable_fields || []).concat(form.director_fillable_fields || [])
    .filter(f => values[f.key] !== undefined)
    .map(f => `סעיף ${f.clause || '—'}: ${f.label} — ${values[f.key]}`)
    .join('\n');

  const consent = form.requires_guardian
    ? 'האפוטרופוס החוקי מאשר/ת בחתימה דיגיטלית את האמור, בהתאם לתקנון מעמד והעברות של שחקנים קטינים.'
    : 'החותם/ת מאשר/ת בחתימה דיגיטלית את האמור, בהתאם לתקנון ההתאחדות לכדורגל בישראל.';

  return `${header}\n${parties}\n--- סעיפי ההסכם ---\n${fieldsBlock}\n\n--- הצהרת הסכמה ---\n${consent}\n`;
}

/**
 * סיכום מהיר לתצוגה — כמה שדות מולאו אוטומטית לעומת חסרים
 */
export function getMappingSummary({ formKey, player, club, transfer, contract, savedFilled }) {
  const { values, warnings, autoMappedCount } = mapFormData({ formKey, player, club, transfer, contract, savedFilled });
  const form = getOfficialForm(formKey);
  const totalFields = (form?.negotiable_fields?.length || 0) + (form?.director_fillable_fields?.length || 0);
  const filledCount = Object.keys(values).length;
  const criticalCount = warnings.filter(w => w.severity === 'critical' || w.reason === 'minor_requires_guardian').length;
  return {
    totalFields,
    filledCount,
    autoMappedCount,
    missingCount: warnings.filter(w => w.reason === 'missing_value').length,
    criticalCount,
    isReady: criticalCount === 0 && warnings.filter(w => w.reason === 'missing_value').length === 0,
    warnings,
  };
}