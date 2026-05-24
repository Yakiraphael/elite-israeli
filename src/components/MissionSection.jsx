import { motion } from 'framer-motion';

const pillars = [
  {
    hebrew: 'שינוי',
    english: 'Transformation',
    description: 'קטיעת רצף הסיכון החברתי דרך יצירת סביבה מובנית של שינוי — שבה כל נער מזוהה כנכס אסטרטגי לחברה.',
    icon: '◈',
  },
  {
    hebrew: 'אמונה',
    english: 'Belief',
    description: 'בניית זהות אישית מבוססת ערכים, חוסן מנטלי ותודעת מצוינות — יסודות שמניעים ביצועים גבוהים לאורך חיים.',
    icon: '◇',
  },
  {
    hebrew: 'רצון',
    english: 'Will',
    description: 'פיתוח מנהיגות פנימית, מוטיבציה מובנית ויכולת ביצועית — הכלים שמאפשרים הפיכת פוטנציאל להישג מדיד.',
    icon: '◆',
  },
];

export default function MissionSection() {
  return (
    <section id="mission" className="py-28 md:py-36 relative overflow-hidden bg-slate-100" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            הפילוסופיה המנחה
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6"
          >
            משימה אסטרטגית <span className="gold-gradient">ומתודולוגיה</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-body text-base text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            עילית ישראלית (חלצ), שנוסדה ב-2025, מפעילה מסגרת חינוכית-טיפולית ייחודית המשלבת ספורט תחרותי,
            פיתוח מנהיגות, חוסן מנטלי, אוריינות פיננסית ויזמות עסקית — בתוך מסגרת מובנית ומדידה לנוער הפריפריה בישראל.
          </motion.p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.hebrew}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="pillar-card card-hover rounded-sm p-8 text-center group bg-white"
            >
              <div className="text-3xl text-gold mb-4">{pillar.icon}</div>
              <div className="font-display text-3xl font-black text-navy mb-1">{pillar.hebrew}</div>
              <div className="font-body text-xs tracking-[0.25em] text-gold font-bold mb-5 uppercase">{pillar.english}</div>
              <p className="font-body text-sm text-slate-500 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sports as catalyst */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-sm overflow-hidden bg-navy"
          style={{ border: '1px solid rgba(180,140,50,0.3)' }}
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase">המתודולוגיה הייחודית</span>
                <h3 className="font-display text-2xl md:text-3xl font-black text-white mt-3 mb-4">
                  ספורט כ<span className="gold-gradient">פלטפורמה לפיתוח אנושי</span>
                </h3>
                <p className="font-body text-sm text-white/75 leading-relaxed">
                  מגרש הכדורגל משמש כסביבת למידה מוגנת שבה תהליכי לחץ, קבלת החלטות ועבודת צוות הופכים
                  להזדמנויות לפיתוח מצוינות אופרטיבית, אופי ומנהיגות פנימית — כלים שמשרתים את הנוער לאורך כל חייהם.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {['NLP ותקשורת מתקדמת', 'שפת גוף ונוכחות', 'אוריינות פיננסית', 'יזמות עסקית'].map((tool) => (
                  <div key={tool} className="bg-white/10 border border-gold/25 rounded-sm p-4 text-center">
                    <div className="w-2 h-2 bg-gold rounded-full mx-auto mb-2" />
                    <span className="font-body text-xs text-white/80 font-semibold leading-snug">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}