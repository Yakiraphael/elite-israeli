import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const phases = [
  {
    phase: 'שלב א׳',
    title: 'הקמה',
    period: '2024 — אוגוסט 2026',
    status: 'completed',
    milestones: [
      'רישום החברה כחלצ"ה',
      'גיבוש מייסדים ובניית צוות מרכזי',
      'עיצוב תכנית ראשונית ופיתוח תכנית לימודים',
      'זיהוי אתר פיילוט בפריפריה הדרומית',
    ],
  },
  {
    phase: 'שלב ב׳',
    title: 'השקה ופיילוט',
    period: 'ספטמבר 2026 — מרץ 2027',
    status: 'active',
    milestones: [
      'השקת תכנית פיילוט לקבוצה ראשונה (דרום)',
      'הקמת ליגת נוער אזורית ראשונה',
      'השקת תכנית NLP ובניית מנטליות',
      'הסכמי חסות ושותפות ראשונים',
    ],
  },
  {
    phase: 'שלב ג׳',
    title: 'הרחבה ומדרגיות',
    period: 'אפריל 2027 — 2028',
    status: 'upcoming',
    milestones: [
      'הרחבה לאזורי הצפון והמרכז',
      'הנחת אבן פינה לבית עילית לבוגרים',
      'הקמת קבוצה בכירה מבוגרי התכנית',
      'השקת קמפיין מדיה ועיתונות ארצי',
    ],
  },
  {
    phase: 'שלב ד׳',
    title: 'השפעה לאומית',
    period: '2028 — 2029',
    status: 'upcoming',
    milestones: [
      'גיוס הקבוצה הראשונה לליגות מקצועיות',
      'הקמת מדגרת אוריינות פיננסית',
      'השקת תכנית יזמות לאומית',
      'השגת אבן דרך של 1,000+ נוער שנשתנו',
    ],
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-gold', bg: 'bg-gold/10 border-gold/40', label: 'הושלם' },
  active: { icon: Clock, color: 'text-gold', bg: 'bg-gold/20 border-gold', label: 'בתהליך' },
  upcoming: { icon: Circle, color: 'text-cream/30', bg: 'bg-navy border-cream/15', label: 'עתידי' },
};

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="py-28 md:py-36 relative overflow-hidden" style={{ background: 'hsl(220, 35%, 5%)' }} dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold"
          >
            המסע שלנו
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-white mt-4 mb-6"
          >
            מפת <span className="gold-gradient">הדרכים האסטרטגית</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto"
          />
        </div>

        <div className="relative">
          {/* Timeline line — on the right side for RTL */}
          <div className="absolute right-8 md:right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />

          <div className="space-y-12">
            {phases.map((phase, i) => {
              const cfg = statusConfig[phase.status];
              const isRight = i % 2 === 0;

              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-0 items-start`}
                >
                  {/* Timeline dot */}
                  <div className="absolute right-8 md:right-1/2 translate-x-1/2 z-10 mt-6">
                    <div className={`w-4 h-4 rounded-full border-2 ${phase.status === 'active' ? 'bg-gold border-gold shadow-lg shadow-gold/40' : phase.status === 'completed' ? 'bg-gold/60 border-gold/60' : 'bg-navy border-cream/20'}`} />
                  </div>

                  {/* Card */}
                  <div className={`mr-16 md:mr-0 w-full md:w-[calc(50%-2rem)] ${isRight ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className={`pillar-card rounded-sm p-6 ${phase.status === 'active' ? 'border-gold/50' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-body text-xs font-bold text-gold tracking-widest">{phase.phase}</span>
                        <span className={`font-body text-xs px-2 py-0.5 rounded-sm border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <h3 className="font-display text-xl font-black text-white mb-1">{phase.title}</h3>
                      <span className="font-body text-xs text-cream/40">{phase.period}</span>
                      <ul className="mt-4 space-y-2">
                        {phase.milestones.map((m, mi) => (
                          <li key={mi} className="flex items-start gap-2">
                            <div className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${phase.status === 'completed' ? 'bg-gold' : phase.status === 'active' ? 'bg-gold' : 'bg-cream/20'}`} />
                            <span className={`font-body text-xs leading-relaxed ${phase.status === 'upcoming' ? 'text-cream/40' : 'text-cream/65'}`}>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}