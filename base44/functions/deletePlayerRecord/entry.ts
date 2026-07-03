import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Right to be Forgotten: hard delete of a player's record (admin-only).
// Logs the deletion and alerts the club + IEFA admin.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { player_id } = await req.json();
    if (!player_id) return Response.json({ error: 'player_id is required' }, { status: 400 });

    let player;
    try {
      player = await base44.asServiceRole.entities.Player.get(player_id);
    } catch {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }
    if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

    if (user.role !== 'admin' || user.club_id !== player.club_id) {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_id: user.id, actor_name: user.full_name, actor_role: user.role,
        action: 'unauthorized_attempt', player_id, club_id: player.club_id,
        details: 'Attempted to delete a player record without admin rights for this club'
      });
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await base44.asServiceRole.entities.Player.delete(player_id);

    await base44.asServiceRole.entities.AuditLog.create({
      actor_id: user.id, actor_name: user.full_name, actor_role: user.role,
      action: 'delete_player', player_id, club_id: player.club_id,
      details: `Hard delete executed for ${player.full_name || player_id}`
    });

    const club = await base44.asServiceRole.entities.Club.get(player.club_id);
    if (club?.contact_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: club.contact_email,
        subject: 'מחיקת נתוני שחקן בוצעה',
        body: `נתוני השחקן ${player.full_name || player_id} נמחקו לצמיתות מהמערכת לפי בקשת "זכות להישכח", בוצע על ידי ${user.full_name}.`
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});