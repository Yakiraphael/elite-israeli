import { useState } from 'react';
import { motion } from 'framer-motion';
import EliteIdCard, { computeOverall } from './EliteIdCard';
import FootballBalls from './player/FootballBalls';
import TierBadge from './player/TierBadge';
import { scoreToTier } from '@/lib/evaluationEngine';
import { Sliders } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

export default function EliteIdShowcase() {
  const s = useHomeStrings();
  const DEMO = {
    name: s.eliteId.demoName, eliteId: 'ELITE-2026-0042', position: s.eliteId.demoPos, age: 16,
    avatarUrl: 'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/e80f625a1_generated_image.png',
    stats: { technique: 4, game_intelligence: 4, physicality: 3, decision_making: 5, mentality: 5 },
  };
  const [stats, setStats] = useState({ ...DEMO.stats });
  const setStat = (key, val) => setStats(prev => ({ ...prev, [key]: Number(val) }));
  const reset = () => setStats({ ...DEMO.stats });
  const overall = computeOverall(stats);
  const tier = scoreToTier(overall ?? 0);

  // Localized category labels → { key: label }
  const categoryLabels = (s.eliteId.evalCategories || []).reduce((acc, cat) => {
    acc[cat.key] = cat.label;
    return acc;
  }, {});

  return (
    <section className="py-24 md:py-28 relative overflow-hidden bg-slate-100">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.eliteId.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-4">
            {s.eliteId.title1} <span className="gold-gradient">{s.eliteId.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">{s.eliteId.intro}</motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex flex-col items-center">
            <EliteIdCard
              name={DEMO.name}
              eliteId={DEMO.eliteId}
              position={DEMO.position}
              stats={stats}
              rating={overall}
              age={DEMO.age}
              avatarUrl={DEMO.avatarUrl}
              categoryLabels={categoryLabels}
            />
            <div className="mt-5 text-center">
              <div className="text-xs text-slate-400">{s.eliteId.liveHint}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-black text-navy flex items-center gap-2">
                <Sliders size={18} className="text-gold" /> {s.eliteId.panelTitle}
              </h3>
              <button onClick={reset} className="text-xs font-bold text-gold hover:text-gold-dark transition-colors">{s.eliteId.reset}</button>
            </div>
            <div className="space-y-5">
              {(s.eliteId.evalCategories || []).map(cat => (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body text-xs font-bold text-navy">{cat.label}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={stats[cat.key] ?? 1}
                    onChange={e => setStat(cat.key, e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="mt-2 flex justify-center">
                    <FootballBalls score={stats[cat.key] ?? 0} size={20} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="font-body text-sm font-bold text-navy">{s.eliteId.overallLabel}</span>
              <div className="flex items-center gap-3">
                <FootballBalls score={overall ?? 0} size={20} />
                <TierBadge tier={tier} size="lg" />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">{s.eliteId.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}