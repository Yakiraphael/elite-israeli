import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import EliteIdCard from '../EliteIdCard';
import { buildRatingBreakdown } from '@/lib/playerRating';

const STALE_MS = 24 * 60 * 60 * 1000;

export default function DynamicPlayerCard({ player }) {
  const [expanded, setExpanded] = useState(false);
  const [tmData, setTmData] = useState(player.transfermarkt_data || null);

  useEffect(() => {
    const isStale = !player.transfermarkt_last_checked || (Date.now() - new Date(player.transfermarkt_last_checked).getTime()) > STALE_MS;
    if (isStale && player.transfermarkt_url) {
      base44.functions.invoke('transfermarktSync', { playerId: player.id })
        .then(res => { if (res.data?.player?.transfermarkt_data) setTmData(res.data.player.transfermarkt_data); })
        .catch(() => {});
    }
  }, [player.id]);

  const { overall, factors } = buildRatingBreakdown(player, tmData);
  const age = player.birth_date ? (new Date().getFullYear() - new Date(player.birth_date).getFullYear()) : undefined;

  return (
    <div>
      <EliteIdCard
        name={player.full_name}
        eliteId={player.elite_id || 'ELITE-2026-----'}
        position={player.position}
        stats={player.stats || {}}
        avatarUrl={player.avatar_url}
        rating={overall}
        age={age}
        city={player.city}
      />

      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-center gap-1.5 mt-3 text-[#D4AF37] text-xs font-bold hover:text-amber-300 transition-colors">
        <Sparkles size={12} /> למה ניתן ציון {overall ?? '--'}?
        <motion.span animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={12} /></motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-3">
              <p className="text-white/40 text-[10px]">הציון מבוסס אך ורק על נתונים קיימים בתיק השחקן ובפרופיל Transfermarkt המאומת — ללא הערכות שרירותיות.</p>
              {factors.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-3 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white text-xs font-bold">{f.label}</div>
                    <div className="text-white/50 text-[10px] mt-0.5 leading-relaxed">{f.reason}</div>
                  </div>
                  <span className={`text-xs font-black flex-shrink-0 ${f.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{f.points > 0 ? '+' : ''}{f.points}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}