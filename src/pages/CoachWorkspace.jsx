import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Users, ClipboardList, AlertTriangle, CheckCircle2, Clock, X,
  Search, Calendar, Activity, Shield, FileText, Loader2,
  ChevronRight, ChevronDown, AlertCircle, TrendingUp, Lock
} from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

function calcDaysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getMedicalStatus(player) {
  if (!player.medical_certificate_url) return { label: 'חסר', color: 'red', days: null };
  const days = calcDaysLeft(player.medical_expiry_date);
  if (days === null) return { label: 'תקין', color: 'green', days: null };
  if (days < 0) return { label: 'פג תוקף', color: 'red', days };
  if (days < 30) return { label: `${days} ימים`, color: 'yellow', days };
  return { label: 'תקין', color: 'green', days };
}

const STATUS_BADGE = {
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CoachWorkspace() {
  const [tab, setTab] = useState('squad');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['coach-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 100),
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['coach-requests'],
    queryFn: () => base44.entities.PlayerRequest.filter({ status: 'נשלח' }, '-created_date', 50),
  });

  const filtered = players.filter(p =>
    !search || p.full_name?.includes(search) || p.team_name?.includes(search)
  );

  // KPI computed
  const medicalIssues = players.filter(p => getMedicalStatus(p).color === 'red').length;
  const medicalWarnings = players.filter(p => getMedicalStatus(p).color === 'yellow').length;
  const ifaReady = players.filter(p => p.ifa_ready).length;
  const pendingRequests = requests.length;

  const tabs = [
    { id: 'squad', label: 'Squad Health', icon: Shield },
    { id: 'requests', label: 'בקשות שחקנים', icon: ClipboardList, badge: pendingRequests },
    { id: 'compliance', label: 'Compliance', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-0 border-b border-white/10 bg-[#1B263B]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_URL} alt="" className="h-9" />
            <div>
              <h1 className="text-white font-black text-xl">Coach Workspace</h1>
              <p className="text-white/40 text-xs">מרחב עבודה מאמן — מצב בריאות הסגל</p>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <KpiCard label="שחקנים פעילים" value={players.length} color="blue" icon={Users} />
            <KpiCard label="בעיות רפואיות" value={medicalIssues} color="red" icon={AlertTriangle} urgent={medicalIssues > 0} />
            <KpiCard label="בקשות פתוחות" value={pendingRequests} color="amber" icon={ClipboardList} urgent={pendingRequests > 0} />
            <KpiCard label="IFA Ready" value={`${ifaReady}/${players.length}`} color="green" icon={CheckCircle2} />
          </div>

          {/* Search */}
          <div className="relative pb-1">
            <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש שחקן..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg pr-10 pl-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-0 border-t border-white/10">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
              <t.icon size={13} /> {t.label}
              {t.badge > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'squad' && <SquadView players={filtered} loading={loadingPlayers} onSelect={setSelectedPlayer} />}
        {tab === 'requests' && <RequestsView />}
        {tab === 'compliance' && <ComplianceMatrix players={filtered} />}
      </div>

      {selectedPlayer && (
        <PlayerQuickView player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      <Footer />
    </div>
  );
}

function KpiCard({ label, value, color, icon: Icon, urgent }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
  };
  return (
    <div className={`rounded-lg p-4 border ${urgent ? 'animate-pulse' : ''} ${colors[color].split(' ').slice(1).join(' ')} border-white/10 bg-[#1B263B]`}>
      <Icon size={16} className={`mb-2 ${colors[color].split(' ')[0]}`} />
      <div className={`font-black text-2xl ${colors[color].split(' ')[0]}`}>{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function SquadView({ players, loading, onSelect }) {
  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;
  return (
    <div className="space-y-2">
      {players.length === 0 && <div className="text-center py-12 text-white/30 text-sm">אין שחקנים</div>}
      {players.map(p => {
        const med = getMedicalStatus(p);
        return (
          <button key={p.id} onClick={() => onSelect(p)}
            className="w-full bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-4 transition-all text-right group">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
              <Users size={14} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">{p.full_name}</div>
              <div className="text-white/40 text-xs">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[med.color]}`}>
                🏥 {med.label}
              </span>
              {p.ifa_ready && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">IFA ✓</span>}
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

function ComplianceMatrix({ players }) {
  return (
    <div>
      <h3 className="text-white font-black text-base mb-4">מטריצת תקינות — Compliance Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {['שם שחקן', 'סטטוס רפואי', 'IFA Ready', 'מסמכים', 'פעולה מהירה'].map(h => (
                <th key={h} className="text-white/40 font-bold py-3 px-3 text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map(p => {
              const med = getMedicalStatus(p);
              const missingDocs = [];
              if (!p.id_document_url) missingDocs.push('ת.ז');
              if (!p.is_adult && !p.id_suffix_url) missingDocs.push('ספח');
              if (!p.medical_certificate_url) missingDocs.push('רפואי');
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-white font-bold">{p.full_name}</div>
                    <div className="text-white/30">{p.position}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[med.color]}`}>
                      {med.color === 'red' ? '🔴' : med.color === 'yellow' ? '🟡' : '🟢'} {med.label}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold ${p.ifa_ready ? 'text-green-400' : 'text-red-400'}`}>
                      {p.ifa_ready ? '✓ מוכן' : '✗ חסר'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {missingDocs.length === 0
                      ? <span className="text-green-400 text-[10px]">✓ שלם</span>
                      : <span className="text-red-400 text-[10px]">חסר: {missingDocs.join(', ')}</span>
                    }
                  </td>
                  <td className="py-3 px-3">
                    {(med.color === 'red' || missingDocs.length > 0) && (
                      <button className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors">
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

function RequestsView() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['all-requests'],
    queryFn: () => base44.entities.PlayerRequest.list('-created_date', 50),
  });

  const update = useMutation({
    mutationFn: ({ id, status, manager_notes }) => base44.entities.PlayerRequest.update(id, { status, manager_notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-requests', 'coach-requests'] }),
  });

  const STATUS_COLORS = {
    'נשלח': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'בטיפול': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'אושר': 'bg-green-500/20 text-green-400 border-green-500/30',
    'נדחה': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const STATUS_ICONS = { 'נשלח': '⏳', 'בטיפול': '👁️', 'אושר': '✅', 'נדחה': '❌' };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="space-y-3">
      {requests.length === 0 && <div className="text-center py-12 text-white/30 text-sm">אין בקשות פתוחות</div>}
      {requests.map(req => (
        <RequestCard key={req.id} req={req} statusColors={STATUS_COLORS} statusIcons={STATUS_ICONS}
          onApprove={() => update.mutate({ id: req.id, status: 'אושר' })}
          onDeny={() => update.mutate({ id: req.id, status: 'נדחה' })}
          onRead={() => req.status === 'נשלח' && update.mutate({ id: req.id, status: 'בטיפול' })}
        />
      ))}
    </div>
  );
}

function RequestCard({ req, statusColors, statusIcons, onApprove, onDeny, onRead }) {
  const [expanded, setExpanded] = useState(false);
  const CATEGORY_ICONS = { 'חופשה/היעדרות': '🏖️', 'פגישה מקצועית': '🤝', 'בקשת מסמך': '📄', 'פציעה/בריאות': '🏥', 'שינוי עמדה': '⚽', 'בקשת ציוד': '👕', 'סיוע לוגיסטי': '🚗', 'אחר': '💬' };

  return (
    <motion.div layout className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
      <button onClick={() => { setExpanded(e => !e); onRead(); }} className="w-full p-4 text-right flex items-center gap-3">
        <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[req.category] || '💬'}</span>
        <div className="flex-1">
          <div className="text-white font-bold text-sm">{req.subject}</div>
          <div className="text-white/40 text-xs">{req.player_name} · {req.category}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[req.status]}`}>
          {statusIcons[req.status]} {req.status}
        </span>
        {expanded ? <ChevronDown size={14} className="text-white/30 flex-shrink-0" /> : <ChevronRight size={14} className="text-white/30 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
            <p className="text-white/60 text-xs leading-relaxed">{req.details}</p>
            {req.requested_date && <p className="text-white/30 text-xs">📅 תאריך מבוקש: {req.requested_date}</p>}
            {req.attachment_url && (
              <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-xs hover:text-amber-300 flex items-center gap-1">
                <FileText size={12} /> צפה בקובץ מצורף
              </a>
            )}
            {req.status !== 'אושר' && req.status !== 'נדחה' && (
              <div className="flex gap-2">
                <button onClick={onApprove} className="flex-1 bg-green-500/20 text-green-400 text-xs font-bold py-2 rounded-sm hover:bg-green-500/30 border border-green-500/20 transition-colors">✅ אשר</button>
                <button onClick={onDeny} className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-sm hover:bg-red-500/30 border border-red-500/20 transition-colors">❌ דחה</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlayerQuickView({ player, onClose }) {
  const med = getMedicalStatus(player);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-base">{player.full_name}</h3>
            <p className="text-[#D4AF37] text-xs">{player.position}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="space-y-2 text-xs">
          {[
            ['📱 טלפון', player.phone],
            ['📍 עיר', player.city],
            ['⚽ קבוצה', player.team_name],
            ['📏 גובה', player.height_cm ? `${player.height_cm}ס״מ` : null],
            ['IFA Ready', player.ifa_ready ? '✅ כן' : '❌ לא'],
          ].filter(([, v]) => v).map(([l, v]) => (
            <div key={l} className="flex justify-between bg-[#0D1B2A] rounded p-2">
              <span className="text-white/40">{l}</span>
              <span className="text-white font-semibold">{v}</span>
            </div>
          ))}
          <div className="flex justify-between bg-[#0D1B2A] rounded p-2">
            <span className="text-white/40">🏥 רפואי</span>
            <span className={`font-bold ${med.color === 'green' ? 'text-green-400' : med.color === 'yellow' ? 'text-amber-400' : 'text-red-400'}`}>
              {med.label}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}