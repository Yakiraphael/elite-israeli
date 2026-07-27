import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Building2, MapPin, Users, Calendar,
  ShieldCheck, HeartPulse, FileClock, BarChart3, TrendingUp, ArrowRight,
} from 'lucide-react';

// Mission Control · חדר הבקרה העליון של המערך
// סימניית ריכוז נתונים לאדמין — System Pulse + Risk Radar + Municipal Partnerships + Audit preview.

const REGIONS = ['נתיבות', 'קריית גת', 'באר שבע', 'אחר'];

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function AdminMissionControl() {
  const { data: players = [] } = useQuery({
    queryKey: ['admin-mc-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 500),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-mc-events'],
    queryFn: () => base44.entities.TeamEvent.list('-created_date', 200),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-mc-audit'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 8),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['admin-mc-clubs'],
    queryFn: () => base44.entities.Club.list('-created_date', 100),
  });

  // === System Pulse ===
  const activePlayers = players.filter(p => p.account_status === 'מאושר' || p.status === 'פעיל');
  const byRegionP = REGIONS.reduce((acc, r) => ({ ...acc, [r]: players.filter(p => p.region === r).length }), {});
  const byRegionE = REGIONS.reduce((acc, r) => ({ ...acc, [r]: events.filter(e => e.region === r).length }), {});
  const avgAttendance = players.length > 0
    ? Math.round(players.reduce((s, p) => s + (p.attendance_rate ?? 0), 0) / players.length)
    : 0;

  // === Risk Radar ===
  const ineligiblePlayers = players.filter(p => {
    const d = calcDaysLeft(p.medical_expiry_date);
    return (d !== null && d < 0) || p.is_suspended === true;
  });
  const pendingSignOff = players.filter(p => !p.audit_signed_at);

  const lowAttendanceTeams = Object.entries(
    players.reduce((acc, p) => {
      const team = p.team_name || '— לא ידוע —';
      if (!acc[team]) acc[team] = { count: 0, total: 0 };
      acc[team].count += 1;
      acc[team].total += p.attendance_rate ?? 0;
      return acc;
    }, {})
  ).filter(([, s]) => s.count >= 2 && (s.total / s.count) < 60);

  const verifiedClubs = clubs.filter(c => c.is_verified).length;
  const pendingClubs = clubs.filter(c => c.verification_status === 'ממתין לאימות').length;

  const ACTION_LABELS = {
    view_medical: '🩺 צפייה ברשומה רפואית',
    view_contract: '📄 צפייה בחוזה',
    delete_player: '🗑️ מחיקת שחקן',
    export_data: '📤 ייצוא נתונים',
    unauthorized_attempt: '⛔ ניסיון גישה לא מורשה',
    sign_player: '✍️ חתימה על שחקן',
    status_change: '🔄 שינוי סטטוס',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-gradient-to-l from-[#1B263B] to-[#0D1B2A] p-6">
        <div className="absolute -top-8 -left-8 w-56 h-56 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#D4AF37' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
            <BarChart3 size={22} className="text-[#D4AF37]" />
          </div>
          <div>
            <span className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase">Mission Control · חדר הבקרה העליון</span>
            <h1 className="text-white text-2xl font-black">מבט-על על כלל המערך · עילית ישראלית</h1>
          </div>
        </div>
      </motion.div>

      {/* System Pulse */}
      <div>
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2">
          <Activity size={14} /> מדד חיות המערך · System Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PulseCard label="חניכים פעילים" value={activePlayers.length} sub={`מתוך ${players.length} רשומים`} color="green" icon={Users} />
          <PulseCard label="אירועים פעילים" value={events.filter(e => e.is_active).length} sub={`${events.length} סה"כ`} color="blue" icon={Calendar} />
          <PulseCard label="נוכחות ממוצעת" value={`${avgAttendance}%`} sub="ממוצע רבעוני" color="amber" icon={TrendingUp} />
          <PulseCard label="מועדונים מאומתים" value={verifiedClubs} sub={`${pendingClubs} ממתינים לאימות`} color="green" icon={Building2} />
        </div>
      </div>

      {/* Risk & Compliance Radar */}
      <div>
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2">
          <AlertTriangle size={14} /> רדאר חריגים וסיכונים · Risk & Compliance Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RiskCard count={ineligiblePlayers.length} title="שחקנים לא כשירים" sub="פג תוקף רפואי / השעיה פעילה" color="red" icon={HeartPulse}
            list={ineligiblePlayers.slice(0, 5).map(p => ({ id: p.id, label: `${p.full_name}${p.team_name ? ` · ${p.team_name}` : ''}` }))} />
          <RiskCard count={pendingSignOff.length} title="ממתינים לחותמת חתימה" sub="טרם נחתם Pre-Signature Sign-Off" color="amber" icon={FileClock}
            list={pendingSignOff.slice(0, 5).map(p => ({ id: p.id, label: p.full_name }))} />
          <RiskCard count={lowAttendanceTeams.length} title="קבוצות חריגות נוכחות" sub="מתחת ל-60% נוכחות ממוצעת" color="red" icon={Activity}
            list={lowAttendanceTeams.slice(0, 5).map(([team, s]) => ({ id: team, label: `${team} · ${Math.round(s.total / s.count)}%` }))} />
        </div>
      </div>

      {/* Regional / Municipal Partnerships */}
      <div>
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2">
          <MapPin size={14} /> סטטוס שותפויות עירוניות · Municipal Partnerships
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {REGIONS.map(r => (
            <div key={r} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
              <div className="text-white text-sm font-bold flex items-center gap-1"><MapPin size={11} className="text-[#D4AF37]" /> {r}</div>
              <div className="text-white/60 text-xs mt-1">{byRegionP[r]} שחקנים · {byRegionE[r]} אירועים</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit preview */}
      <div>
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2">
          <ShieldCheck size={14} /> פעילות אחרונה · Audit Trail
        </h3>
        {auditLogs.length === 0 ? (
          <div className="text-white/30 text-xs text-center py-6">אין רשומות עדיין</div>
        ) : (
          <div className="bg-[#1B263B] border border-white/10 rounded-lg divide-y divide-white/5">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-bold">{ACTION_LABELS[log.action] || log.action}</div>
                  <div className="text-white/40">{log.actor_name}{log.actor_role ? ` · ${log.actor_role}` : ''}{log.details ? ` · ${log.details}` : ''}</div>
                </div>
                <div className="text-white/25 text-[10px]">{log.created_date ? new Date(log.created_date).toLocaleString('he-IL') : ''}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-white/30 text-[10px] flex items-center gap-1">
          <ArrowRight size={10} /> עבור לטאב "יומן ביקורת" לתצוגה מלאה
        </div>
      </div>
    </div>
  );
}

function PulseCard({ label, value, sub, color, icon: Icon }) {
  const colors = {
    green: { txt: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/5' },
    blue: { txt: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
    amber: { txt: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    red: { txt: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5' },
  };
  const c = colors[color] || colors.green;
  return (
    <div className={`rounded-lg p-4 border ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={c.txt} />
        <span className="text-white/40 text-[11px] font-bold">{label}</span>
      </div>
      <div className={`font-black text-3xl ${c.txt}`}>{value}</div>
      <div className="text-white/40 text-[11px]">{sub}</div>
    </div>
  );
}

function RiskCard({ count, title, sub, color, icon: Icon, list = [] }) {
  const isRed = color === 'red';
  const cls = isRed ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5';
  const txt = isRed ? 'text-red-400' : 'text-amber-400';
  return (
    <div className={`rounded-lg p-4 border ${cls}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={txt} />
        <span className="text-white text-xs font-bold">{title}</span>
      </div>
      <div className={`font-black text-2xl ${txt}`}>{count}</div>
      <div className="text-white/40 text-[11px] mb-2">{sub}</div>
      {list.length > 0 && (
        <div className="text-white/50 text-[10px] space-y-0.5 mt-2 pt-2 border-t border-white/10">
          {list.map(item => <div key={item.id} className="truncate">{item.label}</div>)}
        </div>
      )}
    </div>
  );
}