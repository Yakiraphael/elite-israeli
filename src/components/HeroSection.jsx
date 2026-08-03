import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';
import SecurityBadge from './SecurityBadge';

const LOGO = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const BG_IMAGES = [
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/f76cf2c20_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/c86a77f00_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/a12a41045_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/ab8bc775c_generated_image.png',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/6301d5613_generated_image.png'];

export default function HeroSection() {
  const s = useHomeStrings();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % BG_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={current}
            src={BG_IMAGES[current]}
            alt={s.nav.home}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover" />
        </AnimatePresence>
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-8 flex justify-center">
          <img src={LOGO} alt={s.nav.home} className="h-28 md:h-40 w-auto drop-shadow-2xl" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }} className="mb-4 flex items-center justify-center gap-2.5">
          <span className="h-px w-8 bg-gold/50" />
          <span className="text-[11px] tracking-[0.34em] text-gold font-bold uppercase">{s.hero.badge}</span>
          <span className="h-px w-8 bg-gold/50" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
        className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-5">
          {s.hero.title1}
          <br />
          <span className="gold-gradient">{s.hero.title2}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }}
        className="text-base md:text-lg text-cream/75 max-w-2xl mx-auto mb-8 leading-relaxed">
          {s.hero.subtitle}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })} aria-label={s.hero.btnVisionAria}
          className="bg-gold text-white font-bold text-sm px-9 h-12 rounded-full hover:bg-gold-light transition-all duration-300 shadow-lg shadow-gold/25">
            {s.hero.btnVision}
          </button>
          <button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} aria-label={s.hero.btnContactAria}
          className="border border-gold/50 text-gold font-bold text-sm px-9 h-12 rounded-full hover:bg-gold/10 transition-all duration-300">
            {s.hero.btnPartnership}
          </button>
          <Link to="/player-profile" aria-label={s.hero.btnRegisterAria}
          className="bg-white/10 border border-white/25 text-white font-bold text-sm px-9 h-12 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
            {s.hero.btnRegister}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 1.1 }} className="flex justify-center">
          <SecurityBadge />
        </motion.div>
      </div>

      <button onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })} aria-label={s.hero.scrollAria}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/60 hover:text-gold transition-colors">
      </button>
    </section>);
}