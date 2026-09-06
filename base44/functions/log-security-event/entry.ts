import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * log-security-event — Zero-Trust security audit logging endpoint.
 *
 * Accepts security events from the client (unauthorized route access, suspicious
 * data access attempts) and writes them to the AuditLog entity as service role.
 * This is necessary because AuditLog.create RLS is admin-only — non-admin users
 * cannot create audit records directly, so the RoleGuard calls this function
 * instead.
 *
 * Security hardening:
 * - Requires authentication (no anonymous logging)
 * - Validates action against a strict allowlist (prevents injection of fake events)
 * - Truncates all string inputs to prevent buffer abuse
 * - Captures actor IP for non-repudiation
 * - Rate-limited by the platform's built-in function call limits
 */
const ALLOWED_ACTIONS = new Set([
  'unauthorized_attempt',
  'view_medical',
  'view_contract',
  'export_data',
  'sign_player',
  'status_change',
]);

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // Strict action allowlist — reject anything not in the enum
    if (!body.action || !ALLOWED_ACTIONS.has(body.action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Extract IP — prefer X-Forwarded-For, fall back to X-Real-IP
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();

    // Truncate all free-text fields to prevent abuse
    const details = typeof body.details === 'string' ? body.details.substring(0, 500) : '';
    const player_id = typeof body.player_id === 'string' ? body.player_id.substring(0, 100) : null;
    const club_id = typeof body.club_id === 'string' ? body.club_id.substring(0, 100) : null;

    await base44.asServiceRole.entities.AuditLog.create({
      actor_id: user.id,
      actor_name: user.full_name || user.email || 'unknown',
      actor_role: user.role || 'user',
      action: body.action,
      details,
      player_id,
      club_id,
      actor_ip: ip,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('log-security-event error', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}