import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// מנוע QA פנימי רציף — סריקה יומית אוטומטית של כלל תהליכי המערכת מול רגולציית IFA:
//  - רישום קטינים (אפוטרופוס / ספח ת.ז. / אישור מדיה)
//  - בריאות וביטוח (אישור רפואי פג/פגיע)
//  - חוזים (נוער ללא חתימת אפוטרופוס / חוזים תקועים)
//  - העברות (קטין שעבר שער אפוטרופוס ללא OTP — תיקון אוטומטי: החזרת סטטוס)
//  - יומן ביקורת (פעולות חתימה ללא actor_id — Non-repudiation gap)
//  - UX/ארכיטקטורה (מודאלים נדרשים ל-ResponsiveModal — מניעת גלילה כפולה)
// ממצאים נשמרים בישות QaFinding באופן idempotent: סגירת ממצאים שהוסדרו + הוספת חדשים בלבד.

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

function isMinor(p) {
  if (p.is_adult === true) return false;
  if (!p.birth_date) return true; // גיל לא ידוע — מדיניות "Minor-First" מתייחסת כקטין
  const ageMs = Date.now() - new Date(p.birth_date).getTime();
  return ageMs < 18 * 365.25 * 24 * 3600 * 1000;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // הפעלה מתוזמנת (ללא משתמש) או ידנית — שתיהן רצות כ-service role.
    // קריאת הממצאים עצמם נעולה ב-RLS לאדמין בישות QaFinding, והתגובה חושפת רק ספירות.
    try { await base44.auth.me(); } catch { /* scheduled context — no user */ }

    const db = base44.asServiceRole;
    const runId = `qa_${new Date().toISOString()}`;
    const now = Date.now();

    const players = await db.entities.PlayerRegistration.list('-created_date', 1000);
    const contracts = await db.entities.Contract.list('-created_date', 500);
    const transfers = await db.entities.TransferProposal.list('-created_date', 500);
    const auditLogs = await db.entities.AuditLog.list('-created_date', 500);

    const failures = [];

    // === רישום קטינים — IFA youth registration gates ===
    for (const p of players) {
      if (!isMinor(p)) continue;
      const missing = [];
      if (!p.guardian_name) missing.push('שם אפוטרופוס');
      if (!p.guardian_id) missing.push('ת.ז. אפוטרופוס');
      if (!p.parent_email) missing.push('מייל הורה');
      if (missing.length) {
        failures.push({
          check_type: 'minor_missing_guardian', check_key: `minor_missing_guardian:${p.id}`,
          severity: 'critical', category: 'רישום קטינים',
          title: `קטין ללא פרטי אפוטרופוס — ${p.full_name || ''}`,
          detail: `חסר: ${missing.join(', ')}. רישום קטין חייב בשם הורה/אפוטרופוס, ת.ז. ומייל לפי תקנון IFA.`,
          fix_hint: 'פתח את תיק השחקן והשלם את פרטי האפוטרופוס לפני אישור רישום ב-IFA.',
          target_type: 'PlayerRegistration', target_id: p.id, target_name: p.full_name,
        });
      }
      if (!p.id_suffix_url) {
        failures.push({
          check_type: 'minor_missing_id_suffix', check_key: `minor_missing_id_suffix:${p.id}`,
          severity: 'critical', category: 'רישום קטינים',
          title: `קטין ללא ספח ת.ז. — ${p.full_name || ''}`,
          detail: 'חובה להעלות ספח תעודת זהות פתוח כהוכחת ייחוס הורה-קטין.',
          fix_hint: 'העלה ספח ת.ז. בתיק הרישום.',
          target_type: 'PlayerRegistration', target_id: p.id, target_name: p.full_name,
        });
      }
      const cons = p.legal_terms_accepted || {};
      if (cons.media_consent !== true) {
        failures.push({
          check_type: 'minor_missing_media_consent', check_key: `minor_missing_media_consent:${p.id}`,
          severity: 'warning', category: 'רישום קטינים',
          title: `קטין ללא אישור שימוש במדיה — ${p.full_name || ''}`,
          detail: 'אישור מדיה הוא שער חובה לקטינים על-פי minorGuard.',
          fix_hint: 'חתימת אפוטרופוס על אישור מדיה בפורטל האפוטרופוס.',
          target_type: 'PlayerRegistration', target_id: p.id, target_name: p.full_name,
        });
      }
    }

    // === בריאות וביטוח — medical validity ===
    for (const p of players) {
      const medExp = p.medical_expiry_date ? new Date(p.medical_expiry_date).getTime() : null;
      if (medExp === null) continue;
      const diff = medExp - now;
      if (diff < 0) {
        failures.push({
          check_type: 'medical_expired', check_key: `medical_expired:${p.id}`,
          severity: 'critical', category: 'בריאות וביטוח',
          title: `אישור רפואי פג תוקף — ${p.full_name || ''}`,
          detail: `פג ב-${new Date(medExp).toLocaleDateString('he-IL')}. השחקן אינו כשיר רגולטורית.`,
          fix_hint: 'חדש אישור רפואי ועדכן את שדה medical_expiry_date.',
          target_type: 'PlayerRegistration', target_id: p.id, target_name: p.full_name,
        });
      } else if (diff < THIRTY_DAYS) {
        failures.push({
          check_type: 'medical_expiring', check_key: `medical_expiring:${p.id}`,
          severity: 'warning', category: 'בריאות וביטוח',
          title: `אישור רפואי עומד לפוג — ${p.full_name || ''}`,
          detail: `פקיעה בעוד ${Math.ceil(diff / (24 * 3600 * 1000))} ימים.`,
          fix_hint: 'הנפק אישור רפואי מחודש לפני הפקיעה.',
          target_type: 'PlayerRegistration', target_id: p.id, target_name: p.full_name,
        });
      }
    }

    // === חוזים ===
    for (const c of contracts) {
      if (c.requires_guardian && !c.guardian_signed_at) {
        failures.push({
          check_type: 'contract_guardian_unsigned', check_key: `contract_guardian_unsigned:${c.id}`,
          severity: 'warning', category: 'חוזים',
          title: `חוזה נוער ממתין לחתימת אפוטרופוס — ${c.player_name || ''}`,
          detail: `סטטוס: ${c.status || '—'}. חוזה דורש אפוטרופוס אך לא נחתם על-ידו.`,
          fix_hint: 'שלח תזכורת חתימה לאפוטרופוס דרך פורטל האפוטרופוס.',
          target_type: 'Contract', target_id: c.id, target_name: c.player_name,
        });
      }
      if (c.status === 'ממתין לחתימה' && c.created_date && (now - new Date(c.created_date).getTime()) > TWO_WEEKS) {
        failures.push({
          check_type: 'contract_unsigned_stale', check_key: `contract_unsigned_stale:${c.id}`,
          severity: 'info', category: 'חוזים',
          title: `חוזה ממתין לחתימה מעל שבועיים — ${c.player_name || ''}`,
          detail: 'סטטוס "ממתין לחתימה" ללא פעולה מעל 14 ימים.',
          fix_hint: 'בדוק עם החותם; הארך או בטל לפי נהלי המועדון.',
          target_type: 'Contract', target_id: c.id, target_name: c.player_name,
        });
      }
    }

    // === העברות — אינטגריטת שער אפוטרופוס OTP (תיקון אוטומטי) ===
    const pastGuardianStatuses = ['ממתין לאימות תשלום (בוגר)', 'ממתין לאימות התאחדות (IFA)', 'אושרה סופית'];
    for (const t of transfers) {
      if (!t.is_adult && pastGuardianStatuses.includes(t.status) && !t.guardian_otp_verified) {
        failures.push({
          check_type: 'transfer_guardian_otp_gap', check_key: `transfer_guardian_otp_gap:${t.id}`,
          severity: 'critical', category: 'העברות ומו"מ',
          title: `מעבר קטין עבר שער אפוטרופוס ללא OTP — ${t.player_name || ''}`,
          detail: `סטטוס היה "${t.status}" ללא guardian_otp_verified. פרצת Non-repudiation.`,
          fix_hint: 'הוחזר אוטומטית לשלב "ממתין לאפוטרופוס"; נדרש אימות OTP מחדש.',
          target_type: 'TransferProposal', target_id: t.id, target_name: t.player_name,
          autoFix: { status: 'מאושר — ממתין לאפוטרופוס', guardian_otp_verified: false },
        });
      }
    }

    // === יומן ביקורת — Non-repudiation ===
    for (const a of auditLogs) {
      if (['sign_player', 'consent_signed'].includes(a.action) && !a.actor_id) {
        failures.push({
          check_type: 'audit_actor_missing', check_key: `audit_actor_missing:${a.id}`,
          severity: 'warning', category: 'יומן ביקורת',
          title: 'פעולת חתימה ללא מזהה שחקן ביומן',
          detail: `פעולה ${a.action} נרשמה ללא actor_id — פער Non-repudiation.`,
          fix_hint: 'בדוק את נתיב החתימה שיצר את הרשומה; ודא שמבצע מאומת.',
          target_type: 'AuditLog', target_id: a.id, target_name: a.actor_name,
        });
      }
    }

    // === UX/ארכיטקטורה — מניעת גלילה כפולה ===
    failures.push({
      check_type: 'ui_modal_scroll_risk', check_key: 'ui_modal_scroll_risk:responsive_modal_retrofit',
      severity: 'info', category: 'UX/ארכיטקטורה',
      title: 'מודאלים נדרשים למעטפת ResponsiveModal',
      detail: 'נוסף רכיב shared/ResponsiveModal עם נעילת גלילת גוף וגליל יחיד. יש להרחיב את הטמעתו לכלל החלונות הנפתחים כדי למנוע גלילה כפולה.',
      fix_hint: 'החלף כל Backdrop ידני ב-<ResponsiveModal size="lg" title=... onClose=...>.',
      target_type: 'Architecture', target_id: 'global', target_name: 'ResponsiveModal retrofit',
    });

    // === תיקון אוטומטי (Auto-Correction) ===
    const autoFixedKeys = new Set();
    for (const f of failures) {
      if (f.autoFix) {
        try {
          await db.entities.TransferProposal.update(f.target_id, f.autoFix);
          autoFixedKeys.add(f.check_key);
        } catch (e) { /* שמור את הממצא פתוח אם התיקון נכשל */ }
      }
    }

    // === Idempotent sync מול ממצאים קודמים ===
    const currentKeys = new Set(failures.map(f => f.check_key));
    const previous = await db.entities.QaFinding.filter({ status: 'open' }, null, 500);

    // סגירת ממצאים שהוסדרו מאז הריצה הקודמת
    const toResolve = previous.filter(p => !currentKeys.has(p.check_key));
    if (toResolve.length) {
      await db.entities.QaFinding.bulkUpdate(
        toResolve.map(p => ({ id: p.id, status: 'resolved', resolved_at: new Date().toISOString() }))
      );
    }

    // הוספת ממצאים חדשים בלבד (שלא כבר פתוחים)
    const existingOpenKeys = new Set(previous.map(p => p.check_key));
    const toInsert = failures
      .filter(f => !existingOpenKeys.has(f.check_key))
      .map(f => {
        const rec = {
          check_key: f.check_key, check_type: f.check_type, severity: f.severity, category: f.category,
          title: f.title, detail: f.detail, fix_hint: f.fix_hint,
          target_type: f.target_type, target_id: f.target_id, target_name: f.target_name,
          run_id: runId,
          status: f.autoFix && autoFixedKeys.has(f.check_key) ? 'auto_fixed' : 'open',
        };
        if (f.autoFix && autoFixedKeys.has(f.check_key)) {
          rec.auto_fix_applied = 'סטטוס הוחזר לשלב אפוטרופוס; נדרש אימות OTP מחדש.';
        }
        return rec;
      });
    if (toInsert.length) await db.entities.QaFinding.bulkCreate(toInsert);

    // רענון חומרה/פירוט לממצאים שעדיין פתוחים
    for (const p of previous.filter(p => currentKeys.has(p.check_key))) {
      const f = failures.find(x => x.check_key === p.check_key);
      if (!f) continue;
      await db.entities.QaFinding.update(p.id, {
        severity: f.severity, detail: f.detail, target_name: f.target_name, run_id: runId,
      });
    }

    const severityBreakdown = failures.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});

    return Response.json({
      run_id: runId,
      total_findings: failures.length,
      auto_fixed: autoFixedKeys.size,
      new_inserted: toInsert.length,
      resolved: toResolve.length,
      severity_breakdown: severityBreakdown,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}