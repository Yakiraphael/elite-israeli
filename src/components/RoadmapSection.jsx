import { motion } from 'framer-motion';

const phases = [
  {
    phase: 'שלב א׳',
    title: 'הקמה ותשתית',
    period: '2025 — אוגוסט 2026',
    status: 'completed',
    milestones: [
      'רישום החברה כחלצ"ה ועמידה בדרישות הרגולציה',
      'גיבוש הנהלה בכירה ובניית צוות מרכזי',
      'פיתוח תכנית לימודים ומדדי השפעה',
      'זיהוי אתר פיילוט ויצירת שותפויות ראשוניות',
    ],
  },
  {
    phase: 'שלב ב׳',
    title: 'פיילוט ואימות',
    period: 'ספטמבר 2026 — מרץ 2027',
    status: 'active',
    milestones: [
      'השקת תכנית פיילוט לקבוצת נוער ראשונה (דרום)',
      'הפעלת ליגת נוער אזורית ראשונה',
      'הטמעת תכנית NLP, חוסן מנטלי ופיתוח מנהיגות',
      'גיוס חסויות ושותפויות עסקיות ורשויות',
    ],
  },
  {
    phase: 'שלב ג׳',
    title: 'הרחבה ומדרגיות',
    period: 'אפריל 2027 — 2028',
    status: 'upcoming',
    milestones: [
      'הרחבת הפעילות לאזורי הצפון והמרכז',
      'הנחת אבן פינה לבית עילית — מרכז בוגרים',
      'הקמת קבוצה בכירה מבוגרי התכנית',
      'קמפיין תקשורתי ארצי ובניית מותג',
    ],
  },
  {
    phase: 'שלב ד׳',
    title: 'השפעה לאומית',
    period: '2028 — 2029',
    status: 'upcoming',
    milestones: [
      'גיוס בוגרים ראשונים לליגות מקצועיות',
      'השקת מדגרת אוריינות פיננסית ויזמות',
      'הגעה ל-1,000+ נוער שנשתנו מדיד',
      'שיתופי פעולה עם מערכת החינוך ומשרד הרווחה',
    ],
  },
];

const statusStyle = {
  completed: { badge: 'bg-amber-50 text-gold border-gold/40', dot: 'bg-gold border-gold shadow-gold/40', text: 'text-slate-600', label: 'הושלם' },
  active: { badge: 'bg-amber-100 text-gold border-gold', dot: 'bg-gold border-gold shadow-gold/50', text: 'text-slate-700', label: 'בתהליך' },
  upcoming: { badge: 'bg-slate-100 text-slate-400 border-slate-200', dot: 'bg-white border-slate-300', text: 'text-slate-400', label: 'עתידי' },
};

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="py-28 md:py-36 relative overflow-hidden bg-slate-50" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            תכנון ויישום
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6"
          >
            <span className="gold-gradient">מפת דרכים</span>
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
          <div className="absolute right-8 md:right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />

          <div className="space-y-12">
            {phases.map((phase, i) => {
              const s = statusStyle[phase.status];
              const isRight = i % 2 === 0;
              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-start`}
                >
                  <div className="absolute right-8 md:right-1/2 translate-x-1/2 z-10 mt-6">
                    <div className={`w-4 h-4 rounded-full border-2 ${s.dot} ${phase.status !== 'upcoming' ? 'shadow-lg' : ''}`} />
                  </div>

                  <div className={`mr-16 md:mr-0 w-full md:w-[calc(50%-2rem)] ${isRight ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className={`pillar-card rounded-sm p-6 bg-white ${phase.status === 'active' ? 'border-gold/40' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-body text-xs font-bold text-gold tracking-widest">{phase.phase}</span>
                        <span className={`font-body text-xs px-2 py-0.5 rounded-sm border ${s.badge}`}>{s.label}</span>
                      </div>
                      <h3 className="font-display text-xl font-black text-navy mb-1">{phase.title}</h3>
                      <span className="font-body text-xs text-slate-400 font-semibold">{phase.period}</span>
                      <ul className="mt-4 space-y-2">
                        {phase.milestones.map((m, mi) => (
                          <li key={mi} className="flex items-start gap-2">
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${phase.status === 'upcoming' ? 'bg-slate-300' : 'bg-gold'}`} />
                            <span className={`font-body text-xs leading-relaxed ${s.text}`}>{m}</span>
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