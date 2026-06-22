import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, Loader2, Mail, Phone, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const TIERS = [
  { value: 'Tier 3 — חובבן / ליגות נמוכות', label: 'Tier 3 — חובבן / ליגות נמוכות', desc: 'ליגה א׳, ב׳, ג׳ או ליגות חובבניות' },
  { value: 'Tier 2 — מקצועי בינוני (לאומית)', label: 'Tier 2 — מקצועי בינוני', desc: 'לאומית או מחלקות נוער בדרג ב׳' },
  { value: 'Tier 1 — עלית (ליגת העל / חו״ל)', label: 'Tier 1 — עלית', desc: 'ליגת העל או מועדונים בינלאומיים' },
];

const ROLES = ['מנהל מקצועי', 'סקאוטר', 'מאמן', 'אנליסט', 'מזכירות'];

export default function ClubRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    club_name: '', club_tier: TIERS[0].value, contact_name: '', contact_email: '', contact_phone: '', city: '',
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    await base44.entities.Club.create({ ...form, subscription_plan: 'FREE', billing_status: 'FREE', max_allowed_users: 1, is_verified: false });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-6" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h1 className="text-white text-3xl font-black mb-3">נרשמת בהצלחה!</h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            חשבון המועדון נפתח בסטטוס <span className="text-[#D4AF37] font-bold">FREE</span> עם משתמש אחד וגישה לשחקנים בדרג בסיסי.
            נציג מטעמנו יאמת את המייל הרשמי ויפעיל את החשבון.
          </p>
          <div className="space-y-3">
            <Link to="/transfer-portal" className="block bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors">
              כניסה למערכת
            </Link>
            <Link to="/pricing" className="block border border-[#D4AF37]/50 text-white font-bold text-sm py-4 rounded-sm hover:bg-white/5 transition-colors">
              צפה בחבילות PRO ו-ENTERPRISE
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/transfer-portal" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לכניסה
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <Building2 size={26} className="text-[#D4AF37]" />
          </div>
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">רישום מועדון / סקאוטר</span>
          <h1 className="text-white text-3xl font-black mt-3 mb-2">הרשמת מועדון</h1>
          <p className="text-white/50 text-sm">החשבון נפתח אוטומטית בסטטוס FREE · משתמש אחד · Tier 3</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8 space-y-4">
          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">שם המועדון *</label>
            <input name="club_name" value={form.club_name} onChange={handleChange} placeholder="מכבי תל אביב" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
          </div>

          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">דרג המועדון (Bidder Tier) *</label>
            <select name="club_tier" value={form.club_tier} onChange={handleChange} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors">
              {TIERS.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">איש קשר ראשי *</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="שם מלא" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm pr-10 pl-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">עיר</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="תל אביב" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">מייל רשמי של המועדון *</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input name="contact_email" dir="ltr" value={form.contact_email} onChange={handleChange} placeholder="official@club.com" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm pr-10 pl-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
            </div>
            <p className="text-white/30 text-[10px] mt-1">נדרש לאימות זהות המועדון</p>
          </div>

          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">טלפון איש קשר *</label>
            <div className="relative">
              <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input name="contact_phone" dir="ltr" value={form.contact_phone} onChange={handleChange} placeholder="05X-XXXXXXX" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm pr-10 pl-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
            </div>
          </div>

          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 mt-2">
            <p className="text-white/50 text-xs leading-relaxed">
              החשבון נפתח בחבילת <span className="text-[#D4AF37] font-bold">FREE</span>: משתמש אחד, גישה לשחקנים בדרג בסיסי בלבד.
              ניתן לשדרג ל-PRO (5 משתמשים + גישה לשחקני Elite) או ENTERPRISE (ללא הגבלה) בכל עת.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.club_name || !form.contact_name || !form.contact_email || !form.contact_phone}
            className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            השלם רישום מועדון <CheckCircle2 size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}