import { motion } from 'framer-motion';
import { Linkedin, Globe } from 'lucide-react';

const team = [
  {
    name: 'Yakir Raphael Carmel',
    hebrewName: 'יקיר רפאל כרמל',
    title: 'Social-Tech Entrepreneur & CEO',
    description: 'A visionary leader at the intersection of technology, social impact, and sport. Yakir founded Elite Israeli with a mission to prove that the most powerful classroom is the football pitch — and that every youth in the periphery deserves access to world-class tools for self-development.',
    expertise: ['Social Entrepreneurship', 'Tech Innovation', 'Strategic Leadership', 'Community Building'],
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    name: 'Naor Shir',
    hebrewName: 'נאור שיר',
    title: 'Social-Business Entrepreneur & VP',
    description: 'A seasoned social-business entrepreneur whose expertise bridges grassroots community work with high-level business strategy. Naor brings the commercial architecture and relational intelligence that transforms programs into sustainable, scalable impact engines.',
    expertise: ['Business Development', 'Social Impact', 'Stakeholder Relations', 'Program Architecture'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 navy-gradient" />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.4em] text-gold uppercase font-semibold"
          >
            Leadership & Vision
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            The <span className="gold-gradient">Founders</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="pillar-card card-hover rounded-sm overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <span className="font-body text-xs text-gold tracking-widest uppercase font-semibold">{member.title}</span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-display text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="font-body text-sm text-gold/70 tracking-wider mb-5">{member.hebrewName}</p>
                  <p className="font-body text-sm text-cream/60 leading-relaxed mb-6">{member.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map(skill => (
                      <span
                        key={skill}
                        className="font-body text-xs text-gold/80 bg-gold/8 border border-gold/20 px-3 py-1 rounded-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Vision Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center relative"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-gold/20 font-display text-9xl leading-none select-none">"</div>
          <blockquote className="relative z-10 max-w-3xl mx-auto">
            <p className="font-display text-2xl md:text-3xl text-white/90 italic leading-relaxed mb-6">
              Happiness is not in owning money, but in the process you went through to achieve it — in the thrill of the effort.
            </p>
            <cite className="font-body text-sm text-gold tracking-widest uppercase not-italic">
              The Model is the Youth — Elite Israeli C.I.C.
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}