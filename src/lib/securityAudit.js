import { base44 } from '@/api/base44Client';

/**
 * logSecurityEvent — Fire-and-forget security audit logging.
 * Calls the 'log-security-event' backend function which writes to AuditLog
 * as service role (bypassing RLS, since only admins can create AuditLog records
 * directly). This allows non-admin users' unauthorized access attempts to be
 * recorded for intrusion detection.
 *
 * Silently fails — audit logging must never block the user flow or crash the app.
 */
export async function logSecurityEvent({ action, details, player_id, club_id }) {
  try {
    await base44.functions.invoke('log-security-event', {
      action,
      details,
      player_id,
      club_id,
    });
  } catch (e) {
    // Silently swallow — don't expose audit infrastructure to the client
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Security audit log failed');
    }
  }
}