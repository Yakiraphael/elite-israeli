import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <section id="contact" className="py-28 md:py-36 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 navy-gradient" />
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5">
        <div className="w-full h-full border border-gold rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold"
          >
            היו חלק מהשינוי
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-white mt-4 mb-6"
          >
            הצטרפו <span className="gold-gradient">לתנועה</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-body text-cream/60 max-w-xl mx-auto"
          >
            בין אם אתם משקיעים, שותפים, מאמנים או הורים — יש לכם תפקיד במשימה הזו.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="pillar-card rounded-sm p-6">
              <h3 className="font-display text-xl font-black text-white mb-6">צרו קשר</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'אימייל', value: 'info@eliteisraeli.org' },
                  { icon: Phone, label: 'טלפון', value: '050-000-0000' },
                  { icon: MapPin, label: 'מיקום', value: 'ישראל · צפון, דרום ומרכז' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={15} className="text-gold" />
                    </div>
                    <div>
                      <span className="font-body text-xs text-gold/70 font-bold tracking-wide">{item.label}</span>
                      <p className="font-body text-sm text-cream/70 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pillar-card rounded-sm p-6">
              <h4 className="font-body text-xs text-gold font-bold tracking-wide mb-4">כיצד להצטרף</h4>
              <ul className="space-y-3">
                {['חסות תאגידית', 'התנדבות כמאמן', 'שותפות תכנית', 'מדיה ויחסי ציבור', 'קשרי משקיעים'].map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                    <span className="font-body text-xs text-cream/60">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="pillar-card rounded-sm p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-6">
                    <Send size={24} className="text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-white mb-2">ההודעה התקבלה</h3>
                  <p className="font-body text-cream/60 text-sm">תודה שפנית אלינו. הצוות שלנו יחזור אליך בקרוב.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-body text-xs text-gold/80 font-bold tracking-wide mb-2 block">שם מלא</label>
                      <input
                        type="text" name="name" value={form.name} onChange={handleChange} required
                        placeholder="השם שלך"
                        className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors text-right"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs text-gold/80 font-bold tracking-wide mb-2 block">אימייל</label>
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange} required
                        placeholder="your@email.com"
                        className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold/80 font-bold tracking-wide mb-2 block">אני...</label>
                    <select
                      name="role" value={form.role} onChange={handleChange}
                      className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="" className="bg-navy">בחרו תפקיד</option>
                      <option value="investor" className="bg-navy">משקיע / מממן</option>
                      <option value="partner" className="bg-navy">שותף ארגוני</option>
                      <option value="coach" className="bg-navy">מאמן / מנטור</option>
                      <option value="parent" className="bg-navy">הורה / אפוטרופוס</option>
                      <option value="media" className="bg-navy">מדיה / עיתונות</option>
                      <option value="other" className="bg-navy">אחר</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold/80 font-bold tracking-wide mb-2 block">הודעה</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="ספרו לנו כיצד תרצו להיות מעורבים..."
                      className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors resize-none text-right"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full font-body font-bold text-sm bg-gold text-navy py-4 rounded-sm hover:bg-gold-light transition-colors duration-200 tracking-wide flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    שליחת הודעה
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