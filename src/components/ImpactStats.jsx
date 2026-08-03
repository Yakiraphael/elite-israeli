import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

function Counter({ value }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const match = value.match(/([^\d]*)([\d,.]+)(.*)/);
    if (!match) { setShown(value); return; }
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ''));
    if (isNaN(target)) { setShown(value); return; }
    const node = ref.current;
    if (!node) { setShown(value); return; }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = Math.round(target * eased);
          setShown(`${prefix}${cur.toLocaleString('en-US')}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
          else setShown(value);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [value]);

  return <span ref={ref}>{shown}</span>;
}

export default function ImpactStats() {
  const s = useHomeStrings();
  const STATS = s.stats.stats;

  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-navy">
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.stats.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="font-display text-3xl md:text-4xl font-black text-white mt-3">
            {s.stats.title1} <span className="gold-gradient">{s.stats.title2}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {STATS.map((st, i) => (
            <motion.div key={st.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative bg-white/5 border border-gold/15 rounded-lg p-6 text-center hover:border-gold/40 transition-colors">
              <div className="font-display text-3xl md:text-4xl font-black text-gold leading-none">
                <Counter value={st.value} />
              </div>
              <p className="font-body text-xs md:text-sm text-white/60 mt-3 leading-snug">{st.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}