import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Entity automation handler for Contract create: notifies the director and emails the parent/player
// that a contract is waiting for signature.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event?.type === 'create') {
      await base44.asServiceRole.entities.Notification.create({
        audience: 'director',
        type: 'contract_pending',
        title: `חוזה חדש ממתין לחתימה: ${data.player_name}`,
        body: `${data.contract_type} · תוקף עד ${data.end_date}`,
        player_id: data.player_id,
        player_name: data.player_name,
        link_tab: 'contracts'
      });

      let player = null;
      try { player = await base44.asServiceRole.entities.PlayerRegistration.get(data.player_id); } catch { /* not found */ }
      const email = player?.parent_email;
      if (email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'החוזה שלך ממתין לחתימה',
          body: `שלום, החוזה של ${data.player_name} (${data.contract_type}) ממתין לחתימה דיגיטלית. אנא פנה למועדון לקבלת קישור החתימה.`
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});