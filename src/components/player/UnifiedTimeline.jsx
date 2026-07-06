import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, ArrowLeftRight, HeartPulse, Sparkles, Loader2 } from 'lucide-react';

export default function UnifiedTimeline({ player }) {
  const { data: systemTransfers = [], isLoading } = useQuery({
    queryKey: ['unified-timeline-transfers', player.id],
    queryFn: () => base44.entities.TransferTracker.filter({ player_id: player.id, status: 'Signed' }, '-signed_at', 20),
    enabled: !!player.id,
  });

  const tmData = player.transfermarkt_data || {};

  const events = [
    ...(player.elite_journey || []).map(e => ({ date: e.date, kind: 'journey', title: e.title, desc: e.description, tag: e.category })),
    ...(tmData.transfer_history || []).map(t => ({ date: t.date, kind: 'tm_transfer', title: `${t.from_club} ← ${t.to_club}`, desc: t.fee })),
    ...(tmData.injuries || []).map(i => ({ date: i.date, kind: 'injury', title: i.injury_type, desc: i.duration_days ? `${i.duration_days} ימי החלמה` : '' })),
    ...systemTransfers.map(t => ({ date: t.signed_at || t.trial_date, kind: 'system_transfer', title: `${t.club_from || '?'} ← ${t.club_to}`, desc: t.offer_amount ? `${t.offer_amount.toLocaleString()} ${t.currency || '₪'}` : '' })),
  ].filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>;
  }

  if (events.length === 0) return null;

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-4">ציר זמן קריירה מאוחד</h3>
      <div className="space-y-3">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
            <span className="mt-0.5 flex-shrink-0">
              {ev.kind === 'system_transfer' && <ShieldCheck size={15} className="text-[#D4AF37]" />}
              {ev.kind === 'tm_transfer' && <ArrowLeftRight size={15} className="text-blue-400" />}
              {ev.kind === 'injury' && <HeartPulse size={15} className="text-red-400" />}
              {ev.kind === 'journey' && <Sparkles size={15} className="text-emerald-400" />}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-sm">{ev.title}</span>
                {ev.kind === 'system_transfer' && (
                  <span className="bg-[#D4AF37]/15 text-[#D4AF37] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                    ✓ מתועד ב-IEFA — לפני Transfermarkt
                  </span>
                )}
              </div>
              {ev.desc && <p className="text-white/60 text-xs mt-0.5">{ev.desc}</p>}
              <p className="text-[#D4AF37]/70 text-[10px] mt-1">{ev.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}