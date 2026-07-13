import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, MapPin, FileText, Download, ShieldCheck, PenLine, CheckCircle2, Loader2, Settings } from 'lucide-react';
import GuardianNotificationSettingsModal from './GuardianNotificationSettingsModal';

const MEDICAL_LIGHT = {
  green: { label: 'כשיר לחלוטין', color: '#10B981' },
  yellow: { label: 'נדרש חידוש בקרוב', color: '#F59E0B' },
  red: { label: 'לא כשיר', color: '#EF4444' },
};

export default function ChildOverviewCard({ player, pendingOffers, guardianUser }) {
  const queryClient = useQueryClient();
  const [signName, setSignName] = useState('');
  const [confirm, setConfirm] = useState({});
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  const isExpired = player.medical_expiry_date && new Date(player.medical_expiry_date) < new Date();
  const isSoon = !isExpired && player.medical_expiry_date && (new Date(player.medical_expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;
  const light = !player.medical_certificate_url ? 'red' : isExpired ? 'red' : isSoon ? 'yellow' : 'green';

  const signOffer = useMutation({
    mutationFn: async (offer) => {
      const now = new Date().toISOString();
      await base44.entities.TransferProposal.update(offer.id, {
        status: 'ממתין לאימות התאחדות (IFA)',
        guardian_consent_name: signName.trim(),
        guardian_consent_at: now,
        guardian_otp_verified: true,
      });
      await base44.entities.AuditLog.create({
        actor_id: guardianUser.id,
        actor_name: guardianUser.full_name,
        actor_role: 'parent',
        action: 'sign_player',
        player_id: player.id,
        details: `אפוטרופוס ${signName.trim()} חתם על אישור העברת ${player.full_name} למועדון ${offer.club_name}`,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardian-children'] }),
  });

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-black text-base">{player.full_name}</h3>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>{player.position}</span>
            {player.team_name && <span>· {player.team_name}</span>}
            {player.city && <span className="flex items-center gap-0.5"><MapPin size={10} />{player.city}</span>}
          </div>
        </div>
        <button onClick={() => setShowNotifSettings(true)} title="הגדרות התראות" className="text-white/30 hover:text-white transition-colors flex-shrink-0">
          <Settings size={15} />
        </button>
      </div>

      {showNotifSettings && (
        <GuardianNotificationSettingsModal player={player} onClose={() => setShowNotifSettings(false)} />
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg px-3 py-2 border" style={{ backgroundColor: `${MEDICAL_LIGHT[light].color}15`, borderColor: `${MEDICAL_LIGHT[light].color}40` }}>
          <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: MEDICAL_LIGHT[light].color }}>
            <ShieldCheck size={12} /> כשירות רפואית
          </div>
          <div className="text-white/60 text-[11px] mt-0.5">{MEDICAL_LIGHT[light].label}</div>
        </div>
        <div className="rounded-lg px-3 py-2 border border-white/10 bg-[#0D1B2A]">
          <div className="text-white/40 text-xs font-bold">סטטוס חוזה</div>
          <div className="text-white text-[11px] mt-0.5">{player.contract_end_date ? `בתוקף עד ${player.contract_end_date}` : 'ללא חוזה פעיל'}</div>
        </div>
      </div>

      {(player.id_document_url || player.medical_certificate_url) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {player.id_document_url && (
            <a href={player.id_document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 bg-white/5 px-3 py-1.5 rounded-sm">
              <Download size={12} /> תעודת זהות
            </a>
          )}
          {player.medical_certificate_url && (
            <a href={player.medical_certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 bg-white/5 px-3 py-1.5 rounded-sm">
              <Download size={12} /> אישור רפואי
            </a>
          )}
        </div>
      )}

      {pendingOffers.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <PenLine size={13} /> {player.is_adult ? 'ממתין לאישורך כמנהל אישי' : 'ממתין לחתימתך'} — {pendingOffers.length} הצעת העברה
          </div>
          {pendingOffers.map(offer => (
            <div key={offer.id} className="bg-[#0D1B2A] border border-amber-500/20 rounded-lg p-4">
              <div className="text-white font-bold text-sm mb-1">{offer.club_name}</div>
              <p className="text-white/60 text-xs leading-relaxed mb-2">{offer.proposal_details}</p>
              {offer.document_url && (
                <a href={offer.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 mb-3">
                  <FileText size={12} /> צפה במסמך ההצעה
                </a>
              )}

              {!confirm[offer.id] ? (
                <button onClick={() => setConfirm(c => ({ ...c, [offer.id]: true }))}
                  className="w-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-amber-500/25 transition-colors">
                  {player.is_adult ? 'לחץ לאישור ההעברה כמנהל אישי' : 'לחץ לאישור וחתימה על ההעברה'}
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    value={signName}
                    onChange={e => setSignName(e.target.value)}
                    placeholder={player.is_adult ? 'הקלד את שמך המלא כאישור ניהול' : 'הקלד את שמך המלא כאישור לחתימה דיגיטלית'}
                    className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                  />
                  <button
                    onClick={() => signOffer.mutate(offer)}
                    disabled={!signName.trim() || signOffer.isPending}
                    className="w-full bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-green-500/25 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {signOffer.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    {player.is_adult ? 'אני מאשר/ת את ההעברה כמנהל אישי' : 'אני מאשר/ת את ההעברה בחתימה דיגיטלית'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}