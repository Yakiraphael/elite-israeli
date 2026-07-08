import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, History } from 'lucide-react';

const ACTION_LABELS = {
  view_medical: '🩺 צפייה ברשומה רפואית',
  view_contract: '📄 צפייה בחוזה',
  delete_player: '🗑️ מחיקת שחקן',
  export_data: '📤 ייצוא נתונים',
  unauthorized_attempt: '⛔ ניסיון גישה לא מורשה',
  sign_player: '✍️ חתימה על שחקן',
  status_change: '🔄 שינוי סטטוס',
};

export default function AuditLogPanel() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <History size={18} className="text-[#D4AF37]" />
        <h2 className="text-white font-black text-xl">יומן ביקורת (Audit Log)</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">אין רשומות ביקורת עדיין</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className={`bg-[#1B263B] border rounded-lg p-4 flex items-start justify-between gap-4 ${log.action === 'unauthorized_attempt' ? 'border-red-500/30' : 'border-white/10'}`}>
              <div>
                <div className="text-white font-bold text-sm">{ACTION_LABELS[log.action] || log.action}</div>
                <div className="text-white/40 text-xs mt-1">{log.actor_name || log.actor_id}{log.actor_role ? ` · ${log.actor_role}` : ''}</div>
                {log.details && <div className="text-white/30 text-xs mt-1">{log.details}</div>}
              </div>
              <div className="text-white/25 text-[10px] whitespace-nowrap flex-shrink-0">
                {log.created_date ? new Date(log.created_date).toLocaleString('he-IL') : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}