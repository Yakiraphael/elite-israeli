import { motion } from 'framer-motion';

const team = [
  {
    name: 'יקיר רפאל כרמל',
    title: 'מייסד ומנכ"ל',
    description: 'יזם חברתי-טכנולוגי, מנהל מרכזי יזמות לנוער ומומחה בהובלת תוכניות חינוכיות רב-מגזריות בשטח.',
    expertise: ['יזמות חברתית', 'חדשנות טכנולוגית', 'מנהיגות אסטרטגית'],
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  },
  {
    name: 'נאור שיר',
    title: 'מייסד וסמנכ"ל',
    description: 'יזם חברתי-עסקי, מאמן אנליסט וסקאוטר בשיתוף פעולה עם סוכנויות בינלאומיות.',
    expertise: ['פיתוח עסקי', 'אנליזה ספורטיבית', 'סקאוטינג בינלאומי'],
    image: 'https://myscout.co.il/wp-content/uploads/2024/03/%D7%A0%D7%90%D7%95%D7%A8-%D7%A9%D7%99%D7%A8.jpg',
  },
  {
    name: 'אור מני',
    title: 'סמנכ"ל תפעול',
    description: 'מומחה בניהול אופרטיבי, גיוס עובדים וניהול עסקים, ניהול מו"מ.',
    expertise: ['ניהול אופרטיבי', 'גיוס עובדים', 'ניהול מו"מ'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    name: 'שלו חן',
    title: 'סמנכ"ל פרויקטים',
    description: 'קצין בצה"ל, מאמן מנטלי מוסמך, מאסטר NLP ויזם חברתי המוביל פרויקטים מורכבים.',
    expertise: ['מאמן מנטלי', 'מאסטר NLP', 'יזמות חברתית'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
  {
    name: "מתן רבינוביץ'",
    title: 'סמנכ"ל נוער',
    description: 'קצין לשעבר, איש ברזל ומומחה בהובלת צוותים והנעת תהליכי שטח.',
    expertise: ['הובלת צוותים', 'תהליכי שטח', 'פיתוח נוער'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-28 md:py-36 relative overflow-hidden bg-white" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold"
          >
            מנהיגות וחזון
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-navy mt-4 mb-6"
          >
            <span className="gold-gradient">המייסדים והצוות</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto"
          />
        </div>

        {/* First row: 2 founders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {team.slice(0, 2).map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.15} large />
          ))}
        </div>

        {/* Second row: 3 VPs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.slice(2).map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.1} />
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center relative"
        >
          <div className="absolute -top-8 right-1/2 translate-x-1/2 text-gold/15 font-display text-9xl leading-none select-none">"</div>
          <blockquote className="relative z-10 max-w-3xl mx-auto">
            <p className="font-display text-2xl md:text-3xl text-navy font-bold leading-relaxed mb-6">
              האושר אינו בבעלות על כסף, אלא בתהליך שעברת כדי להשיגו — בריגוש המאמץ.
            </p>
            <cite className="font-body text-sm text-gold tracking-widest font-bold not-italic">
              המודל הוא הנוער — עילית ישראלית
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}

function MemberCard({ member, delay, large }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group pillar-card card-hover rounded-sm overflow-hidden"
    >
      <div className={`relative overflow-hidden ${large ? 'h-64' : 'h-48'}`}>
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-4">
          <span className="font-body text-xs text-gold tracking-widest font-bold">{member.title}</span>
        </div>
      </div>

      <div className={`p-6 ${large ? '' : 'p-5'}`}>
        <h3 className="font-display text-xl font-black text-navy mb-3">{member.name}</h3>
        <p className="font-body text-sm text-slate-600 leading-relaxed mb-4">{member.description}</p>
        <div className="flex flex-wrap gap-2">
          {member.expertise.map(skill => (
            <span key={skill} className="font-body text-xs text-gold bg-amber-50 border border-gold/25 px-3 py-1 rounded-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}