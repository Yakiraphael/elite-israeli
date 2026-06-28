import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Phone, Shield, Baby, Building2, Crown, ChevronLeft, ArrowRight,
  Loader2, CheckCircle2, Lock, Users, Star, Fingerprint, Key
} from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';
const NAVY = '#0D1B2A';
const NAVY_LIGHT = '#1B263B';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const USER_TYPES = [
  {
    id: 'player',
    icon: Baby,
    title: 'שחקן / נוער',
    subtitle: 'כרטיס Elite ID, פרופיל, מעקב קריירה',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    redirect: '/player-profile',
  },
  {
    id: 'club',
    icon: Building2,
    title: 'מועדון / סקאוטר',
    subtitle: 'ניהול שחקנים, הצעות, דאשבורד',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
    redirect: '/club-dashboard',
  },
  {
    id: 'parent',
    icon: Users,
    title: 'הורה / אפוטרופוס',
    subtitle: 'אישור OTP, מסמכים, מעקב',
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    redirect: '/player-profile',
  },
  {
    id: 'admin',
    icon: Crown,
    title: 'מנהל / אנליסט עילית',
    subtitle: 'ממשק מלא — דורש אישור ידני',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    redirect: '/admin',
    locked: true,
  },
];

export default function OnboardingFlow() {
  const [step, setStep] = useState('welcome'); // welcome | type | phone | otp | done
  const [userType, setUserType] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const selectedType = USER_TYPES.find(t => t.id === userType);

  const handleSendOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setError('נא להזין מספר טלפון תקין (9+ ספרות)');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('נא להזין קוד בן 4 ספרות לפחות');
      return;
    }
    setError('');
    setLoading(true);
    // redirect to platform login
    base44.auth.redirectToLogin(selectedType?.redirect || '/');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: NAVY }} dir="rtl">
      {/* Header */}
      <div className="border-b py-4 px-6 flex items-center justify-between" style={{ borderColor: `${WHITE}10` }}>
        <Link to="/" className="flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: GOLD }}>
          <ArrowRight size={16} /> חזרה לאתר
        </Link>
        <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Background deco */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ backgroundColor: GOLD }} />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ backgroundColor: GOLD }} />

          <AnimatePresence mode="wait">

            {/* WELCOME */}
            {step === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border" style={{ backgroundColor: `${GOLD}10`, borderColor: `${GOLD}30` }}>
                  <img src={LOGO_URL} alt="" className="h-12" />
                </div>
                <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>IEFA · Zero Friction Onboarding</span>
                <h1 className="text-3xl md:text-4xl font-black mt-3 mb-3" style={{ color: WHITE }}>כניסה למערכת</h1>
                <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ color: `${WHITE}60` }}>
                  ללא סיסמאות, ללא טפסים מסורבלים. אחד בוחר סוג משתמש — מקבל קוד — נכנס.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {['Passwordless', 'OTP אימות', 'ביומטרי', 'WebAuthn'].map(f => (
                    <span key={f} className="text-[10px] font-bold px-3 py-1 rounded-full border" style={{ borderColor: `${GOLD}30`, color: `${GOLD}80`, backgroundColor: `${GOLD}08` }}>{f}</span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep('type')}
                    className="flex-1 font-black text-sm py-4 rounded-sm transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    <Lock size={16} /> כניסה / הרשמה
                  </button>
                  <button
                    onClick={() => base44.auth.redirectToLogin('/')}
                    className="flex-1 font-black text-sm py-4 rounded-sm transition-colors border flex items-center justify-center gap-2"
                    style={{ borderColor: `${WHITE}20`, color: `${WHITE}70` }}
                  >
                    <Fingerprint size={16} /> כניסה עם ביומטרי
                  </button>
                </div>

                {/* Recovery notice */}
                <p className="text-xs mt-6" style={{ color: `${WHITE}25` }}>
                  החלפת מכשיר? <button onClick={() => setStep('phone')} className="underline hover:opacity-80" style={{ color: `${GOLD}60` }}>שחזור חשבון</button>
                </p>
              </motion.div>
            )}

            {/* TYPE SELECTION */}
            {step === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setStep('welcome')} className="text-xs mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: `${WHITE}40` }}>
                  <ChevronLeft size={14} /> חזרה
                </button>
                <div className="text-center mb-8">
                  <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>שלב 1 מתוך 2</span>
                  <h2 className="text-2xl font-black mt-2" style={{ color: WHITE }}>מי אתה?</h2>
                  <p className="text-xs mt-1" style={{ color: `${WHITE}40` }}>בחר סוג חשבון — הממשק יותאם אוטומטית</p>
                </div>
                <div className="space-y-3">
                  {USER_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { if (t.locked) return; setUserType(t.id); setStep('phone'); }}
                      disabled={t.locked}
                      className={`w-full rounded-lg p-5 flex items-center gap-4 transition-all text-right border group ${t.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400/40 cursor-pointer'}`}
                      style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10`, backgroundImage: t.locked ? undefined : `linear-gradient(135deg, transparent, transparent)` }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${t.color} border ${t.border}`}>
                        <t.icon size={20} style={{ color: GOLD }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-sm" style={{ color: WHITE }}>{t.title}</div>
                        <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{t.subtitle}</p>
                      </div>
                      {t.locked
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30">פנה למנהל</span>
                        : <ArrowRight size={16} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />
                      }
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PHONE INPUT */}
            {step === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <button onClick={() => setStep('type')} className="text-xs mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity mx-auto" style={{ color: `${WHITE}40` }}>
                  <ChevronLeft size={14} /> חזרה
                </button>
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center border" style={{ backgroundColor: `${GOLD}10`, borderColor: `${GOLD}30` }}>
                  <Phone size={22} style={{ color: GOLD }} />
                </div>
                <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>שלב 2 מתוך 2</span>
                <h2 className="text-2xl font-black mt-2 mb-2" style={{ color: WHITE }}>מספר טלפון</h2>
                <p className="text-xs max-w-xs mx-auto mb-6 leading-relaxed" style={{ color: `${WHITE}40` }}>
                  נשלח קוד 6 ספרות בוואטסאפ. אם לא הגיע תוך 60 שניות — SMS אוטומטי.
                </p>
                <div className="max-w-sm mx-auto">
                  <div className="relative mb-3">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: `${WHITE}30` }}>🇮🇱 +972</span>
                    <input
                      type="tel" dir="ltr" value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      placeholder="050-000-0000"
                      className="w-full rounded-lg text-center py-4 text-lg font-bold focus:outline-none transition-colors pr-20"
                      style={{ backgroundColor: NAVY_LIGHT, border: `1px solid ${WHITE}15`, color: WHITE }}
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full font-black text-sm py-4 rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: GOLD, color: NAVY }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                    שלח קוד אימות
                  </button>
                </div>
              </motion.div>
            )}

            {/* OTP VERIFY */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-xs mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity mx-auto" style={{ color: `${WHITE}40` }}>
                  <ChevronLeft size={14} /> חזרה
                </button>
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center border" style={{ backgroundColor: `${GOLD}10`, borderColor: `${GOLD}30` }}>
                  <Shield size={22} style={{ color: GOLD }} />
                </div>
                <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>OTP · וואטסאפ / SMS</span>
                <h2 className="text-2xl font-black mt-2 mb-1" style={{ color: WHITE }}>הזן קוד אימות</h2>
                <p className="text-xs mb-6" style={{ color: `${WHITE}40` }}>
                  שלחנו קוד 6 ספרות ל-<span dir="ltr" className="font-bold" style={{ color: WHITE }}>{phone}</span>
                </p>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text" inputMode="numeric" maxLength={6} dir="ltr"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    placeholder="• • • • • •"
                    className="w-full rounded-lg text-center py-5 text-3xl font-black tracking-[0.6em] focus:outline-none transition-colors"
                    style={{ backgroundColor: NAVY_LIGHT, border: `1px solid ${WHITE}15`, color: WHITE }}
                  />
                  {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
                  <button onClick={handleVerifyOtp} disabled={loading || otp.length < 4}
                    className="w-full font-black text-sm py-4 rounded-sm transition-colors mt-4 disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ backgroundColor: GOLD, color: NAVY }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    אמת וכנס
                  </button>
                  <button onClick={handleSendOtp} className="text-xs mt-3 hover:opacity-80 transition-opacity" style={{ color: `${WHITE}30` }}>
                    לא קיבלתי — שלח שוב
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}