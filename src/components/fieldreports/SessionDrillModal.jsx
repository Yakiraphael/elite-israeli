import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Calendar, Users, CheckCircle2, XCircle, Activity, Star, FileText } from 'lucide-react';

// התעמקות בדיווח שטח — מציג את מלוא נתוני השחקנים שרשומים לאימות (BehaviorLog)
// ואת הדוחות המקצועי/מנטלי/אישי שקושרו אליו, עם אפשרות לפתוח עותק מפורט של כל דוח.
export default function SessionDrillModal({ session, onOpenReport, onClose }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['session-behavior-logs', session?.id],
    queryFn: () => base44.entities.BehaviorLog.filter({ session_id: session.id }, '-created_date', 100),
    enabled: !!session?.id,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ['session-team-reports', session?.id],
    queryFn: () => base44.entities.TeamReport.filter({ session_id: session.id }, '-date_start', 30),
    enabled: !!session?.id,
  });

  const attended = logs.filter(l => l.attended).length;
  const avgDisc = logs.length ? Math.round(logs.reduce((a, l) => a + (l.discipline_score || 0), 0) / logs.length * 10) / 10 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Activity size={15} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">התעמקות בדיווח שטח</h3>
              <p className="text-white/40 text-xs flex items-center gap-2"><Calendar size={11} /> {session?.name} · {session?.date_start}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        {/* מדדי סיכום */}
        <div className="px-5 py-3 grid grid-cols-3 gap-2 border-b border-white/10 flex-shrink-0">
          <Stat label="משתתפים" value={`${attended}/${logs.length}`} icon={Users} />
          <Stat label="משמעת ממוצעת" value={avgDisc || '—'} icon={Star} />
          <Stat label="דוחות מקושרים" value={reports.length} icon={FileText} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* סיכום פסיכולוגי */}
          {session?.psychological_notes && (
            <div>
              <div className="text-white/40 text-[11px] font-bold mb-1">סיכום עיבוד פסיכולוגי בזמן אמת</div>
              <div className="text-white/80 text-sm leading-relaxed bg-[#0D1B2A] border border-white/10 rounded px-3 py-2 whitespace-pre-wrap">
                {session.psychological_notes}
              </div>
            </div>
          )}

          {/* פירוט שחקנים */}
          <div>
            <div className="text-white/40 text-[11px] font-bold mb-2 flex items-center gap-1"><Users size={11} /> דיווח פרטני לכל שחקן/ית ({logs.length})</div>
            {isLoading ? (
              <div className="text-white/30 text-center py-6 text-sm">טוען…</div>
            ) : logs.length === 0 ? (
              <div className="text-white/30 text-center py-6 text-sm">אין דיווח פרטני לאימות זה</div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-lg overflow-hidden">
                {logs.map(l => (
                  <div key={l.id} className="flex items-start gap-3 px-3 py-2.5 bg-[#0D1B2A]">
                    <div className={`w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 ${l.attended ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
                      {l.attended ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">{l.player_name}</span>
                        <span className="text-white/40 text-[10px]">משמעת {l.discipline_score}/10</span>
                        {l.leadership_score ? <span className="text-[#D4AF37] text-[10px]">★ מנהיגות {l.leadership_score}/5</span> : null}
                      </div>
                      {l.notes && <div className="text-white/55 text-xs leading-relaxed mt-0.5">{l.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* דוחות מקושרים */}
          {reports.length > 0 && (
            <div>
              <div className="text-white/40 text-[11px] font-bold mb-2 flex items-center gap-1"><FileText size={11} /> דוחות מפורטים שקושרו לאימות ({reports.length})</div>
              <div className="space-y-2">
                {reports.map(r => (
                  <button key={r.id} onClick={() => onOpenReport(r)}
                    className="w-full text-right bg-[#0D1B2A] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg p-3 flex items-center justify-between gap-3 transition-colors">
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm">
                        {r.report_type === 'מקצועי' ? '🎯' : r.report_type === 'מנטלי' ? '🧠' : '👤'} דוח {r.report_type}
                        {r.player_name && <span className="text-white/40 text-xs"> · {r.player_name}</span>}
                      </div>
                      <div className="text-white/40 text-[10px]">{r.date_start} · {r.author_role || '—'}</div>
                    </div>
                    <span className="text-[#D4AF37] text-xs font-bold flex-shrink-0">פתח דוח ›</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-md p-2.5">
      <div className="flex items-center gap-1 text-white/40 text-[10px] mb-0.5"><Icon size={10} /> {label}</div>
      <div className="text-white font-black text-base">{value}</div>
    </div>
  );
}