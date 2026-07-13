import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Inbox, Building2, FileText, CheckCircle2 } from 'lucide-react';
import TransferPipelineStepper from '../admin/TransferPipelineStepper';

const STATUS_STYLES = {
  'ממתין לאישור הנהלה': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  'מאושר — ממתין לאפוטרופוס': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  'מאושר — ממתין לשחקן (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'ממתין לאימות תשלום (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'ממתין לאימות ההתאחדות (IFA)': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'אושרה סופית': { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  'נדחתה': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  'נסגרה': { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10' },
};

export default function PlayerOffersPanel({ player }) {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState(null);
  const [signName, setSignName] = useState('');

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['player-offers', player.id],
    queryFn: () => base44.entities.TransferProposal.filter({ player_elite_id: player.elite_id || player.id }, '-created_date', 20),
    enabled: !!player.id,
  });

  const manageOwnTransfer = useMutation({
    mutationFn: async (offer) => {
      const now = new Date().toISOString();
      const nextStatus = offer.contract_value > 0 ? 'ממתין לאימות תשלום (בוגר)' : 'ממתין לאימות התאחדות (IFA)';
      await base44.entities.TransferProposal.update(offer.id, {
        status: nextStatus,
        player_consent: true,
        guardian_consent_name: signName.trim(),
        guardian_consent_at: now,
      });
      try {
        const user = await base44.auth.me();
        await base44.entities.AuditLog.create({
          actor_id: user?.id || player.id,
          actor_name: user?.full_name || player.full_name,
          actor_role: 'player',
          action: 'sign_player',
          player_id: player.id,
          details: `השחקן ${signName.trim()} אישר בעצמו את ההעברה למועדון ${offer.club_name}`,
        });
      } catch { /* public/unauthenticated context — skip audit log */ }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-offers', player.id] });
      setConfirmingId(null);
      setSignName('');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <h3 className="text-white font-black text-base mb-1">📬 הצעות שהתקבלו</h3>
      <p className="text-white/50 text-xs mb-4">כל הצעה מקצועית שהוגשה עבורך על ידי מועדון או סקאוט מוסמך</p>

      {offers.length === 0 ? (
        <div className="text-center py-8">
          <Inbox size={24} className="text-white/25 mx-auto mb-2" />
          <p className="text-white/50 text-sm">עדיין לא התקבלו הצעות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(o => {
            const sc = STATUS_STYLES[o.status] || STATUS_STYLES['ממתין לאישור הנהלה'];
            const isYouth = !player.is_adult;
            const canManage = player.is_adult && o.status === 'מאושר — ממתין לשחקן (בוגר)';
            return (
              <div key={o.id} className={`bg-[#0D1B2A] border rounded-lg p-4 ${sc.border}`}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-[#D4AF37]" />
                    <span className="text-white font-bold text-sm">{o.club_name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{o.status}</span>
                </div>

                {/* Transparent progress — visible regardless of youth/adult, no commercial details exposed */}
                <div className="mb-2">
                  <TransferPipelineStepper status={o.status} isAdult={player.is_adult} />
                </div>

                {isYouth ? (
                  <p className="text-white/40 text-xs leading-relaxed">
                    🔒 מאחר שאתה שחקן נוער — פרטי ההצעה המלאים והמסמכים המצורפים חשופים לצפייה ולאישור האפוטרופוס שלך בלבד. תהליך ההעברה, לעומת זאת, שקוף ומוצג לך תמיד למעלה.
                  </p>
                ) : (
                  <>
                    <p className="text-white/70 text-xs leading-relaxed mb-2">{o.proposal_details}</p>
                    {o.contract_value ? (
                      <p className="text-[#D4AF37] text-xs font-bold mb-1">שווי חוזה: ₪{o.contract_value.toLocaleString()}</p>
                    ) : null}
                    {o.document_url && (
                      <a href={o.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 transition-colors mb-2">
                        <FileText size={12} /> צפה במסמך ההצעה
                      </a>
                    )}

                    {canManage && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-blue-400 text-xs font-bold mb-2">כשחקן בוגר, באפשרותך לנהל את ההעברה שלך בעצמך ולאשר אותה ישירות.</p>
                        {confirmingId !== o.id ? (
                          <button onClick={() => setConfirmingId(o.id)}
                            className="w-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-blue-500/25 transition-colors">
                            נהל את ההעברה שלי בעצמי
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <input value={signName} onChange={e => setSignName(e.target.value)}
                              placeholder="הקלד את שמך המלא כאישור ניהול עצמי"
                              className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                            <button onClick={() => manageOwnTransfer.mutate(o)} disabled={!signName.trim() || manageOwnTransfer.isPending}
                              className="w-full bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-green-500/25 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                              {manageOwnTransfer.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              אני מאשר/ת את ההעברה כשחקן עצמאי
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}