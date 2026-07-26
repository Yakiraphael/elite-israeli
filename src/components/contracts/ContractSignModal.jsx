import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, PenLine, X, FileText, ShieldCheck, User, Baby } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { signatureStatus } from '@/lib/contractTemplates';

// Unified digital-signature modal used in-app (player side and shared links).
// Supports multi-party signing: player and/or guardian sign separately. The contract
// is marked "חתום" only after all required signatures are collected. Backend also auto-
// updates the player profile status, so the player card reflects the signed contract.
export default function ContractSignModal({ contract, onClose, onSaved }) {
  const [role, setRole] = useState(() =>
    contract.requires_guardian === false
      ? 'player'
      : (contract.player_signed_at && !contract.guardian_signed_at ? 'guardian' : 'player')
  );
  const [signerName, setSignerName] = useState('');
  const queryClient = useQueryClient();
  const status = signatureStatus(contract);

  const sign = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('signContract', {
        contract_id: contract.id,
        signer_name: signerName.trim(),
        signer_role: role,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-contracts', contract.player_id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onSaved?.();
      onClose();
    },
  });

  const canSignRole = (r) => {
    if (r === 'player') return !contract.player_signed_at;
    return contract.requires_guardian !== false && !contract.guardian_signed_at;
  };
  const needsChoice = contract.requires_guardian !== false && canSignRole('player') && canSignRole('guardian');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-base">חתימה דיגיטלית על חוזה</h3>
            <p className="text-white/40 text-xs mt-1">
              {contract.contract_type}{contract.ifa_form_reference ? ` · מסמך ייחוס: ${contract.ifa_form_reference}` : ''}
            </p>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/30 hover:text-white" /></button>
        </div>

        {/* Contract summary */}
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-white/40">שחקן</span><span className="text-white font-semibold">{contract.player_name}</span></div>
          {contract.club_name && <div className="flex justify-between"><span className="text-white/40">מועדון</span><span className="text-white font-semibold">{contract.club_name}</span></div>}
          <div className="flex justify-between"><span className="text-white/40">תוקף</span><span className="text-white font-semibold">{contract.start_date || '—'} עד {contract.end_date}</span></div>
        </div>

        {/* Signature status */}
        <div className="space-y-2 mb-4">
          <div className="text-[#D4AF37] text-xs font-bold">סטטוס חתימות</div>
          {status.player && (
            <div className={`flex items-center gap-2 text-xs font-bold ${status.player.cls}`}>
              <User size={13} /> {status.player.label}
              {status.player.at && <span className="text-white/30 text-[10px] font-normal">· {new Date(status.player.at).toLocaleString('he-IL')}</span>}
            </div>
          )}
          {status.guardian && (
            <div className={`flex items-center gap-2 text-xs font-bold ${status.guardian.cls}`}>
              <Baby size={13} /> {status.guardian.label}
              {status.guardian.at && <span className="text-white/30 text-[10px] font-normal">· {new Date(status.guardian.at).toLocaleString('he-IL')}</span>}
            </div>
          )}
          {status.ready && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-400">
              <ShieldCheck size={13} /> החוזה נחתם במלואו — סטטוס השחקן עודכן אוטומטית
            </div>
          )}
        </div>

        {/* Document preview */}
        {contract.document_content && (
          <details className="mb-4">
            <summary className="text-[#D4AF37] text-xs font-bold cursor-pointer flex items-center gap-1.5">
              <FileText size={12} /> צפייה בתוכן החוזה
            </summary>
            <pre className="mt-2 bg-[#0D1B2A] border border-white/10 rounded-sm p-3 text-white/70 text-[11px] whitespace-pre-wrap leading-relaxed font-mono max-h-60 overflow-y-auto">{contract.document_content}</pre>
          </details>
        )}

        {/* Role choice for youth contracts */}
        {needsChoice && !status.ready && (
          <div className="mb-4">
            <div className="text-white/40 text-xs mb-1.5">אני חותם/ת כ:</div>
            <div className="flex gap-2">
              <button onClick={() => setRole('player')} disabled={!canSignRole('player')}
                className={`flex-1 text-xs font-bold py-2 rounded-sm border flex items-center justify-center gap-1.5 ${role === 'player' ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37]' : 'border-white/15 text-white/50'} disabled:opacity-30`}>
                <User size={12} /> שחקן
              </button>
              <button onClick={() => setRole('guardian')} disabled={!canSignRole('guardian')}
                className={`flex-1 text-xs font-bold py-2 rounded-sm border flex items-center justify-center gap-1.5 ${role === 'guardian' ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37]' : 'border-white/15 text-white/50'} disabled:opacity-30`}>
                <Baby size={12} /> אפוטרופוס
              </button>
            </div>
          </div>
        )}

        {!status.ready && canSignRole(role) && (
          <>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">חתימה דיגיטלית — שם מלא *</label>
            <input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="שם מלא"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            <p className="text-white/30 text-[10px] mt-2">בעת החתימה יתועדו אוטומטית תאריך, שעה וכתובת IP לצורך תוקף משפטי. לאחר השלמת כל החתימות הנדרשות, סטטוס השחקן בפרופיל יעודכן אוטומטית ל"פעיל".</p>
          </>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2 rounded-sm hover:bg-white/5">סגור</button>
          {!status.ready && canSignRole(role) && (
            <button onClick={() => sign.mutate()} disabled={sign.isPending || !signerName.trim()}
              className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-2 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
              {sign.isPending ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />} חתום
            </button>
          )}
        </div>
        {sign.isError && <p className="text-red-400 text-xs mt-3 text-center">שגיאה בחתימה, נסה שוב</p>}
      </motion.div>
    </div>
  );
}