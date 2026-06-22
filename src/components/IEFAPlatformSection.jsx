import { motion } from 'framer-motion';
import { Brain, Database, ShieldCheck, TrendingDown, Target, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADVANTAGES = [
  {
    icon: Brain,
    title: 'מדד ה-MENTAL',
    subtitle: 'The Mental Index',
    desc: 'לא רק גולים ובישולים. פיתחנו ציון מאומת (1-99) שמודד קור רוח, מנהיגות והתמדה — מחושב בזמן אמת ע"י האנליסטים שלנו בשטח. מועדונים גדולים לא קונים רק רגליים, הם קונים אופי מוכח.',
  },
  {
    icon: Database,
    title: 'אימות דאטה עוקף רגולציה',
    subtitle: 'Data Scraping',
    desc: 'סקריפטים חכמים שואבים ומצליבים מדי לילה את הנתונים הרשמיים מאתר ההתאחדות לכדורגל ישירות לקלפי ה-FIFA הדיגיטליים של השחקנים — ללא תלות בטובות הדדיות. הדאשבורד האמין ביוקר בשוק.',
  },
  {
    icon: ShieldCheck,
    title: 'שומר הסף המשפטי',
    subtitle: 'Guardian Protection Flow',
    desc: 'לשחקן הנוער יש פרופיל ביצועים מלא — אך אפס סמכות משפטית. כל הצעת העברה עוברת פיצול אוטומטי, מאומתת ב-OTP לנייד ההורה ונחתמת דיגיטלית. 100% הגנה משפטית לקטינים.',
  },
  {
    icon: TrendingDown,
    title: 'דיסראפשן כלכלי: 5% בלבד',
    subtitle: 'FinTech Core',
    desc: 'במקום סוכנים שגוזרים 10%-15% מהחוזה, המערכת מאפשרת ייצוג דיגיטלי מלא לכל שחקן בוגר בעמלה חסרת תקדים של 5% בלבד — שחלק ממנה נצבע ישירות כתרומה לחל"צ, לסבסוד רישום ובדיקות רפואיות לילדי הפריפריה.',
  },
];

export default function IEFAPlatformSection() {
  return (
    <section id="iefa-platform" className="py-24 md:py-32 relative overflow-hidden bg-[#0D1B2A]" dir="rtl">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-[#D4AF37] font-bold uppercase"
          >
            IEFA Platform · תשתית הספורט-טק של מדינת ישראל
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-white mt-4 mb-4"
          >
            ה-LinkedIn וה-FinTech <span className="gold-gradient">של עולם הכדורגל</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-[#D4AF37] mx-auto mb-6"
          />
          <motion.blockquote
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-base md:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed italic"
          >
            "הבעיה הגדולה ביותר בכדורגל המודרני היא לא מחסור בכישרון, אלא שוק העברות מיושן, אטום ובירוקרטי,
            שנוטש 99% מהילדים בפריפריה ומסתמך על אינטואיציות וקשרים אישיים במקום על דאטה מאומת."
          </motion.blockquote>
        </div>

        {/* Solution banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-l from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-lg p-6 md:p-8 mb-14 text-center"
        >
          <p className="font-body text-sm md:text-base text-white/70 leading-relaxed max-w-3xl mx-auto">
            פלטפורמת <span className="text-[#D4AF37] font-bold">IEFA</span> היא פלטפורמת הספורט-טק והפינטק הראשונה בישראל שמנהלת את שוק העברות השחקנים מקצה לקצה —
            דיגיטלית, שקופה ומבוססת דאטה. המערכת מחברת בין ארבעה קודקודים: שחקנים, הורים, מועדונים מקצועיים ואנליסטים בשטח.
          </p>
        </motion.div>

        {/* 4 Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {ADVANTAGES.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1B263B] border border-white/10 rounded-lg p-6 hover:border-[#D4AF37]/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <a.icon size={22} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-[#D4AF37]/60 uppercase mb-1">{a.subtitle}</div>
                  <h3 className="font-display text-lg font-black text-white mb-2">{a.title}</h3>
                  <p className="font-body text-sm text-white/50 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social mission callout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-lg overflow-hidden bg-gradient-to-l from-[#1B263B] to-[#0D1B2A] border border-[#D4AF37]/30"
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent" />
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
                <Target size={22} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white mb-2">הלב החברתי</h3>
                <p className="font-body text-sm text-white/60 max-w-2xl leading-relaxed">
                  אנחנו לא מנהלים עוד חוג כדורגל, ולא עוד סוכנות שחקנים. אנחנו בונים את תשתית הספורט-טק והפינטק הרשמית של מדינת ישראל —
                  רשת חברתית וכלכלית חסינת-חסימות שמצילה בני נוער מהרחוב ומזניקה אותם, יחד עם השחקנים הבוגרים, ישירות לחזית הבמה המקצוענית.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="font-body font-bold text-sm bg-[#D4AF37] text-[#0D1B2A] px-8 py-3.5 rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              מודל עסקי <ArrowLeft size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}