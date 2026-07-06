import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DATA_SCHEMA = {
  type: 'object',
  properties: {
    height_cm: { type: 'number' },
    dominant_foot: { type: 'string' },
    current_club: { type: 'string' },
    contract_end_date: { type: 'string' },
    market_value_current: { type: 'string' },
    market_value_history: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, value: { type: 'number' } } } },
    transfer_history: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, from_club: { type: 'string' }, to_club: { type: 'string' }, fee: { type: 'string' } } } },
    achievements: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, year: { type: 'string' }, competition: { type: 'string' } } } },
    career_stats: { type: 'array', items: { type: 'object', properties: { season: { type: 'string' }, club: { type: 'string' }, competition: { type: 'string' }, appearances: { type: 'number' }, goals: { type: 'number' }, assists: { type: 'number' } } } },
    national_team: { type: 'array', items: { type: 'object', properties: { team: { type: 'string' }, matches: { type: 'number' }, goals: { type: 'number' } } } },
    injuries: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, injury_type: { type: 'string' }, duration_days: { type: 'number' } } } },
    social_links: { type: 'array', items: { type: 'string' } },
  },
};

async function fetchTransfermarktData(base44Service, player) {
  const urls = [player.transfermarkt_url, player.transfermarkt_achievements_url, player.transfermarkt_stats_url, player.transfermarkt_national_team_url].filter(Boolean);
  const prompt = `Research these Transfermarkt pages for a football player and extract complete, up-to-date structured data:\n${urls.join('\n')}\n\nInclude: height in cm (number), dominant foot, current club name, current contract end date, current market value (with currency symbol), full market value history (date + numeric value in the value's currency major units), full transfer history (date, from club, to club, fee), full list of career achievements/titles (title, year, competition), season-by-season career statistics (season, club, competition, appearances, goals, assists), national team appearances (team name, matches, goals), any documented injuries (date, injury type, duration in days), and any social media links found on the profile.`;
  return await base44Service.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: DATA_SCHEMA,
  });
}

async function syncOnePlayer(base44Service, player) {
  const result = await fetchTransfermarktData(base44Service, player);
  const { height_cm, dominant_foot, current_club, contract_end_date, ...cachedData } = result;

  const hasChanged = JSON.stringify(cachedData) !== JSON.stringify(player.transfermarkt_data || {});
  const now = new Date().toISOString();

  const updates = {
    transfermarkt_last_checked: now,
  };
  if (hasChanged) {
    updates.transfermarkt_data = cachedData;
    updates.transfermarkt_last_changed = now;
    if (height_cm && !player.height_cm) updates.height_cm = height_cm;
    if (dominant_foot && !player.dominant_foot) updates.dominant_foot = dominant_foot;
    if (current_club && !player.team_name) updates.team_name = current_club;
    if (contract_end_date) updates.contract_end_date = contract_end_date;
  }

  const updated = await base44Service.entities.PlayerRegistration.update(player.id, updates);
  return updated;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { playerId, mode, force } = body;

    if (mode === 'all') {
      const base44 = createClientFromRequest(req);
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const players = await base44.asServiceRole.entities.PlayerRegistration.filter({});
      const stale = players
        .filter(p => p.transfermarkt_url && (!p.transfermarkt_last_checked || p.transfermarkt_last_checked < fourHoursAgo))
        .slice(0, 5);

      const results = [];
      for (const player of stale) {
        try {
          await syncOnePlayer(base44.asServiceRole, player);
          results.push({ id: player.id, status: 'synced' });
        } catch (e) {
          results.push({ id: player.id, status: 'error', error: e.message });
        }
      }
      return Response.json({ synced: results.length, results });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!playerId) return Response.json({ error: 'playerId is required' }, { status: 400 });

    const player = await base44.asServiceRole.entities.PlayerRegistration.get(playerId);
    if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });
    if (!player.transfermarkt_url) return Response.json({ error: 'Player has no Transfermarkt URL' }, { status: 400 });

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    if (!force && player.transfermarkt_last_checked && player.transfermarkt_last_checked > fourHoursAgo) {
      return Response.json({ player, skipped: true });
    }

    const updated = await syncOnePlayer(base44.asServiceRole, player);
    return Response.json({ player: updated, skipped: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});