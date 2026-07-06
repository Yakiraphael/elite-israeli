import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: '250,000', label: 'נוער בסיכון בישראל' },
  { value: '68%', label: 'שיעור נשירה ממסגרות חינוכיות בקרב נוער בסיכון' },
  { value: '387', label: 'שעות התערבות שנתיות לכל נער בתכנית' },
  { value: '+50%', label: 'שיפור במדדי חוסן מנטלי לאחר שנת השתתפות' },
  { value: '3.4x', label: 'עלייה בסיכויי שילוב במסגרת ספורטיבית תחרותית' },
  { value: '1,020', label: 'נוער בסיכון מטופל בשנה' },
];

function Counter({ value }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    // Extract a numeric part for animation; keep non-numeric prefix/suffix
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
  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-navy" dir="rtl">
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            מדדי השפעה ותמונת מצב
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="font-display text-3xl md:text-4xl font-black text-white mt-3"
          >
            הסיכון <span className="gold-gradient">הוא אמיתי</span> — וההזדמנות גם
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative bg-white/5 border border-gold/15 rounded-lg p-6 text-center hover:border-gold/40 transition-colors"
            >
              <div className="font-display text-3xl md:text-4xl font-black text-gold leading-none">
                <Counter value={s.value} />
              </div>
              <p className="font-body text-xs md:text-sm text-white/60 mt-3 leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}