import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Baby, Building2, Crown, ChevronLeft, ArrowRight,
  Lock, Users, Fingerprint
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
    redirect: '/club-registration',
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
  const [step, setStep] = useState('welcome'); // welcome | type
  const navigate = useNavigate();

  const handleSelectType = (t) => {
    if (t.locked) return;
    navigate(t.redirect);
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
                <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>IEFA · הרשמה למערכת</span>
                <h1 className="text-3xl md:text-4xl font-black mt-3 mb-3" style={{ color: WHITE }}>כניסה למערכת</h1>
                <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ color: `${WHITE}60` }}>
                  בחר את סוג המשתמש שלך ותועבר ישירות לטופס הרישום המתאים.
                </p>

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
                    <Fingerprint size={16} /> כניסה עם חשבון קיים
                  </button>
                </div>
              </motion.div>
            )}

            {/* TYPE SELECTION */}
            {step === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={() => setStep('welcome')} className="text-xs mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: `${WHITE}40` }}>
                  <ChevronLeft size={14} /> חזרה
                </button>
                <div className="text-center mb-8">
                  <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>שלב אחד קטן</span>
                  <h2 className="text-2xl font-black mt-2" style={{ color: WHITE }}>מי אתה?</h2>
                  <p className="text-xs mt-1" style={{ color: `${WHITE}40` }}>בחר סוג חשבון — תועבר ישירות לטופס הרישום המתאים</p>
                </div>
                <div className="space-y-3">
                  {USER_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectType(t)}
                      disabled={t.locked}
                      className={`w-full rounded-lg p-5 flex items-center gap-4 transition-all text-right border group ${t.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400/40 cursor-pointer'}`}
                      style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
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

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}