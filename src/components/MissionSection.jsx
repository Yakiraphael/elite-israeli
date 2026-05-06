import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const pillars = [
  {
    hebrew: 'שינוי',
    english: 'Change',
    description: 'Every young person carries within them the power to transform their reality. We create the environment where change becomes inevitable.',
    icon: '◈',
  },
  {
    hebrew: 'אמונה',
    english: 'Belief',
    description: 'We build deep-rooted belief in self-worth, potential, and purpose — the foundation every elite performer is built upon.',
    icon: '◇',
  },
  {
    hebrew: 'רצון',
    english: 'Will',
    description: 'The relentless drive to grow. We ignite the will that turns aspirations into achievements and dreams into lived reality.',
    icon: '◆',
  },
];

export default function MissionSection() {
  return (
    <section id="mission" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 navy-gradient" />

      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-gold/5" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-gold/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.4em] text-gold uppercase font-semibold"
          >
            Our Foundation
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            Mission & <span className="gold-gradient">Strategy</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-body text-lg text-cream/60 max-w-3xl mx-auto leading-relaxed"
          >
            Elite Israeli (C.I.C.) uses football as the primary catalyst for a deep educational-therapeutic process,
            equipping youth in the periphery with education, mindset tools, business management skills, and entrepreneurship — through NLP, Body Language, and Financial Management.
          </motion.p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.english}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="pillar-card card-hover rounded-sm p-8 text-center group"
            >
              <div className="text-4xl text-gold mb-4 font-display">{pillar.icon}</div>
              <div className="font-display text-3xl font-bold text-white mb-1">{pillar.hebrew}</div>
              <div className="font-body text-xs tracking-[0.3em] text-gold uppercase font-semibold mb-5">{pillar.english}</div>
              <p className="font-body text-sm text-cream/60 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sports as catalyst */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-sm overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsla(43,74%,52%,0.08) 0%, hsla(220,35%,12%,1) 100%)', border: '1px solid hsla(43,74%,52%,0.25)' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="font-body text-xs tracking-[0.3em] text-gold uppercase font-semibold">The Methodology</span>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
                  Football as a <span className="gold-gradient">Catalyst</span>
                </h3>
                <p className="font-body text-cream/65 leading-relaxed">
                  Sport is not our end goal — it is our vehicle. The football pitch becomes a laboratory for life, where every drill, every match, every moment of pressure becomes an opportunity to develop character, resilience, leadership, and purpose.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {['NLP & Communication', 'Body Language Mastery', 'Financial Literacy', 'Entrepreneurship'].map((tool, i) => (
                  <div key={tool} className="bg-navy/60 border border-gold/15 rounded-sm p-4 text-center">
                    <div className="w-2 h-2 bg-gold rounded-full mx-auto mb-2" />
                    <span className="font-body text-xs text-cream/70 font-medium">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}