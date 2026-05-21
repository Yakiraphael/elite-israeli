import { motion } from 'framer-motion';

const team = [
  {
    name: 'יקיר רפאל כרמל',
    title: 'מייסד ומנכ"ל',
    description: 'יזם חברתי-טכנולוגי, מנהל מרכזי יזמות לנוער ומומחה בהובלת תוכניות חינוכיות רב-מגזריות בשטח. מוביל תהליכי שינוי מערכתי בצומת שבין חינוך, ספורט וטכנולוגיה.',
    tags: ['יזמות חברתית', 'פיתוח מנהיגות', 'תוכניות חינוך'],
  },
  {
    name: 'נאור שיר',
    title: 'מייסד וסמנכ"ל',
    description: 'יזם חברתי-עסקי, מאמן אנליסט וסקאוטר בשיתוף פעולה עם סוכנויות בינלאומיות. מביא מומחיות ייחודית בגשר בין קהילה לאסטרטגיה עסקית ובניית מנועי השפעה מדרגיים.',
    tags: ['פיתוח עסקי', 'אנליזה ספורטיבית', 'סקאוטינג בינלאומי'],
  },
  {
    name: 'אור מני',
    title: 'סמנכ"ל תפעול',
    description: 'מומחה בניהול אופרטיבי, גיוס עובדים וניהול עסקים ומשא ומתן. אחראי על מצוינות תפעולית, בניית תשתיות ארגוניות וייעול תהליכי ליבה.',
    tags: ['ניהול אופרטיבי', 'מצוינות ארגונית', 'גיוס ומשאבי אנוש'],
  },
  {
    name: 'שלו חן',
    title: 'סמנכ"ל פרויקטים',
    description: 'קצין בצה"ל, מאמן מנטלי מוסמך, מאסטר NLP ויזם חברתי. מוביל פרויקטים מורכבים ממשלב התכנון האסטרטגי ועד ביצוע שטח — עם דגש על חוסן מנטלי ופיתוח אישי.',
    tags: ['NLP מאסטר', 'אימון מנטלי', 'ניהול פרויקטים'],
  },
  {
    name: "מתן רבינוביץ'",
    title: 'סמנכ"ל נוער',
    description: 'קצין לשעבר, בעל ניסיון מוכח בהובלת צוותים בסביבות לחץ גבוהות ובהנעת תהליכי שטח. מוביל את קשרי הנוער, חניכה וביצוע תכניות ישירות בשטח.',
    tags: ['הובלת צוותים', 'תהליכי שטח', 'חניכת נוער'],
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-28 md:py-36 relative overflow-hidden bg-slate-50" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            ניהול ומנהיגות
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6"
          >
            <span className="gold-gradient">ההנהלה הבכירה</span>
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
            className="font-body text-sm text-slate-500 max-w-xl mx-auto leading-relaxed"
          >
            צוות הנהלה רב-תחומי המשלב מומחיות בחינוך, עסקים, צבא, ספורט ויזמות חברתית.
          </motion.p>
        </div>

        {/* Founders - 2 column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {team.slice(0, 2).map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>

        {/* VPs - 3 column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.slice(2).map((member, i) => (
            <TeamCard key={member.name} member={member} index={i + 2} />
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 relative border border-gold/20 rounded-sm p-10 text-center bg-white"
        >
          <div className="absolute -top-6 right-1/2 translate-x-1/2 text-gold/20 font-display text-8xl leading-none select-none">"</div>
          <blockquote className="relative z-10 max-w-3xl mx-auto">
            <p className="font-display text-xl md:text-2xl text-navy font-bold leading-relaxed mb-5">
              האושר אינו בבעלות על כסף, אלא בתהליך שעברת כדי להשיגו — בריגוש המאמץ.
            </p>
            <cite className="font-body text-xs text-gold tracking-widest font-bold not-italic uppercase">
              המודל הוא הנוער — עילית ישראלית, 2025
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}

function TeamCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      className="pillar-card card-hover rounded-sm p-7 bg-white"
    >
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-display text-xl font-black text-navy">{member.name}</h3>
            <span className="font-body text-xs text-gold font-bold tracking-wide">{member.title}</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-amber-50 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-gold rounded-full" />
          </div>
        </div>
      </div>
      <p className="font-body text-sm text-slate-600 leading-relaxed mb-5">{member.description}</p>
      <div className="flex flex-wrap gap-2">
        {member.tags.map(tag => (
          <span key={tag} className="font-body text-xs text-gold bg-amber-50 border border-gold/20 px-3 py-1 rounded-sm">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}