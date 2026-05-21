import { motion } from 'framer-motion';
import { Home, Trophy, Users, Star, TrendingUp, MapPin, Handshake, Flame, Target, Award } from 'lucide-react';

const goals = [
  { icon: Home, title: 'בית לחיים', subtitle: 'מרכז קהילתי לנוער', description: 'הקמת מרכז קהילתי קבוע ומקצועי לנוער הפריפריה — מרחב פיתוח מובנה שבו כישרון מזוהה, מטופח ומנוהל לכדי פוטנציאל מלא.' },
  { icon: MapPin, title: 'ליגות נוער אזוריות', subtitle: 'מסגרות תחרות ממוסדות', description: 'הקמת ליגות נוער אזוריות רשמיות בצפון, בדרום ובמרכז הארץ — פלטפורמות תחרותיות הפועלות כמנועי מיצוי כישרון ומנהיגות.' },
  { icon: Star, title: 'בית עילית', subtitle: 'רשת בוגרים מקצועית', description: 'בניית פלטפורמת בוגרים — "בית עילית" — המחברת בין מצטיינים לשעבר לתפקידי חונכות, ייעוץ ומסלולים מקצועיים בתחומים מגוונים.' },
  { icon: Trophy, title: 'קבוצה תחרותית בכירה', subtitle: 'הוכחת מושג חברתית', description: 'הקמת קבוצה ספורטיבית בכירה המאויישת כולה מבוגרי התכנית — מודל חי המוכיח את אפקטיביות ההשקעה בפיתוח אנושי ממוסד.' },
  { icon: TrendingUp, title: 'מסלולי גיוס מקצועי', subtitle: 'ממגרש הכדורגל לקריירה', description: 'פיתוח מסלולים מובנים לגיוס שחקנים מצטיינים לליגות מקצועיות — הסרת מחסומים ויצירת מוביליות חברתית וכלכלית אמיתית.' },
  { icon: Users, title: 'פיתוח מנהיגות', subtitle: 'דור ההמשך הקהילתי', description: 'תכנית פיתוח מנהיגות מובנית המכשירה את דור ההמשך לתפקידי ניהול, חניכה ואחריות קהילתית — בכלים מקצועיים ומדידים.' },
  { icon: Flame, title: 'חוסן מנטלי ו-NLP', subtitle: 'מצוינות אופרטיבית', description: 'הטמעת תכניות NLP, חוסן פסיכולוגי ותודעת ביצועים גבוהים — מערכת כלים פסיכולוגית-חינוכית המשמשת את העלית הספורטיבית העולמית.' },
  { icon: Handshake, title: 'מדגרת יזמות', subtitle: 'עסקים ומיזמים חברתיים', description: 'תכנית יזמות עסקית מובנית המלווה נוער בפיתוח, תכנון והשקת מיזמים — גישה פרקטית לחשיבה מנהיגותית ולניהול עסקי.' },
  { icon: Target, title: 'אוריינות פיננסית', subtitle: 'עצמאות כלכלית', description: 'הוראת ניהול פיננסי אישי, השקעות ועצמאות כלכלית — שבירת מעגלי עוני דוריים דרך חינוך פיננסי מעשי ומדיד.' },
  { icon: Award, title: 'השפעה קהילתית מדידה', subtitle: 'אפקט השפעה ארצי', description: 'מדידת הצלחה לפי מדדי השפעה חברתית מוכחים — הפחתת נשירה, עלייה בתעסוקה, ושינוי מדד הניידות החברתית ברחבי הפריפריה.' },
];

export default function GoalsSection() {
  return (
    <section id="goals" className="py-28 md:py-36 relative overflow-hidden bg-white" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            החזון האסטרטגי
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-6"
          >
            10 <span className="gold-gradient">יעדי השפעה מדידים</span>
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
            className="font-body text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            כל יוזמה ותכנית מחוברת למדדי השפעה מדידים — מסגרת אחידה המבטיחה שקיפות, יעילות ותוצאות ברות אימות
            לכלל בעלי העניין: רשויות, מערכת החינוך, גופי פילנתרופיה ומשקיעים חברתיים.
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
                transition={{ delay: (i % 3) * 0.08 }}
                className="group pillar-card card-hover rounded-sm p-6 bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-amber-50 border border-gold/25 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <span className="font-body text-xs font-bold text-gold/80 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-display text-base font-black text-navy mb-0.5">{goal.title}</h3>
                    <span className="font-body text-xs text-gold/60 font-semibold">{goal.subtitle}</span>
                    <p className="font-body text-xs text-slate-500 mt-3 leading-relaxed">{goal.description}</p>
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