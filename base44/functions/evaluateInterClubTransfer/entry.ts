import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// מנוע העברות בין-מועדוניות (Inter-Club Transfer Engine).
// מעריך זכאות העברה בין שני מועדונים רשומים של עילית ישראלית ומחזיר תוצאת הידור (gating)
// ששער האישור הקיים (buildApprovalChecks) צורך כדי לאכוף חסמים תקנוניים של ההתאחדות:
// - אימות שני המועדונים (is_verified + verification_status="מאומת" + operational_status="פעיל")
// - מועדון מעביר שונה ממועדון קולט
// - אכיפת דמי תיווך IEFA (5%) לבוגרים; דמי גריעה (Solidarity) להעברה בינלאומית
// - רשימת אישורים נדרשים (אפוטרופוס/שחקן/מנהל מעביר/IFA)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['admin', 'director'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — נדרש תפקיד מנהל' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const transferId = body.transfer_id || body.transferId;
    if (!transferId) return Response.json({ error: 'transfer_id required' }, { status: 400 });

    const proposal = await base44.asServiceRole.entities.TransferProposal.get(transferId);
    if (!proposal) return Response.json({ error: 'Transfer not found' }, { status: 404 });

    const cat = proposal.transfer_category || '';
    const isLoan = cat.startsWith('השאל');
    const isAdult = !!proposal.is_adult;
    const scope = proposal.transfer_scope || 'מבצע חיצוני';
    const isInterClub = scope === 'בין-מועדוני (עילית)';

    const findClub = async (id, name) => {
      if (id) {
        try { return await base44.asServiceRole.entities.Club.get(id); } catch { /* not found */ }
      }
      if (name) {
        const list = await base44.asServiceRole.entities.Club.filter({ club_name: name });
        return list && list[0] ? list[0] : null;
      }
      return null;
    };

    const toClub = await findClub(proposal.to_club_id, proposal.club_name);
    const fromClub = await findClub(proposal.from_club_id, proposal.from_club_name);

    const elig = (c) => !!(c && c.is_verified === true && c.verification_status === 'מאומת' && (c.operational_status || 'פעיל') === 'פעיל');

    const reasons = [];
    let bothVerified = false;
    if (isInterClub) {
      bothVerified = !!(toClub && fromClub && elig(toClub) && elig(fromClub));
      if (!toClub) reasons.push('מועדון קולט לא זוהה במערכת');
      if (!fromClub) reasons.push('מועדון מעביר לא זוהה במערכת');
      if (toClub && !elig(toClub)) reasons.push('מועדון קולט אינו מאומת/פעיל');
      if (fromClub && !elig(fromClub)) reasons.push('מועדון מעביר אינו מאומת/פעיל');
      if (toClub && fromClub && toClub.id === fromClub.id) reasons.push('מועדון קולט ומעביר זהים — סמן כתוך-מועדוני');
    } else {
      bothVerified = true;
      reasons.push('תהליך תוך-מועדוני/חיצוני — אין חובת אימות בין-מועדוני');
    }

    const requiredApprovals = [];
    if (!isAdult) requiredApprovals.push('אפוטרופוס (קטין)');
    if (isAdult) requiredApprovals.push('שחקן בוגר');
    requiredApprovals.push('מנהל מקצועי קולט');
    if (isInterClub) requiredApprovals.push('מנהל מקצועי מעביר (רישום גריעה)');
    requiredApprovals.push('אימות התאחדות (IFA)');
    if (isAdult && isInterClub) requiredApprovals.push('תשלום דמי תיווך IEFA');

    const ifaFeeRequired = isAdult && isInterClub;
    const solidarityRequired = isInterClub && cat === 'בוגרים - בינלאומי';
    let recommendedFee = null;
    if (ifaFeeRequired && typeof proposal.contract_value === 'number' && proposal.contract_value > 0) {
      recommendedFee = Math.round(proposal.contract_value * 0.05 * 100) / 100;
    }

    return Response.json({
      transfer_scope: scope,
      transfer_category: cat,
      is_loan: isLoan,
      is_adult: isAdult,
      from_club: fromClub ? { id: fromClub.id, name: fromClub.club_name, verified: elig(fromClub), operational_status: fromClub.operational_status } : null,
      to_club: toClub ? { id: toClub.id, name: toClub.club_name, verified: elig(toClub), operational_status: toClub.operational_status } : null,
      both_verified: bothVerified,
      gating_ok: reasons.length === 0,
      reasons,
      required_approvals: requiredApprovals,
      ifa_fee_required: ifaFeeRequired,
      solidarity_fee_required: solidarityRequired,
      recommended_iefa_fee: recommendedFee,
      evaluator_id: user.id,
      evaluated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('evaluateInterClubTransfer error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});