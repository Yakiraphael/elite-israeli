import { motion } from 'framer-motion';
import { useState } from 'react';

const PHOTOS = [
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/39caff1b2_WhatsAppImage2026-05-27at1520561.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/d2e3afbc0_WhatsAppImage2026-05-27at1520562.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/d6b81bde6_WhatsAppImage2026-05-27at1520563.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/25bfa9401_WhatsAppImage2026-05-27at1520564.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/a1c562c9e_WhatsAppImage2026-05-27at1520565.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/9bd4e5d41_WhatsAppImage2026-05-27at1520566.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/6efe32825_WhatsAppImage2026-05-27at1520567.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/60b0299ac_WhatsAppImage2026-05-27at1520568.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/efb74961e_WhatsAppImage2026-05-27at1520569.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/85063194c_WhatsAppImage2026-05-27at15205610.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/ae5980d67_WhatsAppImage2026-05-27at15205611.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/604eeb80c_WhatsAppImage2026-05-27at15205612.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/9a330b2e9_WhatsAppImage2026-05-27at15205613.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/0e183d3ab_WhatsAppImage2026-05-27at15205614.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/104169076_WhatsAppImage2026-05-27at15205615.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/94b031381_WhatsAppImage2026-05-27at15205616.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/522d45828_WhatsAppImage2026-05-27at15205617.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/27fa8dbae_WhatsAppImage2026-05-27at15205618.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/2beee1357_WhatsAppImage2026-05-27at152056.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/322617fed_WhatsAppImage2026-05-27at1521051.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/b29c306db_WhatsAppImage2026-05-27at1521052.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/ca73544f0_WhatsAppImage2026-05-27at1521053.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/f1d21446d_WhatsAppImage2026-05-27at1521054.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/50d1a09b8_WhatsAppImage2026-05-27at1521055.jpg',
  'https://media.base44.com/images/public/69fafcd4c8e6ad563cb577b8/9029725b8_WhatsAppImage2026-05-27at152105.jpg',
];

// Deterministic sizes and delays per bubble
const BUBBLE_CONFIGS = PHOTOS.map((_, i) => ({
  size: [120, 140, 160, 180, 200, 110, 150][i % 7],
  delay: (i * 0.4) % 4,
  duration: 5 + (i % 4),
  yOffset: 12 + (i % 3) * 6,
}));

export default function BubblesGallery() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden relative" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Header */}
      <div className="text-center mb-14 px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
        >
          הפעילות שלנו בשטח
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-4"
        >
          רגעים <span className="gold-gradient">מהמגרש</span>
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="w-24 h-0.5 bg-gold mx-auto"
        />
      </div>

      {/* Bubbles grid — scrolling marquee rows */}
      <div className="space-y-6 overflow-hidden">
        {/* Row 1 — slides right */}
        <BubbleRow photos={PHOTOS.slice(0, 9)} configs={BUBBLE_CONFIGS.slice(0, 9)} direction={1} onSelect={setSelected} />
        {/* Row 2 — slides left */}
        <BubbleRow photos={PHOTOS.slice(9, 17)} configs={BUBBLE_CONFIGS.slice(9, 17)} direction={-1} onSelect={setSelected} />
        {/* Row 3 — slides right */}
        <BubbleRow photos={PHOTOS.slice(17)} configs={BUBBLE_CONFIGS.slice(17)} direction={1} onSelect={setSelected} />
      </div>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selected}
            alt="תמונה מהפעילות"
            className="max-w-3xl max-h-[85vh] w-full object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-6 left-6 text-white/70 hover:text-white text-3xl leading-none"
          >×</button>
        </motion.div>
      )}
    </section>
  );
}

function BubbleRow({ photos, configs, direction, onSelect }) {
  // Duplicate for seamless loop
  const doubled = [...photos, ...photos];

  return (
    <div className="relative flex gap-5 overflow-hidden">
      <motion.div
        className="flex gap-5 flex-shrink-0"
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {doubled.map((url, i) => {
          const cfg = configs[i % configs.length];
          return (
            <motion.div
              key={i}
              className="flex-shrink-0 cursor-pointer"
              style={{ width: cfg.size, height: cfg.size }}
              animate={{ y: [0, -cfg.yOffset, 0] }}
              transition={{ duration: cfg.duration, delay: cfg.delay, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              onClick={() => onSelect(url)}
            >
              <img
                src={url}
                alt="פעילות עילית"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg hover:border-gold/60 transition-colors duration-300"
                style={{ boxShadow: '0 8px 32px rgba(180,140,40,0.12)' }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}