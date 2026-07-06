import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Users, CheckCircle2, ArrowLeft, CreditCard, Baby, Star, MessageSquare, Clock } from 'lucide-react';
import PreRegistrationModal from './PreRegistrationModal';

const YOUTH_STEPS = [
  { icon: FileText, title: 'המועדון מגיש הצעה', desc: 'הצעת הצטרפות + מסמך חוזה PDF רשמי נשלחים דרך המערכת.' },
  { icon: ShieldCheck, title: 'בדיקת הנהלת עילית', desc: 'הנהלת "עילית ישראלית" בודקת ומאשרת את תקינות ההצעה.' },
  { icon: Users, title: 'אישור אפוטרופוס ב-OTP', desc: 'השחקן מקבל התראת צפייה. ההורה מקבל SMS/מייל מאובטח עם קוד אימות חד-פעני.' },
  { icon: CheckCircle2, title: 'חתימה דיגיטלית + הפקת תיק', desc: 'ההורה חותם דיגיטלית. המערכת מייצרת קובץ מאוחד, שולחת עותקים ומשנה סטטוס ל"הועבר".' },
];

const ADULT_STEPS = [
  { icon: FileText, title: 'המועדון מגיש הצעה', desc: 'הצעה דיגיטלית לשחקן בוגר חופשי — שכר מוצע + טיוטת חוזה.' },
  { icon: CheckCircle2, title: 'אישור השחקן', desc: 'השחקן הבוגר בוחן את התנאים, לוחץ "מאשר תנאים" וחותם דיגיטלית.' },
  { icon: CreditCard, title: 'אימות תשלום (Payment Gate)', desc: 'המערכת מייצרת דרישת תשלום לעמלת IEFA (2%). תיק ההעברה נשאר חסום עד אישור תשלום (PAID).' },
  { icon: ShieldCheck, title: 'אימות התאחדות (IFA)', desc: 'המערכת משחררת את תיק הרישום, עוקבת אחר עדכון שם הקבוצה באתר ההתאחדות עד אישור סופי (COMPLETED).' },
];

export default function TransferHubSection() {
  const [tab, setTab] = useState('youth');
  const [showModal, setShowModal] = useState(false);
  const steps = tab === 'youth' ? YOUTH_STEPS : ADULT_STEPS;

  return (
    <section id="transfer-hub" className="py-24 md:py-28 relative overflow-hidden bg-white" dir="rtl">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-4"
          >
            <Clock size={13} className="text-gold" />
            <span className="font-body text-xs font-bold text-gold">בקרוב · בשלבי פיתוח מתקדמים</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-body text-xs tracking-[0.3em] text-gold font-bold uppercase block"
          >
            Transfer Hub · מערכת העברות IEFA
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-black text-navy mt-4 mb-4"
          >
            מערכת ההעברות של <span className="gold-gradient">עילית ישראלית</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="w-24 h-0.5 bg-gold mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="font-body text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed"
          >
            אנחנו בונים זרימת עבודה מבוקרת, מאובטחת ואוטומטית לכל סוגי ההעברות — נוער ובוגרים. הצטרפו לרשימת ההמתנה כדי לקבל גישה מוקדמת עם ההשקה.
          </motion.p>
        </div>

        {/* Youth / Adult toggle */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { id: 'youth', label: 'נוער וקטינים', icon: Baby },
            { id: 'adult', label: 'בוגרים (18+)', icon: Star },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={`זרימת עבודה: ${t.label}`}
              aria-pressed={tab === t.id}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all ${tab === t.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {steps.map((s, i) => (
            <motion.div
              key={`${tab}-${s.title}`}
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

        {/* Adult features (only for adult tab) */}
        {tab === 'adult' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14"
          >
            {[
              { icon: MessageSquare, title: 'צ׳אט ישיר ומאובטח', desc: 'שחקן בוגר וסקאוט יכולים לנהל צ׳אט ישיר בתוך המערכת לסגירת תנאים, שכר ומבחנים.' },
              { icon: Star, title: 'מנגנון "סוכן חופשי"', desc: 'כפתור שמסמן לשוק: "שחקן חופשי ללא חוזה וללא סוכן, מוכן לחתימה מיידית".' },
              { icon: CreditCard, title: 'ארנק דיגיטלי ו-Escrow', desc: 'תבניות חוזים סטנדרטיות, חתימה דיגיטלית, ושחרור מסמכים רק לאחר אימות תשלום.' },
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <f.icon size={20} className="text-gold mb-3" />
                <h4 className="font-display font-black text-sm text-navy mb-1">{f.title}</h4>
                <p className="font-body text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

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
                <h3 className="font-display text-lg font-black text-white mb-1">
                  {tab === 'youth' ? 'הגנה מלאה על קטינים' : 'אבטחה פיננסית מלאה'}
                </h3>
                <p className="font-body text-xs text-white/60 max-w-xl leading-relaxed">
                  {tab === 'youth'
                    ? 'ההצעה אינה מגיעה ישירות לנער. פנייה ישירה לקטין חסומה לחלוטין. כל פנייה עוברת את הנהלת "עילית ישראלית" ואישור אפוטרופוס ב-OTP.'
                    : 'תיק ההעברה נשאר חסום עד אימות תשלום העמלה. אימות כפול מול ההתאחדות לכדורגל (IFA) — ברישום ולאחר סגירת ההעברה.'}
                  {' '}המערכת עומדת בתקני פרטיות מחמירים ובתקני אבטחת מידע מתקדמים, כולל הצפנת נתונים, אחסון בשרתים מאובטחים בתקן SOC 2 ו-ISO 27001, ובקרות גישה מבוססות הרשאות.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="font-body font-bold text-sm bg-gold text-white px-8 py-3.5 rounded-sm hover:bg-gold-light transition-colors flex items-center gap-2 flex-shrink-0"
            >
              הצטרפו לרשימת ההמתנה <ArrowLeft size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {showModal && <PreRegistrationModal onClose={() => setShowModal(false)} />}
    </section>
  );
}