import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import EliteIdCard, { computeOverall } from '../EliteIdCard';
import FootballBalls from '../player/FootballBalls';
import TierBadge from '../player/TierBadge';
import { EVALUATION_CATEGORIES, scoreToTier } from '@/lib/evaluationEngine';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { X, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function EliteIdEditorModal({ player, onClose }) {
  const { lang } = useTranslation();
  const strings = getEvaluationStrings(lang);
  const [eliteId, setEliteId] = useState(player.elite_id || '');
  const [categories, setCategories] = useState(() => ({
    technique: 3, game_intelligence: 3, physicality: 3, decision_making: 3, mentality: 3,
    ...(player.categories || {}),
  }));

  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-players'] });
      onClose();
    },
  });

  const overall = computeOverall(categories);
  const tier = scoreToTier(overall);
  const setCategory = (key, val) => setCategories(prev => ({ ...prev, [key]: Number(val) }));
  const autoId = () => setEliteId(`ELITE-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`);

  const handleSave = () => {
    save.mutate({ elite_id: eliteId, categories, overall_rating: overall });
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
              categories={categories}
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

          {/* Sliders — 5 categories (1-5) with FootballBalls */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-bold">נתוני הערכה</span>
              <div className="flex items-center gap-2">
                <TierBadge tier={tier} size="sm" strings={strings} />
                <FootballBalls score={overall} size={16} />
              </div>
            </div>
            <div className="space-y-4">
              {EVALUATION_CATEGORIES.map(cat => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white/70">{strings.categories[cat]}</span>
                    <FootballBalls score={categories[cat] || 0} size={14} />
                  </div>
                  <input
                    type="range" min={1} max={5} step={1} value={categories[cat] || 1}
                    onChange={e => setCategory(cat, e.target.value)}
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