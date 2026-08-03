import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Mail, Phone, User, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { useHomeStrings } from '@/lib/i18n/homeStrings';
import DocumentUpload from '../components/registration/DocumentUpload';
import SecurityBadge from '../components/SecurityBadge';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const TIERS = [
  { value: 'Tier 3 — חובבן / ליגות נמוכות', label: 'Tier 3', descKey: 'registration' },
  { value: 'Tier 2 — מקצועי בינוני (לאומית)', label: 'Tier 2', descKey: 'registration' },
  { value: 'Tier 1 — עלית (ליגת העל / חו״ל)', label: 'Tier 1', descKey: 'registration' },
];

export default function ClubRegistration() {
  const { t } = useTranslation();
  const s = useHomeStrings();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    club_name: '', club_tier: TIERS[0].value, business_id: '', league_name: '', contact_name: '', contact_email: '', contact_phone: '', city: '',
    municipality: '', latitude: '', longitude: '',
    incorporation_certificate_url: '',
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    await base44.entities.Club.create({
      ...form, subscription_plan: 'FREE', max_allowed_users: 1, is_verified: false, verification_status: 'ממתין לאימות',
      geo_verification_status: 'PENDING_VERIFICATION', service_radius_km: 20,
      latitude: form.latitude ? +form.latitude : null, longitude: form.longitude ? +form.longitude : null,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h1 className="text-white text-3xl font-black mb-3">{t('registration.successTitle')}</h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            {t('registration.successDesc', { club: form.club_name })}
          </p>
          <div className="space-y-3">
            <Link to="/transfer-portal" className="block bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors">
              {t('registration.enterSystem')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const inpClass = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors";
  const labelClass = "text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block";
  const hintClass = "text-white/30 text-[10px] mt-1";

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/transfer-portal" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
              <ArrowRight size={16} /> {t('registration.backToLogin')}
            </Link>
            <LanguageSwitcher />
          </div>
          <img src={LOGO_URL} alt={s.nav.home} className="h-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={26} className="text-[#D4AF37]" />
          </div>
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">{t('registration.badge')}</span>
          <h1 className="text-white text-3xl font-black mt-3 mb-2">{t('registration.title')}</h1>
          <p className="text-white/50 text-sm">{t('registration.subtitle')}</p>
          <div className="flex justify-center mt-4">
            <SecurityBadge />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8 space-y-4">
          <div>
            <label className={labelClass}>{t('registration.clubName')}</label>
            <input name="club_name" value={form.club_name} onChange={handleChange} placeholder="Maccabi Tel Aviv" className={inpClass} />
          </div>

          <div>
            <label className={labelClass}>{t('registration.businessId')}</label>
            <input name="business_id" dir="ltr" value={form.business_id} onChange={handleChange} placeholder="512345678" className={inpClass} />
            <p className={hintClass}>{t('registration.businessIdHint')}</p>
          </div>

          <div>
            <label className={labelClass}>{t('registration.leagueName')}</label>
            <input name="league_name" value={form.league_name} onChange={handleChange} placeholder={t('registration.leagueHint')} className={inpClass} />
            <p className={hintClass}>{t('registration.leagueHint')}</p>
          </div>

          <div>
            <label className={labelClass}>{t('registration.clubTier')}</label>
            <select name="club_tier" value={form.club_tier} onChange={handleChange} className={inpClass}>
              {TIERS.map(tier => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('registration.contactName')}</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder={t('common.name')} className={`${inpClass} pr-10 pl-4`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('registration.city')}</label>
              <input name="city" value={form.city} onChange={handleChange} className={inpClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('registration.municipality')}</label>
            <input name="municipality" value={form.municipality} onChange={handleChange} className={inpClass} />
            <p className={hintClass}>{t('registration.municipalityHint')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('registration.latitude')}</label>
              <input name="latitude" dir="ltr" value={form.latitude} onChange={handleChange} placeholder="31.7921" className={inpClass} />
            </div>
            <div>
              <label className={labelClass}>{t('registration.longitude')}</label>
              <input name="longitude" dir="ltr" value={form.longitude} onChange={handleChange} placeholder="34.6589" className={inpClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('registration.email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input name="contact_email" dir="ltr" value={form.contact_email} onChange={handleChange} placeholder="official@club.com" className={`${inpClass} pr-10 pl-4`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('registration.phone')}</label>
            <div className="relative">
              <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input name="contact_phone" dir="ltr" value={form.contact_phone} onChange={handleChange} placeholder="05X-XXXXXXX" className={`${inpClass} pr-10 pl-4`} />
            </div>
          </div>

          <DocumentUpload
            label={t('registration.incorporation')}
            name="incorporation_certificate_url"
            value={form.incorporation_certificate_url}
            onChange={(url) => setForm(prev => ({ ...prev, incorporation_certificate_url: url }))}
            required
            hint={t('registration.incorporationHint')}
          />

          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 mt-2">
            <p className="text-white/50 text-xs leading-relaxed">{t('registration.verificationNote')}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.club_name || !form.business_id || !form.league_name || !form.contact_name || !form.contact_email || !form.contact_phone || !form.incorporation_certificate_url}
            className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {t('registration.submitBtn')} <CheckCircle2 size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}