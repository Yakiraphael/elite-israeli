import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, FileText, User, Baby, ShieldCheck } from 'lucide-react';
import ContractSignModal from '../components/contracts/ContractSignModal';
import { signatureStatus } from '../lib/contractTemplates';

// Public signing page used via shared link (?contract_id=...). Both player and guardian
// (for youth contracts) can sign here; status auto-updates the player profile on full signing.
export default function SignContract() {
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract_id');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!contractId) { setLoading(false); return; }
      try {
        const c = await base44.entities.Contract.get(contractId);
        setContract(c);
      } catch {
        setError('החוזה לא נמצא');
      }
      setLoading(false);
    })();
  }, [contractId, refreshKey]);

  if (loading) {
    return <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={28} /></div>;
  }

  if (!contract || (error && !contract)) {
    return <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-white/50 text-sm" dir="rtl">קישור לא תקין</div>;
  }

  const sig = signatureStatus(contract);
  const fullySigned = contract.status === 'חתום';

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-md w-full p-6">
        {fullySigned ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
            <h1 className="text-white font-black text-lg">החוזה נחתם במלואו</h1>
            <p className="text-white/40 text-xs mt-2">תודה. כל החותמים חתמו והסטטוס עודכן אוטומטית בפרופיל השחקן.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-[#D4AF37]" />
              <h1 className="text-white font-black text-lg">חתימה דיגיטלית על חוזה</h1>
            </div>
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-2 text-xs mb-4">
              <div className="flex justify-between"><span className="text-white/40">שחקן</span><span className="text-white font-semibold">{contract.player_name}</span></div>
              <div className="flex justify-between"><span className="text-white/40">סוג חוזה</span><span className="text-white font-semibold">{contract.contract_type}</span></div>
              <div className="flex justify-between"><span className="text-white/40">תוקף</span><span className="text-white font-semibold">{contract.start_date || '—'} עד {contract.end_date}</span></div>
              {contract.ifa_form_reference && <div className="text-white/30 text-[10px] mt-1">מסמך ייחוס: {contract.ifa_form_reference}</div>}
            </div>

            <div className="space-y-2 mb-4">
              {sig.player && (
                <div className={`flex items-center gap-2 text-xs font-bold ${sig.player.cls}`}>
                  <User size={13} /> {sig.player.label}
                </div>
              )}
              {sig.guardian && (
                <div className={`flex items-center gap-2 text-xs font-bold ${sig.guardian.cls}`}>
                  <Baby size={13} /> {sig.guardian.label}
                </div>
              )}
            </div>

            {contract.document_content && (
              <details className="mb-4">
                <summary className="text-[#D4AF37] text-xs font-bold cursor-pointer">צפייה בתוכן החוזה</summary>
                <pre className="mt-2 bg-[#0D1B2A] border border-white/10 rounded-sm p-3 text-white/70 text-[11px] whitespace-pre-wrap leading-relaxed font-mono max-h-60 overflow-y-auto">{contract.document_content}</pre>
              </details>
            )}

            <button onClick={() => setOpenModal(true)}
              className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
              <ShieldCheck size={16} /> חתום על החוזה
            </button>
          </>
        )}
      </div>

      {openModal && (
        <ContractSignModal
          contract={contract}
          onClose={() => setOpenModal(false)}
          onSaved={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}