import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt="מגרש כדורגל"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      </div>

      {/* Geometric accents */}
      <div className="absolute top-1/4 left-8 md:left-16 w-48 h-48 border border-gold/15 rotate-45 float-animation" />
      <div className="absolute bottom-1/4 right-8 md:right-16 w-24 h-24 border border-gold/10 rotate-12 float-animation" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <img
            src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png"
            alt="עילית ישראלית"
            className="h-24 md:h-32 w-auto mx-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-4"
        >
          <span className="font-body text-xs tracking-[0.3em] text-gold font-bold">
            חברה לטובת הציבור · ייסוד 2024
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6"
        >
          משנים חיים
          <br />
          <span className="gold-gradient">דרך המשחק</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-body text-lg md:text-xl text-cream/70 max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          "האושר אינו בבעלות על כסף, אלא בתהליך שעברת כדי להשיגו —
          בריגוש המאמץ."
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-body text-sm text-gold/70 tracking-widest mb-12"
        >
          — המודל הוא הנוער
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-body font-bold text-sm bg-gold text-navy px-10 py-4 rounded-sm hover:bg-gold-light transition-all duration-300 tracking-wide shadow-lg shadow-gold/20"
          >
            החזון שלנו
          </button>
          <button
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-body font-bold text-sm border border-gold/50 text-gold px-10 py-4 rounded-sm hover:bg-gold/10 transition-all duration-300 tracking-wide"
          >
            הצטרפו לתנועה
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => document.querySelector('#mission')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/60 hover:text-gold transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}