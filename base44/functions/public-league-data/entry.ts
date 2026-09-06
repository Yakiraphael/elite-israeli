import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isYouthAgeGroup } from '../../shared/youthGuard.ts';

/**
 * public-league-data — Zero-Trust public data whitelist endpoint.
 *
 * Returns ONLY publicly-safe fields from league/fixture entities. This is the
 * single gateway for the public website to access sports data — all sensitive
 * fields (internal IDs, notes, referee details, dispute reasons, raw scores
 * before verification) are stripped at the server level before the response
 * leaves the platform.
 *
 * YOUTH-ONLY ENFORCEMENT: Only records with allowed youth age groups (U10–U21)
 * are returned. Any record with adult markers or a non-youth age_group is
 * silently filtered out — the public site never sees adult football data.
 *
 * No authentication required — this endpoint is designed for the public site.
 * But it only returns fields on the explicit public whitelist.
 *
 * Usage: invoke with { resource: 'standings' | 'fixtures', age_group?, limit? }
 */
const PUBLIC_STANDING_FIELDS = ['team_name', 'played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'goal_difference', 'points'];
const PUBLIC_FIXTURE_FIELDS = ['competition', 'round', 'age_group', 'home_team', 'away_team', 'match_date', 'kickoff_time', 'stadium_name', 'home_score', 'away_score', 'status'];

function pickFields(record, fields) {
  const out = {};
  for (const f of fields) {
    if (record[f] !== undefined) out[f] = record[f];
  }
  return out;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const resource = body.resource;
    const ageGroup = typeof body.age_group === 'string' ? body.age_group.substring(0, 50) : null;
    const limit = Math.min(Math.max(parseInt(body.limit) || 50, 1), 200);

    if (resource === 'standings') {
      const filter = ageGroup ? { age_group: ageGroup } : {};
      const records = await base44.asServiceRole.entities.LeagueStanding.filter(filter, '-points', limit);
      // Youth-only enforcement: filter out any non-youth age groups at the server level
      const safe = records
        .filter(r => isYouthAgeGroup(r.age_group))
        .map(r => pickFields(r, PUBLIC_STANDING_FIELDS));
      return Response.json({ standings: safe });

    } else if (resource === 'fixtures') {
      const filter = ageGroup ? { age_group: ageGroup, status: 'COMPLETED' } : { status: 'COMPLETED' };
      const records = await base44.asServiceRole.entities.MatchFixture.filter(filter, '-match_date', limit);
      // Youth-only enforcement + only verified results — no pending/disputed/adult data
      const safe = records
        .filter(r => r.result_status === 'VERIFIED_AND_APPROVED')
        .filter(r => isYouthAgeGroup(r.age_group))
        .map(r => pickFields(r, PUBLIC_FIXTURE_FIELDS));
      return Response.json({ fixtures: safe });

    } else {
      return Response.json({ error: 'Invalid resource' }, { status: 400 });
    }
  } catch (error) {
    console.error('public-league-data error', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}