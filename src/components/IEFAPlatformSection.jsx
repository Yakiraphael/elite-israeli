import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Database, ShieldCheck, TrendingDown, Target, Baby, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHomeStrings } from '@/lib/i18n/homeStrings';
import SecurityBadge from './SecurityBadge';
import PreRegistrationModal from './PreRegistrationModal';

const ADV_ICONS = [Brain, Database, ShieldCheck, TrendingDown];
const USER_ICONS = [Baby, Building2, Users];
const USER_COLORS = [
  { color: 'border-blue-500/30 hover:border-blue-400/60', iconColor: 'text-blue-400', bg: 'bg-blue-500/10' },
  { color: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70', iconColor: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', featured: true },
  { color: 'border-green-500/30 hover:border-green-400/60', iconColor: 'text-green-400', bg: 'bg-green-500/10' },
];

export default function IEFAPlatformSection() {
  const s = useHomeStrings();
  const [preRegRole, setPreRegRole] = useState(null);

  return (
    <section id="iefa-platform" className="py-24 md:py-32 relative overflow-hidden bg-[#0D1B2A]">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-[#D4AF37] font-bold uppercase">{s.iefa.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4">
            {s.iefa.title1} <span className="gold-gradient">{s.iefa.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-[#D4AF37] mx-auto mb-6" />
          <motion.blockquote initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-base md:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed italic">{s.iefa.quote}</motion.blockquote>
          <div className="flex justify-center mt-6"><SecurityBadge /></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-l from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-lg p-6 md:p-8 mb-14 text-center">
          <p className="font-body text-sm md:text-base text-white/70 leading-relaxed max-w-3xl mx-auto">{s.iefa.banner}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
          {s.iefa.advantages.map((a, i) => {
            const Icon = ADV_ICONS[i] || Brain;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#1B263B] border border-white/10 rounded-lg p-6 hover:border-[#D4AF37]/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <Icon size={22} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-wider text-[#D4AF37]/60 uppercase mb-1">{a.subtitle}</div>
                    <h3 className="font-display text-lg font-black text-white mb-2">{a.title}</h3>
                    <p className="font-body text-sm text-white/50 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-14">
          <div className="text-center mb-8">
            <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">{s.iefa.joinBadge}</span>
            <h3 className="text-white text-2xl md:text-3xl font-black mt-3 mb-2">{s.iefa.joinTitle}</h3>
            <p className="text-white/50 text-sm">{s.iefa.joinSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {s.iefa.userTypes.map((ut, i) => {
              const Icon = USER_ICONS[i] || Baby;
              const uc = USER_COLORS[i] || USER_COLORS[0];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`relative bg-[#1B263B] border rounded-xl p-6 transition-all group ${uc.color} ${uc.featured ? 'shadow-xl shadow-[#D4AF37]/10' : ''}`}>
                  {uc.featured && <span className="absolute -top-3 right-6 bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black px-3 py-1 rounded-full">{s.iefa.popular}</span>}
                  <div className={`w-12 h-12 rounded-xl ${uc.bg} border border-white/10 flex items-center justify-center mb-4`}>
                    <Icon size={22} className={uc.iconColor} />
                  </div>
                  <h4 className="text-white font-black text-lg mb-1">{ut.title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed mb-5">{ut.desc}</p>
                  <button onClick={() => setPreRegRole(ut.cta)}
                    className={`w-full text-center font-black text-sm py-3 rounded-sm transition-colors ${uc.featured ? 'bg-[#D4AF37] text-[#0D1B2A] hover:bg-amber-400' : 'border border-white/20 text-white hover:bg-white/5'}`}>
                    {ut.cta} →
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-lg overflow-hidden bg-gradient-to-l from-[#1B263B] to-[#0D1B2A] border border-[#D4AF37]/30">
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
                <Target size={22} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white mb-2">{s.iefa.socialTitle}</h3>
                <p className="font-body text-sm text-white/60 max-w-2xl leading-relaxed">{s.iefa.socialDesc}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <a href="#roi" className="font-body font-bold text-sm border border-white/20 text-white/70 px-7 py-3 rounded-sm hover:bg-white/5 transition-colors text-center">{s.iefa.businessModel}</a>
            </div>
          </div>
        </motion.div>
      </div>

      {preRegRole && <PreRegistrationModal initialRole={preRegRole} onClose={() => setPreRegRole(null)} />}
    </section>);
}