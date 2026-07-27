import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Users, Star, FileText, Activity, ChevronLeft } from 'lucide-react';

// התעמקות בסשן — מציגה נתוני BehaviorLog (נוכחות/משמעת/מנהיגות) + דוחות מקושרים עבור אימות/סדנה.
export default function SessionDrillModal({ session, onOpenReport, onClose }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['session-logs', session.id],
    queryFn: () => base44.entities.BehaviorLog.filter({ session_id: session.id }, 'session_date', 50),
  });
  const { data: reports = [] } = useQuery({
    queryKey: ['session-reports', session.id],
    queryFn: () => base44.entities.TeamReport.filter({ session_id: session.id }, '-date_start', 10),
  });

  const attended = logs.filter(l => l.attended).length;
  const avgDisc = logs.length ? (logs.reduce((s, l) => s + (l.discipline_score || 0), 0) / logs.length).toFixed(1) : '—';
  const date = session.date_start || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-black text-base flex items-center gap-2">
              <Activity size={15} className="text-[#D4AF37]" /> התעמקות בדיווח שטח
            </h3>
            <p className="text-white/40 text-xs">{session.name} · {date}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* סטטיסטיקה */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 text-center">
              <Users size={14} className="text-white/40 mx-auto mb-1" />
              <div className="text-white font-black text-sm">{attended}/{logs.length}</div>
              <div className="text-white/40 text-[9px]">משתתפים</div>
            </div>
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 text-center">
              <Star size={14} className="text-[#D4AF37] mx-auto mb-1" />
              <div className="text-white font-black text-sm">{avgDisc}</div>
              <div className="text-white/40 text-[9px]">משמעת ממוצעת</div>
            </div>
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 text-center">
              <FileText size={14} className="text-blue-400 mx-auto mb-1" />
              <div className="text-white font-black text-sm">{reports.length}</div>
              <div className="text-white/40 text-[9px]">דוחות מקושרים</div>
            </div>
          </div>

          {/* סיכום עיבוד פסיכולוגי */}
          {session.psychological_notes && (
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
              <div className="text-white/40 text-[10px] font-bold mb-1">סיכום עיבוד פסיכולוגי בזמן אמת</div>
              <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">{session.psychological_notes}</p>
            </div>
          )}

          {/* דיווח פרטני לכל שחקן */}
          <div>
            <div className="text-white/50 text-[11px] font-bold mb-2">דיווח פרטני לכל שחקן/ית ({logs.length})</div>
            {logs.length === 0 && <div className="text-white/30 text-xs">אין דיווחי נוכחות לסשן זה</div>}
            <div className="space-y-1.5">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between bg-[#0D1B2A] border border-white/10 rounded-md p-2.5">
                  <div className="min-w-0">
                    <div className="text-white text-xs font-bold truncate">{l.player_name || '—'}</div>
                    {l.notes && <div className="text-white/40 text-[10px] truncate">{l.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {l.attended ? <span className="text-green-400 text-[10px] font-bold">נוכח</span> : <span className="text-red-400 text-[10px] font-bold">נעדר</span>}
                    {l.discipline_score != null && <span className="text-[#D4AF37] text-[10px] font-bold">משמעת {l.discipline_score}/10</span>}
                    {l.leadership_score != null && <span className="text-blue-400 text-[10px] font-bold">מנהיגות {l.leadership_score}/5</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* דוחות מקושרים */}
          {reports.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-white/50 text-[11px] font-bold mb-2">דוחות מפורטים מסשן זה ({reports.length})</div>
              <div className="space-y-1.5">
                {reports.map(r => (
                  <div key={r.id} className="bg-[#0D1B2A] border border-white/10 rounded-md p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold">{r.report_type} {r.player_name ? `· ${r.player_name}` : ''}</span>
                      <span className="text-white/40 text-[10px]">{r.author_name || ''}</span>
                    </div>
                    {r.summary && <p className="text-white/60 text-[11px] mt-1">{r.summary}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {onOpenReport && (
          <div className="p-3 border-t border-white/10 flex justify-end">
            <button onClick={onOpenReport}
              className="flex items-center gap-1.5 bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold px-3 py-2 rounded-md hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30">
              <ChevronLeft size={13} /> צור דוח מפורט מסשן זה
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}