import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public digital-signature endpoint (no login required - player/parent sign via a shared link).
// Records a legal timestamp + signer IP, then flips the contract to signed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contract_id, signer_name } = await req.json();
    if (!contract_id || !signer_name) {
      return Response.json({ error: 'contract_id and signer_name are required' }, { status: 400 });
    }

    const contract = await base44.asServiceRole.entities.Contract.get(contract_id);
    if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });
    if (contract.status === 'חתום') return Response.json({ error: 'Contract already signed' }, { status: 400 });

    const signerIp = req.headers.get('x-forwarded-for') || 'unknown';
    const signedAt = new Date().toISOString();

    await base44.asServiceRole.entities.Contract.update(contract_id, {
      status: 'חתום', signed_at: signedAt, signer_name, signer_ip: signerIp
    });

    await base44.asServiceRole.entities.Notification.create({
      audience: 'director',
      type: 'contract_signed',
      title: `חוזה נחתם: ${contract.player_name}`,
      body: `נחתם על ידי ${signer_name} ב-${signedAt}`,
      player_id: contract.player_id,
      player_name: contract.player_name,
      link_tab: 'contracts'
    });

    return Response.json({ success: true, signed_at: signedAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});