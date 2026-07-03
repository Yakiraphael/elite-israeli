import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, AlertTriangle, CheckCircle2, TrendingUp, Search,
  FileText, ClipboardList, BarChart3, X, ChevronRight, Loader2,
  Lock, Star, Activity, Calendar, ArrowRight, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import NotificationBell from '../components/NotificationBell';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';
const ADMIN_PASSWORD = 'elite2025';

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function DirectorDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);

  const tryLogin = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setUnlocked(true); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 2000); }
  };

  if (!unlocked) return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm px-6 text-center">
        <img src={LOGO_URL} alt="" className="h-16 mx-auto mb-6" />
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-[#D4AF37]" />
        </div>
        <h1 className="text-white font-black text-xl mb-1">Director Dashboard</h1>
        <p className="text-white/40 text-sm mb-6">ממשק מנהל מקצועי</p>
        <form onSubmit={tryLogin} className="space-y-3">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="סיסמה"
            className={`w-full bg-[#1B263B] border rounded-sm px-4 py-3 text-white text-sm text-center tracking-widest placeholder-white/20 focus:outline-none transition-colors ${pwErr ? 'border-red-500' : 'border-white/15 focus:border-[#D4AF37]/60'}`} />
          {pwErr && <p className="text-red-400 text-xs">סיסמה שגויה</p>}
          <button type="submit" className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm hover:bg-amber-400">כניסה</button>
        </form>
        <Link to="/" className="text-white/30 text-xs mt-4 inline-block hover:text-white/60">חזרה לאתר</Link>
      </motion.div>
    </div>
  );

  return <DashboardContent onLogout={() => setUnlocked(false)} />;
}

function DashboardContent({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: players = [], isLoading: loadPlayers } = useQuery({
    queryKey: ['dir-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 200),
  });
  const { data: requests = [] } = useQuery({
    queryKey: ['dir-requests'],
    queryFn: () => base44.entities.PlayerRequest.list('-created_date', 100),
  });
  const { data: transfers = [] } = useQuery({
    queryKey: ['dir-transfers'],
    queryFn: () => base44.entities.TransferTracker.list('-created_date', 50),
  });

  const filtered = players.filter(p => !search || p.full_name?.includes(search) || p.position?.includes(search) || p.team_name?.includes(search));

  // KPIs
  const medicalExpired = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return d !== null && d < 0; }).length;
  const medicalSoon = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return d !== null && d >= 0 && d < 30; }).length;
  const contractsAlerts = transfers.filter(t => t.status === 'Contract Pending').length;
  const pendingReqs = requests.filter(r => r.status === 'נשלח' || r.status === 'בטיפול').length;
  const ifaReady = players.filter(p => p.ifa_ready).length;
  const complianceScore = players.length > 0 ? Math.round((ifaReady / players.length) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: BarChart3 },
    { id: 'squad', label: 'ניהול סגל', icon: Users },
    { id: 'requests', label: 'תור פעולות', icon: ClipboardList, badge: pendingReqs },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      {/* Header */}
      <div className="bg-[#1B263B] border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-9" />
            <div>
              <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Director Dashboard</span>
              <div className="text-white/40 text-[10px]">חדר בקרה מנהל מקצועי</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Global search */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מהיר — שחקן, עמדה..."
                className="bg-[#0D1B2A] border border-white/15 rounded-lg pr-9 pl-4 py-2 text-white text-xs placeholder-white/25 focus:outline-none w-56 focus:border-[#D4AF37]/60" />
            </div>
            <NotificationBell audience="director" onNavigate={setTab} />
            <Link to="/" className="text-white/40 hover:text-white text-xs flex items-center gap-1"><ArrowRight size={12} /> אתר</Link>
            <button onClick={onLogout} className="text-white/30 hover:text-red-400 text-xs flex items-center gap-1"><Lock size={12} /> יציאה</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1B263B] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
              <t.icon size={13} /> {t.label}
              {t.badge > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {tab === 'overview' && (
          <OverviewTab
            players={players} complianceScore={complianceScore} medicalExpired={medicalExpired}
            medicalSoon={medicalSoon} contractsAlerts={contractsAlerts} pendingReqs={pendingReqs}
            ifaReady={ifaReady} transfers={transfers} requests={requests}
          />
        )}

        {tab === 'squad' && (
          <SquadTab players={filtered} loading={loadPlayers} onSelect={setSelectedPlayer} search={search} setSearch={setSearch} />
        )}

        {tab === 'requests' && (
          <RequestsTab requests={requests} />
        )}

        {tab === 'compliance' && (
          <ComplianceTab players={filtered} />
        )}
      </div>

      {selectedPlayer && <PlayerDeepDive player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}

// ---- OVERVIEW ----
function OverviewTab({ players, complianceScore, medicalExpired, medicalSoon, contractsAlerts, pendingReqs, ifaReady, transfers, requests }) {
  const scoreColor = complianceScore >= 90 ? 'text-green-400' : complianceScore >= 70 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = complianceScore >= 90 ? 'bg-green-500/10 border-green-500/20' : complianceScore >= 70 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-5 border text-center ${scoreBg}`}>
          <Shield size={20} className={`mx-auto mb-2 ${scoreColor}`} />
          <div className={`font-black text-3xl ${scoreColor}`}>{complianceScore}%</div>
          <div className="text-white/50 text-xs mt-1">Compliance Score</div>
          <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${complianceScore}%`, backgroundColor: complianceScore >= 90 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
        <DirKpi label="בעיות רפואיות" value={medicalExpired} sub={`${medicalSoon} בסכנה`} color={medicalExpired > 0 ? 'red' : 'green'} icon={Activity} urgent={medicalExpired > 0} />
        <DirKpi label="חוזים להחלטה" value={contractsAlerts} sub="Contract Pending" color={contractsAlerts > 0 ? 'amber' : 'green'} icon={FileText} />
        <DirKpi label="בקשות פתוחות" value={pendingReqs} sub="Action Queue" color={pendingReqs > 0 ? 'amber' : 'green'} icon={ClipboardList} urgent={pendingReqs > 0} />
      </div>

      {/* Action Queue preview */}
      {pendingReqs > 0 && (
        <div className="bg-[#1B263B] border border-amber-500/20 rounded-lg p-5">
          <h3 className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
            <ClipboardList size={14} /> תור הפעולות — {pendingReqs} ממתינות
          </h3>
          <p className="text-white/40 text-xs">לחץ על לשונית "תור פעולות" לטיפול מהיר</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'סה״כ שחקנים', value: players.length, icon: '👥' },
          { label: 'IFA Ready', value: ifaReady, icon: '✅' },
          { label: 'שחקנים חופשיים', value: players.filter(p => p.is_free_agent).length, icon: '🟢' },
          { label: 'העברות פעילות', value: transfers.filter(t => t.status === 'Trialist' || t.status === 'Contract Pending').length, icon: '🔄' },
        ].map(s => (
          <div key={s.label} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-white font-black text-xl">{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DirKpi({ label, value, sub, color, icon: Icon, urgent }) {
  const map = { red: ['text-red-400', 'bg-red-500/10', 'border-red-500/20'], amber: ['text-amber-400', 'bg-amber-500/10', 'border-amber-500/20'], green: ['text-green-400', 'bg-green-500/10', 'border-green-500/20'] };
  const [tc, bg, border] = map[color] || map.green;
  return (
    <div className={`rounded-lg p-5 border ${bg} ${border} ${urgent ? 'animate-pulse' : ''}`}>
      <Icon size={18} className={`mb-2 ${tc}`} />
      <div className={`font-black text-3xl ${tc}`}>{value}</div>
      <div className="text-white/50 text-xs mt-0.5">{label}</div>
      <div className="text-white/25 text-[10px]">{sub}</div>
    </div>
  );
}

// ---- SQUAD TAB ----
function SquadTab({ players, loading, onSelect }) {
  const [posFilter, setPosFilter] = useState('');
  const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];

  const filtered2 = posFilter ? players.filter(p => p.position === posFilter) : players;

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
          className="bg-[#1B263B] border border-white/15 rounded-lg px-3 py-2 text-white text-xs focus:outline-none">
          <option value="">כל העמדות</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-white/30 text-xs">{filtered2.length} שחקנים</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered2.map(p => {
          const days = calcDaysLeft(p.medical_expiry_date);
          const medAlert = days !== null && days < 30;
          return (
            <button key={p.id} onClick={() => onSelect(p)}
              className="bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-4 text-right transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{p.full_name}</div>
                <div className="text-white/40 text-xs">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}{p.city ? ` · ${p.city}` : ''}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {medAlert && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ רפואי</span>}
                {p.ifa_ready && <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded-full border border-[#D4AF37]/20">IFA</span>}
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- REQUESTS TAB ----
function RequestsTab({ requests }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PlayerRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dir-requests'] }),
  });

  const pending = requests.filter(r => r.status === 'נשלח' || r.status === 'בטיפול');
  const done = requests.filter(r => r.status === 'אושר' || r.status === 'נדחה');

  const CAT_ROUTE = {
    'חופשה/היעדרות': 'מאמן',
    'פציעה/בריאות': 'פיזיותרפיסט + מאמן',
    'בקשת מסמך': 'מנהל אדמיניסטרטיבי',
    'פגישה מקצועית': 'מנהל מקצועי',
    'שינוי עמדה': 'מנהל מקצועי',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-white font-black text-base mb-1">Action Queue — {pending.length} ממתינות</h3>
      {pending.length === 0 && <div className="text-center py-10 text-white/30 text-sm">🎉 אין בקשות פתוחות</div>}
      {pending.map(req => (
        <div key={req.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-sm">{req.subject}</span>
                {req.priority === 'קריטי' && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">קריטי</span>}
              </div>
              <div className="text-white/50 text-xs mb-1">{req.player_name} · {req.category}</div>
              <p className="text-white/40 text-xs leading-relaxed mb-2">{req.details}</p>
              {CAT_ROUTE[req.category] && (
                <div className="text-[#D4AF37] text-[10px] bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded px-2 py-1 inline-block">
                  → {CAT_ROUTE[req.category]}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => update.mutate({ id: req.id, status: 'אושר' })}
                className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-green-500/30 border border-green-500/20 transition-colors flex items-center gap-1">
                <CheckCircle2 size={12} /> אשר
              </button>
              <button onClick={() => update.mutate({ id: req.id, status: 'נדחה' })}
                className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-red-500/30 border border-red-500/20 transition-colors flex items-center gap-1">
                <X size={12} /> דחה
              </button>
            </div>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white/30 text-xs mb-2">היסטוריה ({done.length})</h4>
          {done.slice(0, 5).map(req => (
            <div key={req.id} className="flex items-center gap-3 py-2 border-b border-white/5 text-xs">
              <span className={req.status === 'אושר' ? 'text-green-400' : 'text-red-400'}>{req.status === 'אושר' ? '✅' : '❌'}</span>
              <span className="text-white/60 flex-1">{req.player_name} — {req.subject}</span>
              <span className="text-white/30">{req.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- COMPLIANCE TAB ----
function ComplianceTab({ players }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-black text-base">Compliance Matrix</h3>
        <button className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded hover:bg-[#D4AF37]/20 transition-colors">
          📄 הפק דוח PDF
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead className="bg-[#1B263B]">
            <tr>
              {['שם שחקן', 'עמדה', 'סטטוס רפואי', 'IFA Ready', 'מסמכים', 'ימים לתוקף', 'פעולה'].map(h => (
                <th key={h} className="text-white/40 font-bold py-3 px-4 text-right whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const days = calcDaysLeft(p.medical_expiry_date);
              const medColor = !p.medical_certificate_url ? 'red' : days === null ? 'green' : days < 0 ? 'red' : days < 30 ? 'yellow' : 'green';
              const medLabel = !p.medical_certificate_url ? '🔴 חסר' : days === null ? '🟢 תקין' : days < 0 ? '🔴 פג תוקף' : days < 30 ? `🟡 ${days}י׳` : '🟢 תקין';
              const missDocs = [!p.id_document_url && 'ת.ז', !p.is_adult && !p.id_suffix_url && 'ספח', !p.medical_certificate_url && 'רפואי'].filter(Boolean);
              const rowBg = medColor === 'red' ? 'bg-red-500/5' : missDocs.length > 0 ? 'bg-amber-500/5' : '';

              return (
                <tr key={p.id} className={`border-t border-white/5 ${rowBg} hover:bg-white/2 transition-colors`}>
                  <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{p.full_name}</td>
                  <td className="py-3 px-4 text-white/50">{p.position}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{medLabel}</td>
                  <td className="py-3 px-4">
                    <span className={p.ifa_ready ? 'text-green-400' : 'text-red-400'}>{p.ifa_ready ? '✅' : '❌'}</span>
                  </td>
                  <td className="py-3 px-4">
                    {missDocs.length === 0
                      ? <span className="text-green-400">✓ שלם</span>
                      : <span className="text-red-400">חסר: {missDocs.join(', ')}</span>}
                  </td>
                  <td className="py-3 px-4">
                    {days !== null ? <span className={days < 0 ? 'text-red-400' : days < 30 ? 'text-amber-400' : 'text-white/40'}>{days} ימים</span> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {(medColor === 'red' || missDocs.length > 0) && (
                      <button className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors whitespace-nowrap">
                        שלח התראה
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- PLAYER DEEP DIVE ----
function PlayerDeepDive({ player, onClose }) {
  const days = calcDaysLeft(player.medical_expiry_date);
  const radarData = player.stats ? Object.entries(player.stats).map(([k, v]) => ({
    subject: k.toUpperCase(), value: v || 0, fullMark: 99
  })) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-white font-black text-base">{player.full_name}</h3>
            <p className="text-[#D4AF37] text-xs">{player.position}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['📱 טלפון', player.phone],
              ['📍 עיר', player.city],
              ['⚽ קבוצה', player.team_name],
              ['👟 רגל', player.dominant_foot],
              ['IFA Ready', player.ifa_ready ? '✅' : '❌'],
              ['📅 רפואי', days !== null ? (days < 0 ? `🔴 פג ${Math.abs(days)}י` : `${days < 30 ? '🟡' : '🟢'} ${days}י`) : '—'],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className="bg-[#0D1B2A] rounded p-2 flex justify-between">
                <span className="text-white/40">{l}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>

          {radarData.length > 0 && (
            <div className="bg-[#0D1B2A] rounded-lg p-3">
              <p className="text-white/40 text-[10px] mb-2">Performance Radar</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#ffffff40' }} />
                  <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {player.achievements && (
            <div className="bg-[#0D1B2A] rounded-lg p-3">
              <p className="text-[#D4AF37] text-[10px] font-bold mb-1">🏆 הישגים</p>
              <p className="text-white/60 text-xs">{player.achievements}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}