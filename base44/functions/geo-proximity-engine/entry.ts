import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ============================================================
// geo-proximity-engine — מרחב גיאוגרפי רב-רשויות (Spatial Multi-Municipality).
// פעולות (action):
//   calculateDistance  — חישוב מרחק Haversine בין שתי נקודות (ק"מ).
//   nearbyClubs        — מועדונים מאומתים-אזורית ברדיוס מבוקש סביב מועדון יעד.
//   suggestRegionalLeague — הצעת שיוך ליגה אזורית לפי קרבה גיאוגרפית.
//   verifyRegional     — אימות מועדון כ-VERIFIED_REGIONAL + קביעת רדיוס שירות.
// RBAC: verifyRegional = אדמין/הנהלה. שאר — admin/director/coach.
// ============================================================

const R_EARTH_KM = 6371.0;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number' || Number.isNaN(v))) return null;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return +(R_EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin';
    const canManage = isAdmin || user.role === 'director' || user.role === 'coach';

    // ---------- calculateDistance ----------
    if (action === 'calculateDistance') {
      const { lat1, lon1, lat2, lon2 } = body;
      const d = haversineKm(+lat1, +lon1, +lat2, +lon2);
      if (d == null) return Response.json({ error: 'נדרשות קואורדינטות תקינות (lat1,lon1,lat2,lon2)' }, { status: 400 });
      return Response.json({ distance_km: d });
    }

    // ---------- nearbyClubs ----------
    if (action === 'nearbyClubs') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { target_club_id, max_distance_km } = body;
      if (!target_club_id) return Response.json({ error: 'נדרש target_club_id' }, { status: 400 });
      const target = await base44.entities.Club.get(target_club_id);
      if (!target?.latitude || !target?.longitude) {
        return Response.json({ error: 'למועדון היעד אין קואורדינטות גיאוגרפיות. נא להשלים מיקום לפני חישוב קרבה.' }, { status: 400 });
      }
      const all = await base44.entities.Club.list('-created_date', 300);
      const maxKm = +max_distance_km || target.service_radius_km || 25;
      const nearby = all
        .filter(c => c.id !== target_club_id && c.geo_verification_status === 'VERIFIED_REGIONAL' && c.latitude && c.longitude)
        .map(c => ({ club_id: c.id, name: c.club_name, municipality: c.municipality, distance_km: haversineKm(+target.latitude, +target.longitude, +c.latitude, +c.longitude), latitude: c.latitude, longitude: c.longitude }))
        .filter(x => x.distance_km != null && x.distance_km <= maxKm)
        .sort((a, b) => a.distance_km - b.distance_km);
      return Response.json({ target: { id: target.id, name: target.club_name, municipality: target.municipality, service_radius_km: maxKm }, nearby, count: nearby.length });
    }

    // ---------- suggestRegionalLeague ----------
    if (action === 'suggestRegionalLeague') {
      if (!canManage) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const { target_club_id, age_group } = body;
      if (!target_club_id) return Response.json({ error: 'נדרש target_club_id' }, { status: 400 });
      const res = await base44.functions.invoke('geo-proximity-engine', { action: 'nearbyClubs', target_club_id, max_distance_km: body.max_distance_km }).then(r => r.data || r);
      const suggested = res.nearby || [];
      // בניית שם מרחב אזורי על בסיס הרשויות הקרובות
      const munis = Array.from(new Set([res.target?.municipality, ...suggested.map(s => s.municipality)].filter(Boolean)));
      const regionalName = munis.length ? `מרחב ${munis.join(' / ')}` : 'מרחב אזורי';
      const res2 = await {
        regional_league_name: regionalName,
        age_group: age_group || '',
        target: res.target,
        suggested_clubs: suggested,
      };
      return Response.json({ suggestion: res2 });
    }

    // ---------- verifyRegional (אדמין/הנהלה) ----------
    if (action === 'verifyRegional') {
      if (!isAdmin) return Response.json({ error: 'Forbidden — אימות אזורי מותר לאדמין/הנהלת הארגון בלבד' }, { status: 403 });
      const { target_club_id, status, service_radius_km } = body;
      if (!target_club_id) return Response.json({ error: 'נדרש target_club_id' }, { status: 400 });
      if (!['PENDING_VERIFICATION', 'VERIFIED_REGIONAL', 'REJECTED'].includes(status)) {
        return Response.json({ error: 'סטטוס אימות אזורי לא תקין' }, { status: 400 });
      }
      const patch: any = { geo_verification_status: status };
      if (typeof service_radius_km === 'number') patch.service_radius_km = service_radius_km;
      const updated = await base44.entities.Club.update(target_club_id, patch);
      try {
        await base44.entities.AuditLog.create({
          actor_id: user.id, actor_name: user.full_name || '', actor_role: user.role,
          action: 'club_verified', club_id: target_club_id,
          details: `אימות אזורי: ${status} (רדיוס ${patch.service_radius_km ?? updated.service_radius_km ?? '—'} ק"מ)`,
        });
      } catch { /* תיעוד בלבד */ }
      return Response.json({ club: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('geo-proximity-engine error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}