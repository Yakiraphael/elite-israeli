import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Entity automation handler for PlayerRequest create/update.
// "Signal, not noise": routes each request to the right approver, and notifies the requester on status change.
const COACH_CATEGORIES = ['חופשה/היעדרות', 'פציעה/בריאות', 'שינוי עמדה'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (event?.type === 'create') {
      const audience = COACH_CATEGORIES.includes(data.category) ? 'coach' : 'director';
      await base44.asServiceRole.entities.Notification.create({
        audience,
        type: 'request_new',
        title: `בקשה חדשה: ${data.subject}`,
        body: `${data.player_name} · ${data.category}`,
        player_id: data.player_id,
        player_name: data.player_name,
        request_id: event.entity_id,
        link_tab: 'requests'
      });
    }

    if (event?.type === 'update' && old_data?.status !== data.status && (data.status === 'אושר' || data.status === 'נדחה')) {
      await base44.asServiceRole.entities.Notification.create({
        audience: 'director',
        type: 'request_status',
        title: `בקשה ${data.status === 'אושר' ? 'אושרה' : 'נדחתה'}: ${data.subject}`,
        body: `${data.player_name} · ${data.category}`,
        player_id: data.player_id,
        player_name: data.player_name,
        request_id: event.entity_id,
        link_tab: 'requests'
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});