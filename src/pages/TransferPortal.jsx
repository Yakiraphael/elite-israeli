import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Users, Star, Lock, Loader2, LogOut, Phone,
  Baby, Building2, Crown, UserPlus, KeyRound, UserCog, ChevronLeft, Sparkles
} from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const NAVY = '#0D1B2A';
const NAVY_LIGHT = '#1B263B';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const ROLES = [
  { value: 'youth_player', label: 'שחקן נוער', desc: 'פרופיל, כרטיס Elite ID, ציר זמן. חסום לחוזים.', icon: Baby, redirect: '/player-profile' },
  { value: 'parent_guardian', label: 'הורה / אפוטרופוס', desc: 'צפייה בפרופיל והצעות. חתימה דיגיטלית ב-OTP.', icon: Users, redirect: '/transfer-hub' },
  { value: 'adult_player', label: 'שחקן בוגר (18+)', desc: 'פרופיל עצמאי, Free Agent, צ׳אט וחתימת חוזים.', icon: Star, redirect: '/player-profile' },
  { value: 'club_scout', label: 'סקאוטר / מועדון', desc: 'דאשבורד סקאוטינג, הגשת הצעות.', icon: Building2, redirect: '/transfer-hub' },
  { value: 'elite_admin', label: 'אדמין / אנליסט', desc: 'ניהול מלא של שחקנים, כרטיסים והצעות.', icon: ShieldCheck, redirect: '/admin' },
];

export default function TransferPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try {
          const u = await base44.auth.me();
          setUser(u);
        } catch { setUser(null); }
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
    setView('otp');
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
    setView('welcome');
    setPhoneNumber('');
    setOtpCode('');
  };

  const handleSetRole = async (role) => {
    setSavingRole(true);
    await base44.auth.updateMe({ role });
    const u = await base44.auth.me();
    setUser(u);
    setSavingRole(false);
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: NAVY }} dir="rtl">
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: NAVY }} dir="rtl">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: GOLD }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: GOLD }} />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-amber-300 transition-colors text-sm font-bold" style={{ color: GOLD }}>
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {view === 'welcome' && (
          <WelcomeScreen
            user={user}
            onLogin={() => setView('phone')}
            onRegister={() => setView('register')}
            onContinue={() => {
              if (user?.role && ROLES.find(r => r.value === user.role)) {
                setView('dashboard');
              } else {
                setView('onboarding');
              }
            }}
            onLogout={handleLogout}
          />
        )}

        {view === 'phone' && (
          <PhoneStep
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onSend={handleSendOtp}
            onBack={() => setView('welcome')}
            error={otpError}
          />
        )}

        {view === 'otp' && (
          <OtpStep
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            onVerify={handleVerifyOtp}
            onBack={() => setView('phone')}
            error={otpError}
          />
        )}

        {view === 'register' && (
          <RegisterOptions onBack={() => setView('welcome')} />
        )}

        {view === 'onboarding' && user && (
          <OnboardingWizard user={user} onSelect={handleSetRole} saving={savingRole} />
        )}

        {view === 'dashboard' && user && (
          <RoleDashboard user={user} onLogout={handleLogout} onResetRole={() => { handleSetRole(null); }} />
        )}
      </div>
    </div>
  );
}

// ---- Welcome Screen ----
function WelcomeScreen({ user, onLogin, onRegister, onContinue, onLogout }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
        style={{ backgroundColor: `${GOLD}15`, border: `1px solid ${GOLD}40` }}
      >
        <img src={LOGO_URL} alt="עילית ישראלית" className="h-12" />
      </motion.div>

      <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>
        IEFA · מערכת העברות עילית
      </span>
      <h1 className="text-4xl md:text-5xl font-black mt-3 mb-3" style={{ color: WHITE }}>
        ברוכים הבאים
      </h1>
      <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ color: `${WHITE}80` }}>
        הפלטפורמה הדיגיטלית שמנהלת את שוק העברות השחקנים מקצה לקצה — בצורה שקופה, מאובטחת ומבוססת דאטה.
      </p>

      {/* If already authenticated */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto mb-6"
        >
          <div className="rounded-lg p-5 border" style={{ backgroundColor: `${GOLD}10`, borderColor: `${GOLD}30` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${GOLD}20`, border: `2px solid ${GOLD}50` }}>
                <UserCog size={18} style={{ color: GOLD }} />
              </div>
              <div className="text-right flex-1">
                <div className="text-xs font-bold" style={{ color: GOLD }}>
                  {user.role ? ROLES.find(r => r.value === user.role)?.label || 'משתמש' : 'משתמש רשום'}
                </div>
                <div className="font-black text-sm" style={{ color: WHITE }}>{user.full_name || user.email}</div>
              </div>
            </div>
            <button
              onClick={onContinue}
              className="w-full font-black text-sm py-3 rounded-sm transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              המשך לאזור האישי <ArrowRight size={16} />
            </button>
            <button
              onClick={onLogout}
              className="w-full text-xs mt-2 transition-colors flex items-center justify-center gap-1"
              style={{ color: `${WHITE}40` }}
            >
              <LogOut size={12} /> התנתק והיכנס כמשתמש אחר
            </button>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <button
          onClick={onLogin}
          className="flex-1 font-black text-sm py-4 rounded-sm transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          <Lock size={16} /> כניסה למערכת
        </button>
        <button
          onClick={onRegister}
          className="flex-1 font-black text-sm py-4 rounded-sm transition-colors border flex items-center justify-center gap-2"
          style={{ borderColor: `${GOLD}50`, color: WHITE }}
        >
          <UserPlus size={16} /> הרשמה חדשה
        </button>
      </div>

      {/* Role previews */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {[
          { icon: Baby, label: 'שחקן נוער', desc: 'פרופיל + Elite ID' },
          { icon: Star, label: 'שחקן בוגר', desc: 'פרופיל + חוזים' },
          { icon: Users, label: 'הורה / אפוטרופוס', desc: 'אישור OTP' },
          { icon: Building2, label: 'סקאוטר מועדון', desc: 'דאשבורד סקאוטינג' },
        ].map((r, i) => (
          <div key={i} className="rounded-lg p-4 text-center border transition-all hover:border-amber-400/30" style={{ backgroundColor: `${NAVY_LIGHT}80`, borderColor: `${WHITE}10` }}>
            <r.icon size={20} className="mx-auto mb-2" style={{ color: GOLD }} />
            <div className="font-bold text-xs" style={{ color: `${WHITE}90` }}>{r.label}</div>
            <p className="text-[10px] mt-1" style={{ color: `${WHITE}30` }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Register Options ----
function RegisterOptions({ onBack }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={onBack} className="text-xs mb-6 flex items-center gap-1 hover:text-amber-300 transition-colors" style={{ color: `${WHITE}40` }}>
        <ChevronLeft size={14} /> חזרה
      </button>

      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
          <UserPlus size={26} style={{ color: GOLD }} />
        </div>
        <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>הרשמה חדשה</span>
        <h1 className="text-3xl font-black mt-3 mb-2" style={{ color: WHITE }}>בחר סוג חשבון</h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: `${WHITE}50` }}>
          בחר את סוג החשבון שלך כדי להתחיל את תהליך הרישום
        </p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        <Link
          to="/player-profile"
          className="block rounded-lg p-6 transition-all group border hover:border-amber-400/50"
          style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
              <Baby size={24} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 text-right">
              <div className="font-black text-base" style={{ color: WHITE }}>רישום שחקן כדורגל</div>
              <p className="text-xs mt-1" style={{ color: `${WHITE}40` }}>
                שחקן נוער או בוגר. המערכת מחשבת את הגיל אוטומטית ומפצלת למסלול המתאים — עם הוראת אפוטרופוס והעלאת מסמכים.
              </p>
            </div>
            <ArrowRight size={18} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />
          </div>
        </Link>

        <Link
          to="/club-registration"
          className="block rounded-lg p-6 transition-all group border hover:border-amber-400/50"
          style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
              <Building2 size={24} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 text-right">
              <div className="font-black text-base" style={{ color: WHITE }}>רישום סקאוטר / מועדון</div>
              <p className="text-xs mt-1" style={{ color: `${WHITE}40` }}>
                רישום מועדון עם מייל רשמי. החשבון נפתח אוטומטית בסטטוס FREE עם גישה לשחקנים בדרג בסיסי.
              </p>
            </div>
            <ArrowRight size={18} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />
          </div>
        </Link>

        <div className="rounded-lg p-6 border" style={{ backgroundColor: `${NAVY_LIGHT}50`, borderColor: `${WHITE}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
              <Crown size={24} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 text-right">
              <div className="font-black text-base opacity-50" style={{ color: WHITE }}>מאמן / אנליסט עילית</div>
              <p className="text-xs mt-1" style={{ color: `${WHITE}30` }}>
                טופס פנימי — דורש אישור ידני של מנהל המערכת. צור קשר ישירות.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Phone Step ----
function PhoneStep({ phoneNumber, setPhoneNumber, onSend, onBack, error }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <button onClick={onBack} className="text-xs mb-6 flex items-center gap-1 hover:text-amber-300 transition-colors mx-auto" style={{ color: `${WHITE}40` }}>
        <ChevronLeft size={14} /> חזרה
      </button>
      <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
        <Phone size={26} style={{ color: GOLD }} />
      </div>
      <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>Passwordless · כניסה ללא סיסמה</span>
      <h1 className="text-3xl font-black mt-3 mb-4" style={{ color: WHITE }}>כניסה למערכת</h1>
      <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ color: `${WHITE}50` }}>
        הזן את מספר הטלפון הנייד שלך. נשלח לך קוד אימות חד-פעני (OTP) ב-SMS.
      </p>
      <div className="max-w-sm mx-auto">
        <div className="relative mb-4">
          <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: `${WHITE}30` }} />
          <input
            type="tel" dir="ltr" value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
            placeholder="050-000-0000"
            className="w-full rounded-lg text-right pr-12 pl-4 py-4 text-lg font-bold focus:outline-none transition-colors"
            style={{ backgroundColor: NAVY_LIGHT, border: `1px solid ${WHITE}20`, color: WHITE }}
          />
        </div>
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button onClick={onSend} className="w-full font-black text-sm py-4 rounded-sm transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: GOLD, color: NAVY }}>
          <KeyRound size={16} /> שלח קוד אימות
        </button>
      </div>
    </motion.div>
  );
}

// ---- OTP Step ----
function OtpStep({ phoneNumber, otpCode, setOtpCode, onVerify, onBack, error }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <button onClick={onBack} className="text-xs mb-6 flex items-center gap-1 hover:text-amber-300 transition-colors mx-auto" style={{ color: `${WHITE}40` }}>
        <ChevronLeft size={14} /> חזרה
      </button>
      <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
        <Lock size={26} style={{ color: GOLD }} />
      </div>
      <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>אימות OTP</span>
      <h1 className="text-2xl font-black mt-3 mb-2" style={{ color: WHITE }}>הזן קוד אימות</h1>
      <p className="text-sm max-w-md mx-auto mb-8" style={{ color: `${WHITE}50` }}>
        שלחנו קוד בן 4 ספרות למספר <span className="font-bold" dir="ltr" style={{ color: WHITE }}>{phoneNumber}</span>
      </p>
      <div className="max-w-xs mx-auto">
        <input
          type="text" inputMode="numeric" maxLength={6} dir="ltr"
          value={otpCode}
          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && onVerify()}
          placeholder="••••"
          className="w-full rounded-lg text-center py-4 text-2xl font-black tracking-[0.5em] focus:outline-none transition-colors"
          style={{ backgroundColor: NAVY_LIGHT, border: `1px solid ${WHITE}20`, color: WHITE }}
        />
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <button onClick={onVerify} className="w-full font-black text-sm py-4 rounded-sm transition-colors mt-4 flex items-center justify-center gap-2" style={{ backgroundColor: GOLD, color: NAVY }}>
          <ShieldCheck size={16} /> אימות וכניסה
        </button>
      </div>
    </motion.div>
  );
}

// ---- Onboarding Wizard ----
function OnboardingWizard({ user, onSelect, saving }) {
  const options = [
    { role: 'youth_player', label: 'אני שחקן כדורגל', sub: '(או הורה לשחקן נוער)', icon: Baby, desc: 'רישום עם פרטי שחקן, תאריך לידה, ופרטי הורה (חובה לקטינים)' },
    { role: 'club_scout', label: 'אני סקאוטר / נציג מועדון', sub: '(חשבון מועדון)', icon: Building2, desc: 'רישום מועדון עם מייל רשמי. נפתח אוטומטית בסטטוס FREE' },
    { role: 'elite_admin', label: 'אני מאמן / אנליסט בעילית', sub: '(דורש אישור ידני)', icon: Crown, desc: 'טופס פנימי — דורש אישור מנהל מערכת לפני קבלת הרשאות' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
          <Sparkles size={26} style={{ color: GOLD }} />
        </div>
        <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>בחירת סוג חשבון · Onboarding</span>
        <h1 className="text-2xl font-black mt-3" style={{ color: WHITE }}>שלום{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: `${WHITE}50` }}>
          בחר את סוג החשבון שלך כדי להמשיך
        </p>
      </div>
      <div className="space-y-3 max-w-2xl mx-auto">
        {options.map(opt => (
          <button key={opt.role} onClick={() => onSelect(opt.role)} disabled={saving}
            className="w-full rounded-lg p-5 flex items-center gap-4 transition-all text-right group border hover:border-amber-400/50 disabled:opacity-50"
            style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
              <opt.icon size={20} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: WHITE }}>
                {opt.label} <span className="font-normal text-xs" style={{ color: `${WHITE}40` }}>{opt.sub}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{opt.desc}</p>
            </div>
            {saving ? <Loader2 size={16} className="animate-spin" style={{ color: GOLD }} /> : <ArrowRight size={16} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Role Dashboard ----
function RoleDashboard({ user, onLogout, onResetRole }) {
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];
  const redirectPath = roleInfo.redirect;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-lg p-6 mb-8 flex items-center gap-4 border" style={{ background: `linear-gradient(to left, ${GOLD}15, transparent)`, borderColor: `${GOLD}30` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}20`, border: `2px solid ${GOLD}50` }}>
          <roleInfo.icon size={24} style={{ color: GOLD }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold tracking-wide uppercase" style={{ color: GOLD }}>{roleInfo.label}</div>
          <h1 className="font-black text-xl mt-0.5" style={{ color: WHITE }}>{user.full_name || 'משתמש'}</h1>
          <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{user.email}</p>
        </div>
        <button onClick={onLogout} className="text-xs transition-colors flex items-center gap-1 flex-shrink-0 hover:text-red-400" style={{ color: `${WHITE}30` }}>
          <LogOut size={14} /> יציאה
        </button>
      </div>

      <Link to={redirectPath} className="block rounded-lg p-6 transition-all group border hover:border-amber-400 mb-6" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${GOLD}40` }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}20` }}>
            <UserCog size={20} style={{ color: GOLD }} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm" style={{ color: WHITE }}>כניסה לאזור האישי</div>
            <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{roleInfo.desc}</p>
          </div>
          <ArrowRight size={18} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />
        </div>
      </Link>

      {user.role === 'club_scout' && (
        <div className="rounded-lg p-5 mb-4 border" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} style={{ color: GOLD }} />
            <span className="font-bold text-sm" style={{ color: WHITE }}>סטטוס מועדון: FREE</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: `${WHITE}40` }}>
            המועדון בחבילה החינמית. גישה לשחקנים בדרג בסיסי בלבד. שדרג ל-PRO כדי לפתוח גישה ליהלומי האקדמיה.
          </p>
          <Link to="/pricing" className="text-xs font-bold mt-2 inline-block hover:text-amber-300" style={{ color: GOLD }}>
            שדרוג חבילה ←
          </Link>
        </div>
      )}

      {user.role === 'youth_player' && (
        <div className="rounded-lg p-5 mb-4 border" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} style={{ color: `${WHITE}40` }} />
            <span className="font-bold text-sm" style={{ color: WHITE }}>הגנת קטינים פעילה</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: `${WHITE}40` }}>
            לשחקן נוער יש פרופיל ביצועים מלא — אך אפס סמכות משפטית. כל הצעת העברה עוברת אישור אפוטרופוס ב-OTP.
          </p>
        </div>
      )}

      <button onClick={onResetRole} className="mt-4 text-xs transition-colors hover:text-white/60" style={{ color: `${WHITE}30` }}>
        שינוי סוג משתמש
      </button>
    </motion.div>
  );
}