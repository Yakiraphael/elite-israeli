import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2, ArrowLeftRight, CheckCircle2, Lock, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { eligibilityForPlayer, eligibilitySummary } from '@/lib/ageGroupLadder';

// מודל העברת שחקן בין קבוצות המועדון — מוגבל לקפיצות גיל הגיוניות (רמה אחת למעלה בלבד).
// מעדכן את השיוך של השחקן לקבוצה החדשה וכך נכלל אוטומטית בסגל הפעיל של הקבוצה החדשה.
export default function MovePlayerBetweenTeamsModal({ player, onClose }) {
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['club-teams', player.club_id],
    queryFn: () => base44.entities.Team.filter({ club_id: player.club_id }, 'name', 50),
  });

  const move = useMutation({
    mutationFn: ({ team }) => base44.entities.PlayerRegistration.update(player.id, {
      team_id: team.id,
      team_name: team.name,
      league_name: team.age_group || player.league_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dir-players'] });
      queryClient.invalidateQueries({ queryKey: ['coach-players'] });
      toast({ title: 'השחקן הועבר לקבוצה החדשה ונכלל בסגל' });
      onClose();
    },
    onError: (e) => toast({ variant: 'destructive', title: 'שגיאה בהעברה', description: String(e?.message || e).slice(0, 120) }),
  });

  const summary = eligibilitySummary(player);
  const rows = eligibilityForPlayer(player, teams);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <ArrowLeftRight size={15} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">העברת שחקן בין קבוצות המועדון</h3>
              <p className="text-white/40 text-xs">{player.full_name} · {player.position}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* סיכום גיל + כללי העברה */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              <Users size={13} className="text-[#D4AF37]" />
              <span className="font-bold text-white">גיל {summary.age ?? '—'}</span>
              <span className="text-white/30">·</span>
              <span>שכבת גיל: <span className="text-[#D4AF37] font-bold">{summary.tierLabel}</span></span>
            </div>
            <div className="text-[11px] text-white/50 leading-relaxed">
              העברה מותרת רק לשכבת הגיל של השחקן או לשכבה אחת מעליה. אסור לרדת שכבה או לקפוץ יותר משכבה אחת.
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">אין קבוצות במועדון זה</div>
          ) : (
            <div className="space-y-2">
              {rows.map(r => {
                const choice = selected?.id === r.team.id;
                return (
                  <button key={r.team.id}
                    disabled={!r.eligible}
                    onClick={() => setSelected(r.team)}
                    className={`w-full text-right rounded-lg border p-3.5 transition-all flex items-center justify-between gap-3
                      ${!r.eligible ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/[0.02]'
                        : choice ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#0D1B2A] hover:border-[#D4AF37]/40'}`}>
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm flex items-center gap-2">
                        {r.team.name}
                        {r.isCurrent && <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full border border-white/10">נוכחית</span>}
                      </div>
                      <div className="text-white/40 text-[11px]">{r.tier.label}</div>
                      {!r.eligible && r.reason && (
                        <div className="text-red-400/80 text-[10px] mt-0.5 flex items-center gap-1"><Lock size={9} /> {r.reason}</div>
                      )}
                    </div>
                    {r.eligible && (
                      <CheckCircle2 size={16} className={`flex-shrink-0 ${choice ? 'text-[#D4AF37]' : 'text-white/20'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
          <span className="text-white/30 text-[10px]">השחקן יצורף אוטומטית לסגל הקבוצה החדשה</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="text-white/60 hover:text-white text-xs font-bold px-3 py-2 rounded border border-white/10">בטל</button>
            <button disabled={!selected || move.isPending} onClick={() => move.mutate({ team: selected })}
              className="bg-[#D4AF37] text-[#0D1B2A] text-xs font-black px-4 py-2 rounded hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
              {move.isPending ? <Loader2 size={12} className="animate-spin" /> : <ArrowLeftRight size={12} />}
              העבר לקבוצה
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}