import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ============================================================
// bridge-engine — גשר חובבני → מקצועי (Amateur-to-Professional Bridge)
// פעולות (action):
//   scoutToAcademy | approve | reject | list
//   complianceList | complianceVerify | complianceUpload
//   growthList | growthAdd
// RBAC: ניהול צינור מעבר + אימות מסמכים = director/admin. צפיית תאימות = director/admin/מאמן מוסמך. מדידת התפתחות = גם מאמן.
// ============================================================

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const canManage = user.role === 'admin' || user.role === 'director';
    const canReadCompliance = canManage || user.role === 'coach';

    // ---------- scoutToAcademy: יצירת צינור מעבר ממסגרת עממית למועדון התאחדות ----------
    if (action === 'scoutToAcademy') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { player_id, target_club_id, target_club_name, source_org_id, source_org_name, source_org_classification, bridge_fee, sell_on_clause, notes } = body;
      if (!player_id || !target_club_id) return Response.json({ error: 'נדרשים player_id ו-target_club_id' }, { status: 400 });

      const player = await base44.entities.PlayerRegistration.get(player_id);
      if (!player) return Response.json({ error: 'שחקן לא נמצא' }, { status: 404 });

      // תמונת מצב התפתחותית מוקפאת (סקאוט + היסטוריית ביצועים)
      const growth = await base44.entities.YouthGrowthRecord.filter({ player_id }, '-recorded_at', 50);
      const development_snapshot = JSON.stringify({
        capturedAt: new Date().toISOString(),
        growth: growth.slice(0, 20),
        stats: player.stats || null,
        classification: source_org_classification || 'AMATEUR_LEAGUE',
      });

      const rec = await base44.entities.BridgeTransfer.create({
        source_org_id: source_org_id || player.club_id || '',
        source_org_name: source_org_name || player.organization_name || '',
        source_org_classification: source_org_classification || 'AMATEUR_LEAGUE',
        target_club_id,
        target_club_name: target_club_name || '',
        player_id,
        player_name: player.full_name,
        age_group: player.team_name || '',
        birth_date: player.birth_date,
        proposed_by_name: user.full_name,
        proposed_by_role: user.role,
        status: 'PENDING_REVIEW',
        development_snapshot,
        bridge_fee: bridge_fee || 0,
        sell_on_clause: sell_on_clause || '',
        requires_ifa_registration: true,
        ifa_registration_status: 'Awaiting',
        notes: notes || '',
      });

      await audit(base44, user, 'status_change', `יצירת צינור מעבר: ${player.full_name} מ-«${source_org_name || player.organization_name || ''}» למועדון «${target_club_name || ''}»`, target_club_id);
      return Response.json({ transfer: rec });
    }

    // ---------- approve: אישור מעבר ע״י מנהל יעד + הטבעת מקור על השחקן ----------
    if (action === 'approve') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { transfer_id, director_notes, parent_consent_name } = body;
      const tr = await base44.entities.BridgeTransfer.get(transfer_id);
      if (!tr) return Response.json({ error: 'צינור לא נמצא' }, { status: 404 });
      const now = new Date().toISOString();
      const ip = body.client_ip || null;

      const updated = await base44.entities.BridgeTransfer.update(transfer_id, {
        status: 'APPROVED',
        director_decision_by: user.id,
        director_decision_at: now,
        director_notes: director_notes || '',
        parent_consent_name: parent_consent_name || '',
        parent_consent_at: parent_consent_name ? now : (tr.parent_consent_at || ''),
        parent_consent_ip: ip || (tr.parent_consent_ip || ''),
        ifa_registration_status: 'Submitted',
      });

      // עדכון מצב רישום השחקן — מעבר לרישום התאחדות (שדות קיימים בלבד)
      await base44.entities.PlayerRegistration.update(tr.player_id, {
        ifa_registration_status: 'Under Contract',
        status: 'IFA Ready',
      });
      await audit(base44, user, 'sign_player', `אישור מעבר גשר: ${tr.player_name} → מועדון «${tr.target_club_name}»`, tr.target_club_id);
      return Response.json({ transfer: updated });
    }

    // ---------- reject: דחיית צינור ----------
    if (action === 'reject') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { transfer_id, director_notes } = body;
      const tr = await base44.entities.BridgeTransfer.get(transfer_id);
      const updated = await base44.entities.BridgeTransfer.update(transfer_id, {
        status: 'REJECTED',
        director_decision_by: user.id,
        director_decision_at: new Date().toISOString(),
        director_notes: director_notes || '',
      });
      await audit(base44, user, 'status_change', `דחיית צינור מעבר: ${tr?.player_name || ''}`, tr?.target_club_id);
      return Response.json({ transfer: updated });
    }

    // ---------- list: שליפת צינורות (RLS מגבה ברמת הישות) ----------
    if (action === 'list') {
      const { status_filter } = body;
      const all = await base44.entities.BridgeTransfer.list('-created_date', 100);
      const list = status_filter ? all.filter(t => t.status === status_filter) : all;
      return Response.json({ transfers: list });
    }

    // ---------- complianceList: שליפת מסמכי תאימות לשחקן ----------
    if (action === 'complianceList') {
      if (!canReadCompliance) return Response.json({ error: 'Forbidden — גישה לתיק רפואי מוגבלת למנהל/מאמן מוסמך' }, { status: 403 });
      const { player_id } = body;
      const docs = await base44.entities.PlayerComplianceDoc.filter({ player_id }, '-created_date', 100);
      await audit(base44, user, 'view_medical', `צפייה בתיק תאימות שחקן ${player_id}`, body.club_id);
      return Response.json({ docs });
    }

    // ---------- complianceUpload: העלאת מסמך תאימות ----------
    if (action === 'complianceUpload') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { club_id, player_id, player_name, doc_type, file_url, notes } = body;
      if (!file_url || !doc_type || !player_id || !club_id) return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
      const doc = await base44.entities.PlayerComplianceDoc.create({
        club_id, player_id, player_name, doc_type, file_url, notes: notes || '',
        is_verified: false, uploaded_by_name: user.full_name,
      });
      await audit(base44, user, 'view_medical', `העלאת מסמך ${doc_type} לשחקן ${player_name || player_id}`, club_id);
      return Response.json({ doc });
    }

    // ---------- complianceVerify: אימות/דחיית מסמך רפואי/תאימות ----------
    if (action === 'complianceVerify') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { doc_id, verified, rejection_reason } = body;
      const doc = await base44.entities.PlayerComplianceDoc.get(doc_id);
      if (!doc) return Response.json({ error: 'מסמך לא נמצא' }, { status: 404 });
      const updated = await base44.entities.PlayerComplianceDoc.update(doc_id, {
        is_verified: !!verified,
        verified_by_name: user.full_name,
        verified_at: new Date().toISOString(),
        rejection_reason: verified ? '' : (rejection_reason || ''),
      });
      await audit(base44, user, 'view_medical', `${verified ? 'אושר' : 'נדחה'} מסמך ${doc.doc_type} של ${doc.player_name || doc.player_id}`, doc.club_id);
      return Response.json({ doc: updated });
    }

    // ---------- growthList: שליפת מדידות התפתחות ----------
    if (action === 'growthList') {
      const { player_id } = body;
      const records = await base44.entities.YouthGrowthRecord.filter({ player_id }, '-recorded_at', 50);
      return Response.json({ records });
    }

    // ---------- growthAdd: הוספת מדידת התפתחות ----------
    if (action === 'growthAdd') {
      if (!(canManage || user.role === 'coach')) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const g = body.record;
      if (!g || !g.player_id || !g.club_id || !g.recorded_at) return Response.json({ error: 'חסרים שדות חובה' }, { status: 400 });
      const rec = await base44.entities.YouthGrowthRecord.create({ ...g, recorded_by_name: user.full_name });
      return Response.json({ record: rec });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('bridge-engine error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function audit(base44, user, action, details, club_id) {
  try {
    await base44.entities.AuditLog.create({
      actor_id: user.id, actor_name: user.full_name || '', actor_role: user.role,
      action, club_id: club_id || '', details,
    });
  } catch { /* תיעוד בלבד */ }
}