import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck, CreditCard, Users, Send, Star, Baby, TrendingUp } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    icon: Baby,
    title: 'נוער וקטינים',
    color: 'text-blue-400',
    questions: [
      { q: 'האם הרישום לשחקנים צעירים חינמי?', a: 'כן. כל שחקן נוער מקבל פרופיל בסיסי בחינם — הדמוקרטיזציה של הדאטה היא עקרון יסוד שלנו. שירותי פרימיום (Elite Pro) זמינים כאופציה נוספת להורים שרוצים דחיפה נוספת.' },
      { q: 'מהי חובת האפוטרופוס ברישום?', a: 'כל נער חייב לשייך לפרופיל שלו את מספר הטלפון והמייל של ההורה האחראי. זוהי הגנה משפטית מלאה על קטינים — ללא אישור הורה בקוד OTP חד-פעמי, אף העברה לא יכולה להתקדם.' },
      { q: 'האם מועדונים יכולים לפנות ישירות לנער?', a: 'לא. פנייה ישירה לקטין חסומה לחלוטין. מועדונים יכולים להגיש הצעה רשמית דרך Transfer Hub בלבד, עם חובת העלאת מסמך PDF. השחקן מקבל התראת צפייה, וההורה מקבל הודעה מאובטחת.' },
      { q: 'מה הוא כרטיס ה-Elite ID?', a: 'כרטיס דיגיטלי עם מספר סידורי ייחודי (ELITE-2026-XXXX), נתונים פיזיים, ומדדי ביצועים (1-99) הכוללים את המדד הייחודי MENTAL — חוסן וקור רוח. הכרטיס מתעדכן בזמן אמת ע"י המאמנים.' },
    ],
  },
  {
    icon: TrendingUp,
    title: 'בוגרים (18+)',
    color: 'text-emerald-400',
    questions: [
      { q: 'מה ההבדל בין מערכת הנוער למערכת הבוגרים?', a: 'בוגרים מעל גיל 18 מקבלים פרופיל עצמאי לחלוטין — ללא חובת אפוטרופוס. ניתן לנהל צ׳אט ישיר עם סקאוטרים, לחתום דיגיטלית באופן עצמאי, ולסמן עצמך כ"שחקן חופשי" מוכן לחתימה מיידית.' },
      { q: 'מהי עמלת התיווך של IEFA?', a: 'עמלה חסרת תקדים של 5% בלבד מכל חוזה בוגר שנסגר דרך ה-Transfer Hub — במקום 10%-15% שגוזרים סוכנים מסורתיים. חלק מהעמלה נתרם ישירות לחל"צ לסבסוד רישום ובדיקות רפואיות לילדי הפריפריה.' },
      { q: 'מהו מנגנון ה-Escrow (בטוחה)?', a: 'בהעברת בוגרים, מסמכי השחרור להתאחדות נשארים חסומים עד שהמועדון משלם את עמלת IEFA דרך קישור תשלום מאובטח. רק לאחר אימות התשלום (PAID), המערכת משחררת את תיק ההעברה.' },
      { q: 'איך המערכת מאמתת את סטטוס השחקן?', a: 'המערכת מבצעת אימות כפול מול ההתאחדות לכדורגל: ברישום (בדיקת כרטיס נקי) ולאחר סגירת העברה (מעקב עדכון שם הקבוצה באתר ההתאחדות). הסטטוס מתעדכן אוטומטית ל-Verified & Live.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'תמחור ומנויים',
    color: 'text-[#D4AF37]',
    questions: [
      { q: 'כמה עולה מנוי מועדון?', a: 'מודל Seats: חבילת FREE (משתמש אחד, גישה לשחקנים בסיסיים בלבד), חבילת PRO (עד 5 משתמשים, פתיחת גישה לשחקני Elite) ב-1,500 ₪/חודש, וחבילת ENTERPRISE (משתמשים ללא הגבלה, גישה מלאה) במחיר מותאם. אין הגבלת הצעות — המועדון יכול לשלוח כמה הצעות שרוצה.' },
      { q: 'מהי לוגיקת חומת התשלום (Paywall)?', a: 'ההגבלה היא על כמות המשתמשים (Seats) ועל דרג המציע (Tier). ב-FREE המועדון יכול להגיש הצעות רק לשחקנים בדרג בסיסי. ב-PRO ו-ENTERPRISE נפתחת הגישה ליהלומי האקדמיה המנטליים של עילית ישראלית. מועדון שרוצה לשים יד על הכישרון הבא — חייב להיות מנוי משלם.' },
      { q: 'מה כולל מסלול Elite Pro?', a: 'מסלול פרימיום לשחקנים ב-49 ₪ בחודש. כולל דוח אנליטי מפורט ומודפס אחת לרבעון, גישה ליועץ מנטלי/תזונתי דיגיטלי, ושירותי עריכת וידאו (Highlight Reels) עם חצים גרפיים מקצועיים.' },
      { q: 'האם יש מודל B2G לרשויות?', a: 'כן. IEFA מוכרת רישיונות דאשבורד שנתיים לעיריות ורשויות מקומיות ככלי EdTech למניעת נשירה ומעקב אחר חוסן בני הנוער בעיר.' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'אבטחה ופרטיות',
    color: 'text-red-400',
    questions: [
      { q: 'איך מוגנים נתוני השחקנים?', a: 'המערכת מאובטחת בהצפנה מלאה. נתוני קטינים מוגנים בשכבות נוספות — אין גישה לפרטי קשר של נערים, וכל פנייה עוברת דרך המערכת בלבד. חתימות דיגיטליות מאומתות בקוד OTP חד-פעני.' },
      { q: 'מה קורה אם מועדון לא משלם את העמלה?', a: 'במערכת הבוגרים, תיק ההעברה (מסמכים חתומים להתאחדות) נשאר חסום ואפור כל עוד סטטוס התשלום הוא PENDING. המועדון פשוט לא יכול לקבל את המסמכים מבלי לשלם.' },
      { q: 'האם המערכת מחליפה עורך דין?', a: 'לא. המערכת מספקת תשתית טכנולוגית ותבניות חוזים. לעניינים משפטיים מורכבים, מומלץ להתייעץ עם עורך דין המתמחה בדיני ספורט.' },
    ],
  },
];

export default function FAQ() {
  const [openCat, setOpenCat] = useState(0);
  const [openQ, setOpenQ] = useState(null);

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B263B] to-[#0D1B2A]" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={28} className="text-[#D4AF37]" />
          </motion.div>
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">עזרה ותמיכה</span>
          <h1 className="text-white text-4xl md:text-5xl font-black mt-4 mb-4">שאלות נפוצות</h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            כל מה שרציתם לדעת על מערכת הליגות וההעברות IEFA — נוער, בוגרים, תמחור, אבטחה ועוד
          </p>
        </div>
      </section>

      {/* Categories tabs */}
      <div className="sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-white/10 z-20">
        <div className="max-w-4xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {FAQ_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setOpenCat(i); setOpenQ(null); }}
              aria-label={`קטגוריה: ${cat.title}`}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${openCat === i ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}
            >
              <cat.icon size={15} /> {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={openCat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {FAQ_CATEGORIES[openCat].questions.map((item, i) => (
              <div key={i} className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenQ(openQ === i ? null : i)}
                  aria-expanded={openQ === i}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-bold text-sm flex-1">{item.q}</span>
                  <ChevronDown size={18} className={`text-[#D4AF37] flex-shrink-0 transition-transform ${openQ === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openQ === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/60 text-sm leading-relaxed px-5 pb-5">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-l from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-lg p-6 text-center">
          <h3 className="text-white font-black text-lg mb-2">לא מצאת את התשובה?</h3>
          <p className="text-white/50 text-sm mb-4">צוות התמיכה שלנו זמין לעזור</p>
          <a href="/#contact" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-6 py-3 rounded-sm hover:bg-amber-400 transition-colors">
            <Send size={15} /> צור קשר
          </a>
        </div>
      </div>

      <Footer />
      <SocialFloat />
    </div>
  );
}