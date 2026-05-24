import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const BG_IMAGES = [
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/f76cf2c20_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/c86a77f00_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/a12a41045_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/ab8bc775c_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/6301d5613_generated_image.png',
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" dir="rtl">
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={current}
            src={BG_IMAGES[current]}
            alt="עילית ישראלית"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        {/* Carousel dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {BG_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold w-6' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-1/4 left-8 md:left-16 w-48 h-48 border border-gold/15 rotate-45 float-animation" />
      <div className="absolute bottom-1/4 right-8 md:right-16 w-24 h-24 border border-gold/10 rotate-12 float-animation" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <img
            src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png"
            alt="עילית ישראלית"
            className="h-36 md:h-52 w-auto mx-auto drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-5 flex flex-col items-center gap-2"
        >
          <span className="font-body text-xs tracking-[0.35em] text-gold font-bold uppercase">
            חברה לטובת הציבור · שנת ייסוד 2025
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
        >
          מסגרת חינוכית-טיפולית
          <br />
          <span className="gold-gradient">לפיתוח מנהיגות הנוער</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-body text-base md:text-lg text-cream/75 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          עילית ישראלית מתמחה בהובלת תהליכי פיתוח אישי, חוסן מנטלי ומצוינות אופרטיבית
          לנוער בפריפריה — דרך שילוב ייחודי של ספורט, חינוך ויזמות.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-body font-bold text-sm bg-gold text-white px-10 py-4 rounded-sm hover:bg-gold-light transition-all duration-300 tracking-wide shadow-lg shadow-gold/30"
          >
            החזון והמשימה
          </button>
          <button
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-body font-bold text-sm border border-gold/50 text-gold px-10 py-4 rounded-sm hover:bg-gold/10 transition-all duration-300 tracking-wide"
          >
            שיתוף פעולה אסטרטגי
          </button>
        </motion.div>
      </div>

      <button
        onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/60 hover:text-gold transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}