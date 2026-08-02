import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, MapPin, FileText, Download, ShieldCheck, PenLine, CheckCircle2, Loader2, Settings, FileSignature, Eye, ShieldX } from 'lucide-react';
import GuardianNotificationSettingsModal from './GuardianNotificationSettingsModal';
import GuardianComplianceGate from './GuardianComplianceGate';
import GuardianConsentPanel from './GuardianConsentPanel';
import GuardianCloseCardModal from './GuardianCloseCardModal';
import GuardianPlayerProfileModal from './GuardianPlayerProfileModal';
import { generateFormPdf } from '@/lib/generateIfoFormPdf';
import IFAFormSignModal from '@/components/admin/IFAFormSignModal';
import NegotiationHub from '@/components/negotiation/NegotiationHub';
import ContractClausesView from '@/components/negotiation/ContractClausesView';
import { consentSnapshot } from '@/lib/regulationVersion';

// מכאן מתבצעת החתימה הדיגיטלית האינטראקטיבית על טופס ההתאחדות — אפוטרופוס/שחקן ממלא השלמות וחותם.
function primaryFormKeyForOffer(offer, player, role) {
  const cat = offer.transfer_category || '';
  const isLoan = cat.startsWith('השאל');
  const isIntl = cat.includes('בינלאומי');
  if (isLoan) {
    return player.is_adult ? 'player_loan_adult' : 'player_loan_minor';
  }
  if (player.is_adult) return isIntl ? 'player_transfer_adult_international' : 'player_transfer_adult_domestic';
  return 'player_transfer_minor';
}

function isLoanOffer(offer) {
  return (offer.transfer_category || '').startsWith('השאל');
}

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
  const [generatingForm, setGeneratingForm] = useState({});
  const [signModal, setSignModal] = useState(null); // {offer, formKey}
  const [showProfile, setShowProfile] = useState(false);
  const [showClose, setShowClose] = useState(false);

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
        ...consentSnapshot(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardian-children'] }),
  });

  const handleGenerateForm = async (offer, formKey) => {
    setGeneratingForm(g => ({ ...g, [offer.id]: true }));
    try {
      await generateFormPdf({
        form_key: formKey || primaryFormKeyForOffer(offer, player),
        player,
        club: { club_name: offer.club_name, contact_name: offer.contact_name },
        transfer: {
          club_to: offer.club_name,
          club_from: player.team_name,
          transfer_category: offer.transfer_category,
          contract_value: offer.contract_value,
          iefa_commission_fee: offer.iefa_commission_fee,
          loan_start_date: offer.loan_start_date,
          loan_end_date: offer.loan_end_date,
        },
      });
    } catch (err) {
      console.error('form gen failed', err);
    } finally {
      setGeneratingForm(g => ({ ...g, [offer.id]: false }));
    }
  };

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
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setShowProfile(true)} title="צפה בפרופיל השחקן"
            className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2.5 py-1.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors">
            <Eye size={12} /> פרופיל
          </button>
          <button onClick={() => setShowClose(true)} title="סגירת כרטיס שחקן"
            className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-sm hover:bg-amber-500/20 transition-colors">
            <ShieldX size={12} /> סגור כרטיס
          </button>
          <button onClick={() => setShowNotifSettings(true)} title="הגדרות התראות" className="text-white/30 hover:text-white transition-colors p-1">
            <Settings size={15} />
          </button>
        </div>
      </div>

      {showNotifSettings && (
        <GuardianNotificationSettingsModal player={player} onClose={() => setShowNotifSettings(false)} />
      )}

      {!player.is_adult && (
        <GuardianConsentPanel player={player} guardianUser={guardianUser} />
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
            <PenLine size={13} /> {player.is_adult ? 'ממתין למשא ומתן מול המועדון' : 'ממתין לחתימתך כאפוטרופוס'} — {pendingOffers.length} {pendingOffers.length === 1 ? (pendingOffers[0] && isLoanOffer(pendingOffers[0]) ? 'השאלה' : 'העברה') : 'פעולות'}
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

              {isLoanOffer(offer) && offer.loan_start_date && (
                <div className="text-amber-400/80 text-[11px] mb-2 flex items-center gap-1 font-bold">
                  <PenLine size={11} /> תקופת השאלה: {offer.loan_start_date} → {offer.loan_end_date || '—'}
                </div>
              )}

              {/* הורדת טיוטת PDF — משותף לכל התפקידים, לעיון בלבד */}
              <button
                onClick={() => handleGenerateForm(offer)}
                disabled={generatingForm[offer.id]}
                className="flex items-center gap-1.5 text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-40 mb-3"
              >
                {generatingForm[offer.id] ? <Loader2 size={11} className="animate-spin" /> : <FileSignature size={11} />}
                הורד טיוטת PDF לעיון
              </button>

              {player.is_adult ? (
                // שחקן בוגר עם מנהל אישי — המנהל אינו חותם, רק מנהל משא ומתן על סעיפי החוזה.
                // השחקן הבוגר חותם בעצמו דרך פרופיל השחקן שלו. תצוגה מובנה מאוחדת לשני הצדדים.
                <ContractClausesView proposal={offer} player={player} role="manager" currentUser={guardianUser} />
              ) : (
                // קטין — אפוטרופוס חותם בלבד
                <>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <button
                      onClick={() => setSignModal({ offer, formKey: primaryFormKeyForOffer(offer, player) })}
                      className="flex items-center gap-1.5 text-[10px] font-bold bg-[#D4AF37] text-[#0D1B2A] border border-[#D4AF37] px-2.5 py-1.5 rounded-sm hover:bg-amber-400 transition-colors"
                    >
                      <FileSignature size={11} /> מלא וחתום על טופס {isLoanOffer(offer) ? 'ההשאלה' : 'ההעברה'}
                    </button>
                    <button
                      onClick={() => setSignModal({ offer, formKey: 'guardian_consent_form' })}
                      className="flex items-center gap-1.5 text-[10px] font-bold bg-white/5 text-white/70 border border-white/15 px-2.5 py-1.5 rounded-sm hover:bg-white/10 transition-colors"
                    >
                      <FileSignature size={11} /> טופס הסכמת אפוטרופוס
                    </button>
                  </div>

                  <GuardianComplianceGate offer={offer} player={player} guardianUser={guardianUser} onApproved={(o) => signOffer.mutate(o)} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {signModal && (
        <IFAFormSignModal
          formKey={signModal.formKey}
          proposal={signModal.offer}
          player={player}
          club={{ club_name: signModal.offer.club_name, contact_name: signModal.offer.contact_name }}
          transfer={{
            club_to: signModal.offer.club_name,
            club_from: player.team_name,
            transfer_category: signModal.offer.transfer_category,
            contract_value: signModal.offer.contract_value,
            iefa_commission_fee: signModal.offer.iefa_commission_fee,
            loan_start_date: signModal.offer.loan_start_date,
            loan_end_date: signModal.offer.loan_end_date,
          }}
          signerRole={player.is_adult ? 'player' : 'guardian'}
          currentUser={guardianUser}
          onClose={() => setSignModal(null)}
        />
      )}

      {showProfile && (
        <GuardianPlayerProfileModal player={player} onClose={() => setShowProfile(false)} />
      )}

      {showClose && (
        <GuardianCloseCardModal
          player={player}
          guardianUser={guardianUser}
          onClose={() => setShowClose(false)}
        />
      )}
    </div>
  );
}