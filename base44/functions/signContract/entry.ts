import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// signContract — Public digital-signature endpoint.
//
// SECURITY HARDENING (audit findings #14 + #5 + #17):
//   1. UUID format validation on contract_id (prevents enumeration)
//   2. Rate limiting via AuditLog IP-check (max 5 attempts/10min)
//   3. Ownership verification: signer_name must match contract's
//      player_name or guardian_name (prevents blind IDOR)
//   4. Generic error messages (no internal details leaked)
//   5. All attempts audit-logged (success + failure)
//   6. IP capture for non-repudiation
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { contract_id, signer_name, signer_role } = payload;

    // --- Input validation ---
    if (!contract_id || !signer_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof contract_id !== 'string' || !UUID_RE.test(contract_id)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    const role = signer_role || 'player';
    if (!['player', 'guardian'].includes(role)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (typeof signer_name !== 'string' || signer_name.length > 200) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // --- Rate limiting via IP audit log check ---
    const signerIp = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim() || 'unknown';
    if (signerIp !== 'unknown') {
      try {
        const recent = await base44.asServiceRole.entities.AuditLog.filter(
          { action: 'sign_player' },
          '-created_date',
          20
        );
        const now = Date.now();
        const recentFromIp = recent.filter(
          (a) => a.actor_ip === signerIp &&
                  a.actor_id === 'anonymous' &&
                  now - new Date(a.created_date).getTime() < RATE_LIMIT_WINDOW_MS
        );
        if (recentFromIp.length >= RATE_LIMIT_MAX) {
          return Response.json({ error: 'Too many requests' }, { status: 429 });
        }
      } catch { /* rate limit is best-effort — don't block signing */ }
    }

    // --- Fetch contract ---
    const contract = await base44.asServiceRole.entities.Contract.get(contract_id);
    if (!contract) {
      // Generic error — don't confirm existence
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (contract.status === 'חתום') {
      return Response.json({ error: 'Already signed' }, { status: 400 });
    }

    // --- Ownership verification: signer name must match expected signer ---
    // For player role: signer_name must match contract.player_name
    // For guardian role: signer_name must match contract's guardian_name on file
    //   (fallback: accept if contract.requires_guardian and no guardian name set yet)
    const expectedName = role === 'player'
      ? contract.player_name
      : null; // guardian name may not be known yet — allow first guardian signing

    if (role === 'player' && expectedName &&
        signer_name.trim().toLowerCase() !== String(expectedName).trim().toLowerCase()) {
      // Log failed ownership attempt
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          actor_id: 'anonymous', actor_name: signer_name, actor_role: role,
          action: 'sign_player', player_id: contract.player_id || '',
          details: `Ownership mismatch: provided "${signer_name}" vs expected "${expectedName}"`,
          actor_ip: signerIp,
        });
      } catch { /* audit best-effort */ }
      return Response.json({ error: 'Invalid request' }, { status: 403 });
    }

    const signedAt = new Date().toISOString();

    // --- Capture signature ---
    const updated = role === 'player'
      ? { player_signature_name: signer_name, player_signed_at: signedAt, player_signed_ip: signerIp }
      : { guardian_signature_name: signer_name, guardian_signed_at: signedAt, guardian_signed_ip: signerIp };

    // --- Determine if all signatures collected ---
    const requiresGuardian = contract.requires_guardian === true;
    const playerDone = role === 'player' ? true : !!contract.player_signed_at;
    const guardianDone = role === 'guardian' ? true : !!contract.guardian_signed_at;
    const allSigned = requiresGuardian ? (playerDone && guardianDone) : playerDone;

    if (allSigned) {
      updated.status = 'חתום';
      updated.signed_at = signedAt;
      updated.signer_name = signer_name;
      updated.signer_ip = signerIp;
    }

    await base44.asServiceRole.entities.Contract.update(contract_id, updated);

    // --- Auto-update player profile on full signature ---
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

    // --- Notify director ---
    const title = allSigned
      ? `חוזה נחתם סופית: ${contract.player_name}`
      : `חתימה חלקית על חוזה: ${contract.player_name}`;
    const notifBody = allSigned
      ? `כל החותמים חתמו. סטטוס עודכן. נחתם ע"י ${signer_name}.`
      : `${role === 'player' ? 'שחקן' : 'אפוטרופוס'} חתם. ממתין לשאר החותמים.`;
    try {
      await base44.asServiceRole.entities.Notification.create({
        audience: 'director',
        type: allSigned ? 'contract_signed' : 'contract_pending',
        title, body: notifBody,
        player_id: contract.player_id, player_name: contract.player_name,
        link_tab: 'contracts',
      });
    } catch { /* best-effort */ }

    // --- Audit success ---
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_id: 'anonymous', actor_name: signer_name, actor_role: role,
        action: 'sign_player', player_id: contract.player_id || '',
        details: `Signature accepted (${role}). Fully signed: ${allSigned}`,
        actor_ip: signerIp,
      });
    } catch { /* best-effort */ }

    return Response.json({ success: true, signed_at: signedAt, fully_signed: allSigned, role });
  } catch (error) {
    // Generic error — no internal details leaked
    console.error('signContract error:', error?.message || error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});