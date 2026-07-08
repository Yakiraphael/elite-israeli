import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, Copy, Check, Send, Loader2, Mail } from 'lucide-react';

export default function InvitePlayerPanel() {
  const inviteLink = `${window.location.origin}/transfer-portal`;
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: 'הזמנה להצטרפות לפלטפורמת עילית ישראלית',
        body: `שלום,\n\nהוזמנת להצטרף כשחקן/ית לפלטפורמת עילית ישראלית.\nלחץ/י על הקישור הבא כדי להירשם ולהשלים את הפרופיל שלך:\n\n${inviteLink}\n\nבברכה,\nצוות עילית ישראלית`,
      });
      setSent(true);
      setEmail('');
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      setError('שליחת ההזמנה נכשלה, נסה שוב');
    }
    setSending(false);
  };

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-1">
        <Link2 size={16} className="text-[#D4AF37]" />
        <h3 className="text-white font-black text-base">הזמנת שחקנים למערכת</h3>
      </div>
      <p className="text-white/40 text-xs mb-5">שתף קישור ישיר להרשמה, או שלח הזמנה ישירות למייל השחקן</p>

      <div className="mb-5">
        <label className="text-white/40 text-xs font-bold mb-1.5 block">קישור הרשמה ישיר</label>
        <div className="flex items-center gap-2">
          <input readOnly value={inviteLink}
            className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white/70 text-xs focus:outline-none" />
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-3 py-2.5 rounded-sm hover:bg-amber-400 transition-colors flex-shrink-0">
            {copied ? <><Check size={13} /> הועתק</> : <><Copy size={13} /> העתק</>}
          </button>
        </div>
      </div>

      <div>
        <label className="text-white/40 text-xs font-bold mb-1.5 block flex items-center gap-1.5"><Mail size={12} /> שליחת הזמנה במייל</label>
        <div className="flex items-center gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="כתובת מייל של השחקן"
            className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          <button onClick={handleSendEmail} disabled={!email.trim() || sending}
            className="flex items-center gap-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-xs px-3 py-2.5 rounded-sm hover:bg-blue-500/25 transition-colors disabled:opacity-40 flex-shrink-0">
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} שלח
          </button>
        </div>
        {sent && <p className="text-green-400 text-xs mt-2 flex items-center gap-1"><Check size={12} /> ההזמנה נשלחה בהצלחה</p>}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}