import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Users, CheckCircle2, ArrowLeft, CreditCard, Baby, Star, MessageSquare, Clock } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';
import PreRegistrationModal from './PreRegistrationModal';

const YOUTH_ICONS = [FileText, ShieldCheck, Users, CheckCircle2];
const ADULT_ICONS = [FileText, CheckCircle2, CreditCard, ShieldCheck];
const FEATURE_ICONS = [MessageSquare, Star, CreditCard];

export default function TransferHubSection() {
  const s = useHomeStrings();
  const [tab, setTab] = useState('youth');
  const [showModal, setShowModal] = useState(false);
  const steps = tab === 'youth' ? s.transfers.ySteps : s.transfers.aSteps;
  const stepIcons = tab === 'youth' ? YOUTH_ICONS : ADULT_ICONS;

  return (
    <section id="transfer-hub" className="py-24 md:py-28 relative overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-4">
            <Clock size={13} className="text-gold" />
            <span className="font-body text-xs font-bold text-gold">{s.transfers.comingSoon}</span>
          </motion.div>
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase block">{s.transfers.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-4">
            {s.transfers.title1} <span className="gold-gradient">{s.transfers.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed">{s.transfers.intro}</motion.p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {[
            { id: 'youth', label: s.transfers.youthTab, icon: Baby },
            { id: 'adult', label: s.transfers.adultTab, icon: Star },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-label={t.label} aria-pressed={tab === t.id}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all ${tab === t.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {steps.map((st, i) => {
            const Icon = stepIcons[i] || FileText;
            return (
              <motion.div key={`${tab}-${i}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-white border border-slate-200 rounded-lg p-6 hover:border-gold/50 hover:shadow-lg transition-all">
                <div className="absolute -top-3 right-5 w-7 h-7 rounded-full bg-gold text-white text-xs font-black flex items-center justify-center">{i + 1}</div>
                <div className="w-11 h-11 rounded-lg bg-amber-50 border border-gold/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gold" />
                </div>
                <h3 className="font-display text-base font-black text-navy mb-2">{st.title}</h3>
                <p className="font-body text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {tab === 'adult' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
            {s.transfers.adultFeatures.map((f, i) => {
              const Icon = FEATURE_ICONS[i] || MessageSquare;
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <Icon size={20} className="text-gold mb-3" />
                  <h4 className="font-display font-black text-sm text-navy mb-1">{f.title}</h4>
                  <p className="font-body text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-lg overflow-hidden bg-navy border border-gold/20">
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white mb-1">
                  {tab === 'youth' ? s.transfers.protectionYTitle : s.transfers.protectionATitle}
                </h3>
                <p className="font-body text-xs text-white/60 max-w-xl leading-relaxed">
                  {tab === 'youth' ? s.transfers.protectionYDesc : s.transfers.protectionADesc}{' '}
                  {s.transfers.protectionNote}
                </p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="font-body font-bold text-sm bg-gold text-white px-8 py-3.5 rounded-sm hover:bg-gold-light transition-colors flex items-center gap-2 flex-shrink-0">
              {s.transfers.waitlistBtn} <ArrowLeft size={16} />
            </button>
          </div>
        </motion.div>
      </div>
      {showModal && <PreRegistrationModal onClose={() => setShowModal(false)} />}
    </section>
  );
}