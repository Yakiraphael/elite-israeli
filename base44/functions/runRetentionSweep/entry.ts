import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

// ============================================================
// runRetentionSweep — מדיניות מחיקה אוטומטית של נתוני קטינים
// ============================================================
// פונקציה מתוזמנת (שבועית). מזהה קטינים שחדלו מפעילות לפני יותר
// מ-retention_minor_days_after_inactivity (ברירת מחדל 2555 ימים ≈ 7 שנים,
// בהתאם לחוקי העזר של ההתאחדות), ומבצע אנונימיזציה של שדות PII
// (ברירת מחדל) או מחיקה קשה לפי הגדרת ComplianceSettings.
//
// "סיום פעילות" = המאוחר מבין contract_end_date / updated_date / created_date.
// כל פעולה נרשמת ב-AuditLog תחת action retention_anonymize / retention_delete
// יחד עם terms_version התקנון הפעיל, לשם שחזור מדויק של התנאים בביקורת עתידית.
// ============================================================

const CURRENT_REGULATION_VERSION = 'IFA-REG-2026.1';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 2555;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  console.log('[runRetentionSweep] start');
  try {
    const settingsList = await base44.asServiceRole.entities.ComplianceSettings.list();
    const settings = settingsList[0] || null;

    if (!settings || !settings.retention_enabled) {
      console.log('[runRetentionSweep] retention disabled — skipping');
      return Response.json({ skipped: true, reason: 'retention disabled' });
    }

    const days = Number(settings.retention_minor_days_after_inactivity) || DEFAULT_DAYS;
    const anonymize = settings.retention_anonymize_only !== false;
    const threshold = Date.now() - days * MS_PER_DAY;
    console.log(`[runRetentionSweep] days=${days} anonymize=${anonymize} threshold=${new Date(threshold).toISOString()}`);

    const players = await base44.asServiceRole.entities.PlayerRegistration.list('-created_date', 1000);
    const minors = players.filter(p => p.is_adult === false);
    console.log(`[runRetentionSweep] scanned ${players.length} registrations, ${minors.length} minors`);

    let processed = 0;
    const report = [];

    for (const p of minors) {
      const endDateStr = p.contract_end_date || p.updated_date || p.created_date;
      if (!endDateStr) continue;

      const endTs = new Date(endDateStr).getTime();
      if (!endTs || endTs > threshold) continue;

      try {
        if (anonymize) {
          await base44.asServiceRole.entities.PlayerRegistration.update(p.id, {
            full_name: '[נתונים אנונימיו]',
            id_number: null,
            phone: null,
            street_address: null,
            parent_phone: null,
            parent_email: null,
            guardian_name: null,
            guardian_id: null,
            id_document_url: null,
            id_suffix_url: null,
            medical_certificate_url: null,
            documents: [],
            digital_signature: null,
            internal_notes: null,
          });
          await base44.asServiceRole.entities.AuditLog.create({
            actor_id: 'system',
            actor_name: 'Retention Sweep',
            actor_role: 'system',
            action: 'retention_anonymize',
            player_id: p.id,
            details: `PII אנונימי לאחר ${days} ימי חוסר-פעילות (סיום פעילות: ${endDateStr})`,
            terms_version: CURRENT_REGULATION_VERSION,
          });
          report.push({ id: p.id, mode: 'anonymize' });
        } else {
          await base44.asServiceRole.entities.PlayerRegistration.delete(p.id);
          await base44.asServiceRole.entities.AuditLog.create({
            actor_id: 'system',
            actor_name: 'Retention Sweep',
            actor_role: 'system',
            action: 'retention_delete',
            player_id: p.id,
            details: `מחיקה קשה לאחר ${days} ימי חוסר-פעילות (סיום פעילות: ${endDateStr})`,
            terms_version: CURRENT_REGULATION_VERSION,
          });
          report.push({ id: p.id, mode: 'delete' });
        }
        processed++;
      } catch (err) {
        console.error(`[runRetentionSweep] failed for ${p.id}:`, err.message);
      }
    }

    if (settings.id) {
      try {
        await base44.asServiceRole.entities.ComplianceSettings.update(settings.id, {
          retention_last_sweep_at: new Date().toISOString(),
          retention_last_sweep_count: processed,
        });
      } catch (e) {
        console.error('[runRetentionSweep] settings update failed:', e.message);
      }
    }

    console.log(`[runRetentionSweep] done — processed=${processed}`);
    return Response.json({ processed, anonymize, days, report });
  } catch (error) {
    console.error('[runRetentionSweep] fatal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});