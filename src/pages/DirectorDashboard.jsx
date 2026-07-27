import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, AlertTriangle, CheckCircle2, TrendingUp, Search,
  FileText, ClipboardList, BarChart3, X, ChevronRight, Loader2,
  Lock, Star, Activity, Calendar, ArrowRight, Filter, Wallet, Crown, Send, UserPlus, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RoleToolbar from '../components/RoleToolbar';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import NotificationBell from '../components/NotificationBell';
import ContractsPanel from '../components/director/ContractsPanel';
import TemplatesPanel from '../components/director/TemplatesPanel';
import UniversalPdfFormModal from '../components/director/UniversalPdfFormModal';
import FinanceTab from '../components/director/FinanceTab';
import AnalyticsTab from '../components/director/AnalyticsTab';
import TransfersManager from '../components/admin/TransfersManager';
import InvitePlayerPanel from '../components/InvitePlayerPanel';
import DirectorPlayerProfileModal from '../components/director/DirectorPlayerProfileModal';
import SubmissionProgressBar from '../components/registration/SubmissionProgressBar';
import DirectorComplianceMatrix from '@/components/director/DirectorComplianceMatrix';
import DocumentPackagesPanel from '@/components/director/DocumentPackagesPanel';
import PlayerGapModal from '@/components/director/PlayerGapModal';

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
        <h1 className="text-white font-black text-xl mb-1">דשבורד מנהל מקצועי</h1>
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
  const [openFormKey, setOpenFormKey] = useState(null);
  const [subCF, setSubCF] = useState('contracts');

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
  const { data: contracts = [] } = useQuery({
    queryKey: ['dir-contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 300),
  });
  const [gapPlayer, setGapPlayer] = useState(null);

  const filtered = players.filter(p => !search || p.full_name?.includes(search) || p.position?.includes(search) || p.team_name?.includes(search));

  // KPIs
  const medicalExpired = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return d !== null && d < 0; }).length;
  const medicalSoon = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return d !== null && d >= 0 && d < 30; }).length;
  const contractsAlerts = transfers.filter(t => t.status === 'Contract Pending').length;
  const pendingReqs = requests.filter(r => r.status === 'נשלח' || r.status === 'בטיפול').length;
  const ifaReady = players.filter(p => p.ifa_ready).length;
  const complianceScore = players.length > 0 ? Math.round((ifaReady / players.length) * 100) : 0;

  // סדר יעדים: סקירה → תהליכי העברה → סגל ותאימות IFA → חוזים ומסמכים → תור פעולות → כספים → ניתוח → גיוס
  const tabs = [
    { id: 'overview', label: 'סקירה', icon: BarChart3 },
    { id: 'transfers', label: 'תהליכי העברה', icon: Send },
    { id: 'squad_compliance', label: 'סגל ותאימות מול ההתאחדות הרשמית', icon: Shield },
    { id: 'contracts_forms', label: 'חוזים ומסמכים', icon: FileText },
    { id: 'requests', label: 'תור פעולות', icon: ClipboardList, badge: pendingReqs },
    { id: 'finance', label: 'כספים', icon: Wallet },
    { id: 'analytics', label: 'ניתוח נתונים', icon: BarChart3 },
    { id: 'invite', label: 'גיוס שחקנים', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <RoleToolbar activeLabel="דשבורד מנהל מקצועי" activeIcon={Crown} />

      {/* Header */}
      <div className="bg-[#1B263B] border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">חדר בקרה מנהל מקצועי</h1>
            <p className="text-white/40 text-xs">תהליכי העברה · תיקים משפטיים · תאימות חוקית להרכב מול ההתאחדות הרשמית</p>
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

        {tab === 'transfers' && (
          <TransfersManager />
        )}

        {tab === 'squad_compliance' && (
          <div className="space-y-8">
            <SquadTab players={filtered} loading={loadPlayers} onSelect={setSelectedPlayer} search={search} setSearch={setSearch} />
            <ComplianceTab players={filtered} contracts={contracts} onTriggerPackage={setGapPlayer} />
          </div>
        )}

        {tab === 'contracts_forms' && (
          <div className="space-y-5">
            <div className="flex gap-1.5 bg-[#1B263B] border border-white/10 rounded-lg p-1.5 justify-center items-center">
              <button onClick={() => setSubCF('contracts')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'contracts' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/60 hover:text-white'}`}>
                <FileText size={14} /> ניהול חוזים קיימים
              </button>
              <button onClick={() => setSubCF('templates')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'templates' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/60 hover:text-white'}`}>
                <Crown size={14} /> בנק התבניות הרשמיות
              </button>
              <button onClick={() => setSubCF('packages')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'packages' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/60 hover:text-white'}`}>
                <Package size={14} /> חבילות מסמכים משפטיים
              </button>
            </div>
            {subCF === 'contracts' && <ContractsPanel />}
            {subCF === 'templates' && <TemplatesPanel onOpenForm={setOpenFormKey} />}
            {subCF === 'packages' && <DocumentPackagesPanel />}
          </div>
        )}

        {tab === 'requests' && (
          <RequestsTab requests={requests} players={players} />
        )}

        {tab === 'finance' && (
          <FinanceTab />
        )}

        {tab === 'analytics' && (
          <AnalyticsTab players={filtered} />
        )}

        {tab === 'invite' && (
          <InvitePlayerPanel />
        )}
      </div>

      {selectedPlayer && <DirectorPlayerProfileModal player={selectedPlayer} allPlayers={players} onClose={() => setSelectedPlayer(null)} />}
      {gapPlayer && (
        <PlayerGapModal
          player={gapPlayer}
          contracts={contracts}
          viewerRole="director"
          onClose={() => setGapPlayer(null)}
        />
      )}
      {openFormKey && (
        <UniversalPdfFormModal
          formKey={openFormKey}
          signerRole="director"
          onClose={() => setOpenFormKey(null)}
        />
      )}
    </div>
  );
}

// ---- OVERVIEW ----
function OverviewTab({ players, complianceScore, medicalExpired, medicalSoon, contractsAlerts, pendingReqs, ifaReady, transfers, requests }) {
  const scoreColor = complianceScore >= 90 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444';
  const radialData = [{ name: 'compliance', value: complianceScore, fill: scoreColor }];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-l from-[#1B263B] to-[#0D1B2A] p-6 md:p-8">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#D4AF37' }} />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-36 h-36 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="75%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: '#ffffff10' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black text-2xl" style={{ color: scoreColor }}>{complianceScore}%</span>
              <span className="text-white/30 text-[9px] font-bold uppercase tracking-wide">תאימות רגולטורית</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-right">
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">חדר בקרה — עילית ישראלית</span>
            <h2 className="text-white text-2xl font-black mt-1">מבט כללי על מצב הליגה</h2>
            <p className="text-white/40 text-sm mt-1">{players.length} שחקנים רשומים · {ifaReady} מוכנים IFA · {transfers.length} העברות במעקב</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DirKpi label="בעיות רפואיות" value={medicalExpired} sub={`${medicalSoon} בסכנה`} color={medicalExpired > 0 ? 'red' : 'green'} icon={Activity} urgent={medicalExpired > 0} />
        <DirKpi label="חוזים להחלטה" value={contractsAlerts} sub="חוזה ממתין" color={contractsAlerts > 0 ? 'amber' : 'green'} icon={FileText} />
        <DirKpi label="בקשות פתוחות" value={pendingReqs} sub="תור פעולות" color={pendingReqs > 0 ? 'amber' : 'green'} icon={ClipboardList} urgent={pendingReqs > 0} />
        <DirKpi label="שחקנים חופשיים" value={players.filter(p => p.is_free_agent).length} sub="שחקנים חופשיים" color="blue" icon={Users} />
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
          { label: 'מוכן להתאחדות הרשמית', value: ifaReady, icon: '✅' },
          { label: 'שחקנים חופשיים', value: players.filter(p => p.is_free_agent).length, icon: '🟢' },
          { label: 'העברות פעילות', value: transfers.filter(t => t.status === 'Trialist' || t.status === 'Contract Pending').length, icon: '🔄' },
        ].map(s => (
          <div key={s.label} className="bg-[#1B263B] border border-white/10 rounded-lg p-4 card-hover">
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
                <SubmissionProgressBar player={p} compact />
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
function RequestsTab({ requests, players = [] }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PlayerRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dir-requests'] }),
  });

  const pending = requests.filter(r => r.status === 'נשלח' || r.status === 'בטיפול');
  const done = requests.filter(r => r.status === 'אושר' || r.status === 'נדחה');

  // סידור פעולות לפי מצבי ניהול חוזים — שחקנים שזקוקים לחידוש (90 יום ומטה)
  const contractsExpiring = players
    .filter(p => {
      const d = calcDaysLeft(p.contract_end_date);
      return d !== null && d < 90;
    })
    .sort((a, b) => calcDaysLeft(a.contract_end_date) - calcDaysLeft(b.contract_end_date));

  const CAT_ROUTE = {
    'חופשה/היעדרות': 'מאמן',
    'פציעה/בריאות': 'פיזיותרפיסט + מאמן',
    'בקשת מסמך': 'מנהל אדמיניסטרטיבי',
    'פגישה מקצועית': 'מנהל מקצועי',
    'שינוי עמדה': 'מנהל מקצועי',
  };

  return (
    <div className="space-y-5">
      {contractsExpiring.length > 0 && (
        <div className="bg-[#1B263B] border border-amber-500/30 rounded-lg p-5">
          <h3 className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
            <FileText size={14} /> חוזים דורשים חידוש · {contractsExpiring.length} שחקנים
          </h3>
          <div className="space-y-2">
            {contractsExpiring.map(p => {
              const d = calcDaysLeft(p.contract_end_date);
              const expired = d < 0;
              return (
                <div key={p.id} className="flex items-center justify-between bg-[#0D1B2A] border border-white/10 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${expired ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <span className="text-white font-bold text-sm">{p.full_name}</span>
                    <span className="text-white/40 text-xs">{p.position}</span>
                  </div>
                  <div className="text-xs text-left">
                    <div className="text-white/40">חוזה עד {p.contract_end_date}</div>
                    <div className={`font-bold ${expired ? 'text-red-400' : 'text-amber-400'}`}>
                      {expired ? `פג תוקף לפני ${-d} ימים` : `${d} ימים לסיום`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    <div className="space-y-3">
      <h3 className="text-white font-black text-base mb-1">תור פעולות — {pending.length} ממתינות</h3>
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
    </div>
  );
}

// ---- COMPLIANCE TAB ----
function ComplianceTab({ players, contracts = [], onTriggerPackage }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-black text-base">מטריצת תאימות רגולטורית — תאימות מול ההתאחדות הרשמית</h3>
        <span className="text-white/30 text-[10px]">מטריצה מלאה · רפואי · רישום · חוזה · משמעת · משפטי · פציעה · זמינות · כרטיסים</span>
      </div>
      <DirectorComplianceMatrix
        players={players}
        contracts={contracts}
        viewerRole="director"
        onTriggerPackage={onTriggerPackage}
      />
    </div>
  );
}