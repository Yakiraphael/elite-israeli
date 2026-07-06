import { motion } from 'framer-motion';
import { Trophy, Building2, Users, MapPin, Brain, Wallet, Award, ChevronLeft, MessageCircle } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/972509080518';

const PROGRAMS = [
  {
    icon: Trophy,
    tag: 'תוכנית 1',
    title: 'ליגת "עילית" ארצית לנוער בסיכון',
    subtitle: 'דרך הרשויות המקומיות',
    color: '#D4AF37',
    summary: 'הרחבת המודל ההוליסטי שלנו לרמה עירונית וארצית — ליגת כדורגל 11 על 11 המבוססת על שיתוף פעולה עם אגפי הרווחה ברשויות המקומיות, לטובת בני נוער בתיקי רווחה.',
    points: [
      'קבוצות שכונתיות המייצגות אזור ברשות המקומית, ליצירת שייכות וזהות קהילתית',
      'גיוס והפניה בשיתוף אגפי הרווחה — מענה ממוקד לנוער הזקוק ביותר לתמיכה',
      'פורמט 11 על 11 עם קבוצות של עד 22 שחקנים, לקראת רשת ליגות שתתחבר לליגה ארצית אחת',
      'שימור המודל ההוליסטי: אימונים אינטנסיביים, ליווי מנטלי, כישורי חיים ויזמות',
      '"גביע ליגה" ו"אירוע דראפט" בהיקף ארצי עם אורחים מהארץ ומחו"ל',
    ],
  },
  {
    icon: Building2,
    tag: 'תוכנית 2',
    title: 'תוכנית חברתית-ספורטיבית מקיפה',
    subtitle: 'לפנימיות, כפרי נוער ובתי ספר',
    color: '#3B82F6',
    summary: 'תוכנית הוליסטית ל-10 קבוצות (8–12 שחקנים כל אחת), המשלבת אימוני כדורגל אינטנסיביים עם ליווי אישי וקבוצתי מעמיק, לטובת בני נוער באוכלוסיית הפנימיות וההוסטלים.',
    points: [
      '12 שעות שבועיות של פעילות — 2 אימונים ומשחק ליגה, במתכונת 6 על 6 לאורך שנת הלימודים',
      'ליווי מקצועי צמוד: מנהל מקצועי ושני מדריכים לכל קבוצה',
      'פיתוח מנטלי וטיפולי — חוסן אישי, ביטחון עצמי ויציאה ממעגלי סיכון',
      'הקניית כישורי חיים ויזמות — ניהול פיננסי, יזמות ופיתוח מוצר',
      '"גביע הליגה" בפגרת פסח ו"אירוע דראפט" מסכם עם סקאוטרים ואנשי מקצוע',
    ],
  },
  {
    icon: Users,
    tag: 'תוכנית 3',
    title: 'עילית השכונות',
    subtitle: 'עילית לנוער מהשכונה — מבוסס מתנ"סים קהילתיים',
    color: '#10B981',
    summary: 'תוכנית המביאה את המודל של "עילית ישראלית" ישירות אל השכונה, בשיתוף פעולה עם מתנ"סים קהילתיים — כך שהפעילות נגישה, קרובה לבית ומחוברת לזהות המקומית של בני הנוער.',
    points: [
      'פעילות המתקיימת במתנ"ס השכונתי — נגישות מרבית ומחויבות קהילתית',
      'המיקום הוא לב התוכנית: בחירת מתנ"ס בשכונה הרלוונטית יוצרת שייכות ומחברת את הנוער לסביבתו',
      'המשך המודל ההוליסטי — ספורט, ליווי מנטלי וכישורי חיים, בהתאמה לקנה המידה השכונתי',
      'בסיס להתרחבות עתידית לרשת שכונות נוספת ברחבי הארץ',
    ],
  },
];

export default function ProgramsSection() {
  return (
    <section className="py-24 md:py-28 relative overflow-hidden bg-navy" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            התוכניות שלנו
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4"
          >
            שלוש דרכים <span className="gold-gradient">ליצור שינוי</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-white/50 max-w-3xl mx-auto leading-relaxed"
          >
            שלוש תוכניות משלימות, בקנה מידה שונה — מהשכונה ועד הרמה הארצית — כולן בנויות על אותו מודל הוליסטי: ספורט, פיתוח מנטלי וכישורי חיים.
          </motion.p>
        </div>

        <div className="space-y-6">
          {PROGRAMS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-white/10 bg-[#1B263B] p-6 md:p-8 hover:border-gold/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 md:w-64">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${p.color}20`, border: `1px solid ${p.color}40` }}
                  >
                    <p.icon size={22} style={{ color: p.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full inline-block mb-2"
                    style={{ backgroundColor: `${p.color}15`, color: p.color }}
                  >
                    {p.tag}
                  </span>
                  <h3 className="font-display text-xl font-black text-white leading-tight mb-1">{p.title}</h3>
                  <p className="font-body text-xs text-white/40">{p.subtitle}</p>
                </div>

                <div className="flex-1">
                  <p className="font-body text-sm text-white/60 leading-relaxed mb-4">{p.summary}</p>
                  <ul className="space-y-2.5">
                    {p.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <ChevronLeft size={14} className="mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                        <span className="font-body text-xs text-white/50 leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlights: mental development + location emphasis, shared across all programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          {[
            { icon: Brain, text: 'פיתוח מנטלי וטיפולי עמוק בכל תוכנית' },
            { icon: MapPin, text: 'המיקום הקהילתי הוא לב ההצלחה — שייכות מקומית לכל שכבת גיל' },
            { icon: Wallet, text: 'כישורי חיים, ניהול פיננסי ויזמות כחלק בלתי נפרד מהתהליך' },
          ].map((h, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center gap-3">
              <h.icon size={18} className="text-gold flex-shrink-0" />
              <span className="font-body text-xs text-white/60 leading-relaxed">{h.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="font-body text-sm text-white/50 mb-5">רוצים לשמוע עוד או להוביל אחת מהתוכניות באזורכם?</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body font-bold text-sm bg-gold text-white px-8 py-3.5 rounded-sm hover:bg-gold-light transition-colors"
          >
            <MessageCircle size={18} /> דברו איתנו בוואטסאפ
          </a>
        </motion.div>
      </div>
    </section>
  );
}