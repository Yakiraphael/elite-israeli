import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 navy-gradient" />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Decorative */}
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-5">
        <div className="w-full h-full border border-gold rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.4em] text-gold uppercase font-semibold"
          >
            Be Part of the Change
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            Join the <span className="gold-gradient">Movement</span>
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
            Whether you are an investor, partner, coach, or parent — there is a role for you in this mission.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="pillar-card rounded-sm p-6">
              <h3 className="font-display text-xl font-bold text-white mb-6">Get in Touch</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'info@eliteisraeli.org' },
                  { icon: Phone, label: 'Phone', value: '+972 (0) 50 000 0000' },
                  { icon: MapPin, label: 'Location', value: 'Israel · North, South & Center' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={15} className="text-gold" />
                    </div>
                    <div>
                      <span className="font-body text-xs text-gold/70 uppercase tracking-wider font-semibold">{item.label}</span>
                      <p className="font-body text-sm text-cream/70 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pillar-card rounded-sm p-6">
              <h4 className="font-body text-xs text-gold uppercase tracking-widest font-semibold mb-4">How to Get Involved</h4>
              <ul className="space-y-3">
                {['Corporate Sponsorship', 'Youth Coaching Volunteer', 'Program Partnership', 'Media & PR', 'Investor Relations'].map(r => (
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
            initial={{ opacity: 0, x: 30 }}
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
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Message Received</h3>
                  <p className="font-body text-cream/60 text-sm">Thank you for reaching out. Our team will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-body text-xs text-gold/80 uppercase tracking-wider font-semibold mb-2 block">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs text-gold/80 uppercase tracking-wider font-semibold mb-2 block">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold/80 uppercase tracking-wider font-semibold mb-2 block">I am a...</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                    >
                      <option value="" className="bg-navy">Select your role</option>
                      <option value="investor" className="bg-navy">Investor / Funder</option>
                      <option value="partner" className="bg-navy">Organization Partner</option>
                      <option value="coach" className="bg-navy">Coach / Mentor</option>
                      <option value="parent" className="bg-navy">Parent / Guardian</option>
                      <option value="media" className="bg-navy">Media / Press</option>
                      <option value="other" className="bg-navy">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs text-gold/80 uppercase tracking-wider font-semibold mb-2 block">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us how you'd like to get involved..."
                      className="w-full bg-navy/80 border border-cream/10 rounded-sm px-4 py-3 font-body text-sm text-white placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full font-body font-semibold text-sm bg-gold text-navy py-4 rounded-sm hover:bg-gold-light transition-colors duration-200 tracking-[0.15em] uppercase flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    Send Message
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