import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Settings } from 'lucide-react';
import StaffProfileSettingsModal from './staff/StaffProfileSettingsModal';

// Slim toolbar shown on top of every role-based dashboard (coach/director/scouting).
// Lets the user jump back to their personal profile/role screen and edit their staff profile.
export default function RoleToolbar({ activeLabel, activeIcon: ActiveIcon }) {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="bg-[#0D1B2A] border-b border-white/10 px-6 py-2.5" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/transfer-portal" className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-amber-300 transition-colors">
          <ArrowRight size={13} /> הפרופיל שלי
        </Link>
        <div className="flex items-center gap-4">
          {activeLabel && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
              {ActiveIcon ? <ActiveIcon size={13} className="text-[#D4AF37]" /> : <LayoutGrid size={13} className="text-[#D4AF37]" />}
              {activeLabel}
            </div>
          )}
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors">
            <Settings size={13} /> הגדרות פרופיל
          </button>
        </div>
      </div>
      {showSettings && <StaffProfileSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}