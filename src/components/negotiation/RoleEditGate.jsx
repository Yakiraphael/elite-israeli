import { Lock } from 'lucide-react';
import { canRole } from '@/lib/negotiationAudit';

// שער הרשאות — עוטף פעולות עריכה ונועל אותן לתפקידים שאינם המועדון.
// מציג חיווי ויזואלי ברור מדוע הפעולה חסומה ולמי פנויה.
export default function RoleEditGate({ role, action = 'canEdit', children, lockMessage }) {
  const allowed = canRole(role, action);
  if (allowed) return children;

  const msg = lockMessage || 'פעולה זו שמורה למועדון (מנהל מקצועי) בלבד. ניתן להציע שינוי דרך מרכז המשא ומתן.';

  return (
    <div className="relative inline-block w-full" dir="rtl">
      <div className="opacity-50 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#0D1B2A]/70 rounded-lg px-3 text-center">
        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
          <Lock size={12} />
          <span className="leading-snug">{msg}</span>
        </div>
      </div>
    </div>
  );
}