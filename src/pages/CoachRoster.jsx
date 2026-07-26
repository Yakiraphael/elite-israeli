/**
 * CoachRoster — דף ייעודי למאמן עם סגל + סטטוס חוזים.
 * סינון לפי קבוצת גיל וליגה, סימון ברור של חתום / בתהליך / ללא חוזה / פג תוקף.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Baby, User, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import RoleToolbar from '@/components/RoleToolbar';
import CoachRosterContractsView from '@/components/coach/CoachRosterContractsView';
import CoachPlayerProfileModal from '@/components/coach/CoachPlayerProfileModal';

const LOGO_URL = 'https://media.base44.com/files/public/69fafcd4c8e6ad563cb577b8/logo.png';

export default function CoachRoster() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['coach-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 100),
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ['coach-contracts-overview-page'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });

  // counting summary
  const summary = players.map(p => {
    const mine = contracts.find(c => c.player_id === p.id && c.status === 'חתום');
    const pending = contracts.find(c => c.player_id === p.id && c.status === 'ממתין לחתימה');
    let state = 'none';
    if (mine) {
      const days = mine.end_date ? Math.ceil((new Date(mine.end_date) - new Date()) / 86400000) : null;
      if (days !== null && days < 0) state = 'expired';
      else if (days !== null && days < 30) state = 'expiring';
      else state = 'signed';
    } else if (pending) {
      state = 'pending';
    }
    return { p, state };
  });

  const counts = {
    signed: summary.filter(s => s.state === 'signed').length,
    pending: summary.filter(s => s.state === 'pending').length,
    expiring: summary.filter(s => s.state === 'expiring').length,
    expired: summary.filter(s => s.state === 'expired').length,
    none: summary.filter(s => s.state === 'none').length,
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <RoleToolbar activeLabel="סגל וחוזים" activeIcon={FileText} />

      <div className="pt-24 pb-12 border-b border-white/10 bg-[#1B263B]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_URL} alt="" className="h-10 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div>
              <h1 className="text-white font-black text-xl">הסגל שלי — סטטוס חוזים</h1>
              <p className="text-white/40 text-xs mt-0.5">ראייה ברורה: מי חתום, מי בתהליך, מי ללא חוזה. סינון לפי גיל וליגה.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiTile label="חתומים" value={counts.signed} color="green" Icon={CheckCircle2} />
            <KpiTile label="בתהליך חוזה" value={counts.pending} color="blue" Icon={Clock} />
            <KpiTile label="מתקרבים לסיום" value={counts.expiring} color="amber" Icon={Clock} />
            <KpiTile label="פג תוקף" value={counts.expired} color="red" Icon={AlertCircle} />
            <KpiTile label="ללא חוזה" value={counts.none} color="slate" Icon={AlertCircle} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>
        ) : (
          <CoachRosterContractsView players={players} onSelect={setSelectedPlayer} />
        )}
      </div>

      {selectedPlayer && (
        <CoachPlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

function KpiTile({ label, value, color, Icon }) {
  const colors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/25',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    red: 'text-red-400 bg-red-500/10 border-red-500/25',
    slate: 'text-white/50 bg-white/5 border-white/15',
  };
  return (
    <div className={`rounded-lg p-3 border ${colors[color]} flex items-center gap-2.5`}>
      <Icon size={18} className="opacity-80" />
      <div>
        <div className="text-xl font-black leading-none">{value}</div>
        <div className="text-[10px] font-bold opacity-70 mt-0.5">{label}</div>
      </div>
    </div>
  );
}