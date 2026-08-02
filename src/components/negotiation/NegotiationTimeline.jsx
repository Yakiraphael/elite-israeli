import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, History, UserCircle, ArrowDownCircle, ArrowUpCircle, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { buildNegotiationTimeline } from '@/lib/negotiationAudit';

// ציר זמן (Audit Trail) שקוף לחלוטין — מתעד כל פעולה במשא ומתן עם חיווי "Logged By".
// משותף למועדון ולשחקן/אפוטרופוס כדי ששני הצדדים יראו את אותו תיעוד מלא.
const EVENT_META = {
  draft:    { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'יצירת טיוטה' },
  propose:  { icon: ArrowUpCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'הצעת שינוי' },
  accepted: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: 'אישור ויישום' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'דחייה' },
};

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return String(ts); }
}

export default function NegotiationTimeline({ proposalId, proposal }) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['negotiation-requests', proposalId],
    queryFn: () => base44.entities.NegotiationRequest.filter({ transfer_id: proposalId }, '-created_date', 100),
    enabled: !!proposalId,
  });

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-white/30" /></div>;
  }

  const events = buildNegotiationTimeline(requests, proposal || {});

  if (events.length === 0) {
    return (
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 text-center">
        <History size={18} className="text-white/20 mx-auto mb-1" />
        <p className="text-white/30 text-[11px]">אין פעולות מתועדות עדיין</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3" dir="rtl">
      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-3 uppercase tracking-widest">
        <History size={12} /> ציר זמן — תיעוד מלא (Audit Trail)
      </div>
      <ol className="relative pr-4 border-r border-white/10 space-y-3">
        {events.map((ev) => {
          const m = EVENT_META[ev.type] || EVENT_META.propose;
          const Icon = m.icon;
          return (
            <li key={ev.id} className="relative">
              <span className={`absolute -right-[18px] top-0.5 w-2.5 h-2.5 rounded-full ${m.bg} border border-white/20`} />
              <div className={`rounded-lg p-2.5 ${m.bg} border border-white/10`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className={m.color} />
                    <span className={`text-[10px] font-black ${m.color}`}>{m.label}</span>
                  </div>
                  <span className="text-white/30 text-[9px]">{fmtDate(ev.ts)}</span>
                </div>
                <div className="text-white font-bold text-xs mb-1">{ev.clause}</div>
                <div className="text-white/60 text-[11px] leading-relaxed">{ev.detail}</div>
                {/* חיווי "Logged By" — מי בדיוק ביצע את הפעולה */}
                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/10">
                  <UserCircle size={10} className="text-white/40" />
                  <span className="text-white/50 text-[10px] font-bold">Logged By: <span className="text-white/80">{ev.loggedBy}</span></span>
                </div>
                {ev.reasoning && (
                  <p className="text-white/40 text-[10px] leading-relaxed mt-1.5 whitespace-pre-wrap">"{ev.reasoning}"</p>
                )}
                {ev.notes && (
                  <p className="text-white/50 text-[10px] leading-relaxed mt-1.5 whitespace-pre-wrap border-t border-white/10 pt-1.5">
                    <span className="font-bold text-white/70">תגובת המועדון: </span>{ev.notes}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}