import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Users, Star, Lock, Loader2, LogOut,
  Building2, UserPlus, UserCog, Sparkles, Trophy, Dumbbell, X, Send, CheckCircle2,
} from 'lucide-react';
import SecurityBadge from '../components/SecurityBadge';
import MasterAccessPanel from '../components/MasterAccessPanel';
import BackButton from '../components/BackButton';

const MASTER_EMAIL = 'yakirkarmel@gmail.com';
const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const ROLES = [
  { value: 'player', label: 'שחקן כדורגל', sub: 'נוער (עד 18) או בוגר', icon: Star, desc: 'פרופיל אישי, כרטיס Elite ID, מעקב העברות ובקשות.', redirect: '/player-profile', color: '#3B82F6' },
  { value: 'coach', label: 'מאמן / מדריך', sub: 'עובד הקבוצה', icon: Trophy, desc: 'ניהול מחנה אימונים, מעקב שחקנים, דוחות ונוכחות.', redirect: '/coach', color: '#10B981' },
  { value: 'parent', label: 'הורה / אפוטרופוס', sub: 'לשחקן נוער', icon: Users, desc: 'צפייה בפרופיל ילדך, חתימה על מסמכים ואישורים.', redirect: '/guardian-portal', color: '#F59E0B' },
  { value: 'club_scout', label: 'סקאוטר / מועדון', sub: 'נציג ארגוני', icon: Building2, desc: 'דאשבורד סקאוטינג, הגשת הצעות העברה וניהול שחקנים.', redirect: '/scouting', color: '#8B5CF6' },
  { value: 'director', label: 'מנהל מקצועי', sub: 'דירקטור / אנליסט', icon: Dumbbell, desc: 'חדר בקרה מלא — Compliance, Squad Health, העברות.', redirect: '/director', color: '#EF4444' },
];

// פורטל תפקידים — נקודת הכניסה המאוחדת. שפת עיצוב: פחם עמוק + זהב + כחול-פעולה.
// לוגיקה נשמרת במלואה (welcome → confirm → onboarding → dashboard → master), שינוי ויזואלי בלבד.
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
          if (u.email === MASTER_EMAIL) {
            setView('master');
          } else {
            const roleInfo = ROLES.find(r => r.value === u.role);
            if (roleInfo) {
              // לא מנתבים אוטומטית — קודם מציגים מסך אישור זהות, כדי למנוע בלבול בין חשבונות/מכשירים
              setView('confirm');
            } else {
              setView('onboarding');
            }
          }
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/transfer-portal');
  const handleSignup = () => navigate('/onboarding');

  const handleConfirmContinue = () => {
    const roleInfo = ROLES.find(r => r.value === user.role);
    if (['coach', 'director', 'club_scout'].includes(user.role)) {
      navigate(roleInfo.redirect);
    } else {
      setView('dashboard');
    }
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
      const roleInfo = ROLES.find(r => r.value === roleValue);
      // שחקן/מועדון חייבים להשלים קודם את טופס הרישום המלא — לפני גישה לדשבורד. הורה עובר ישר לפורטל האפוטרופוס.
      if (roleValue === 'player' || roleValue === 'parent' || roleValue === 'club_scout') {
        navigate(roleInfo.redirect);
      } else {
        setView('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
    setSavingRole(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface" dir="rtl">
        <div className="max-w-3xl mx-auto px-6 pt-20 space-y-4 animate-pulse">
          <div className="h-10 w-40 rounded-lg mx-auto bg-panel border border-hairline" />
          <div className="h-6 w-64 rounded mx-auto bg-panel" />
          <div className="h-14 w-full max-w-sm mx-auto rounded-xl bg-panel border border-hairline" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto pt-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-panel border border-hairline" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface" dir="rtl">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: 'var(--brand)' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: 'var(--brand)' }} />

      {/* Header */}
      <div className="relative z-10 border-b border-hairline py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BackButton label="חזרה" fallback="/" className="flex items-center gap-2 text-sm font-bold text-brand hover:text-amber-300 transition-colors" />
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-ink-faint hover:text-red-400 transition-colors">
              <LogOut size={14} /> יציאה
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {view === 'welcome' && <WelcomeScreen onLogin={handleLogin} onSignup={handleSignup} />}
        {view === 'confirm' && user && <ConfirmAccountScreen user={user} onContinue={handleConfirmContinue} onLogout={handleLogout} />}
        {view === 'onboarding' && user && <OnboardingWizard user={user} onSelect={handleSetRole} saving={savingRole} navigate={navigate} />}
        {view === 'dashboard' && user && <RoleDashboard user={user} onLogout={handleLogout} navigate={navigate} />}
        {view === 'master' && user && (
          <MasterAccessPanel user={user} navigate={navigate} onLogout={handleLogout}
            onContinueNormal={() => {
              const roleInfo = ROLES.find(r => r.value === user.role);
              setView(roleInfo ? 'confirm' : 'onboarding');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ---- Welcome Screen ----
function WelcomeScreen({ onLogin, onSignup }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-brand-soft border border-brand-line">
        <img src={LOGO_URL} alt="עילית ישראלית" className="h-12" />
      </div>

      <span className="text-[11px] tracking-[0.34em] font-bold uppercase text-brand">IEFA · פלטפורמה מקצועית</span>
      <h1 className="text-4xl md:text-5xl font-black mt-3 mb-4 text-ink">ברוכים הבאים</h1>
      <p className="text-sm max-w-md mx-auto mb-10 leading-relaxed text-ink-muted">
        הפלטפורמה הדיגיטלית לניהול שוק העברות, פרופילי שחקנים וכלי ניהול מקצועיים לעמותת עילית ישראלית.
      </p>

      <div className="flex justify-center mb-6"><SecurityBadge /></div>

      <div className="max-w-sm mx-auto space-y-3 mb-12">
        <button onClick={onSignup}
          className="w-full min-h-[48px] font-black text-base py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all bg-action text-white hover:brightness-110">
          <UserPlus size={18} /> הרשמה למערכת
        </button>
        <button onClick={onLogin}
          className="w-full min-h-[48px] font-black text-base py-4 rounded-xl flex items-center justify-center gap-3 border transition-all text-ink border-hairline-strong hover:bg-panel">
          <Lock size={18} /> התחברות עם מייל וסיסמה
        </button>
        <p className="text-xs text-ink-faint leading-relaxed">
          הרשמה — משתמש חדש, בחירת תפקיד ומילוי טופס רישום.<br />
          התחברות — משתמש קיים, עם המייל והסיסמה שקיבלת בהודעת המייל.
        </p>
      </div>

      {/* Role previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {ROLES.map((r, i) => (
          <div key={i} className="rounded-xl p-4 text-right border transition-all bg-panel border-hairline hover:border-brand-line">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${r.color}20`, border: `1px solid ${r.color}40` }}>
              <r.icon size={16} style={{ color: r.color }} />
            </div>
            <div className="font-bold text-xs text-ink">{r.label}</div>
            <p className="text-[10px] mt-1 leading-relaxed text-ink-faint">{r.sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Confirm account ----
function ConfirmAccountScreen({ user, onContinue, onLogout }) {
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${roleInfo.color}20`, border: `2px solid ${roleInfo.color}60` }}>
        <roleInfo.icon size={26} style={{ color: roleInfo.color }} />
      </div>
      <span className="text-[11px] tracking-[0.34em] font-bold uppercase text-brand">אימות זהות</span>
      <h1 className="text-2xl font-black mt-3 text-ink">מחובר בתור {user.full_name || user.email}</h1>
      <p className="text-sm mt-2 text-ink-muted">{user.email}</p>
      <p className="text-xs mt-1 text-ink-faint">תפקיד: {roleInfo.label}</p>

      <div className="max-w-sm mx-auto space-y-3 mt-8">
        <button onClick={onContinue}
          className="w-full min-h-[48px] font-black text-base py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all bg-action text-white hover:brightness-110">
          <ArrowRight size={18} /> כן, זה אני — המשך
        </button>
        <button onClick={onLogout}
          className="w-full min-h-[44px] font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 border transition-all text-ink border-hairline-strong hover:bg-panel">
          <LogOut size={16} /> זה לא אני — התנתקות
        </button>
      </div>
    </motion.div>
  );
}

// ---- Onboarding: pick role ----
function OnboardingWizard({ user, onSelect, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-brand-soft border border-brand-line">
          <Sparkles size={26} className="text-brand" />
        </div>
        <span className="text-[11px] tracking-[0.34em] font-bold uppercase text-brand">שלב אחד קטן</span>
        <h1 className="text-2xl font-black mt-3 text-ink">שלום{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
        <p className="text-sm mt-2 max-w-md mx-auto text-ink-muted">בחר את תפקידך במערכת — ניתן לשנות בהמשך</p>
        <p className="text-xs mt-3 max-w-md mx-auto text-ink-faint">
          לאחר בחירת התפקיד תועבר להשלמת טופס רישום מלא. הגישה לממשק הייעודי תיפתח רק לאחר אישור צוות המערכת.
        </p>
      </div>

      <div className="space-y-3 max-w-xl mx-auto">
        {ROLES.map(opt => (
          <button key={opt.value} onClick={() => onSelect(opt.value)} disabled={saving}
            className="w-full rounded-xl p-5 flex items-center gap-4 transition-all text-right group border bg-panel border-hairline hover:border-brand-line disabled:opacity-50">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${opt.color}15`, border: `1px solid ${opt.color}40` }}>
              {saving ? <Loader2 size={20} className="animate-spin" style={{ color: opt.color }} /> : <opt.icon size={20} style={{ color: opt.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink">
                {opt.label}
                <span className="font-normal text-xs mr-2 text-ink-faint">{opt.sub}</span>
              </div>
              <p className="text-xs mt-0.5 text-ink-muted">{opt.desc}</p>
            </div>
            <ArrowRight size={16} className="text-ink-faint group-hover:text-brand transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Dashboard after role set ----
function RoleDashboard({ user, onLogout, navigate }) {
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* User card */}
      <div className="rounded-xl p-6 mb-6 flex items-center gap-4 border bg-panel border-brand-line"
        style={{ background: 'linear-gradient(to left, var(--brand-soft), transparent)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${roleInfo.color}20`, border: `2px solid ${roleInfo.color}60` }}>
          <roleInfo.icon size={24} style={{ color: roleInfo.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand">{roleInfo.label}</div>
          <h1 className="font-black text-xl mt-0.5 text-ink">{user.full_name || 'משתמש'}</h1>
          <p className="text-xs mt-0.5 text-ink-faint truncate">{user.email}</p>
        </div>
      </div>

      {/* Main CTA */}
      <button onClick={() => navigate(roleInfo.redirect)}
        className="w-full min-h-[44px] rounded-xl p-5 transition-all group border bg-panel border-hairline hover:border-brand-line mb-4 text-right flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${roleInfo.color}15`, border: `1px solid ${roleInfo.color}40` }}>
          <UserCog size={20} style={{ color: roleInfo.color }} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-ink">כניסה לאזור האישי שלי</div>
          <p className="text-xs mt-0.5 text-ink-muted">{roleInfo.desc}</p>
        </div>
        <ArrowRight size={18} className="text-ink-faint group-hover:text-brand transition-colors" />
      </button>

      {user.role === 'club_scout' && (
        <div className="rounded-xl p-4 mb-4 border bg-panel border-hairline">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} className="text-brand" />
            <span className="font-bold text-xs text-ink">סטטוס מועדון: FREE</span>
          </div>
          <p className="text-xs text-ink-muted">גישה בסיסית לשחקנים. שדרג ל-PRO לגישה מלאה.</p>
          <Link to="/pricing" className="text-xs font-bold mt-1 inline-block text-brand hover:text-amber-300">שדרוג חבילה ←</Link>
        </div>
      )}

      {user.role === 'player' && (
        <div className="rounded-xl p-4 mb-4 border bg-panel border-hairline">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} style={{ color: '#3B82F6' }} />
            <span className="font-bold text-xs text-ink">פרופיל שחקן פעיל</span>
          </div>
          <p className="text-xs text-ink-muted">הפרופיל שלך כולל Elite ID, נתוני ביצוע ומעקב העברות מלא.</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-hairline">
        <button onClick={() => setShowRoleRequest(true)} className="text-xs text-ink-faint hover:text-brand transition-colors">בקשת שינוי תפקיד</button>
        <button onClick={onLogout} className="text-xs text-ink-faint hover:text-red-400 transition-colors flex items-center gap-1">
          <LogOut size={12} /> התנתקות
        </button>
      </div>

      {showRoleRequest && <RoleChangeRequestModal user={user} currentRole={roleInfo} onClose={() => setShowRoleRequest(false)} />}
    </motion.div>
  );
}

// ---- Role change request modal ----
function RoleChangeRequestModal({ user, currentRole, onClose }) {
  const [requestedRole, setRequestedRole] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!requestedRole || !reason.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.RoleChangeRequest.create({
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        current_role: user.role,
        requested_role: requestedRole,
        reason: reason.trim(),
      });
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl p-6 border bg-panel border-hairline" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-base text-ink">בקשת שינוי תפקיד</h3>
          <button onClick={onClose}><X size={16} className="text-ink-faint" /></button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-400" />
            <p className="text-sm text-ink">הבקשה נשלחה לאישור המנהל המקצועי</p>
            <button onClick={onClose} className="mt-4 text-xs font-bold text-brand">סגור</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-ink-muted">
              שינוי תפקיד לאחר הרשמה מחייב אישור רשמי. תפקידך הנוכחי: <span className="font-bold text-brand">{currentRole.label}</span>
            </p>
            <div>
              <label className="text-xs font-bold mb-1.5 block text-brand">תפקיד מבוקש</label>
              <select value={requestedRole} onChange={e => setRequestedRole(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm border bg-surface border-hairline-strong text-ink focus:outline-none focus:border-brand-line">
                <option value="">בחר תפקיד</option>
                {ROLES.filter(r => r.value !== user.role).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block text-brand">סיבת הבקשה</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="הסבר קצר לבקשה..."
                className="w-full rounded-lg px-3 py-2.5 text-sm border bg-surface border-hairline-strong text-ink placeholder-ink-faint focus:outline-none focus:border-brand-line resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={!requestedRole || !reason.trim() || submitting}
              className="w-full font-black text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 bg-action text-white hover:brightness-110">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} שלח בקשה
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}