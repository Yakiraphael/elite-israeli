import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { HeartPulse, AlertTriangle, Tag } from 'lucide-react';

const TAGS = ['שחקן לסגל בוגרים', 'שחקן להשקעה', 'שחקן למכירה'];

export default function RiskAssessmentTab({ player }) {
  const queryClient = useQueryClient();
  const injuries = player.transfermarkt_data?.injuries || [];

  const update = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dir-players'] }),
  });

  return (
    <div className="space-y-4">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><HeartPulse size={13} /> תיק רפואי מלא</h4>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-[#1B263B] rounded p-2 flex justify-between">
            <span className="text-white/40">אישור רפואי</span>
            <span className="text-white font-semibold">{player.medical_certificate_url ? '✓ קיים' : '✗ חסר'}</span>
          </div>
          <div className="bg-[#1B263B] rounded p-2 flex justify-between">
            <span className="text-white/40">תוקף עד</span>
            <span className="text-white font-semibold">{player.medical_expiry_date || '—'}</span>
          </div>
        </div>
        {injuries.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-white/40 text-xs mb-1">היסטוריית פציעות כרוניות</p>
            {injuries.map((inj, i) => (
              <div key={i} className="flex justify-between text-xs bg-[#1B263B] rounded px-3 py-1.5">
                <span className="text-white/70">{inj.injury_type}</span>
                <span className="text-white/40">{inj.date} · {inj.duration_days} ימים</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/25 text-xs">אין היסטוריית פציעות מתועדת</p>
        )}
      </div>

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle size={13} /> נכס חברתי — משמעת והתנהגות</h4>
        <div className="flex items-center justify-between text-xs bg-[#1B263B] rounded px-3 py-2">
          <span className="text-white/40">כרטיסים צהובים (עונה)</span>
          <span className={`font-bold ${player.yellow_cards_count >= 3 ? 'text-red-400' : 'text-white'}`}>{player.yellow_cards_count || 0}</span>
        </div>
        {player.coach_impact_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {player.coach_impact_tags.map((t, i) => (
              <span key={i} className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Tag size={13} /> פוטנציאל שוק — תיוג ניהולי</h4>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button key={tag} onClick={() => update.mutate({ market_potential_tag: tag })}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${player.market_potential_tag === tag ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'bg-[#1B263B] text-white/60 border-white/15 hover:border-[#D4AF37]/40'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}