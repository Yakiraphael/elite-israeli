import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import EliteIdCard, { STAT_KEYS, computeOverall } from '../EliteIdCard';
import { X, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function EliteIdEditorModal({ player, onClose }) {
  const [eliteId, setEliteId] = useState(player.elite_id || '');
  const [stats, setStats] = useState(() => ({
    pac: 50, sho: 50, pas: 50, dri: 50, def: 50, phy: 50, mental: 50,
    ...(player.stats || {}),
  }));

  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-players'] });
      onClose();
    },
  });

  const overall = computeOverall(stats);
  const setStat = (key, val) => setStats(prev => ({ ...prev, [key]: Number(val) }));
  const autoId = () => setEliteId(`ELITE-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`);

  const handleSave = () => {
    save.mutate({ elite_id: eliteId, stats, overall_rating: overall });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#1B263B] z-10">
          <div>
            <div className="text-[#D4AF37] text-xs font-bold tracking-wide uppercase">עריכת כרטיס Elite ID</div>
            <h3 className="text-white font-black text-lg mt-0.5">{player.full_name}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Live preview */}
          <div className="flex flex-col items-center">
            <EliteIdCard
              name={player.full_name}
              eliteId={eliteId || 'ELITE-2026-----'}
              position={player.position}
              stats={stats}
              rating={overall}
              avatarUrl={player.avatar_url}
              age={player.birth_date ? (new Date().getFullYear() - new Date(player.birth_date).getFullYear()) : undefined}
              city={player.city}
            />
            <div className="mt-4 w-full">
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">Elite ID</label>
              <div className="flex gap-2">
                <input
                  value={eliteId} onChange={e => setEliteId(e.target.value)} dir="ltr"
                  placeholder="ELITE-2026-0042"
                  className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
                <button onClick={autoId} className="text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm px-3 hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-1">
                  <RotateCcw size={12} /> חישוב
                </button>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-bold">נתוני ביצועים</span>
              <span className="text-white/40 text-xs">ציון כולל: <span className="text-[#D4AF37] font-black text-base">{overall}</span></span>
            </div>
            <div className="space-y-4">
              {STAT_KEYS.map(s => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white/70">
                      {s.label} <span className="text-white/30 font-normal">— {s.he}</span>
                    </span>
                    <span className="text-sm font-black text-[#D4AF37] tabular-nums w-8 text-left">{stats[s.key]}</span>
                  </div>
                  <input
                    type="range" min={0} max={99} value={stats[s.key]}
                    onChange={e => setStat(s.key, e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave} disabled={save.isPending}
              className="w-full mt-6 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {save.isPending ? <><Loader2 size={15} className="animate-spin" />שומר...</> : <><CheckCircle2 size={15} />שמור כרטיס Elite ID</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}