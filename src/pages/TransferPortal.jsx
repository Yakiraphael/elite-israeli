import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Users, Star, Lock, Loader2, LogOut, Send, UserCog } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const ROLES = [
  { value: 'elite_admin', label: 'אדמין עילית', desc: 'ניהול מלא של הצעות העברה, שחקנים ואישורים', icon: ShieldCheck },
  { value: 'player_guardian', label: 'שחקן / אפוטרופוס', desc: 'צפייה בהצעות ואישור העברות עבור השחקן', icon: Users },
  { value: 'coach_analyst', label: 'מאמן / אנליסט עילית', desc: 'ניהול כרטיסי Elite ID ונתוני ביצועים', icon: Star },
];

export default function TransferPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

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

  const handleLogin = () => base44.auth.redirectToLogin('/transfer-portal');

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null);
  };

  const handleSetRole = async (role) => {
    setSavingRole(true);
    await base44.auth.updateMe({ role });
    const u = await base44.auth.me();
    setUser(u);
    setSavingRole(false);
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
      {/* Header */}
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {!user ? (
          <WelcomeScreen onLogin={handleLogin} />
        ) : !user.role || !ROLES.find(r => r.value === user.role) ? (
          <RoleSelection user={user} onSelect={handleSetRole} saving={savingRole} />
        ) : (
          <RoleDashboard user={user} onLogout={handleLogout} onResetRole={() => handleSetRole(null)} />
        )}
      </div>
    </div>
  );
}

// ---- Welcome (not authenticated) ----
function WelcomeScreen({ onLogin }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
        <Lock size={26} className="text-[#D4AF37]" />
      </div>
      <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">מערכת העברות עילית</span>
      <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-4">כניסה למערכת</h1>
      <p className="text-white/50 text-sm max-w-md mx-auto mb-10 leading-relaxed">
        מערכת ההעברות של עילית ישראלית מאפשרת ניהול מבוקר ומאובטח של הצעות הצטרפות לנוער.
        התחבר עם שם, מייל וסיסמה כדי לגשת לאזור האישי שלך.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {ROLES.map(r => (
          <div key={r.value} className="bg-[#1B263B] border border-white/10 rounded-lg p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-3">
              <r.icon size={18} className="text-[#D4AF37]" />
            </div>
            <div className="text-white font-bold text-sm">{r.label}</div>
            <p className="text-white/40 text-[11px] mt-1 leading-snug">{r.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onLogin}
        className="bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-10 py-4 rounded-sm hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
      >
        <UserCog size={16} /> התחבר / הירשם
      </button>
      <p className="text-white/30 text-[11px] mt-4">הרשמה מלאה עם שם, מייל וסיסמה · מאובטח ע"י מערכת עילית</p>
    </motion.div>
  );
}

// ---- Role Selection (authenticated, no role yet) ----
function RoleSelection({ user, onSelect, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">בחירת תפקיד</span>
        <h1 className="text-white text-2xl md:text-3xl font-black mt-3">שלום{user.full_name ? `, ${user.full_name}` : ''}!</h1>
        <p className="text-white/50 text-sm mt-2">בחר את סוג המשתמש שלך כדי להמשיך</p>
      </div>

      <div className="space-y-3">
        {ROLES.map(r => (
          <button
            key={r.value}
            onClick={() => onSelect(r.value)}
            disabled={saving}
            className="w-full bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/50 rounded-lg p-5 flex items-center gap-4 transition-all text-right group disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
              <r.icon size={20} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">{r.label}</div>
              <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
            </div>
            {saving ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" /> : <ArrowRight size={16} className="text-white/30 group-hover:text-[#D4AF37] transition-colors" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Role Dashboard (authenticated with role) ----
function RoleDashboard({ user, onLogout, onResetRole }) {
  const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];

  const actions = {
    elite_admin: [
      { label: 'לוח ניהול הצעות', to: '/admin', icon: Send, desc: 'צפייה ואישור/דחיית הצעות העברה' },
      { label: 'ניהול שחקנים ואירועים', to: '/admin', icon: Users, desc: 'ניהול רישומי שחקנים ואירועים' },
    ],
    player_guardian: [
      { label: 'הצעות העברה עבור השחקן', to: '/transfer-hub', icon: Send, desc: 'צפייה בהצעות ואישור האפוטרופוס' },
    ],
    coach_analyst: [
      { label: 'כרטיסי Elite ID', to: '/admin', icon: Star, desc: 'ניהול נתוני שחקנים וכרטיסים' },
    ],
  };

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

      {/* Actions */}
      <div className="space-y-3">
        {(actions[user.role] || []).map((a, i) => (
          <Link
            key={i}
            to={a.to}
            className="block bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/50 rounded-lg p-5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                <a.icon size={18} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{a.label}</div>
                <p className="text-white/40 text-xs mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-[#D4AF37] transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Change role */}
      <button
        onClick={onResetRole}
        className="mt-6 text-white/30 hover:text-white/60 text-xs transition-colors"
      >
        שינוי סוג משתמש
      </button>
    </motion.div>
  );
}