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

      {/* Static grid gallery */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {PHOTOS.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              onClick={() => setSelected(url)}
            >
              <img
                src={url}
                alt="פעילות עילית"
                className="w-full h-full object-cover blur-sm"
                style={{ filter: 'blur(8px)' }}
              />
            </motion.div>
          ))}
        </div>
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