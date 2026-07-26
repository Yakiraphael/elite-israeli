import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public digital-signature endpoint (no login required - player/parent sign via a shared link).
// Supports multi-party signing: each signer (player / guardian) signs separately, and the
// contract auto-flips to "חתום" only after all required signatures are collected — then the
// player profile (PlayerRegistration) is auto-updated so registration status reflects the signed contract.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { contract_id, signer_name, signer_role } = payload;
    if (!contract_id || !signer_name) {
      return Response.json({ error: 'contract_id and signer_name are required' }, { status: 400 });
    }
    const role = signer_role || 'player';
    if (!['player', 'guardian'].includes(role)) {
      return Response.json({ error: 'signer_role must be player or guardian' }, { status: 400 });
    }

    const contract = await base44.asServiceRole.entities.Contract.get(contract_id);
    if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });
    if (contract.status === 'חתום') return Response.json({ error: 'Contract already fully signed' }, { status: 400 });

    const signerIp = req.headers.get('x-forwarded-for') || 'unknown';
    const signedAt = new Date().toISOString();

    // Capture this signer's signature in the right slot
    const updated = role === 'player'
      ? { player_signature_name: signer_name, player_signed_at: signedAt, player_signed_ip: signerIp }
      : { guardian_signature_name: signer_name, guardian_signed_at: signedAt, guardian_signed_ip: signerIp };

    // Determine whether all required signatures are now in place
    const requiresGuardian = contract.requires_guardian === true;
    const playerDone = role === 'player' ? true : !!contract.player_signed_at;
    const guardianDone = role === 'guardian' ? true : !!contract.guardian_signed_at;
    const allSigned = requiresGuardian ? (playerDone && guardianDone) : playerDone;

    if (allSigned) {
      updated.status = 'חתום';
      updated.signed_at = signedAt;
      // Backwards-compatible single-signer fields
      updated.signer_name = signer_name;
      updated.signer_ip = signerIp;
    }

    await base44.asServiceRole.entities.Contract.update(contract_id, updated);

    // Auto-update player profile: a fully-signed contract promotes registration readiness.
    if (allSigned && contract.player_id) {
      try {
        const player = await base44.asServiceRole.entities.PlayerRegistration.get(contract.player_id);
        if (player) {
          const patch = {};
          if (!player.ifa_ready) patch.ifa_ready = true;
          if (player.status === 'ממתין' || player.status === 'מאושר') patch.status = 'פעיל';
          if (Object.keys(patch).length) {
            await base44.asServiceRole.entities.PlayerRegistration.update(contract.player_id, patch);
          }
        }
      } catch (e) {
        console.error('player auto-update failed:', e?.message || e);
      }
    }

    // Notify director of signing progress
    const title = allSigned
      ? `חוזה נחתם סופית: ${contract.player_name}`
      : `חתימה חלקית על חוזה: ${contract.player_name}`;
    const notifBody = allSigned
      ? `כל החותמים חתמו. סטטוס עודכן ל"חתום" ופרופיל השחקן עודכן אוטומטית. נחתם ע"י ${signer_name}.`
      : `${role === 'player' ? 'שחקן' : 'אפוטרופוס'} חתם על החוזה. ממתין לשאר החותמים.`;
    try {
      await base44.asServiceRole.entities.Notification.create({
        audience: 'director',
        type: allSigned ? 'contract_signed' : 'contract_pending',
        title,
        body: notifBody,
        player_id: contract.player_id,
        player_name: contract.player_name,
        link_tab: 'contracts',
      });
    } catch {
      // Notification is best-effort — don't fail the signature if it errors.
    }

    return Response.json({ success: true, signed_at: signedAt, fully_signed: allSigned, role });
  } catch (error) {
    console.error('signContract error:', error?.message || error);
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});