import { motion } from 'framer-motion';
import { HeartHandshake, TrendingUp, Fingerprint, Workflow, LineChart, Rocket } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

const PILLAR_ICONS = [Fingerprint, Workflow, LineChart, Rocket];

export default function ROISection() {
  const s = useHomeStrings();

  return (
    <section id="roi" className="py-24 md:py-28 relative overflow-hidden bg-navy">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.roi.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            {s.roi.title1} <span className="gold-gradient">{s.roi.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-white/50 max-w-3xl mx-auto leading-relaxed">{s.roi.intro}</motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {s.roi.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i] || Fingerprint;
            return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-lg p-6 border border-white/10 bg-[#1B263B] hover:border-gold/40 transition-all">
                <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gold" />
                </div>
                <h3 className="font-display text-base font-black text-white mb-2">{p.title}</h3>
                <p className="font-body text-xs text-white/50 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-lg p-8 border border-gold/20 bg-gradient-to-br from-[#1B263B] to-navy">
            <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
              <HeartHandshake size={20} className="text-gold" />
            </div>
            <h3 className="font-display text-lg font-black text-white mb-2">{s.roi.socialTitle}</h3>
            <p className="font-body text-sm text-white/50 leading-relaxed">{s.roi.socialDesc}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="rounded-lg p-8 border border-gold/20 bg-gradient-to-br from-[#1B263B] to-navy">
            <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center mb-4">
              <TrendingUp size={20} className="text-gold" />
            </div>
            <h3 className="font-display text-lg font-black text-white mb-2">{s.roi.financialTitle}</h3>
            <p className="font-body text-sm text-white/50 leading-relaxed">{s.roi.financialDesc}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}