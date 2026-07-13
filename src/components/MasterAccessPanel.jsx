import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Crown, Briefcase, Search, Shield, Settings, User, LogOut, ArrowRight, Loader2, KeyRound, Users } from 'lucide-react';

const NAVY = '#0D1B2A';
const NAVY_LIGHT = '#1B263B';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';

const DASHBOARDS = [
  { label: 'דשבורד מאמן', path: '/coach', icon: Briefcase, color: '#10B981', note: 'גישה חופשית' },
  { label: 'דשבורד סקאוטינג', path: '/scouting', icon: Search, color: '#8B5CF6', note: 'גישה חופשית' },
  { label: 'דשבורד מנהל מקצועי', path: '/director', icon: Crown, color: '#EF4444', note: 'סיסמה: elite2025' },
  { label: 'פאנל ניהול (אירועים/שחקנים)', path: '/admin', icon: Settings, color: '#3B82F6', note: 'סיסמה: elite2025' },
  { label: 'פורטל אפוטרופוס', path: '/guardian-portal', icon: Users, color: '#F59E0B', note: 'גישת בדיקה — הורה/אפוטרופוס' },
];

export default function MasterAccessPanel({ user, navigate, onContinueNormal, onLogout }) {
  const [search, setSearch] = useState('');

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['master-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 100),
  });

  const filtered = players.filter(p => !search || p.full_name?.includes(search));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-xl p-6 mb-6 flex items-center gap-4 border" style={{ background: `${GOLD}12`, borderColor: `${GOLD}30` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}20`, border: `2px solid ${GOLD}60` }}>
          <KeyRound size={24} style={{ color: GOLD }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold tracking-wide uppercase" style={{ color: GOLD }}>גישת בעלים · Master Access</div>
          <h1 className="font-black text-xl mt-0.5" style={{ color: WHITE }}>{user.full_name || 'משתמש'}</h1>
          <p className="text-xs mt-0.5" style={{ color: `${WHITE}40` }}>{user.email}</p>
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: `${WHITE}40` }}>
        גישה מלאה לכל הממשקים במערכת — עבור בין תפקידים לצורך בדיקה ובקרה.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {DASHBOARDS.map(d => (
          <button
            key={d.path}
            onClick={() => navigate(d.path)}
            className="rounded-xl p-4 flex items-center gap-3 border hover:border-opacity-60 transition-all text-right"
            style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${d.color}15`, border: `1px solid ${d.color}40` }}>
              <d.icon size={18} style={{ color: d.color }} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: WHITE }}>{d.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: `${WHITE}35` }}>{d.note}</div>
            </div>
            <ArrowRight size={14} style={{ color: `${WHITE}20` }} />
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4 border mb-6" style={{ backgroundColor: NAVY_LIGHT, borderColor: `${WHITE}10` }}>
        <div className="flex items-center gap-2 mb-3">
          <User size={14} style={{ color: GOLD }} />
          <span className="font-bold text-sm" style={{ color: WHITE }}>צפייה בפרופיל שחקן ספציפי</span>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חפש שחקן לפי שם..."
          className="w-full rounded-sm px-3 py-2.5 text-sm border mb-3 focus:outline-none"
          style={{ backgroundColor: NAVY, borderColor: `${WHITE}15`, color: WHITE }}
        />
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin" style={{ color: GOLD }} /></div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {filtered.length === 0 && <p className="text-xs text-center py-4" style={{ color: `${WHITE}30` }}>לא נמצאו שחקנים</p>}
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/player-profile?id=${p.id}`)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-right hover:bg-white/5 transition-colors"
              >
                <span className="text-sm" style={{ color: WHITE }}>{p.full_name}</span>
                <span className="text-[10px]" style={{ color: `${WHITE}30` }}>{p.position}{p.team_name ? ` · ${p.team_name}` : ''}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${WHITE}10` }}>
        <button onClick={onContinueNormal} className="text-xs transition-colors hover:text-amber-300" style={{ color: `${WHITE}30` }}>
          <Shield size={12} className="inline ml-1" /> המשך לתפקיד הרגיל שלי
        </button>
        <button onClick={onLogout} className="text-xs transition-colors hover:text-red-400 flex items-center gap-1" style={{ color: `${WHITE}30` }}>
          <LogOut size={12} /> התנתקות
        </button>
      </div>
    </motion.div>
  );
}