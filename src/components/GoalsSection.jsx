import { motion } from 'framer-motion';
import { Home, Trophy, Users, Star, TrendingUp, MapPin, Handshake, Flame, Target, Award } from 'lucide-react';

const goals = [
  {
    icon: Home,
    title: 'A Home for Life',
    subtitle: 'בית לחיים',
    description: 'Creating a permanent, nurturing "Home for Life" for youth in the periphery — a safe space where potential is recognized and cultivated.',
  },
  {
    icon: MapPin,
    title: 'Regional Youth Leagues',
    subtitle: 'ליגות נוער אזוריות',
    description: 'Establishing official regional youth leagues across the North, South, and Center of Israel, creating structured competitive frameworks.',
  },
  {
    icon: Star,
    title: 'The Elite House',
    subtitle: 'בית עילית',
    description: 'Building the "Elite House" — an exclusive hub for program graduates to continue growing, mentoring peers, and entering professional pathways.',
  },
  {
    icon: Trophy,
    title: 'Senior Team Formation',
    subtitle: 'הקמת קבוצה בכירה',
    description: 'Establishing a senior competitive team built entirely from program alumni, demonstrating what transformation looks like at scale.',
  },
  {
    icon: TrendingUp,
    title: 'Professional Drafting',
    subtitle: 'גיוס לליגות מקצועניות',
    description: 'Developing a clear pathway for drafting talented players into professional leagues — turning development into real-world opportunity.',
  },
  {
    icon: Users,
    title: 'Practical Leadership',
    subtitle: 'מנהיגות מעשית',
    description: 'Cultivating the next generation of community leaders through hands-on mentorship, responsibility programs, and real-world leadership experiences.',
  },
  {
    icon: Flame,
    title: 'Mindset Education',
    subtitle: 'חינוך מנטלי',
    description: 'Delivering structured programs in NLP, psychological resilience, and high-performance thinking — tools the world\'s elite have used for decades.',
  },
  {
    icon: Handshake,
    title: 'Business Incubation',
    subtitle: 'פיתוח יזמות',
    description: 'Providing youth with the frameworks of entrepreneurship and business management, turning ambition into viable ventures.',
  },
  {
    icon: Target,
    title: 'Financial Empowerment',
    subtitle: 'העצמה פיננסית',
    description: 'Teaching financial literacy, investment thinking, and economic independence — breaking generational cycles through financial education.',
  },
  {
    icon: Award,
    title: 'Community Impact',
    subtitle: 'השפעה קהילתית',
    description: 'Measuring success not by trophies but by transformed communities — creating a ripple effect of empowerment across Israel\'s periphery.',
  },
];

export default function GoalsSection() {
  return (
    <section id="goals" className="py-28 md:py-36 relative overflow-hidden" style={{ background: 'hsl(220, 35%, 5%)' }}>
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full border border-gold" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full border border-gold" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.4em] text-gold uppercase font-semibold"
          >
            Strategic Vision
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mt-4 mb-6"
          >
            10 <span className="gold-gradient">Impact Goals</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-body text-cream/60 max-w-2xl mx-auto"
          >
            Every initiative, every program, every player — mapped to ten transformational pillars that define our commitment to Israel's youth.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal, i) => {
            const Icon = goal.icon;
            return (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="group pillar-card card-hover rounded-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-gold/10 border border-gold/25 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body text-xs font-bold text-gold/80 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-0.5">{goal.title}</h3>
                    <span className="font-body text-xs text-gold/60 tracking-wider">{goal.subtitle}</span>
                    <p className="font-body text-xs text-cream/55 mt-3 leading-relaxed">{goal.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}