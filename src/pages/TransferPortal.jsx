import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Users, Star, Lock, Loader2, LogOut,
  Baby, Building2, Crown, UserPlus, UserCog, ChevronLeft, Sparkles,
  Trophy, Dumbbell
} from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';
const NAVY = '#0D1B2A';
const NAVY_LIGHT = '#1B263B';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const ROLES = [
  {
    value: 'player',
    label: 'שחקן כדורגל',
    sub: 'נוער (עד 18) או בוגר',
    icon: Star,
    desc: 'פרופיל אישי, כרטיס Elite ID, מעקב העברות ובקשות.',
    redirect: '/player-profile',
    color: '#3B82F6'
  },
  {
    value: 'coach',
    label: 'מאמן / מדריך',
    sub: 'עובד הקבוצה',
    icon: Trophy,
    desc: 'ניהול מחנה אימונים, מעקב שחקנים, דוחות ונוכחות.',
    redirect: '/coach',
    color: '#10B981'
  },
  {
    value: 'parent_guardian',
    label: 'הורה / אפוטרופוס',
    sub: 'לשחקן נוער',
    icon: Users,
    desc: 'צפייה בפרופיל ילדך, חתימה על מסמכים ואישורים.',
    redirect: '/player-profile',
    color: '#F59E0B'
  },
  {
    value: 'club_scout',
    label: 'סקאוטר / מועדון',
    sub: 'נציג ארגוני',
    icon: Building2,
    desc: 'דאשבורד סקאוטינג, הגשת הצעות העברה וניהול שחקנים.',
    redirect: '/transfer-hub',
    color: '#8B5CF6'
  },
  {
    value: 'director',
    label: 'מנהל מקצועי',
    sub: 'דירקטור / אנליסט',
    icon: Dumbbell,
    desc: 'חדר בקרה מלא — Compliance, Squad Health, העברות.',
    redirect: '/director',
    color: '#EF4444'
  },
];

export default function TransferPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('welcome');
  const [savingRole, setSavingRole] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const u = await base44.auth.me();
          setUser(u);
          if (u?.role && ROLES.find(r => r.value === u.role)) {
            setView('dashboard');
          } else {
            setView('onboarding');
          }
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/transfer-portal');
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null);
    setView('welcome');
  };

  const handleSetRole = async (roleValue) => {
    setSavingRole(true);
    try {
      await base44.auth.updateMe({ role: roleValue });
      const u = await base44.auth.me();
      setUser(u);
      setView('dashboard');
    } catch (e) {
      console.error(e);
    }
    setSavingRole(false);
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
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: GOLD }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: GOLD }} />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:text-amber-300 transition-colors text-sm font-bold" style={{ color: GOLD }}>
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs transition-colors hover:text-red-400" style={{ color: `${WHITE}40` }}>
              <LogOut size={14} /> יציאה
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {view === 'welcome' && <WelcomeScreen onLogin={handleLogin} />}
        {view === 'onboarding' && user && (
          <OnboardingWizard user={user} onSelect={handleSetRole} saving={savingRole} />
        )}
        {view === 'dashboard' && user && (
          <RoleDashboard user={user} onLogout={handleLogout} onChangeRole={() => setView('onboarding')} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

// ---- Welcome Screen ----
function WelcomeScreen({ onLogin }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
        style={{ backgroundColor: `${GOLD}15`, border: `1px solid ${GOLD}40` }}>
        <img src={LOGO_URL} alt="עילית ישראלית" className="h-12" />
      </div>

      <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>
        IEFA · פלטפורמה מקצועית
      </span>
      <h1 className="text-4xl md:text-5xl font-black mt-3 mb-4" style={{ color: WHITE }}>
        ברוכים הבאים
      </h1>
      <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ color: `${WHITE}60` }}>
        הפלטפורמה הדיגיטלית לניהול שוק העברות, פרופילי שחקנים וכלי ניהול מקצועיים לעמותת עילית ישראלית.
      </p>

      <div className="max-w-sm mx-auto space-y-3 mb-12">
        <button
          onClick={onLogin}
          className="w-full font-black text-base py-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg"
          style={{ backgroundColor: GOLD, color: NAVY }}
        >
          <Lock size={18} /> כניסה / הרשמה למערכת
        </button>
        <p className="text-xs" style={{ color: `${WHITE}30` }}>
          כניסה מאובטחת באמצעות Google או מייל וסיסמה
        </p>
      </div>

      {/* Role previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {ROLES.map((r, i) => (
          <div key={i} className="rounded-lg p-4 text-right border transition-all"
            style={{ backgroundColor: `${NAVY_LIGHT}80`, borderColor: `${WHITE}10` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${r.color}20`, border: `1px solid ${r.color}40` }}>
              <r.icon size={16} style={{ color: r.color }} />
            </div>
            <div className="font-bold text-xs" style={{ color: `${WHITE}90` }}>{r.label}</div>
            <p className="text-[10px] mt-1 leading-relaxed" style={{ color: `${WHITE}35` }}>{r.sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Onboarding: pick role after login ----
function OnboardingWizard({ user, onSelect, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
          <Sparkles size={26} style={{ color: GOLD }} />
        </div>
        <span className="text-xs tracking-[0.3em] font-bold uppercase" style={{ color: GOLD }}>שלב אחד קטן</span>
        <h1 className="text-2xl font-black mt-3" style={{ color: WHITE }}>
          שלום{user?.full_name ? `, ${user.full_name}` : ''}!
        </h1>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: `${WHITE}50` }}>
          בחר את תפקידך במערכת — ניתן לשנות בהמשך
        </p>
      </div>

      <div className="space-y-3 max-w-xl mx-auto">
        {ROLES.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={saving}
            className="w-full rounded-xl p-5 flex items-center gap-4 transition-all text-right group border hover:border-amber-400/50 disabled:opacity-50"
            style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${opt.color}15`, border: `1px solid ${opt.color}40` }}>
              {saving
                ? <Loader2 size={20} className="animate-spin" style={{ color: opt.color }} />
                : <opt.icon size={20} style={{ color: opt.color }} />
              }
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: WHITE }}>
                {opt.label}
                <span className="font-normal text-xs mr-2" style={{ color: `${WHITE}40` }}>{opt.sub}</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{opt.desc}</p>
            </div>
            <ArrowRight size={16} style={{ color: `${WHITE}20` }} className="group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Dashboard after role set ----
function RoleDashboard({ user, onLogout, onChangeRole, navigate }) {
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* User card */}
      <div className="rounded-xl p-6 mb-6 flex items-center gap-4 border"
        style={{ background: `linear-gradient(to left, ${GOLD}12, transparent)`, borderColor: `${GOLD}30` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${roleInfo.color}20`, border: `2px solid ${roleInfo.color}60` }}>
          <roleInfo.icon size={24} style={{ color: roleInfo.color }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold tracking-wide uppercase" style={{ color: GOLD }}>{roleInfo.label}</div>
          <h1 className="font-black text-xl mt-0.5" style={{ color: WHITE }}>{user.full_name || 'משתמש'}</h1>
          <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{user.email}</p>
        </div>
      </div>

      {/* Main CTA */}
      <button
        onClick={() => navigate(roleInfo.redirect)}
        className="w-full rounded-xl p-6 transition-all group border hover:border-amber-400 mb-4 text-right flex items-center gap-4"
        style={{ backgroundColor: NAVY_LIGHT, borderColor: `${GOLD}40` }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${roleInfo.color}15`, border: `1px solid ${roleInfo.color}40` }}>
          <UserCog size={20} style={{ color: roleInfo.color }} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm" style={{ color: WHITE }}>כניסה לאזור האישי שלי</div>
          <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{roleInfo.desc}</p>
        </div>
        <ArrowRight size={18} style={{ color: `${WHITE}30` }} className="group-hover:text-amber-400 transition-colors" />
      </button>

      {/* Role-specific info */}
      {user.role === 'club_scout' && (
        <div className="rounded-xl p-4 mb-4 border" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} style={{ color: GOLD }} />
            <span className="font-bold text-xs" style={{ color: WHITE }}>סטטוס מועדון: FREE</span>
          </div>
          <p className="text-xs" style={{ color: `${WHITE}40` }}>גישה בסיסית לשחקנים. שדרג ל-PRO לגישה מלאה.</p>
          <Link to="/pricing" className="text-xs font-bold mt-1 inline-block hover:text-amber-300" style={{ color: GOLD }}>
            שדרוג חבילה ←
          </Link>
        </div>
      )}

      {user.role === 'player' && (
        <div className="rounded-xl p-4 mb-4 border" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} style={{ color: '#3B82F6' }} />
            <span className="font-bold text-xs" style={{ color: WHITE }}>פרופיל שחקן פעיל</span>
          </div>
          <p className="text-xs" style={{ color: `${WHITE}40` }}>
            הפרופיל שלך כולל Elite ID, נתוני ביצוע ומעקב העברות מלא.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: `${WHITE}10` }}>
        <button onClick={onChangeRole} className="text-xs transition-colors hover:text-amber-300" style={{ color: `${WHITE}30` }}>
          שינוי תפקיד
        </button>
        <button onClick={onLogout} className="text-xs transition-colors hover:text-red-400 flex items-center gap-1" style={{ color: `${WHITE}30` }}>
          <LogOut size={12} /> התנתקות
        </button>
      </div>
    </motion.div>
  );
}