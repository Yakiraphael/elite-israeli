import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, FileText } from 'lucide-react';

export default function SignContract() {
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('contract_id');
  const [contract, setContract] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
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
  }, [contractId]);

  const handleSign = async () => {
    setSigning(true);
    setError('');
    try {
      await base44.functions.invoke('signContract', { contract_id: contractId, signer_name: signerName });
      setSigned(true);
    } catch (e) {
      setError('שגיאה בחתימה, נסה שוב');
    }
    setSigning(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={28} /></div>;
  }

  if (!contract || error && !contract) {
    return <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-white/50 text-sm" dir="rtl">קישור לא תקין</div>;
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-md w-full p-6">
        {signed || contract.status === 'חתום' ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
            <h1 className="text-white font-black text-lg">החוזה נחתם בהצלחה</h1>
            <p className="text-white/40 text-xs mt-2">תודה, החתימה נרשמה במערכת.</p>
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
            </div>
            <label className="text-white/40 text-xs">שם מלא של החותם</label>
            <input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="שם מלא"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 mb-4 focus:outline-none focus:border-[#D4AF37]/60" />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button disabled={!signerName || signing} onClick={handleSign}
              className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {signing ? <Loader2 size={16} className="animate-spin" /> : 'אני מאשר וחותם על החוזה'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}