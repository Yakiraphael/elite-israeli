import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ROLE_OPTIONS = ['שחקן', 'מאמן', 'הורה', 'סקאוטר / מועדון', 'מנהל מקצועי', 'אחר'];

export default function PreRegistrationModal({ onClose }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role_interest: '', club_name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.role_interest) return;
    setSubmitting(true);
    try {
      await base44.entities.PreRegistration.create(form);
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-lg p-6 md:p-8 bg-[#1B263B] border border-white/10"
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-white">רישום מקדים למערכת ההעברות</h3>
          <button onClick={onClose} aria-label="סגירה"><X size={18} className="text-white/40" /></button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle2 size={36} className="mx-auto mb-4 text-green-400" />
            <p className="text-white text-sm font-bold">תודה! נציג הצוות שלנו יצור איתך קשר לפני ההשקה.</p>
            <button onClick={onClose} className="mt-6 text-sm font-bold text-[#D4AF37]">סגור</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/50 text-xs leading-relaxed mb-2">
              מערכת ההעברות נמצאת כעת בשלבי פיתוח מתקדמים ותושק בקרוב. השאירו פרטים ותהיו הראשונים לדעת ולקבל גישה מוקדמת.
            </p>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">שם מלא *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="ישראל ישראלי"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">מייל *</label>
              <input name="email" dir="ltr" value={form.email} onChange={handleChange} placeholder="you@email.com"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">טלפון</label>
              <input name="phone" dir="ltr" value={form.phone} onChange={handleChange} placeholder="05X-XXXXXXX"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">תחום עניין *</label>
              <select name="role_interest" value={form.role_interest} onChange={handleChange}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60">
                <option value="">בחר...</option>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">שם מועדון (אם רלוונטי)</label>
              <input name="club_name" value={form.club_name} onChange={handleChange} placeholder="אופציונלי"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.full_name || !form.email || !form.role_interest || submitting}
              className="w-full font-black text-sm py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all bg-[#D4AF37] text-[#0D1B2A] hover:bg-amber-400"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} הרשמה מקדימה
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}