import { motion } from 'framer-motion';

const pillars = [
  {
    hebrew: 'שינוי',
    english: 'Change',
    description: 'כל נער טומן בתוכו את הכוח לשנות את מציאותו. אנו יוצרים את הסביבה שבה שינוי הופך לבלתי נמנע.',
    icon: '◈',
  },
  {
    hebrew: 'אמונה',
    english: 'Belief',
    description: 'אנו בונים אמונה עמוקה בערך העצמי, בפוטנציאל ובמטרה — היסוד שעליו נבנה כל ספורטאי עילית.',
    icon: '◇',
  },
  {
    hebrew: 'רצון',
    english: 'Will',
    description: 'הדחף הבלתי נלאה לצמוח. אנו מצית את הרצון שהופך שאיפות להישגים וחלומות למציאות חיה.',
    icon: '◆',
  },
];

export default function MissionSection() {
  return (
    <section id="mission" className="py-28 md:py-36 relative overflow-hidden" style={{ background: '#f8fafc' }} dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-gold/8" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-gold/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold"
          >
            הבסיס שלנו
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-navy mt-4 mb-6"
          >
            משימה <span className="gold-gradient">ואסטרטגיה</span>
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
            className="font-body text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed"
          >
            עילית ישראלית (חלצ), שנוסדה ב-2025, משתמשת בכדורגל כזרז ראשי לתהליך חינוכי-טיפולי עמוק,
            ומצוידת נוער בפריפריה בחינוך, כלים לחשיבה ניהולית, ניהול עסקי ויזמות — דרך NLP, שפת גוף וניהול פיננסי.
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
              className="pillar-card card-hover rounded-sm p-8 text-center group"
            >
              <div className="text-4xl text-gold mb-4 font-display">{pillar.icon}</div>
              <div className="font-display text-4xl font-black text-navy mb-1">{pillar.hebrew}</div>
              <div className="font-body text-xs tracking-[0.3em] text-gold font-bold mb-5 uppercase">{pillar.english}</div>
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
          style={{ border: '1px solid hsla(43,74%,45%,0.3)' }}
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="font-body text-xs tracking-[0.3em] text-gold font-bold">המתודולוגיה</span>
                <h3 className="font-display text-3xl md:text-4xl font-black text-white mt-3 mb-4">
                  כדורגל כ<span className="gold-gradient">זרז לשינוי</span>
                </h3>
                <p className="font-body text-cream/65 leading-relaxed">
                  הספורט אינו המטרה הסופית שלנו — הוא הכלי שלנו. מגרש הכדורגל הופך למעבדת חיים, שבה כל תרגיל, כל משחק, כל רגע של לחץ הופך להזדמנות לפתח אופי, חוסן, מנהיגות ומטרה.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {['NLP ותקשורת', 'שפת גוף', 'אוריינות פיננסית', 'יזמות'].map((tool) => (
                  <div key={tool} className="bg-white/5 border border-gold/15 rounded-sm p-4 text-center">
                    <div className="w-2 h-2 bg-gold rounded-full mx-auto mb-2" />
                    <span className="font-body text-xs text-cream/70 font-semibold">{tool}</span>
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