import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Entity-automation handler — runs when a BehaviorLog record is created.
// Recomputes derived metrics on the affected PlayerRegistration record:
//   - attendance_rate   (% of BehaviorLog entries with attended=true)
//   - discipline_avg    (mean discipline_score across scored logs)
//   - consecutive_absences (latest unbroken run of !attended)
// Triggered automatically — see automation "BehaviorLog create → recomputePlayerMetrics".
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body?.event;
    const data = body?.data;

    if (event?.type !== 'create' || !data?.player_id) {
      return Response.json({ success: true, skipped: true });
    }
    const playerId = String(data.player_id);

    const logs = await base44.asServiceRole.entities.BehaviorLog.filter(
      { player_id: playerId }, '-created_date', 500
    );

    const total = logs.length;
    const attended = logs.filter(l => l.attended === true).length;
    const attendanceRate = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;

    const scored = logs.filter(l => typeof l.discipline_score === 'number');
    const disciplineAvg = scored.length > 0
      ? Math.round((scored.reduce((sum, l) => sum + l.discipline_score, 0) / scored.length) * 10) / 10
      : null;

    // walk most-recent logs first; count unbroken absences
    const sortedDesc = [...logs].sort(
      (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)
    );
    let consec = 0;
    for (const l of sortedDesc) {
      if (l.attended !== true) consec++;
      else break;
    }

    const patch = {
      attendance_rate: attendanceRate,
      consecutive_absences: consec,
      ...(disciplineAvg !== null ? { discipline_avg: disciplineAvg } : {})
    };

    await base44.asServiceRole.entities.PlayerRegistration.update(playerId, patch);

    return Response.json({ success: true, playerId, patch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}