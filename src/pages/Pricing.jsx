import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';
import { motion } from 'framer-motion';
import { Check, Building2, Star, Baby, Crown, ArrowLeft, Sparkles, Users, Infinity as InfinityIcon, Lock, Unlock, Landmark, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const YOUTH_PLANS = [
  {
    icon: Baby,
    name: 'בסיסי',
    price: 'חינם',
    period: '',
    desc: 'לכל שחקן נוער — ללא הגבלה',
    color: 'border-white/15',
    features: [
      'פרופיל שחקן מלא',
      'כרטיס Elite ID דיגיטלי',
      'העלאת קישורי מדיה (יוטיוב/טיקטוק)',
      'השתתפות באירועים וטורנירים',
      'ציר זמן — The Elite Journey',
      'הגנה מלאה על קטינים (אפוטרופוס חובה)',
    ],
    cta: 'הרשמה חינמית',
  },
  {
    icon: Crown,
    name: 'Elite Pro',
    price: '₪49',
    period: '/ חודש',
    desc: 'שירותי ערך מוסף להורים',
    featured: true,
    color: 'border-[#D4AF37]/50',
    features: [
      'כל מה שבבסיסי',
      'דוח אנליטי מפורט ומודפס — רבעוני',
      'גישה ליועץ מנטלי/תזונתי דיגיטלי',
      'שירותי עריכת וידאו (Highlight Reels)',
      'חצים גרפיים מקצועיים על סרטונים',
      'תגיות ביצועים מותאמות אישית',
    ],
    cta: 'שדרג ל-Elite Pro',
  },
];

const ADULT_PLANS = [
  {
    icon: Star,
    name: 'בסיסי',
    price: 'חינם',
    period: '',
    desc: 'לשחקנים בוגרים — ללא הגבלה',
    features: [
      'פרופיל עצמאי לחלוטין (18+)',
      'כרטיס Elite ID דיגיטלי',
      'מנגנון "שחקן חופשי" (Free Agent Toggle)',
      'אימות כרטיס נקי מול ההתאחדות (IFA)',
      'היסטוריית דאטה ממערכת הנוער',
    ],
    cta: 'הרשמה חינמית',
  },
  {
    icon: Crown,
    name: 'פרימיום בוגרים',
    price: '₪99',
    period: '/ חודש',
    desc: 'לחצי-מקצוענים וחובבנים',
    featured: true,
    color: 'border-[#D4AF37]/50',
    features: [
      'כל מה שבבסיסי',
      'צ׳אט ישיר ומאובטח עם סקאוטרים',
      'תבניות חוזים סטנדרטיות',
      'חתימה דיגיטלית עצמאית',
      'דוחות ביצועים מתקדמים',
      'עדכון סטטוס העברה בזמן אמת',
    ],
    cta: 'שדרג לפרימיום',
  },
];

const CLUB_PLANS = [
  {
    icon: Building2,
    name: 'FREE',
    price: 'חינם',
    period: '',
    desc: 'משתמש בודד · Tier 3',
    seats: 'משתמש אחד (1 Seat)',
    tier: 'גישה לשחקנים בדרג בסיסי בלבד',
    features: [
      'משתמש אחד בלבד (המנהל המקצועי)',
      'חיפוש בסיסי במאגר השחקנים',
      'הגשת הצעות ללא הגבלה — אך רק לשחקנים בדרג נמוך',
      'ללא גישה ליהלומי האקדמיה (Elite)',
      'ללא מדדים מנטליים עמוקים',
    ],
    cta: 'התחל בחינם',
    color: 'border-white/15',
  },
  {
    icon: Users,
    name: 'PRO',
    price: '₪1,500',
    period: '/ חודש',
    desc: 'צוות סקאוטינג · Tier 2',
    seats: 'עד 5 משתמשים (5 Seats)',
    tier: 'פתיחת גישה לשחקני Elite מאומתים',
    featured: true,
    color: 'border-[#D4AF37]/50',
    features: [
      'עד 5 משתמשים סימולטניים (מנהל, מאמן, סקאוטרים)',
      'הגשת הצעות ללא הגבלה — כולל שחקני Elite',
      'סינון מתקדם (עמדה, גיל, מדדים, MENTAL)',
      'צפייה בסרטוני ביצועים מלאים',
      'כפתור Transfer Hub פעיל להגשת הצעות',
      'תמיכה וליווי מקצועי',
    ],
    cta: 'שדרג ל-PRO',
  },
  {
    icon: Crown,
    name: 'ENTERPRISE',
    price: 'מחיר מותאם',
    period: '',
    desc: 'מועדון מלא · Tier 1',
    seats: 'משתמשים ללא הגבלה (∞)',
    tier: 'גישה מלאה לכל דרגי השחקנים',
    color: 'border-white/15',
    features: [
      'משתמשים ללא הגבלה (כל מחלקות המועדון)',
      'סקאוטרים, מאמני כל שנתוני הנוער, אנליסטים ומזכירות',
      'הגשת הצעות ללא הגבלה — כולל שחקני Elite בכירים',
      'API ייעודי לאינטגרציה עם מערכות המועדון',
      'דאשבורד ניהולי מותאם אישית',
      'ניהול חשבונית ומחלקות מתקדם',
    ],
    cta: 'צרו קשר',
  },
];

export default function Pricing() {
  const [tab, setTab] = useState('youth');

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <Navbar />

      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B263B] to-[#0D1B2A]" />
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={28} className="text-[#D4AF37]" />
          </motion.div>
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">Pay as you Grow · מודל SaaS</span>
          <h1 className="text-white text-4xl md:text-5xl font-black mt-4 mb-4">תמחור ומסלולים</h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            כניסה חינמית לחלוטין לכל שחקני הנוער והבוגרים. מועדונים משלמים לפי כמות משתמשים (Seats) ודרג מציע (Tiers) —
            ללא הגבלת הצעות. שימוש מאסיבי, צמיחה מבוקרת.
          </p>
        </div>
      </section>

      <div className="sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-white/10 z-20">
        <div className="max-w-2xl mx-auto px-6 flex justify-center gap-1">
          {[
            { id: 'youth', label: 'נוער וקטינים', icon: Baby },
            { id: 'adult', label: 'בוגרים (18+)', icon: Star },
            { id: 'clubs', label: 'מועדונים B2B', icon: Building2 },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={`מסלול: ${t.label}`}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {tab === 'clubs' ? (
          <div>
            {/* Paywall logic explanation */}
            <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <Lock size={22} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-white font-black text-lg mb-2">לוגיקת חומת התשלום (Paywall)</h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    אין הגבלת הצעות — המועדון יכול לשלוח כמה הצעות שרוצה. ההגבלה היא על <span className="text-[#D4AF37] font-bold">כמות המשתמשים (Seats)</span> ועל <span className="text-[#D4AF37] font-bold">דרג המציע (Tier)</span>.
                    במסלול החינמי, המועדון מוגבל לשחקנים בדרג בסיסי בלבד. ב-PRO ו-ENTERPRISE נפתחת הגישה ליהלומי האקדמיה המנטליים של עילית ישראלית.
                  </p>
                </div>
              </div>
            </div>

            {/* Club tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CLUB_PLANS.map((plan, i) => (
                <ClubCard key={i} plan={plan} />
              ))}
            </div>

            {/* Tier restriction matrix */}
            <div className="mt-10 bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8">
              <h3 className="text-white font-black text-base mb-4">דרגי מציעים (Bidder Tiers) — התאמה בין דרג המועדון לדרג השחקן</h3>
              <div className="space-y-3">
                {[
                  { tier: 'Tier 3 — חובבן / ליגות נמוכות', access: 'שחקנים חופשיים ושחקנים בליגות נמוכות', locked: false, icon: Unlock },
                  { tier: 'Tier 2 — מקצועי בינוני (לאומית)', access: 'פתיחת גישה לשחקני Elite מאומתים', locked: false, icon: Unlock },
                  { tier: 'Tier 1 — עלית (ליגת העל / חו"ל)', access: 'גישה מלאה לכל דרגי השחקנים כולל יהלומי האקדמיה', locked: false, icon: Unlock },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0D1B2A] rounded-lg p-4 border border-white/5">
                    <t.icon size={18} className={i === 0 ? 'text-white/40' : 'text-[#D4AF37]'} />
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">{t.tier}</div>
                      <div className="text-white/40 text-xs">{t.access}</div>
                    </div>
                    {i === 0 && <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded">FREE</span>}
                    {i === 1 && <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded">PRO</span>}
                    {i === 2 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">ENTERPRISE</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {(tab === 'youth' ? YOUTH_PLANS : ADULT_PLANS).map((plan, i) => (
              <PlanCard key={i} plan={plan} />
            ))}
          </div>
        )}

        {/* Revenue streams */}
        <div className="mt-16">
          <h2 className="text-white font-black text-2xl text-center mb-2">מקורות הכנסה</h2>
          <p className="text-white/40 text-sm text-center mb-8">שלושה ערוצי SaaS ופינטק משומנים</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Building2, title: 'B2B SaaS — מועדונים', desc: 'מנוי חודשי מבוסס משתמשים (Seats) ודרגי מציעים (Tiers). כמות ההצעות עצמה ללא הגבלה — מייצר שימוש מאסיבי במוצר.', color: 'text-[#D4AF37]' },
              { icon: TrendingDown, title: 'Success Fees — 5% בלבד', desc: 'גבייה אוטומטית של 5% מכל חוזה בוגר שנסגר דרך ה-Transfer Hub. חלק מהעמלה נתרם ישירות לחל"צ לסבסוד ילדי הפריפריה.', color: 'text-emerald-400' },
              { icon: Landmark, title: 'B2G — רשויות מקומיות', desc: 'מכירת רישיונות דאשבורד שנתיים לעיריות ככלי EdTech למניעת נשירה ומעקב אחר חוסן בני הנוער בעיר.', color: 'text-blue-400' },
            ].map((m, i) => (
              <div key={i} className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                <m.icon size={24} className={`${m.color} mb-3`} />
                <h3 className="text-white font-bold text-sm mb-2">{m.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/transfer-portal" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-8 py-4 rounded-sm hover:bg-amber-400 transition-colors">
            התחל עכשיו <ArrowLeft size={16} />
          </Link>
        </div>
      </div>

      <Footer />
      <SocialFloat />
    </div>
  );
}

function PlanCard({ plan }) {
  const Icon = plan.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-[#1B263B] border rounded-lg p-8 ${plan.color || 'border-white/10'} ${plan.featured ? 'shadow-2xl shadow-[#D4AF37]/10' : ''}`}
    >
      {plan.featured && (
        <span className="absolute -top-3 right-8 bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black px-3 py-1 rounded-full tracking-wider">פופולרי</span>
      )}
      <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#D4AF37]" />
      </div>
      <h3 className="text-white font-black text-xl">{plan.name}</h3>
      <p className="text-white/40 text-xs mt-1">{plan.desc}</p>
      <div className="flex items-baseline gap-1 mt-4 mb-6">
        <span className="text-white font-black text-4xl">{plan.price}</span>
        {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check size={16} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <span className="text-white/70">{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/transfer-portal" className={`block text-center font-black text-sm py-3 rounded-sm transition-colors ${plan.featured ? 'bg-[#D4AF37] text-[#0D1B2A] hover:bg-amber-400' : 'border border-white/20 text-white hover:bg-white/5'}`}>
        {plan.cta}
      </Link>
    </motion.div>
  );
}

function ClubCard({ plan }) {
  const Icon = plan.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-b from-[#1B263B] to-[#0D1B2A] border rounded-lg p-6 ${plan.color || 'border-white/10'} ${plan.featured ? 'shadow-2xl shadow-[#D4AF37]/10' : ''}`}
    >
      {plan.featured && (
        <span className="absolute -top-3 right-6 bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black px-3 py-1 rounded-full tracking-wider">המומלץ</span>
      )}
      <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#D4AF37]" />
      </div>
      <h3 className="text-white font-black text-lg">{plan.name}</h3>
      <p className="text-white/40 text-xs mt-0.5">{plan.desc}</p>
      <div className="flex items-baseline gap-1 mt-4 mb-4">
        <span className="text-white font-black text-3xl">{plan.price}</span>
        {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
      </div>

      {/* Seats badge */}
      <div className="flex items-center gap-2 bg-[#0D1B2A] rounded-lg px-3 py-2 mb-2">
        <Users size={14} className="text-[#D4AF37] flex-shrink-0" />
        <span className="text-white/70 text-xs font-bold">{plan.seats}</span>
      </div>
      {/* Tier access badge */}
      <div className="flex items-center gap-2 bg-[#0D1B2A] rounded-lg px-3 py-2 mb-4">
        {plan.name === 'FREE' ? <Lock size={14} className="text-white/40 flex-shrink-0" /> : <Unlock size={14} className="text-[#D4AF37] flex-shrink-0" />}
        <span className="text-white/70 text-xs">{plan.tier}</span>
      </div>

      <ul className="space-y-2.5 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <Check size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <span className="text-white/70">{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/transfer-portal" className={`block text-center font-black text-sm py-3 rounded-sm transition-colors ${plan.featured ? 'bg-[#D4AF37] text-[#0D1B2A] hover:bg-amber-400' : 'border border-white/20 text-white hover:bg-white/5'}`}>
        {plan.cta}
      </Link>
    </motion.div>
  );
}