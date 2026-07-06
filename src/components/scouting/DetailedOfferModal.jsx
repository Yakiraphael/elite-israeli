import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Send, Upload, X } from 'lucide-react';

const CURRENCY_SYMBOLS = { ILS: '₪', EUR: '€', USD: '$', GBP: '£' };

export default function DetailedOfferModal({ player, onClose }) {
  const [form, setForm] = useState({
    club_name: '', contact_name: '', contact_email: '', contact_phone: '',
    role_offered: player.position || '', contract_years: '', salary: '', currency: 'ILS',
    signing_bonus: '', trial_period: false, message: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFile(file_url);
    setUploading(false);
  };

  const handleSend = async () => {
    setSending(true);
    const sym = CURRENCY_SYMBOLS[form.currency];
    const parts = [
      `עמדה מוצעת: ${form.role_offered}`,
      form.contract_years && `אורך חוזה: ${form.contract_years} שנים`,
      form.salary && `שכר: ${sym}${form.salary}/חודש`,
      form.signing_bonus && `בונוס חתימה: ${sym}${form.signing_bonus}`,
      form.trial_period && 'כולל תקופת מבחן ראשונית',
      form.message && `הודעה אישית: ${form.message}`,
    ].filter(Boolean).join(' · ');

    await base44.entities.TransferProposal.create({
      club_name: form.club_name || 'מועדון לא צוין',
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      player_elite_id: player.elite_id || player.id,
      player_name: player.full_name,
      proposal_details: parts,
      contract_value: Number(form.salary) * Number(form.contract_years || 1) * 12 || undefined,
      document_url: file || undefined,
      is_adult: player.is_adult,
    });
    setSending(false);
    setSent(true);
  };

  if (sent) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1B263B] border border-green-500/30 rounded-lg p-8 text-center max-w-sm" onClick={e => e.stopPropagation()} dir="rtl">
        <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
        <h3 className="text-white font-black text-base mb-2">ההצעה נשלחה בהצלחה!</h3>
        <p className="text-white/60 text-sm">ל{player.full_name}. ניהול "עילית ישראלית" יבצע בדיקה ולאחריה תישלח לאישור השחקן/אפוטרופוס.</p>
        <button onClick={onClose} className="mt-4 w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm">סגור</button>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-white font-black text-base">📝 הגשת הצעה מפורטת</h3>
            <p className="text-white/60 text-xs mt-0.5">ל-{player.full_name} · {player.position}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">פרטי המועדון</p>
            <div className="space-y-2.5">
              <input value={form.club_name} onChange={set('club_name')} placeholder="שם המועדון" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              <div className="grid grid-cols-2 gap-2.5">
                <input value={form.contact_name} onChange={set('contact_name')} placeholder="איש קשר" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
                <input value={form.contact_phone} onChange={set('contact_phone')} placeholder="טלפון ליצירת קשר" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
              <input value={form.contact_email} onChange={set('contact_email')} placeholder="מייל ליצירת קשר" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
          </div>

          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">תנאי ההצעה</p>
            <div className="space-y-2.5">
              <input value={form.role_offered} onChange={set('role_offered')} placeholder="עמדה מוצעת" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              <div className="grid grid-cols-3 gap-2.5">
                <input type="number" value={form.salary} onChange={set('salary')} placeholder="שכר חודשי" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
                <select value={form.currency} onChange={set('currency')} className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="ILS">₪ ILS</option>
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                </select>
                <input type="number" value={form.contract_years} onChange={set('contract_years')} placeholder="שנות חוזה" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
              <input type="number" value={form.signing_bonus} onChange={set('signing_bonus')} placeholder="בונוס חתימה (אופציונלי)" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.trial_period} onChange={set('trial_period')} className="accent-[#D4AF37]" />
                <span className="text-white/70 text-sm">כולל תקופת מבחן ראשונית</span>
              </label>
            </div>
          </div>

          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">הודעה אישית לשחקן</p>
            <textarea value={form.message} onChange={set('message')} rows={3} placeholder="ספר לשחקן על החזון, תפקידו הצפוי בסגל..." className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          </div>

          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">טיוטת חוזה (PDF, אופציונלי)</p>
            <label className="flex items-center justify-center gap-2 border border-dashed border-white/25 rounded-sm py-3 text-white/60 text-xs cursor-pointer hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {file ? 'קובץ הועלה ✓' : 'העלה קובץ'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/70 text-sm py-3 rounded-sm hover:bg-white/5">ביטול</button>
          <button onClick={handleSend} disabled={!form.club_name || !form.salary || !form.contract_years || sending} className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} שלח הצעה
          </button>
        </div>
      </motion.div>
    </div>
  );
}