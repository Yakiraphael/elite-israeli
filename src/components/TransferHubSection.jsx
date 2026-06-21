import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Users, CheckCircle2, ArrowLeft } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    title: 'המועדון שולח הצעה',
    desc: 'הצעת הצטרפות + מסמך PDF רשמי נשלחים דרך המערכת.',
  },
  {
    icon: ShieldCheck,
    title: 'בדיקת הנהלת עילית',
    desc: 'הנהלת "עילית ישראלית" בודקת ומאשרת את ההצעה לפני המשך התהליך.',
  },
  {
    icon: Users,
    title: 'אישור אפוטרופוס חוקי',
    desc: 'האפוטרופוס החוקי מקבל את ההצעה לאישור מקביל, בליווי צוות ניהולי.',
  },
  {
    icon: CheckCircle2,
    title: 'הזמנה לנבחנת — רק לאחר אישור',
    desc: 'רק לאחר אישור דו-צדדי, הנוער מוזמן לנבחן. מודל מגן ומבוקר.',
  },
];

export default function TransferHubSection() {
  return (
    <section id="transfer-hub" className="py-24 md:py-28 relative overflow-hidden bg-white" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase"
          >
            Transfer Hub · מרכז העברות פנימי
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-4"
          >
            הגשת הצעה רשמית <span className="gold-gradient">לקבוצות וסקאוטים</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            כל הצעת הצטרפות עוברת תחילה דרך הנהלת "עילית ישראלית" ואפוטרופוס חוקי — לפני שמגיעה לנוער.
            מודל מגן, מקצועי ומבוקר המבטיח את ביטחון הקטינים.
          </motion.p>
        </div>

        {/* Routing steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white border border-slate-200 rounded-lg p-6 hover:border-gold/50 hover:shadow-lg transition-all"
            >
              <div className="absolute -top-3 right-5 w-7 h-7 rounded-full bg-gold text-white text-xs font-black flex items-center justify-center">
                {i + 1}
              </div>
              <div className="w-11 h-11 rounded-lg bg-amber-50 border border-gold/20 flex items-center justify-center mb-4">
                <s.icon size={20} className="text-gold" />
              </div>
              <h3 className="font-display text-base font-black text-navy mb-2">{s.title}</h3>
              <p className="font-body text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Protection banner + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-lg overflow-hidden bg-navy border border-gold/20"
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white mb-1">הגנה על הנוער</h3>
                <p className="font-body text-xs text-white/60 max-w-xl leading-relaxed">
                  ההצעה אינה מגיעה ישירות לנער. כל פנייה עוברת בדיקת רקע ואימות זהות של המועדון הפונה,
                  לפי נהלי "עילית ישראלית" ודיני הגנת קטינים.
                </p>
              </div>
            </div>
            <Link
              to="/transfer-hub"
              className="font-body font-bold text-sm bg-gold text-white px-8 py-3.5 rounded-sm hover:bg-gold-light transition-colors flex items-center gap-2 flex-shrink-0"
            >
              הגשת הצעת הצטרפות <ArrowLeft size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}