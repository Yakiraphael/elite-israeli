import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserCog, Mail, Send, Loader2, Check } from 'lucide-react';

export default function GuardianContactCard({ player }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const contact = player.is_adult
    ? (player.manager_email ? { email: player.manager_email, label: 'מנהל אישי' } : null)
    : (player.parent_email ? { email: player.parent_email, label: 'הורה / אפוטרופוס', name: player.guardian_name } : null);

  if (!contact) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: contact.email,
      subject: `הודעה בנוגע ל${player.full_name} — עילית ישראלית`,
      body: message.trim(),
    });
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 2500);
    setOpen(false);
  };

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserCog size={14} className="text-[#D4AF37]" />
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase">{contact.label}</h3>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {contact.name && <div className="text-white text-sm font-semibold truncate">{contact.name}</div>}
          <a href={`mailto:${contact.email}`} className="text-white/60 text-xs hover:text-[#D4AF37] transition-colors flex items-center gap-1 truncate">
            <Mail size={11} /> {contact.email}
          </a>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-sm transition-colors flex-shrink-0">
          <Send size={12} /> שלח הודעה
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="תוכן ההודעה..."
            className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          <button onClick={handleSend} disabled={sending || !message.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs py-2 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40">
            {sending ? <Loader2 size={13} className="animate-spin" /> : sent ? <Check size={13} /> : <Send size={12} />}
            {sending ? 'שולח...' : sent ? 'נשלח' : 'שלח'}
          </button>
        </div>
      )}
    </div>
  );
}