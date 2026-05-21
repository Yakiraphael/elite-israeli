import { motion } from 'framer-motion';
import { Home, Trophy, Users, Star, TrendingUp, MapPin, Handshake, Flame, Target, Award } from 'lucide-react';

const goals = [
  { icon: Home, title: 'בית לחיים', subtitle: 'מרכז קהילתי לנוער הפריפריה', description: 'יצירת "בית לחיים" קבוע ומטפח לנוער הפריפריה — מרחב בטוח שבו פוטנציאל מזוהה ומפותח.' },
  { icon: MapPin, title: 'ליגות נוער אזוריות', subtitle: 'צפון, דרום ומרכז', description: 'הקמת ליגות נוער אזוריות רשמיות ברחבי הצפון, הדרום והמרכז של ישראל — מסגרות תחרותיות מובנות.' },
  { icon: Star, title: 'בית עילית', subtitle: 'מרכז לבוגרי התכנית', description: 'בניית "בית עילית" — מרכז בלעדי לבוגרי התכנית להמשיך לצמוח, לחנוך עמיתים ולהיכנס למסלולים מקצועיים.' },
  { icon: Trophy, title: 'הקמת קבוצה בכירה', subtitle: 'מבוגרי התכנית', description: 'הקמת קבוצה תחרותית בכירה הבנויה כולה מבוגרי התכנית — הוכחה חיה למה שינוי נראה כמוהו בקנה מידה.' },
  { icon: TrendingUp, title: 'גיוס לליגות מקצועיות', subtitle: 'מסלול לקריירה מקצועית', description: 'פיתוח מסלול ברור לגיוס שחקנים מוכשרים לליגות מקצועיות — הפיכת פיתוח להזדמנות אמיתית.' },
  { icon: Users, title: 'מנהיגות מעשית', subtitle: 'דור המנהיגים הבא', description: 'טיפוח דור המנהיגים הקהילתי הבא דרך חניכה מעשית, תכניות אחריות וחוויות מנהיגות בעולם האמיתי.' },
  { icon: Flame, title: 'חינוך מנטלי', subtitle: 'NLP ובניית מנטליות', description: 'העברת תכניות מובנות ב-NLP, חוסן פסיכולוגי וחשיבה בעלת ביצועים גבוהים — כלים שהעלית העולמית משתמשת בהם.' },
  { icon: Handshake, title: 'פיתוח יזמות', subtitle: 'מדגרת עסקים', description: 'מתן מסגרות של יזמות וניהול עסקי לנוער, והפיכת שאיפות לעסקים בני קיימא.' },
  { icon: Target, title: 'העצמה פיננסית', subtitle: 'אוריינות כלכלית', description: 'הוראת אוריינות פיננסית, חשיבת השקעות ועצמאות כלכלית — שבירת מעגלים דוריים דרך חינוך פיננסי.' },
  { icon: Award, title: 'השפעה קהילתית', subtitle: 'אפקט גלים ברחבי ישראל', description: 'מדידת הצלחה לא בגביעים אלא בקהילות שנשתנו — יצירת אפקט גלים של העצמה ברחבי הפריפריה הישראלית.' },
];

export default function GoalsSection() {
  return (
    <section id="goals" className="py-28 md:py-36 relative overflow-hidden bg-white" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="absolute inset-0 opacity-3 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full border border-gold/10" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full border border-gold/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold"
          >
            החזון האסטרטגי
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-black text-navy mt-4 mb-6"
          >
            10 <span className="gold-gradient">יעדי השפעה</span>
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
            className="font-body text-slate-500 max-w-2xl mx-auto"
          >
            כל יוזמה, כל תכנית, כל שחקן — ממופים לעשרה עמודי תווך טרנספורמציוניים המגדירים את מחויבותנו לנוער ישראל.
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
                transition={{ delay: (i % 3) * 0.1 }}
                className="group pillar-card card-hover rounded-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-amber-50 border border-gold/25 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <span className="font-body text-xs font-bold text-gold/80 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-display text-lg font-black text-navy mb-0.5">{goal.title}</h3>
                    <span className="font-body text-xs text-gold/60">{goal.subtitle}</span>
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