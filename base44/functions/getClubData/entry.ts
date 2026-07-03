import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Server-side RBAC gateway: never trust the client to filter data by role.
// admin -> full club data. coach -> only teams they're assigned to (+ those players).
// player -> only their own Player record. parent -> only linked players' records.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.club_id) return Response.json({ error: 'No club assigned to this user' }, { status: 403 });

    const clubId = user.club_id;
    const club = await base44.asServiceRole.entities.Club.get(clubId);
    if (!club) return Response.json({ error: 'Club not found' }, { status: 404 });

    const logAccess = async (action, playerId, details) => {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_id: user.id, actor_name: user.full_name, actor_role: user.role,
        action, player_id: playerId || '', club_id: clubId, details: details || ''
      });
    };

    // Coach sees technical data only - medical files and contract documents are redacted
    const redactForCoach = (player) => ({
      ...player,
      medical_info: player.medical_info ? { last_checkup_date: player.medical_info.last_checkup_date } : undefined,
      contract_status: player.contract_status ? { status: player.contract_status.status } : undefined
    });

    if (user.role === 'admin') {
      const teams = await base44.asServiceRole.entities.Team.filter({ club_id: clubId });
      const players = await base44.asServiceRole.entities.Player.filter({ club_id: clubId });
      const requests = await base44.asServiceRole.entities.Request.filter({ club_id: clubId });
      await logAccess('view_medical', '', `admin viewed ${players.length} player records`);
      return Response.json({ club, teams, players, requests });
    }

    if (user.role === 'coach') {
      const allTeams = await base44.asServiceRole.entities.Team.filter({ club_id: clubId });
      const myTeams = allTeams.filter(t => Array.isArray(t.coach_ids) && t.coach_ids.includes(user.id));
      const playerIds = new Set();
      myTeams.forEach(t => (t.roster || []).forEach(r => playerIds.add(r.player_id)));
      const allPlayers = await base44.asServiceRole.entities.Player.filter({ club_id: clubId });
      const myPlayers = allPlayers.filter(p => playerIds.has(p.user_id)).map(redactForCoach);
      await logAccess('view_contract', '', `coach viewed ${myPlayers.length} player records (redacted)`);
      return Response.json({ club, teams: myTeams, players: myPlayers });
    }

    if (user.role === 'player') {
      const players = await base44.asServiceRole.entities.Player.filter({ user_id: user.id, club_id: clubId });
      return Response.json({ club, players });
    }

    if (user.role === 'parent') {
      const linkedIds = Array.isArray(user.linked_accounts) ? user.linked_accounts : [];
      if (linkedIds.length === 0) return Response.json({ club, players: [] });
      const allPlayers = await base44.asServiceRole.entities.Player.filter({ club_id: clubId });
      const players = allPlayers.filter(p => linkedIds.includes(p.user_id));
      return Response.json({ club, players });
    }

    await logAccess('unauthorized_attempt', '', `role ${user.role} attempted club data access`);
    return Response.json({ error: 'Role not permitted' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});