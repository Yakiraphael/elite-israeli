import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';
import { motion } from 'framer-motion';
import { Check, Building2, Star, Baby, Crown, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const YOUTH_PLANS = [
  {
    icon: Baby,
    name: 'בסיסי',
    price: 'חינם',
    period: '',
    desc: 'לכל שחקן נוער',
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
      'קידום פרופיל מול סקאוטרים',
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
    desc: 'לשחקנים בוגרים',
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
      'פרופיל מקודם מול סקאוטרים',
      'צ׳אט ישיר עם סקאוטרים',
      'תבניות חוזים סטנדרטיות',
      'חתימה דיגיטלית עצמאית',
      'דוחות ביצועים מתקדמים',
    ],
    cta: 'שדרג לפרימיום',
  },
];

const CLUB_PLANS = [
  {
    icon: Building2,
    name: 'מנוי מועדון B2B',
    price: '₪1,500',
    period: '/ חודש',
    desc: 'למועדונים וסקאוטרים מקצועניים',
    features: [
      'גישה למאגר שחקנים מלא ומסונן',
      'סינון מתקדם (עמדה, גיל, מדדים, MENTAL)',
      'צפייה בסרטוני ביצועים מלאים',
      'שימוש ב-Transfer Hub להגשת הצעות רשמיות',
      'העלאת מסמכי חוזה PDF',
      'תמיכה וליווי מקצועי',
    ],
    cta: 'צור קשר למנוי',
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
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">מודל עסקי IEFA</span>
          <h1 className="text-white text-4xl md:text-5xl font-black mt-4 mb-4">תמחור ומסלולים</h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            טכנולוגיה, אופטימיזציה, דאטה וחינוך — מודלים עסקיים חוקיים ורווחיים, מבלי לגעת בכספי העברות ישירים של נוער
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

      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
        {tab === 'clubs' ? (
          <div className="max-w-lg mx-auto">
            <ClubCard plan={CLUB_PLANS[0]} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(tab === 'youth' ? YOUTH_PLANS : ADULT_PLANS).map((plan, i) => (
              <PlanCard key={i} plan={plan} />
            ))}
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-white font-black text-2xl text-center mb-2">מקורות הכנסה נוספים</h2>
          <p className="text-white/40 text-sm text-center mb-8">מודלים עסקיים חוקיים ומניבים</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Crown, title: 'דמי השבחה וסולידריות', desc: 'עד 5% מהעברה עתידית לפי תקנון פיפ"א — עבור שחקנים שהתאמנו באקדמיה בגילאי 12-23', color: 'text-[#D4AF37]' },
              { icon: Sparkles, title: 'חסויות מסחריות', desc: 'מותגי ספורט ונוער מעניקים חסות ל"נבחרת החודש" ופרסום ממוקד בפורטל', color: 'text-emerald-400' },
              { icon: Star, title: 'עמלות תיווך (בוגרים)', desc: '5%-10% עמלה חוקית מחוזה שחקן בוגר — בדיוק כמו סוכן מסורתי, רק אוטומטי ושקוף', color: 'text-blue-400' },
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
          <Link to="/player-profile" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-8 py-4 rounded-sm hover:bg-amber-400 transition-colors">
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
      className="relative bg-gradient-to-b from-[#1B263B] to-[#0D1B2A] border border-[#D4AF37]/40 rounded-lg p-8 shadow-2xl shadow-[#D4AF37]/10"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
          <Icon size={26} className="text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-white font-black text-xl">{plan.name}</h3>
          <p className="text-white/40 text-xs">{plan.desc}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-1 mt-4 mb-6">
        <span className="text-white font-black text-5xl">{plan.price}</span>
        <span className="text-white/40 text-sm">{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check size={16} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <span className="text-white/70">{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/transfer-hub" className="block text-center bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm hover:bg-amber-400 transition-colors">
        {plan.cta}
      </Link>
    </motion.div>
  );
}