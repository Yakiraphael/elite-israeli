import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users, Star, Lock, Loader2, LogOut, Phone, Baby, Building2, Crown, UserPlus, KeyRound, UserCog } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const ROLES = [
  { value: 'youth_player', label: 'שחקן נוער', desc: 'פרופיל ביצועים, כרטיס Elite ID, ציר זמן. חסום לצ׳אטים וחוזים.', icon: Baby, redirect: '/player-profile' },
  { value: 'parent_guardian', label: 'הורה / אפוטרופוס', desc: 'צפייה בפרופיל הבן ובהצעות העברה. חתימה דיגיטלית ב-OTP.', icon: Users, redirect: '/transfer-hub' },
  { value: 'adult_player', label: 'שחקן בוגר (18+)', desc: 'פרופיל עצמאי, סטטוס Free Agent, צ׳אט ישיר וחתימת חוזים.', icon: Star, redirect: '/player-profile' },
  { value: 'club_scout', label: 'סקאוטר / נציג מועדון', desc: 'דאשבורד סקאוטינג, הגשת הצעות. גישה לפי חבילת המועדון.', icon: Building2, redirect: '/transfer-hub' },
  { value: 'elite_admin', label: 'אדמין / אנליסט עילית', desc: 'ניהול מלא של שחקנים, כרטיסים והצעות.', icon: ShieldCheck, redirect: '/admin' },
];

const ONBOARDING_OPTIONS = [
  { role: 'youth_player', label: 'אני שחקן כדורגל', sub: '(או הורה לשחקן נוער)', icon: Baby, desc: 'רישום עם פרטי שחקן, תאריך לידה, ופרטי הורה (חובה לקטינים)' },
  { role: 'club_scout', label: 'אני סקאוטר / נציג מועדון', sub: '(חשבון מועדון)', icon: Building2, desc: 'רישום מועדון עם מייל רשמי. נפתח אוטומטית בסטטוס FREE' },
  { role: 'elite_admin', label: 'אני מאמן / אנליסט בעילית', sub: '(דורש אישור ידני)', icon: Crown, desc: 'טופס פנימי — דורש אישור מנהל מערכת לפני קבלת הרשאות' },
];

export default function TransferPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try {
          const u = await base44.auth.me();
          setUser(u);
          if (u.role && ROLES.find(r => r.value === u.role)) {
            setStep('dashboard');
          } else {
            setStep('onboarding');
          }
        } catch {
          setStep('phone');
        }
      } else {
        setStep('phone');
      }
      setLoading(false);
    });
  }, []);

  const handleSendOtp = () => {
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setOtpError('נא להזין מספר טלפון תקין');
      return;
    }
    setOtpError('');
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) {
      setOtpError('נא להזין קוד בן 4 ספרות לפחות');
      return;
    }
    setOtpError('');
    base44.auth.redirectToLogin('/transfer-portal');
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null);
    setStep('phone');
    setPhoneNumber('');
    setOtpCode('');
  };

  const handleSetRole = async (role) => {
    setSavingRole(true);
    await base44.auth.updateMe({ role });
    const u = await base44.auth.me();
    setUser(u);
    setSavingRole(false);
    setStep('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center" dir="rtl">
        <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {step === 'phone' && (
          <PhoneStep
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onSend={handleSendOtp}
            error={otpError}
          />
        )}
        {step === 'otp' && (
          <OtpStep
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            onVerify={handleVerifyOtp}
            onBack={() => setStep('phone')}
            error={otpError}
          />
        )}
        {step === 'onboarding' && user && (
          <OnboardingWizard user={user} onSelect={handleSetRole} saving={savingRole} />
        )}
        {step === 'dashboard' && user && (
          <RoleDashboard user={user} onLogout={handleLogout} onResetRole={() => { handleSetRole(null); }} />
        )}
      </div>
    </div>
  );
}

// ---- Step 1: Phone input ----
function PhoneStep({ phoneNumber, setPhoneNumber, onSend, error }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
        <Phone size={26} className="text-[#D4AF37]" />
      </div>
      <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">כניסה ללא סיסמה · Passwordless</span>
      <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-4">כניסה למערכת</h1>
      <p className="text-white/50 text-sm max-w-md mx-auto mb-10 leading-relaxed">
        הזן את מספר הטלפון הנייד שלך. נשלח לך קוד אימות חד-פעני (OTP) ב-SMS.
        הנייד הוא המפתח הבלעדי לחשבון שלך — ללא סיסמאות.
      </p>

      <div className="max-w-sm mx-auto">
        <div className="relative mb-4">
          <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="tel"
            dir="ltr"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
            placeholder="050-000-0000"
            className="w-full bg-[#1B263B] border border-white/15 rounded-lg text-right pr-12 pl-4 py-4 text-white text-lg font-bold placeholder-white/20 focus:border-[#D4AF37] focus:outline-none transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button
          onClick={onSend}
          className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2"
        >
          <KeyRound size={16} /> שלח קוד אימות
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {[
          { icon: Baby, label: 'שחקן נוער', desc: 'פרופיל + כרטיס Elite ID' },
          { icon: Users, label: 'הורה / אפוטרופוס', desc: 'אישור הצעות ב-OTP' },
          { icon: Building2, label: 'סקאוטר מועדון', desc: 'דאשבורד סקאוטינג' },
        ].map((r, i) => (
          <div key={i} className="bg-[#1B263B]/50 border border-white/5 rounded-lg p-4 text-center">
            <r.icon size={18} className="text-[#D4AF37] mx-auto mb-2" />
            <div className="text-white/70 font-bold text-xs">{r.label}</div>
            <p className="text-white/30 text-[10px] mt-1">{r.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Step 2: OTP verification ----
function OtpStep({ phoneNumber, otpCode, setOtpCode, onVerify, onBack, error }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
        <Lock size={26} className="text-[#D4AF37]" />
      </div>
      <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">אימות OTP</span>
      <h1 className="text-white text-2xl md:text-3xl font-black mt-3 mb-2">הזן קוד אימות</h1>
      <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
        שלחנו קוד בן 4 ספרות למספר <span className="text-white font-bold" dir="ltr">{phoneNumber}</span>
      </p>

      <div className="max-w-xs mx-auto">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          dir="ltr"
          value={otpCode}
          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && onVerify()}
          placeholder="••••"
          className="w-full bg-[#1B263B] border border-white/15 rounded-lg text-center py-4 text-white text-2xl font-black tracking-[0.5em] placeholder-white/20 focus:border-[#D4AF37] focus:outline-none transition-colors"
        />
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <button
          onClick={onVerify}
          className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors mt-4 inline-flex items-center justify-center gap-2"
        >
          <ShieldCheck size={16} /> אימות וכניסה
        </button>
        <button
          onClick={onBack}
          className="w-full text-white/30 hover:text-white/60 text-xs mt-3 transition-colors"
        >
          חזרה להזנת מספר
        </button>
      </div>
    </motion.div>
  );
}

// ---- Step 3: Onboarding Wizard (new user, choosing account type) ----
function OnboardingWizard({ user, onSelect, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
          <UserPlus size={26} className="text-[#D4AF37]" />
        </div>
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">בחירת סוג חשבון · Onboarding</span>
        <h1 className="text-white text-2xl md:text-3xl font-black mt-3">שלום{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
        <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
          לא מצאנו את המספר שלך במערכת. בחר את סוג החשבון שלך כדי להמשיך
        </p>
      </div>

      <div className="space-y-3">
        {ONBOARDING_OPTIONS.map(opt => (
          <button
            key={opt.role}
            onClick={() => onSelect(opt.role)}
            disabled={saving}
            className="w-full bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/50 rounded-lg p-5 flex items-center gap-4 transition-all text-right group disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
              <opt.icon size={20} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">
                {opt.label} <span className="text-white/40 font-normal text-xs">{opt.sub}</span>
              </div>
              <p className="text-white/40 text-xs mt-0.5">{opt.desc}</p>
            </div>
            {saving ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" /> : <ArrowRight size={16} className="text-white/30 group-hover:text-[#D4AF37] transition-colors" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Step 4: Role Dashboard (authenticated with role) ----
function RoleDashboard({ user, onLogout, onResetRole }) {
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];

  const redirectPath = roleInfo.redirect;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Welcome banner */}
      <div className="bg-gradient-to-l from-[#D4AF37]/15 to-transparent border border-[#D4AF37]/30 rounded-lg p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0">
          <roleInfo.icon size={24} className="text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <div className="text-[#D4AF37] text-xs font-bold tracking-wide uppercase">{roleInfo.label}</div>
          <h1 className="text-white font-black text-xl mt-0.5">{user.full_name || 'משתמש'}</h1>
          <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
        </div>
        <button onClick={onLogout} className="text-white/30 hover:text-red-400 text-xs transition-colors flex items-center gap-1 flex-shrink-0">
          <LogOut size={14} /> יציאה
        </button>
      </div>

      {/* Redirect action */}
      <Link
        to={redirectPath}
        className="block bg-gradient-to-l from-[#1B263B] to-[#0D1B2A] border border-[#D4AF37]/40 rounded-lg p-6 transition-all group hover:border-[#D4AF37] mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
            <UserCog size={20} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">כניסה לאזור האישי</div>
            <p className="text-white/40 text-xs mt-0.5">{roleInfo.desc}</p>
          </div>
          <ArrowRight size={18} className="text-white/30 group-hover:text-[#D4AF37] transition-colors" />
        </div>
      </Link>

      {/* Role-specific info */}
      {user.role === 'club_scout' && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-[#D4AF37]" />
            <span className="text-white font-bold text-sm">סטטוס מועדון: FREE</span>
          </div>
          <p className="text-white/40 text-xs leading-relaxed">
            המועדון שלך בחבילה החינמית. גישה לשחקנים בדרג בסיסי בלבד. שדרג ל-PRO כדי לפתוח גישה ליהלומי האקדמיה ולהוסיף סקאוטרים לצוות.
          </p>
          <Link to="/pricing" className="text-[#D4AF37] text-xs font-bold hover:text-amber-300 mt-2 inline-block">
            שדרוג חבילה ←
          </Link>
        </div>
      )}

      {user.role === 'youth_player' && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-white/40" />
            <span className="text-white font-bold text-sm">הגנת קטינים פעילה</span>
          </div>
          <p className="text-white/40 text-xs leading-relaxed">
            לשחקן נוער יש פרופיל ביצועים מלא — אך אפס סמכות משפטית. כל הצעת העברה עוברת אישור אפוטרופוס ב-OTP.
          </p>
        </div>
      )}

      <button
        onClick={onResetRole}
        className="mt-4 text-white/30 hover:text-white/60 text-xs transition-colors"
      >
        שינוי סוג משתמש
      </button>
    </motion.div>
  );
}