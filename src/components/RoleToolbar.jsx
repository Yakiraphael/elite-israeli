import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, LogOut, UserCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StaffProfileSettingsModal from './staff/StaffProfileSettingsModal';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

// סרגל כלים עליון אחיד לכל דשבורד תפקיד (מאמן/מנהל מקצועי): לוגו + תג תפקיד בימין, זהות משתמש במרכז, פעולות מהירות בשמאל.
// דביק לראש המסך, ללא כפל לוגו או פעולות בכותרת המשנה של הדשבורד.
export default function RoleToolbar({ activeLabel, activeIcon: ActiveIcon }) {
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10" dir="rtl">
      <div className="max-w-7xl mx-auto h-14 px-5 flex items-center justify-between gap-3">
        {/* ימין — מותג + תג תפקיד */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={LOGO_URL} alt="" className="h-7 w-auto flex-shrink-0" />
          {activeLabel && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              {ActiveIcon ? <ActiveIcon size={12} className="text-[#D4AF37]" /> : null}
              <span className="text-[11px] font-bold text-[#D4AF37]">{activeLabel}</span>
            </div>
          )}
        </div>

        {/* מרכז — זהות מחוברת */}
        {user && (
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <UserCircle size={14} className="text-white/60" />
            </div>
            <div className="min-w-0 text-right leading-tight">
              <div className="text-xs font-bold text-white truncate max-w-[180px]">{user.full_name || 'משתמש'}</div>
              <div className="text-[10px] text-white/35 truncate max-w-[180px]">{user.email}</div>
            </div>
          </div>
        )}

        {/* שמאל — ניווט מהיר */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link to="/transfer-portal" title="חזרה לפרופיל שלי"
            className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-[#D4AF37] transition-colors px-2.5 py-1.5 rounded hover:bg-white/5">
            <ArrowRight size={12} /> <span className="hidden sm:inline">הפרופיל שלי</span>
          </Link>
          <button onClick={() => setShowSettings(true)} title="הגדרות פרופיל"
            className="flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white transition-colors px-2.5 py-1.5 rounded hover:bg-white/5">
            <Settings size={12} /> <span className="hidden sm:inline">הגדרות</span>
          </button>
          <button onClick={() => base44.auth.logout('/transfer-portal')} title="יציאה"
            className="flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-red-400 transition-colors px-2.5 py-1.5 rounded hover:bg-white/5">
            <LogOut size={12} />
          </button>
        </div>
      </div>
      {showSettings && <StaffProfileSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}