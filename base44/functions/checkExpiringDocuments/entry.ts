import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled daily job: flags medical certificates expiring within 30 days or already expired.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const players = await base44.asServiceRole.entities.PlayerRegistration.list('-created_date', 500);

    const now = new Date();
    const soon = players.filter(p => {
      if (!p.medical_expiry_date) return false;
      const days = Math.ceil((new Date(p.medical_expiry_date) - now) / (1000 * 60 * 60 * 24));
      return days < 30;
    });

    for (const p of soon) {
      const expired = new Date(p.medical_expiry_date) < now;
      await base44.asServiceRole.entities.Notification.create({
        audience: 'coach',
        type: 'document_expiring',
        title: expired ? `אישור רפואי פג תוקף: ${p.full_name}` : `אישור רפואי עומד לפוג: ${p.full_name}`,
        body: `תוקף: ${p.medical_expiry_date}`,
        player_id: p.id,
        player_name: p.full_name,
        link_tab: 'compliance'
      });
    }

    return Response.json({ success: true, flagged: soon.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});