import { motion } from 'framer-motion';
import { Home, Trophy, Users, Star, TrendingUp, MapPin, Handshake, Flame, Target, Award } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

const GOAL_ICONS = [Home, MapPin, Star, Trophy, TrendingUp, Users, Flame, Handshake, Target, Award];

export default function GoalsSection() {
  const s = useHomeStrings();

  return (
    <section id="goals" className="py-28 md:py-36 relative overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.goals.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6">
            <span className="gold-gradient">{s.goals.title}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-8" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">{s.goals.intro}</motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {s.goals.items.map((goal, i) => {
            const Icon = GOAL_ICONS[i] || Target;
            return (
              <motion.div key={goal.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}
                className="group pillar-card card-hover rounded-sm p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-amber-50 border border-gold/25 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <span className="font-body text-xs font-bold text-gold/80 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-display text-base font-black text-navy mb-0.5">{goal.title}</h3>
                    <span className="font-body text-xs text-gold/60 font-semibold">{goal.subtitle}</span>
                    <p className="font-body text-xs text-slate-500 mt-3 leading-relaxed">{goal.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}