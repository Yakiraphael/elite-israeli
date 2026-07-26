import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// מנוע התראות מבוסס תפקידים להעברות והשאלות שחקנים.
// פועל אוטומטית על כל שינוי ב-TransferProposal או TransferDocument ומעדכן
// שחקן, אפוטרופוס, מנהל מקצועי ומאמן בזמן אמת על סטטוס טפסי ההעברה/השאלה.

const PLAYER_FETCH_FIELDS = 'full_name,email,parent_email,parent_phone,is_adult,guardian_name,event_name,team_name,manager_email';

const STATUS_MESSAGES = {
  'מאושר — ממתין לאפוטרופוס': {
    audience: 'parent',
    type: 'transfer_status',
    title: 'נדרשת חתימתך על טופס העברה/השאלה',
    bodySuffix: ' (לחיצה על הכפתור תפתח את פורטל החתימה הדיגיטלית)',
    emailPref: 'transfer_offer',
  },
  'מאושר — ממתין לשחקן (בוגר)': {
    audience: 'player',
    type: 'transfer_status',
    title: 'ממתינים לאישורך על ההעברה/השאלה',
    emailPref: 'transfer_offer',
  },
  'ממתין לאימות התאחדות (IFA)': {
    audience: 'player',
    type: 'transfer_status',
    title: 'כל החתימות הושלמו — ממתינים לאישור סופי',
    bodySuffix: ' המנהל המקצועי יפיק את חבילת ההגשה להתאחדות.',
    emailPref: 'transfer_status',
    alsoParent: true,
  },
  'אושרה סופית': {
    audience: 'player',
    type: 'transfer_approved',
    title: 'ההעברה/השאלה אושרה סופית ✓',
    bodySuffix: ' חבילת ההגשה להתאחדות מוכנה.',
    emailPref: 'request_status',
    alsoParent: true,
  },
  'נדחתה': {
    audience: 'player',
    type: 'transfer_rejected',
    title: 'ההעברה/השאלה נדחתה',
    emailPref: 'request_status',
    alsoParent: true,
  },
};

async function notifyAudience(base44, { audience, type, title, body, player_id, player_name, transfer_id, transfer_category, target_email, send_email }) {
  // בכל מקרה — רשומת Notification במערכת (זמינה גם ללא מייל)
  const rec = {
    audience,
    type,
    title,
    body,
    player_id,
    player_name,
    transfer_id,
    transfer_category,
    link_tab: audience === 'director' || audience === 'coach' ? 'transfers' : 'portal',
  };
  if (target_email) rec.target_user_email = target_email;
  try {
    await base44.asServiceRole.entities.Notification.create(rec);
  } catch (err) {
    console.error('notif create failed', err?.message || err);
  }

  // שליחת מייל למשתמש רשום בלבד (SendEmail מגיע רק למשתמשי האפליקציה הרשומים)
  if (send_email && target_email) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: target_email,
        subject: title,
        body: `${body}\n\nשחקן: ${player_name || '—'}`,
      });
    } catch (err) {
      console.error('email send skipped (כנראה לא רשום):', err?.message || err);
    }
  }
}

async function fetchPlayer(base44, elite_id) {
  if (!elite_id) return null;
  try {
    const list = await base44.asServiceRole.entities.PlayerRegistration.filter({ elite_id }, '-created_date', 1);
    return list?.[0] || null;
  } catch (err) {
    console.error('player fetch failed', err?.message || err);
    return null;
  }
}

async function handleTransferProposal(base44, { event, data, old_data }) {
  const player = await fetchPlayer(base44, data.player_elite_id);
  const playerName = data.player_name || player?.full_name || '—';
  const isLoan = (data.transfer_category || '').startsWith('השאל');
  const actionWord = isLoan ? 'השאלה' : 'העברה';

  // יצירה חדשה: נרשמת רק למנהל מקצועי כדי לא לחשוף לשחקן/הורה לפני אישור פנימי
  if (event?.type === 'create') {
    await notifyAudience(base44, {
      audience: 'director',
      type: 'transfer_new',
      title: `${actionWord} חדשה מאושרת: ${playerName}`,
      body: `מועדון פונה: ${data.club_name} · ${data.transfer_category || 'העברת נוער'}`,
      player_id: data.player_elite_id,
      player_name: playerName,
      transfer_id: event.entity_id,
      transfer_category: data.transfer_category,
    });
    return;
  }

  // עדכון: בדיקת מעברי סטטוס
  if (event?.type === 'update') {
    const oldStatus = old_data?.status;
    const newStatus = data.status;
    const statusChanged = oldStatus !== newStatus;

    if (statusChanged && STATUS_MESSAGES[newStatus]) {
      const msg = STATUS_MESSAGES[newStatus];
      const body = `${msg.title} — ${playerName}, ${data.club_name}${msg.bodySuffix || ''}`;
      const targetEmail = msg.audience === 'parent' ? (player?.parent_email) : (msg.audience === 'player' ? (player?.email || player?.manager_email) : null);

      await notifyAudience(base44, {
        audience: msg.audience,
        type: msg.type,
        title: msg.title,
        body,
        player_id: data.player_elite_id,
        player_name: playerName,
        transfer_id: event.entity_id,
        transfer_category: data.transfer_category,
        target_email: targetEmail,
        send_email: true,
      });

      if (msg.alsoParent && player?.parent_email) {
        await notifyAudience(base44, {
          audience: 'parent',
          type: msg.type,
          title: msg.title,
          body,
          player_id: data.player_elite_id,
          player_name: playerName,
          transfer_id: event.entity_id,
          transfer_category: data.transfer_category,
          target_email: player.parent_email,
          send_email: true,
        });
      }
    }

    // אימות OTP אפוטרופוס הושלם → נרשמת למנהל מקצועי
    if (old_data?.guardian_otp_verified === false && data.guardian_otp_verified === true) {
      await notifyAudience(base44, {
        audience: 'director',
        type: 'transfer_doc_signed',
        title: `אפוטרופוס חתם דיגיטלית: ${playerName}`,
        body: `${actionWord} ל${data.club_name} מוכנה להמשך טיפול. חתימת ${data.guardian_consent_name || 'אפוטרופוס'} תועדה.`,
        player_id: data.player_elite_id,
        player_name: playerName,
        transfer_id: event.entity_id,
        transfer_category: data.transfer_category,
        send_email: false,
      });
    }

    // הסכמת שחקן בוגר נרשמה → נרשמת למנהל מקצועי
    if (old_data?.player_consent === false && data.player_consent === true) {
      await notifyAudience(base44, {
        audience: 'director',
        type: 'transfer_doc_signed',
        title: `שחקן אישר הסכמה: ${playerName}`,
        body: `${actionWord} ל${data.club_name} — הסכמת השחקן הבוגר נרשמה דיגיטלית.`,
        player_id: data.player_elite_id,
        player_name: playerName,
        transfer_id: event.entity_id,
        transfer_category: data.transfer_category,
        send_email: false,
      });
    }

    // אישור מאמן
    if (old_data?.coach_approval_status !== data.coach_approval_status &&
        (data.coach_approval_status === 'אושר על ידי מאמן' || data.coach_approval_status === 'נדחה על ידי מאמן')) {
      await notifyAudience(base44, {
        audience: 'director',
        type: 'transfer_status',
        title: `${data.coach_approval_status === 'אושר על ידי מאמן' ? 'אושר' : 'נדחה'} על-ידי מאמן: ${playerName}`,
        body: data.coach_approval_notes || '—',
        player_id: data.player_elite_id,
        player_name: playerName,
        transfer_id: event.entity_id,
        transfer_category: data.transfer_category,
        send_email: false,
      });
    }
  }
}

async function handleTransferDocument(base44, { event, data, old_data }) {
  // חתימה דיגיטלית על מסמך העברה/השאלה הושלמה → התראה לכל התפקידים
  if (event?.type === 'create' && data.status === 'נחתם דיגיטלית') {
    // שליפת ההצעה כדי לזהות שחקן וקטגוריה
    let proposal = null;
    try {
      proposal = await base44.asServiceRole.entities.TransferProposal.get(data.transfer_id);
    } catch { /* ignore */ }
    const player = proposal ? await fetchPlayer(base44, proposal.player_elite_id) : null;
    const playerName = proposal?.player_name || '—';
    const isLoan = (proposal?.transfer_category || '').startsWith('השאל');
    const actionWord = isLoan ? 'השאלה' : 'העברה';

    await notifyAudience(base44, {
      audience: 'director',
      type: 'transfer_doc_signed',
      title: `מסמך ${data.doc_label || 'IFA'} נחתם: ${playerName}`,
      body: `${actionWord} ל${proposal?.club_name || '—'} — חותם: ${data.signature_name || '—'} · ${data.signed_at || ''}`,
      player_id: proposal?.player_elite_id,
      player_name: playerName,
      transfer_id: data.transfer_id,
      transfer_category: proposal?.transfer_category,
      send_email: false,
    });

    // עדכון השחקן / האפוטרופוס על השלמת חתימה
    if (player && !player.is_adult && player.parent_email) {
      await notifyAudience(base44, {
        audience: 'parent',
        type: 'transfer_doc_signed',
        title: 'החתימה הדיגיטלית שלך נקלטה ✓',
        body: `${data.doc_label || 'טופס העברה/השאלה'} נחתם בהצלחה עבור ${playerName}.`,
        player_id: proposal?.player_elite_id,
        player_name: playerName,
        transfer_id: data.transfer_id,
        transfer_category: proposal?.transfer_category,
        target_email: player.parent_email,
        send_email: true,
      });
    }
  }

  // עדכון סטטוס של מסמך קיים ל"נחתם דיגיטלית"
  if (event?.type === 'update' && old_data?.status !== 'נחתם דיגיטלית' && data.status === 'נחתם דיגיטלית') {
    // רישום דומה — נזהה שחקן ושלח התראה למנהל מקצועי
    let proposal = null;
    try { proposal = await base44.asServiceRole.entities.TransferProposal.get(data.transfer_id); } catch { /* ignore */ }
    const player = proposal ? await fetchPlayer(base44, proposal.player_elite_id) : null;
    const playerName = proposal?.player_name || '—';
    await notifyAudience(base44, {
      audience: 'director',
      type: 'transfer_doc_signed',
      title: `מסמך ${data.doc_label || 'IFA'} נחתם: ${playerName}`,
      body: `חותם: ${data.signature_name || '—'} · ${data.signed_at || ''}`,
      player_id: proposal?.player_elite_id,
      player_name: playerName,
      transfer_id: data.transfer_id,
      transfer_category: proposal?.transfer_category,
      send_email: false,
    });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;
    const entityName = event?.entity_name;

    if (entityName === 'TransferProposal') {
      await handleTransferProposal(base44, { event, data, old_data });
    } else if (entityName === 'TransferDocument') {
      await handleTransferDocument(base44, { event, data, old_data });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('routeTransferStatusNotification error:', error?.message || error);
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});