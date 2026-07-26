/**
 * CoachRosterContractsView — תצוגת סגל עם סטטוס חוזים
 * מציג שחקנים עם חוזה חתום / ממתין לחתימה / ללא חוזה / פג תוקף
 * עם סינון לפי קבוצת גיל וסטטוס ליגה.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, FileSignature, Clock, AlertCircle, CheckCircle2, Baby, User, ShieldCheck } from 'lucide-react';

function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

function contractState(player, contracts) {
  const mine = contracts.filter(c => c.player_id === player.id);
  if (mine.length === 0) return { status: 'none', label: 'ללא חוזה', cls: 'text-white/40 bg-white/5 border-white/15', icon: AlertCircle };

  const pending = mine.filter(c => c.status === 'ממתין לחתימה');
  if (pending.length > 0) {
    const p = pending[0];
    return {
      status: 'pending',
      label: p.requires_guardian ? 'ממתין לחתימה (נוער)' : 'ממתין לחתימה',
      cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: Clock,
      contract: p,
    };
  }

  const signed = mine.filter(c => c.status === 'חתום');
  if (signed.length > 0) {
    const latest = signed.sort((a, b) => new Date(b.end_date || 0) - new Date(a.end_date || 0))[0];
    const days = daysLeft(latest.end_date);
    if (days !== null && days < 0) {
      return { status: 'expired', label: 'פג תוקף', cls: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, contract: latest };
    }
    if (days !== null && days < 30) {
      return { status: 'expiring', label: `${days} ימים לסיום`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, contract: latest };
    }
    return { status: 'signed', label: `חתום עד ${latest.end_date || '—'}`, cls: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2, contract: latest };
  }

  return { status: 'none', label: 'ללא חוזה פעיל', cls: 'text-white/40 bg-white/5 border-white/15', icon: AlertCircle };
}

const AGE_FILTERS = [
  { id: 'all', label: 'כל הגילאים' },
  { id: 'minor', label: 'נוער (קטינים)' },
  { id: 'adult', label: 'בוגרים' },
];

const LEAGUE_FILTERS = [
  { id: 'all', label: 'כל סטטוסי ליגה' },
  { id: 'ifa_ready', label: 'IFA Ready בלבד' },
  { id: 'pending', label: 'ממתינים לאימות' },
  { id: 'free_agent', label: 'שחקנים חופשיים' },
];

export default function CoachRosterContractsView({ players, onSelect }) {
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['coach-contracts-overview'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });

  const enriched = useMemo(() => players.map(p => ({ player: p, contractState: contractState(p, contracts) }))
    .filter(x => {
      if (search && !x.player.full_name?.includes(search) && !x.player.team_name?.includes(search)) return false;
      if (ageFilter === 'minor' && x.player.is_adult) return false;
      if (ageFilter === 'adult' && !x.player.is_adult) return false;
      if (leagueFilter === 'ifa_ready' && !x.player.ifa_ready) return false;
      if (leagueFilter === 'pending' && x.player.account_status !== 'ממתין לאישור') return false;
      if (leagueFilter === 'free_agent' && !x.player.is_free_agent) return false;
      return true;
    }), [players, contracts, search, ageFilter, leagueFilter]);

  // ספירות לכותרת
  const counts = useMemo(() => ({
    signed: enriched.filter(x => x.contractState.status === 'signed').length,
    pending: enriched.filter(x => x.contractState.status === 'pending').length,
    expiring: enriched.filter(x => x.contractState.status === 'expiring').length,
    expired: enriched.filter(x => x.contractState.status === 'expired').length,
    none: enriched.filter(x => x.contractState.status === 'none').length,
  }), [enriched]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-white font-black text-base flex items-center gap-2">
          <FileSignature size={16} className="text-[#D4AF37]" /> סגל — סטטוס חוזים
        </h3>
        <div className="flex gap-2 flex-wrap text-[10px] font-bold">
          <span className="bg-green-500/15 text-green-400 px-2 py-1 rounded-full border border-green-500/25">{counts.signed} ✓ חתומים</span>
          <span className="bg-blue-500/15 text-blue-400 px-2 py-1 rounded-full border border-blue-500/25">{counts.pending} ⏳ ממתינים</span>
          {counts.expiring > 0 && <span className="bg-amber-500/15 text-amber-400 px-2 py-1 rounded-full border border-amber-500/25">{counts.expiring} 🟡 מתקרבים לסיום</span>}
          {counts.expired > 0 && <span className="bg-red-500/15 text-red-400 px-2 py-1 rounded-full border border-red-500/25">{counts.expired} 🔴 פג תוקף</span>}
          <span className="bg-white/5 text-white/40 px-2 py-1 rounded-full border border-white/15">{counts.none} ללא חוזה</span>
        </div>
      </div>

      {/* סינון */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש שם / קבוצה..."
            className="w-full bg-[#1B263B] border border-white/15 rounded-lg pr-9 pl-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {AGE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setAgeFilter(f.id)}
              className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${ageFilter === f.id ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
              {(f.id === 'minor') ? <Baby size={11} /> : (f.id === 'adult') ? <User size={11} /> : null}
              {f.label}
            </button>
          ))}
        </div>
        <select value={leagueFilter} onChange={e => setLeagueFilter(e.target.value)}
          className="bg-[#1B263B] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none">
          {LEAGUE_FILTERS.map(f => <option key={f.id} value={f.id} className="bg-[#1B263B]">{f.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>
      ) : enriched.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">אין שחקנים תואמים לסינון</div>
      ) : (
        <div className="space-y-2">
          {enriched.map(({ player: p, contractState: cs }) => {
            const Icon = cs.icon;
            return (
              <button key={p.id} onClick={() => onSelect?.(p)}
                className="w-full bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-4 transition-colors text-right">
                <div className="flex-shrink-0">
                  {p.is_adult ? <User size={16} className="text-white/30" /> : <Baby size={16} className="text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    {p.full_name}
                    {p.ifa_ready && <ShieldCheck size={12} className="text-[#D4AF37]" />}
                    {p.is_free_agent && <span className="text-[9px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20">Free Agent</span>}
                  </div>
                  <div className="text-white/40 text-xs">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}</div>
                </div>
                {cs.contract && (
                  <div className="hidden md:block text-white/30 text-[10px] flex-shrink-0 text-left">
                    {cs.contract.start_date || '—'} → {cs.contract.end_date || '—'}
                  </div>
                )}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 flex items-center gap-1 ${cs.cls}`}>
                  <Icon size={11} /> {cs.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}