import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldQuestion, CheckCircle2, XCircle, User, MapPin } from 'lucide-react';

export default function CoachTransferApprovals() {
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['coach-transfer-approvals'],
    queryFn: () => base44.entities.TransferProposal.filter({ coach_approval_status: 'ממתין לאישור מאמן' }, '-created_date', 50),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['coach-players-for-approvals'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 200),
  });

  const decide = useMutation({
    mutationFn: ({ id, coach_approval_status }) => base44.entities.TransferProposal.update(id, { coach_approval_status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coach-transfer-approvals'] }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  if (proposals.length === 0) {
    return (
      <div className="text-center py-16">
        <ShieldQuestion size={26} className="text-white/20 mx-auto mb-3" />
        <div className="text-white/30 text-sm">אין בקשות אישור העברה ממתינות</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-5 text-amber-400 text-xs">
        לצורך שמירה על סודיות תנאי ההצעה, אתה נדרש לאשר בהתבסס על פרופיל השחקן בלבד — ללא חשיפת פרטי המועדון או שווי החוזה.
      </div>
      <div className="space-y-3">
        {proposals.map(p => {
          const player = players.find(pl => pl.elite_id === p.player_elite_id || pl.id === p.player_elite_id);
          return (
            <div key={p.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{player?.full_name || p.player_name}</div>
                  <div className="text-white/40 text-xs flex items-center gap-2">
                    {player?.position && <span>{player.position}</span>}
                    {player?.team_name && <span>· {player.team_name}</span>}
                    {player?.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{player.city}</span>}
                  </div>
                </div>
              </div>

              {player && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    ['גובה', player.height_cm ? `${player.height_cm} ס״מ` : '—'],
                    ['ניסיון', player.experience_years ? `${player.experience_years} שנים` : '—'],
                    ['IFA Ready', player.ifa_ready ? '✓ כן' : '✗ לא'],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-2 text-center">
                      <div className="text-white/40 text-[10px]">{l}</div>
                      <div className="text-white text-xs font-bold">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => decide.mutate({ id: p.id, coach_approval_status: 'אושר על ידי מאמן' })}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-bold py-2.5 rounded-sm hover:bg-green-500/25 transition-colors">
                  <CheckCircle2 size={13} /> מאשר להעברה
                </button>
                <button onClick={() => decide.mutate({ id: p.id, coach_approval_status: 'נדחה על ידי מאמן' })}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold py-2.5 rounded-sm hover:bg-red-500/25 transition-colors">
                  <XCircle size={13} /> לא ממליץ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}