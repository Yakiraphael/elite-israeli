import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled daily job: flags signed contracts ending within 30/60/90 days.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const contracts = await base44.asServiceRole.entities.Contract.filter({ status: 'חתום' });
    const now = new Date();
    let flagged = 0;

    for (const c of contracts) {
      if (!c.end_date) continue;
      const days = Math.ceil((new Date(c.end_date) - now) / (1000 * 60 * 60 * 24));
      if (days === 30 || days === 60 || days === 90) {
        await base44.asServiceRole.entities.Notification.create({
          audience: 'director',
          type: 'contract_expiring',
          title: `חוזה מסתיים בעוד ${days} יום: ${c.player_name}`,
          body: `${c.contract_type} · תוקף עד ${c.end_date}`,
          player_id: c.player_id,
          player_name: c.player_name,
          link_tab: 'contracts'
        });
        flagged++;
      }
    }

    return Response.json({ success: true, flagged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});