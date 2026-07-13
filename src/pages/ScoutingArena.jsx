import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import RoleToolbar from '../components/RoleToolbar';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';
import MentalJourneyChart from '../components/player/MentalJourneyChart';
import SquadManagementPanel from '../components/squad/SquadManagementPanel';
import DetailedOfferModal from '../components/scouting/DetailedOfferModal';
import {
  Search, Filter, Star, MapPin, Baby, Building2, ChevronRight, Lock,
  Heart, X, Send, BarChart3, Globe, Loader2, CheckCircle2, Zap, Shield, Users, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];
const CURRENCY_SYMBOLS = { ILS: '₪', EUR: '€', USD: '$', GBP: '£' };

export default function ScoutingArena() {
  const [tab, setTab] = useState('discover');
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [freeAgentOnly, setFreeAgentOnly] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showOffer, setShowOffer] = useState(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['scouting-players', posFilter, freeAgentOnly],
    queryFn: () => {
      const filter = {};
      if (posFilter) filter.position = posFilter;
      if (freeAgentOnly) filter.is_free_agent = true;
      return base44.entities.PlayerRegistration.filter(filter, '-created_date', 50);
    },
  });

  const filtered = players.filter(p =>
    !search || p.full_name?.includes(search) || p.team_name?.includes(search) || p.city?.includes(search)
  );

  const toggleCompare = (player) => {
    setCompareList(prev =>
      prev.find(p => p.id === player.id)
        ? prev.filter(p => p.id !== player.id)
        : prev.length < 2 ? [...prev, player] : prev
    );
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <RoleToolbar activeLabel="דשבורד סקאוטינג" activeIcon={Search} />

      {/* Header */}
      <section className="pt-10 pb-10 px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">IEFA Scouting Arena</span>
            <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-2">{tab === 'discover' ? 'חיפוש שחקנים' : 'ניהול סגל'}</h1>
            <p className="text-white/40 text-sm">
              {tab === 'discover' ? 'כרטיסי שחקן ויזואליים · גרף מנטלי · הצעה מהירה בלחיצה' : 'רשימת הסגל ומבנה עמדות'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button onClick={() => setTab('discover')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors border ${tab === 'discover' ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D1B2A]' : 'border-white/15 text-white/60 hover:border-white/30'}`}>
              <Search size={14} /> חיפוש שחקנים
            </button>
            <button onClick={() => setTab('squad')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors border ${tab === 'squad' ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D1B2A]' : 'border-white/15 text-white/60 hover:border-white/30'}`}>
              <Users size={14} /> ניהול סגל
            </button>
          </div>

          {/* Search + Filters */}
          {tab === 'discover' && (
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="חיפוש לפי שם, קבוצה, עיר..."
                  className="w-full bg-[#1B263B] border border-white/15 rounded-lg pr-10 pl-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
              </div>
              <select
                value={posFilter}
                onChange={e => setPosFilter(e.target.value)}
                className="bg-[#1B263B] border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none"
              >
                <option value="">כל העמדות</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button
                onClick={() => setFreeAgentOnly(f => !f)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-colors border ${freeAgentOnly ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-white/15 text-white/60 hover:border-white/30'}`}
              >
                <Zap size={14} /> Free Agent בלבד
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'squad' && (
          <SquadManagementPanel players={players} onSelect={setSelectedPlayer} />
        )}

        {tab === 'discover' && (
          <>
            {/* Compare bar */}
            {compareList.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-sm">השוואת שחקנים:</span>
                  {compareList.map(p => (
                    <span key={p.id} className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full">{p.full_name}</span>
                  ))}
                </div>
                {compareList.length === 2 && (
                  <button onClick={() => setSelectedPlayer({ compare: compareList })} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors">
                    השווה עכשיו
                  </button>
                )}
              </motion.div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
              </div>
            ) : (
              <>
                <p className="text-white/30 text-xs mb-4">{filtered.length} שחקנים נמצאו</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map(player => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onView={() => setSelectedPlayer(player)}
                      onOffer={() => setShowOffer(player)}
                      onCompare={() => toggleCompare(player)}
                      inCompare={!!compareList.find(p => p.id === player.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Player detail modal */}
      {selectedPlayer && !selectedPlayer.compare && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} onOffer={() => { setShowOffer(selectedPlayer); setSelectedPlayer(null); }} />
      )}

      {/* Compare modal */}
      {selectedPlayer?.compare && (
        <CompareModal players={selectedPlayer.compare} onClose={() => setSelectedPlayer(null)} />
      )}

      {/* Offer modal */}
      {showOffer && (
        <DetailedOfferModal player={showOffer} onClose={() => setShowOffer(null)} />
      )}

      <Footer />
      <SocialFloat />
    </div>
  );
}

function PlayerCard({ player, onView, onOffer, onCompare, inCompare }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg overflow-hidden transition-all group"
    >
      {/* Card top */}
      <div className="relative bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/50 flex items-center justify-center mx-auto mb-2">
          {player.is_adult ? <Star size={24} className="text-[#D4AF37]" /> : <Baby size={24} className="text-[#D4AF37]" />}
        </div>
        <div className="text-white font-black text-sm truncate">{player.full_name}</div>
        <div className="text-[#D4AF37] text-xs mt-0.5">{player.position}</div>
        <div className="flex justify-center gap-1 mt-2">
          {player.is_free_agent && (
            <span className="bg-green-500/20 text-green-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">Free Agent</span>
          )}
          {player.ifa_ready && (
            <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">IFA Ready</span>
          )}
        </div>
      </div>

      {/* Card stats */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'גובה', value: player.height_cm ? `${player.height_cm}` : '—' },
            { label: 'רגל', value: player.dominant_foot?.slice(0, 3) || '—' },
            { label: 'ניסיון', value: player.experience_years ? `${player.experience_years}y` : '—' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-white font-black text-xs">{s.value}</div>
              <div className="text-white/30 text-[9px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-1.5">
        <button onClick={onView} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-sm transition-colors">
          פרופיל
        </button>
        <button
          onClick={onCompare}
          className={`px-2 py-2 rounded-sm text-xs transition-colors ${inCompare ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
          title="השווה"
        >
          <BarChart3 size={12} />
        </button>
        <button onClick={onOffer} className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs py-2 rounded-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-1">
          <Send size={10} /> הצע
        </button>
      </div>
    </motion.div>
  );
}

function PlayerDetailModal({ player, onClose, onOffer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-black text-base">{player.full_name}</h3>
          <div className="flex items-center gap-3">
            <Link to={`/player-profile?id=${player.id}`} title="עבור לפרופיל השחקן המלא"
              className="flex items-center gap-1.5 text-[#D4AF37] hover:text-amber-300 text-xs font-bold transition-colors">
              <ExternalLink size={13} /> לפרופיל המלא
            </Link>
            <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { l: '⚽ עמדה', v: player.position },
              { l: '📍 עיר', v: player.city },
              { l: '📏 גובה', v: player.height_cm ? `${player.height_cm} ס״מ` : null },
              { l: '⚖️ משקל', v: player.weight_kg ? `${player.weight_kg} ק״ג` : null },
              { l: '👟 רגל', v: player.dominant_foot },
              { l: '📅 ניסיון', v: player.experience_years ? `${player.experience_years} שנ׳` : null },
            ].filter(i => i.v).map(i => (
              <div key={i.l} className="flex justify-between bg-[#0D1B2A] rounded p-2">
                <span className="text-white/40">{i.l}</span>
                <span className="text-white font-bold">{i.v}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
            <MentalJourneyChart playerId={player.id} isEliteOrg={!!player.elite_id} isPro={false} />
          </div>

          <button
            onClick={onOffer}
            className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} /> הגש הצעת חוזה
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompareModal({ players, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-black text-base">השוואת שחקנים</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {players.map(p => (
              <div key={p.id} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <div className="text-white font-black text-sm mb-1">{p.full_name}</div>
                <div className="text-[#D4AF37] text-xs mb-3">{p.position}</div>
                <div className="space-y-2 text-xs">
                  {[
                    ['גובה', p.height_cm ? `${p.height_cm}ס״מ` : '—'],
                    ['ניסיון', p.experience_years ? `${p.experience_years}y` : '—'],
                    ['רגל', p.dominant_foot || '—'],
                    ['IFA Ready', p.ifa_ready ? '✓' : '✗'],
                    ['Free Agent', p.is_free_agent ? '✓ חופשי' : '✗ תחת חוזה'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-white/40">{l}</span>
                      <span className="text-white font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}