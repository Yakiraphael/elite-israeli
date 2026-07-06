import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default function PlayerVerificationModal({ player, onClose }) {
  const queryClient = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: (account_status) => base44.entities.PlayerRegistration.update(player.id, { account_status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-players'] }); onClose(); },
  });

  const checks = [
    { label: 'תעודת זהות', ok: !!player.id_document_url, url: player.id_document_url },
    ...(!player.is_adult ? [{ label: 'ספח תעודת זהות', ok: !!player.id_suffix_url, url: player.id_suffix_url }] : []),
    { label: 'תמונת פנים (סלפי)', ok: !!player.selfie_url, url: player.selfie_url },
    { label: 'אישור רפואי', ok: !!player.medical_certificate_url, url: player.medical_certificate_url },
    ...(!player.is_adult ? [
      { label: 'שם הורה/אפוטרופוס', ok: !!player.guardian_name },
      { label: 'ת.ז הורה', ok: !!player.guardian_id },
      { label: 'טלפון הורה', ok: !!player.parent_phone },
      { label: 'מייל הורה', ok: !!player.parent_email },
    ] : []),
    { label: 'קישור אימות זהות', ok: !!player.verification_link, url: player.verification_link },
  ];

  const legalKeys = Object.keys(player.legal_terms_accepted || {});
  const allLegal = legalKeys.length > 0 && legalKeys.every(k => player.legal_terms_accepted[k]);
  const missing = checks.filter(c => !c.ok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-base">בדיקה מקיפה — {player.full_name}</h3>
            <p className="text-white/40 text-xs">{missing.length === 0 && allLegal ? '✅ כל המסמכים הושלמו' : `⚠️ חסרים ${missing.length + (allLegal ? 0 : 1)} פריטים`}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="space-y-2 mb-4">
          {checks.map(c => (
            <div key={c.label} className={`flex items-center justify-between p-2.5 rounded-lg border ${c.ok ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
              <div className="flex items-center gap-2">
                {c.ok ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                <span className="text-white text-xs">{c.label}</span>
              </div>
              {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300"><ExternalLink size={13} /></a>}
            </div>
          ))}
          <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${allLegal ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            {allLegal ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
            <span className="text-white text-xs">אישורים משפטיים</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => updateStatus.mutate('מאושר')} disabled={updateStatus.isPending}
            className="flex-1 bg-green-500/20 text-green-400 text-xs font-bold py-3 rounded-sm hover:bg-green-500/30 border border-green-500/20 transition-colors disabled:opacity-50">
            ✅ אשר שחקן
          </button>
          <button onClick={() => updateStatus.mutate('מושעה')} disabled={updateStatus.isPending}
            className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-3 rounded-sm hover:bg-red-500/30 border border-red-500/20 transition-colors disabled:opacity-50">
            ⛔ השעה
          </button>
        </div>
      </div>
    </div>
  );
}