import { motion } from 'framer-motion';
import { Trophy, Building2, Users, MapPin, Brain, Wallet, Award, ChevronLeft, MessageCircle } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

const WHATSAPP_URL = 'https://wa.me/972509080518';
const ICONS = [Trophy, Building2, Users];
const COLORS = ['#D4AF37', '#3B82F6', '#10B981'];

export default function ProgramsSection() {
  const s = useHomeStrings();

  return (
    <section id="programs" className="py-24 md:py-28 relative overflow-hidden bg-navy">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.programs.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            {s.programs.title1} <span className="gold-gradient">{s.programs.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-white/50 max-w-3xl mx-auto leading-relaxed">{s.programs.intro}</motion.p>
        </div>

        <div className="space-y-6">
          {s.programs.items.map((p, i) => {
            const Icon = ICONS[i] || Trophy;
            const color = COLORS[i] || '#D4AF37';
            return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-white/10 bg-[#1B263B] p-6 md:p-8 hover:border-gold/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 md:w-64">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full inline-block mb-2" style={{ backgroundColor: `${color}15`, color }}>{p.tag}</span>
                    <h3 className="font-display text-xl font-black text-white leading-tight mb-1">{p.title}</h3>
                    <p className="font-body text-xs text-white/40">{p.subtitle}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm text-white/60 leading-relaxed mb-4">{p.summary}</p>
                    <ul className="space-y-2.5">
                      {p.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <ChevronLeft size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
                          <span className="font-body text-xs text-white/50 leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {s.programs.highlights.map((text, i) => {
            const icons = [Brain, MapPin, Wallet];
            const Icon = icons[i] || Brain;
            return (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <Icon size={18} className="text-gold flex-shrink-0" />
                <span className="font-body text-xs text-white/60 leading-relaxed">{text}</span>
              </div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-14">
          <p className="font-body text-sm text-white/50 mb-5">{s.programs.ctaText}</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body font-bold text-sm bg-gold text-white px-8 py-3.5 rounded-sm hover:bg-gold-light transition-colors">
            <MessageCircle size={18} /> {s.programs.ctaBtn}
          </a>
        </motion.div>
      </div>
    </section>
  );
}