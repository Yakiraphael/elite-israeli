import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, AlertTriangle, CheckCircle2, TrendingUp, Search,
  FileText, ClipboardList, BarChart3, X, ChevronRight, Loader2,
  Lock, Star, Activity, Calendar, ArrowRight, Filter, Wallet, Crown, Send, UserPlus, Package, CalendarDays, Trophy
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
import MovePlayerBetweenTeamsModal from '@/components/director/MovePlayerBetweenTeamsModal';
import FieldReportsStudio from '@/components/fieldreports/FieldReportsStudio';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';
const ADMIN_PASSWORD = 'elite2025';

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function DirectorDashboard() {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);

  const tryLogin = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setUnlocked(true); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 2000); }
  };

  if (!unlocked) return (
    <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm px-6 text-center">
        <img src={LOGO_URL} alt="" className="h-16 mx-auto mb-6" />
        <div className="w-14 h-14 rounded-full bg-brand-soft border border-brand-line flex items-center justify-center mx-auto mb-4">
          <Lock size={22} className="text-brand" />
        </div>
        <h1 className="text-ink font-black text-xl mb-1">{t('director.lockTitle')}</h1>
        <p className="text-ink-muted text-sm mb-6">{t('director.lockSubtitle')}</p>
        <form onSubmit={tryLogin} className="space-y-3">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={t('director.passwordPlaceholder')}
            className={`w-full bg-panel border rounded-sm px-4 py-3 text-ink text-sm text-center tracking-widest placeholder-ink-faint focus:outline-none transition-colors ${pwErr ? 'border-red-500' : 'border-hairline focus:border-brand-line'}`} />
          {pwErr && <p className="text-red-400 text-xs">{t('director.passwordError')}</p>}
          <button type="submit" className="w-full bg-brand text-brand-ink font-black text-sm py-3 rounded-sm hover:bg-amber-400">{t('director.loginBtn')}</button>
        </form>
        <Link to="/" className="text-ink-faint text-xs mt-4 inline-block hover:text-ink-muted">{t('director.backToSite')}</Link>
      </motion.div>
    </div>
  );

  return <DashboardContent onLogout={() => setUnlocked(false)} />;
}

function DashboardContent({ onLogout }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [openFormKey, setOpenFormKey] = useState(null);
  const [subCF, setSubCF] = useState('contracts');
  const queryClient = useQueryClient();
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dir-players'] });
    await queryClient.invalidateQueries({ queryKey: ['dir-requests'] });
    await queryClient.invalidateQueries({ queryKey: ['dir-transfers'] });
    await queryClient.invalidateQueries({ queryKey: ['dir-contracts'] });
  };

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
  const [movePlayer, setMovePlayer] = useState(null);
  const [reportTeamId, setReportTeamId] = useState('');

  const { data: clubTeams = [] } = useQuery({
    queryKey: ['director-club-teams'],
    queryFn: async () => {
      let me = null;
      try { me = await base44.auth.me(); } catch { /* */ }
      if (me?.club_id) return base44.entities.Team.filter({ club_id: me.club_id }, 'name', 50);
      return base44.entities.Team.list('-name', 50);
    },
  });
  const activeReportTeam = clubTeams.find(t => t.id === reportTeamId) || clubTeams[0] || null;

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
    { id: 'overview', label: t('director.overview'), icon: BarChart3 },
    { id: 'transfers', label: t('director.transfers'), icon: Send },
    { id: 'squad_compliance', label: t('director.squadCompliance'), icon: Shield },
    { id: 'field_reports', label: t('director.fieldReports'), icon: Activity },
    { id: 'contracts_forms', label: t('director.contractsForms'), icon: FileText },
    { id: 'requests', label: t('director.requests'), icon: ClipboardList, badge: pendingReqs },
    { id: 'finance', label: t('director.finance'), icon: Wallet },
    { id: 'analytics', label: t('director.analytics'), icon: BarChart3 },
    { id: 'invite', label: t('director.invite'), icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <RoleToolbar activeLabel={t('director.controlRoom')} activeIcon={Crown} />

      {/* Header */}
      <div className="bg-panel border-b border-hairline py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-ink font-black text-xl">{t('director.controlRoom')}</h1>
            <p className="text-ink-muted text-xs">{t('owner.directorSub')}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Global search */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('owner.directorSearchHint')}
                className="bg-surface border border-hairline rounded-lg pr-9 pl-4 py-2 text-ink text-xs placeholder-ink-faint focus:outline-none w-56 focus:border-brand-line" />
            </div>
            <Link to="/schedule" title={t('director.scheduleLink')}
              className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center text-ink-muted hover:text-brand hover:border-brand-line transition-colors">
              <CalendarDays size={16} />
            </Link>
            <Link to="/league" title={t('director.leagueLink')}
              className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center text-ink-muted hover:text-brand hover:border-brand-line transition-colors">
              <Trophy size={16} />
            </Link>
            <NotificationBell audience="director" onNavigate={setTab} />
            <Link to="/" className="text-ink-muted hover:text-ink text-xs flex items-center gap-1"><ArrowRight size={12} /> {t('director.siteLink')}</Link>
            <button onClick={onLogout} className="text-ink-faint hover:text-red-400 text-xs flex items-center gap-1"><Lock size={12} /> {t('director.exitBtn')}</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-panel border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'text-brand border-brand' : 'text-ink-muted border-transparent hover:text-ink'}`}>
              <t.icon size={13} /> {t.label}
              {t.badge > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{t.badge}</span>}
            </button>
          ))}

        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20 md:pb-8">

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
            <ComplianceTab players={filtered} contracts={contracts} onTriggerPackage={setGapPlayer} onMovePlayer={setMovePlayer} />
          </div>
        )}

        {tab === 'field_reports' && (
          <FieldReportsStudio
            teams={clubTeams}
            team={activeReportTeam}
            players={filtered}
            authorRole="מנהל מקצועי"
            onPickTeam={setReportTeamId}
          />
        )}

        {tab === 'contracts_forms' && (
          <div className="space-y-5">
            <div className="flex gap-1.5 bg-panel border border-hairline rounded-lg p-1.5 justify-center items-center">
              <button onClick={() => setSubCF('contracts')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'contracts' ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:text-ink'}`}>
                <FileText size={14} /> {t('director.contractsSubTab')}
              </button>
              <button onClick={() => setSubCF('templates')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'templates' ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:text-ink'}`}>
                <Crown size={14} /> {t('director.templatesSubTab')}
              </button>
              <button onClick={() => setSubCF('packages')} className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subCF === 'packages' ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:text-ink'}`}>
                <Package size={14} /> {t('director.packagesSubTab')}
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

      </PullToRefresh>

      <MobileBottomNav tabs={tabs} activeTab={tab} onTabChange={setTab} />
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
      {movePlayer && (
        <MovePlayerBetweenTeamsModal
          player={movePlayer}
          onClose={() => setMovePlayer(null)}
        />
      )}
    </div>
  );
}

// ---- OVERVIEW ----
function OverviewTab({ players, complianceScore, medicalExpired, medicalSoon, contractsAlerts, pendingReqs, ifaReady, transfers, requests }) {
  const { t } = useTranslation();
  const scoreColor = complianceScore >= 90 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444';
  const radialData = [{ name: 'compliance', value: complianceScore, fill: scoreColor }];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-l from-panel to-surface p-6 md:p-8">
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
              <span className="text-ink-faint text-[9px] font-bold uppercase tracking-wide">{t('director.regulatoryScore')}</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-right">
            <span className="text-brand text-xs font-bold tracking-widest uppercase">{t('director.heroBadge')}</span>
            <h2 className="text-ink text-2xl font-black mt-1">{t('director.heroTitle')}</h2>
            <p className="text-ink-muted text-sm mt-1">{t('director.heroDesc', { players: players.length, ifaReady, transfers: transfers.length })}</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DirKpi label={t('director.medicalExpiredShort')} value={medicalExpired} sub={`${medicalSoon} בסכנה`} color={medicalExpired > 0 ? 'red' : 'green'} icon={Activity} urgent={medicalExpired > 0} />
        <DirKpi label={t('director.contractsPendingShort')} value={contractsAlerts} sub="חוזה ממתין" color={contractsAlerts > 0 ? 'amber' : 'green'} icon={FileText} />
        <DirKpi label={t('director.pendingReqsShort')} value={pendingReqs} sub="תור פעולות" color={pendingReqs > 0 ? 'amber' : 'green'} icon={ClipboardList} urgent={pendingReqs > 0} />
        <DirKpi label={t('director.freeAgentsShort')} value={players.filter(p => p.is_free_agent).length} sub="שחקנים חופשיים" color="blue" icon={Users} />
      </div>

      {/* Action Queue preview */}
      {pendingReqs > 0 && (
        <div className="bg-panel border border-amber-500/20 rounded-lg p-5">
          <h3 className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
            <ClipboardList size={14} /> {t('director.awaitingActions', { count: pendingReqs })}
          </h3>
          <p className="text-ink-muted text-xs">{t('director.clickActionQueue')}</p>
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
          <div key={s.label} className="bg-panel border border-hairline rounded-lg p-4 card-hover">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-ink font-black text-xl">{s.value}</div>
            <div className="text-ink-muted text-xs">{s.label}</div>
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
      <div className="text-ink-muted text-xs mt-0.5">{label}</div>
      <div className="text-ink-faint text-[10px]">{sub}</div>
    </div>
  );
}

// ---- SQUAD TAB ----
function SquadTab({ players, loading, onSelect }) {
  const { t } = useTranslation();
  const [posFilter, setPosFilter] = useState('');
  const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];

  const filtered2 = posFilter ? players.filter(p => p.position === posFilter) : players;

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
          className="bg-panel border border-hairline rounded-lg px-3 py-2 text-ink text-xs focus:outline-none">
          <option value="">{t('director.allPositions')}</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-ink-faint text-xs">{filtered2.length} שחקנים</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered2.map(p => {
          const days = calcDaysLeft(p.medical_expiry_date);
          const medAlert = days !== null && days < 30;
          return (
            <button key={p.id} onClick={() => onSelect(p)}
              className="bg-panel border border-hairline hover:border-brand-line rounded-lg p-4 flex items-center gap-4 text-right transition-all group">
              <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand-line flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-brand" />
              </div>
              <div className="flex-1">
                <div className="text-ink font-bold text-sm">{p.full_name}</div>
                <div className="text-ink-muted text-xs">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}{p.city ? ` · ${p.city}` : ''}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {medAlert && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/20">⚠️ רפואי</span>}
                {p.ifa_ready && <span className="text-[9px] bg-brand-soft text-brand px-1.5 py-0.5 rounded-full border border-brand-line">IFA</span>}
                <SubmissionProgressBar player={p} compact />
              </div>
              <ChevronRight size={14} className="text-ink-faint group-hover:text-brand transition-colors flex-shrink-0" />
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
        <div className="bg-panel border border-amber-500/30 rounded-lg p-5">
          <h3 className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
            <FileText size={14} /> חוזים דורשים חידוש · {contractsExpiring.length} שחקנים
          </h3>
          <div className="space-y-2">
            {contractsExpiring.map(p => {
              const d = calcDaysLeft(p.contract_end_date);
              const expired = d < 0;
              return (
                <div key={p.id} className="flex items-center justify-between bg-surface border border-hairline rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${expired ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <span className="text-ink font-bold text-sm">{p.full_name}</span>
                    <span className="text-ink-muted text-xs">{p.position}</span>
                  </div>
                  <div className="text-xs text-left">
                    <div className="text-ink-muted">חוזה עד {p.contract_end_date}</div>
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
      <h3 className="text-ink font-black text-base mb-1">תור פעולות — {pending.length} ממתינות</h3>
      {pending.length === 0 && <div className="text-center py-10 text-ink-faint text-sm">🎉 אין בקשות פתוחות</div>}
      {pending.map(req => (
        <div key={req.id} className="bg-panel border border-hairline rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-ink font-bold text-sm">{req.subject}</span>
                {req.priority === 'קריטי' && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">קריטי</span>}
              </div>
              <div className="text-ink-muted text-xs mb-1">{req.player_name} · {req.category}</div>
              <p className="text-ink-muted text-xs leading-relaxed mb-2">{req.details}</p>
              {CAT_ROUTE[req.category] && (
                <div className="text-brand text-[10px] bg-brand-soft border border-brand-line rounded px-2 py-1 inline-block">
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
          <h4 className="text-ink-faint text-xs mb-2">היסטוריה ({done.length})</h4>
          {done.slice(0, 5).map(req => (
            <div key={req.id} className="flex items-center gap-3 py-2 border-b border-hairline text-xs">
              <span className={req.status === 'אושר' ? 'text-green-400' : 'text-red-400'}>{req.status === 'אושר' ? '✅' : '❌'}</span>
              <span className="text-ink-muted flex-1">{req.player_name} — {req.subject}</span>
              <span className="text-ink-faint">{req.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

// ---- COMPLIANCE TAB ----
function ComplianceTab({ players, contracts = [], onTriggerPackage, onMovePlayer }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-ink font-black text-base">{t('director.complianceTitle')}</h3>
        <span className="text-ink-faint text-[10px]">{t('director.complianceSub')}</span>
      </div>
      <DirectorComplianceMatrix
        players={players}
        contracts={contracts}
        viewerRole="director"
        onTriggerPackage={onTriggerPackage}
        onMovePlayer={onMovePlayer}
      />
    </div>
  );
}