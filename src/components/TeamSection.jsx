import { motion } from 'framer-motion';

const team = [
{
  name: 'יקיר רפאל כרמל',
  englishName: 'Yakir Raphael Carmel',
  title: 'יזם סושיאל-טק ומנכ"ל',
  description: 'מנהיג חזוני בצומת שבין טכנולוגיה, השפעה חברתית וספורט. יקיר ייסד את עילית ישראלית מתוך שליחות להוכיח שהמגרש הוא הכיתה החזקה ביותר — ושכל נער בפריפריה ראוי לגישה לכלים ברמה עולמית לפיתוח עצמי.',
  expertise: ['יזמות חברתית', 'חדשנות טכנולוגית', 'מנהיגות אסטרטגית', 'בניית קהילה'],
  image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80'
},
{
  name: 'נאור שיר',
  englishName: 'Naor Shir',
  title: 'יזם סושיאל-ביזנס וסמנכ"ל',
  description: 'יזם סושיאל-ביזנס מנוסה שמומחיותו גושרת בין עבודה קהילתית שורשית לאסטרטגיה עסקית ברמה גבוהה. נאור מביא את הארכיטקטורה המסחרית והאינטליגנציה הרלציונית שהופכים תכניות למנועי השפעה בני קיימא ומדרגיים.',
  expertise: ['פיתוח עסקי', 'השפעה חברתית', 'קשרי בעלי עניין', 'ארכיטקטורת תכניות'],
  image: 'https://myscout.co.il/wp-content/uploads/2024/03/%D7%A0%D7%90%D7%95%D7%A8-%D7%A9%D7%99%D7%A8.jpg'
}];


export default function TeamSection() {
  return (
    <section id="team" className="py-28 md:py-36 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 navy-gradient" />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold">
            
            מנהיגות וחזון
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-white mt-4 mb-6">
            
            <span className="gold-gradient">המייסדים</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="w-24 h-0.5 bg-gold mx-auto" />
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {team.map((member, i) =>
          <motion.div
            key={member.name}
            initial={{ opacity: 0, x: i === 0 ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative">
            
              <div className="pillar-card card-hover rounded-sm overflow-hidden">
                












              

                <div className="p-8">
                  <h3 className="font-display text-2xl font-black text-white mb-1">{member.name}</h3>
                  <p className="font-body text-sm text-gold/70 mb-5">{member.englishName}</p>
                  <p className="font-body text-sm text-cream/60 leading-relaxed mb-6">{member.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill) =>
                  <span
                    key={skill}
                    className="font-body text-xs text-gold/80 bg-gold/8 border border-gold/20 px-3 py-1 rounded-sm">
                    
                        {skill}
                      </span>
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Vision Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center relative">
          
          <div className="absolute -top-8 right-1/2 translate-x-1/2 text-gold/20 font-display text-9xl leading-none select-none">"</div>
          <blockquote className="relative z-10 max-w-3xl mx-auto">
            <p className="font-display text-2xl md:text-3xl text-white/90 font-bold leading-relaxed mb-6">
              האושר אינו בבעלות על כסף, אלא בתהליך שעברת כדי להשיגו — בריגוש המאמץ.
            </p>
            <cite className="font-body text-sm text-gold tracking-widest font-bold not-italic">
              המודל הוא הנוער — עילית ישראלית
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>);

}