import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

const RECIPIENT = 'yakirkarmel@gmail.com';

export default function ContactSection() {
  const s = useHomeStrings();
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const f = s.contact.emailFields;
    await base44.integrations.Core.SendEmail({
      to: RECIPIENT,
      subject: `${s.contact.emailSubject} — ${form.name}`,
      body: `${s.contact.emailBody}\n\n${f.name}: ${form.name}\n${f.phone}: ${form.phone}\n${f.email}: ${form.email}\n${f.role}: ${form.role || f.notSpecified}\n\n${f.message}:\n${form.message}`.trim(),
    });
    setStatus('success');
  };

  return (
    <section id="contact" className="py-28 md:py-36 relative overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">{s.contact.badge}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6">
            {s.contact.title1} <span className="gold-gradient">{s.contact.title2}</span>
          </motion.h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">{s.contact.intro}</motion.p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <ShieldCheck size={13} className="text-gold" />
            <span className="text-xs text-slate-400 font-semibold">{s.contact.secureNote}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-5">
            <div className="pillar-card rounded-sm p-6 bg-white">
              <h3 className="font-display text-lg font-black text-navy mb-5">{s.contact.infoTitle}</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: s.contact.email, value: 'yakirkarmel@gmail.com' },
                  { icon: Phone, label: s.contact.phone, value: '050-908-0518' },
                  { icon: MapPin, label: s.contact.area, value: s.contact.areaValue },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-sm bg-amber-50 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={14} className="text-gold" />
                    </div>
                    <div>
                      <span className="font-body text-xs text-gold font-bold tracking-wide">{item.label}</span>
                      <p className="font-body text-sm text-slate-600 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pillar-card rounded-sm p-6 bg-white">
              <h4 className="font-body text-xs text-gold font-bold tracking-wide uppercase mb-4">{s.contact.collaborationTitle}</h4>
              <ul className="space-y-2.5">
                {s.contact.collaborationTypes.map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                    <span className="font-body text-xs text-slate-500 leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
            <div className="pillar-card rounded-sm p-8 bg-white">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-gold/40 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={28} className="text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-navy mb-2">{s.contact.successTitle}</h3>
                  <p className="font-body text-slate-500 text-sm">{s.contact.successDesc}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-body text-xs text-gold font-bold tracking-wide mb-2 block">{s.contact.formName}</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder={s.contact.namePlaceholder}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 font-body text-sm text-navy placeholder-slate-400 focus:outline-none focus:border-gold/60 transition-colors text-right" />
                    </div>
                    <div>
                      <label className="font-body text-xs text-gold font-bold tracking-wide mb-2 block">{s.contact.formPhone}</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="05X-XXX-XXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 font-body text-sm text-navy placeholder-slate-400 focus:outline-none focus:border-gold/60 transition-colors" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold font-bold tracking-wide mb-2 block">{s.contact.formEmail}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 font-body text-sm text-navy placeholder-slate-400 focus:outline-none focus:border-gold/60 transition-colors" dir="ltr" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold font-bold tracking-wide mb-2 block">{s.contact.formRole}</label>
                    <select name="role" value={form.role} onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 font-body text-sm text-navy focus:outline-none focus:border-gold/60 transition-colors">
                      <option value="">{s.contact.selectCategory}</option>
                      {s.contact.roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold font-bold tracking-wide mb-2 block">{s.contact.formMessage}</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder={s.contact.messagePlaceholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 font-body text-sm text-navy placeholder-slate-400 focus:outline-none focus:border-gold/60 transition-colors resize-none text-right" />
                  </div>
                  <button type="submit" disabled={status === 'loading'}
                    className="w-full font-body font-bold text-sm bg-navy text-white py-4 rounded-sm hover:bg-navy-light transition-colors duration-200 tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
                    {status === 'loading' ? <><Loader2 size={15} className="animate-spin" />{s.contact.sending}</> : <><Send size={15} />{s.contact.submit}</>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}