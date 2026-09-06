import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldX, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { logSecurityEvent } from '@/lib/securityAudit';

/**
 * RoleGuard — Zero-Trust route protection component.
 * Wraps sensitive routes (Director, Coach, Admin, Bridge, Owner, etc.)
 * and enforces role-based access control at the client level.
 *
 * - Blocks unauthenticated users (redirects to home).
 * - Blocks authenticated users without the required role (shows Access Denied).
 * - Logs every unauthorized attempt to the AuditLog via the log-security-event backend function.
 * - De-duplicates logging per path (logs once per route per session, not on every re-render).
 */
export default function RoleGuard({ roles: allowedRoles, children }) {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();
  const loggedPathRef = useRef(null);

  // Log unauthorized access attempt — once per path change, not on every render
  useEffect(() => {
    if (authChecked && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      const pathKey = location.pathname;
      if (loggedPathRef.current !== pathKey) {
        loggedPathRef.current = pathKey;
        logSecurityEvent({
          action: 'unauthorized_attempt',
          details: `Route: ${pathKey} | Required: [${allowedRoles.join(', ')}] | Actual: ${user.role}`,
        });
      }
    }
  }, [authChecked, isAuthenticated, user, allowedRoles, location.pathname]);

  // Still loading auth state — show spinner
  if (!authChecked || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B0F1A]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect to home (the AuthProvider will trigger login flow)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Authenticated but wrong role — show Access Denied (opaque, no data leak)
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldX size={28} className="text-red-400" />
          </div>
          <h1 className="text-white font-black text-xl mb-2">גישה נדחתה</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            אין לך הרשאה לצפות בדף זה. ניסיון הגישה תועד במערכת הביקורת.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
            <Lock size={10} /> Zero-Trust · Role: {user.role}
          </div>
        </div>
      </div>
    );
  }

  return children;
}