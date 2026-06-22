import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';
import { motion } from 'framer-motion';
import { Check, Building2, Star, Baby, Crown, ArrowLeft, Sparkles, Users, Lock, Unlock, Landmark, TrendingDown, Coins, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLAYER_FREE = [
  'כספת מסמכים רפואיים ומשפטיים',
  'מחולל קורות חיים דו-לשוני (עברית/אנגלית)',
  'קבלת הצעות ממועדונים',
  'גרף רדאר מנטלי בסיסי (17 מדדים)',
  'ניהול פרטי אפוטרופוס ואימות OTP',
  'Transfer Tracker אישי',
];

const PLAYER_BOOST = [
  'כל מה שבחינם',
  'פתיחת ממליץ מנטלי חיצוני (PDF לגרף)',
  'הקפצת פרופיל ראשון בחיפוש סקאוטרים',
  'התראות ווטסאפ בזמן אמת — סקאוטר צפה בך',
  'ייצוא CV מעוצב לאנגלית (PDF יוקרתי)',
];

const CLUB_TIERS = [
  { name: 'Micro', players: 'עד 30 שחקנים', price: '149 ₪', period: '/חודש', desc: 'מועדונים קטנים / ליגות נמוכות', color: 'border-white/15' },
  { name: 'Growth', players: '31–100 שחקנים', price: '390 ₪', period: '/חודש', desc: 'מחלקות נוער בינוניות', color: 'border-white/15' },
  { name: 'Elite', players: '101–300 שחקנים', price: '890 ₪', period: '/חודש', desc: 'ליגה לאומית / מחלקות ענק', featured: true, color: 'border-[#D4AF37]/50' },
  { name: 'Academy', players: '300+ שחקנים', price: '1,490 ₪', period: '/חודש', desc: 'ליגת העל / אקדמיות גלובליות', color: 'border-white/15' },
];

const SCOUTING_TOKENS = [
  { tokens: 10, price: '90 ₪', badge: null },
  { tokens: 50, price: '400 ₪', badge: 'פופולרי' },
  { tokens: 200, price: '1,400 ₪', badge: 'חיסכון מקסימלי' },
];

export default function Pricing() {
  const [tab, setTab] = useState('player');

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B263B] to-[#0D1B2A]" />
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={28} className="text-[#D4AF37]" />
          </motion.div>
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">Hybrid Value-Based Model</span>
          <h1 className="text-white text-4xl md:text-5xl font-black mt-4 mb-4">תמחור IEFA</h1>
          <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
            כניסה חינמית מוחלטת לשחקנים. מועדונים משלמים לפי מספר שחקנים בסגל — לא לפי כמות הצעות.
            עמלת הצלחה <span className="text-[#D4AF37] font-bold">2% בלבד</span> — לעומת סוכנים שלוקחים 10%.
          </p>
        </div>
      </section>

      {/* Tab nav */}
      <div className="sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-sm border-b border-white/10 z-20">
        <div className="max-w-2xl mx-auto px-6 flex justify-center gap-1">
          {[
            { id: 'player', label: 'שחקנים', icon: Baby },
            { id: 'clubs', label: 'מועדונים B2B', icon: Building2 },
            { id: 'revenue', label: 'מקורות הכנסה', icon: Landmark },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 pb-24">

        {/* PLAYER PLANS */}
        {tab === 'player' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {/* Free */}
              <div className="bg-[#1B263B] border border-white/15 rounded-lg p-7">
                <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center mb-4">
                  <Star size={20} className="text-white/50" />
                </div>
                <h3 className="text-white font-black text-xl">עצמאות מלאה</h3>
                <p className="text-white/40 text-xs mt-1">לכל שחקן · נוער ובוגרים</p>
                <div className="text-4xl font-black text-white mt-4 mb-6">חינם <span className="text-sm font-normal text-white/40">תמיד $0</span></div>
                <ul className="space-y-2.5 mb-6">
                  {PLAYER_FREE.map(f => <li key={f} className="flex items-start gap-2 text-sm"><Check size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" /><span className="text-white/70">{f}</span></li>)}
                </ul>
                <div className="text-[10px] text-white/30 mb-4">💚 חינם לחלוטין לשחקנים ממשפחות מעוטות יכולת</div>
                <Link to="/player-profile" className="block text-center border border-white/20 text-white font-black text-sm py-3 rounded-sm hover:bg-white/5">
                  הרשמה חינמית
                </Link>
              </div>

              {/* Boost */}
              <div className="relative bg-[#1B263B] border border-[#D4AF37]/50 rounded-lg p-7 shadow-2xl shadow-[#D4AF37]/10">
                <span className="absolute -top-3 right-6 bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black px-3 py-1 rounded-full">Elite Boost</span>
                <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                  <Zap size={20} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-white font-black text-xl">חשיפת עלית</h3>
                <p className="text-white/40 text-xs mt-1">למי שרוצה דחיפה אקטיבית</p>
                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-4xl font-black text-white">19 ₪</span>
                  <span className="text-white/40 text-sm">/חודש · או 150 ₪/שנה</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {PLAYER_BOOST.map(f => <li key={f} className="flex items-start gap-2 text-sm"><Check size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" /><span className="text-white/70">{f}</span></li>)}
                </ul>
                <Link to="/transfer-portal" className="block text-center bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm hover:bg-amber-400 transition-colors">
                  שדרג ל-Elite Boost
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* CLUB PLANS */}
        {tab === 'clubs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Scalable tier table */}
            <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 mb-8">
              <h2 className="text-white font-black text-lg mb-1">מנוי שוטף לפי כמות שחקנים (Scalable Tier)</h2>
              <p className="text-white/40 text-xs mb-5">המועדון לא משלם על כמות הצעות — רק על מספר שחקנים פעילים בסגל</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {CLUB_TIERS.map(t => (
                  <div key={t.name} className={`relative bg-[#0D1B2A] border rounded-lg p-5 ${t.color}`}>
                    {t.featured && <span className="absolute -top-2.5 right-4 bg-[#D4AF37] text-[#0D1B2A] text-[9px] font-black px-2 py-0.5 rounded-full">המומלץ</span>}
                    <div className="text-white font-black text-sm">{t.name}</div>
                    <div className="text-[#D4AF37] text-xl font-black mt-2">{t.price}</div>
                    <div className="text-white/30 text-[10px]">{t.period}</div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-white/60 text-xs font-bold">{t.players}</div>
                      <div className="text-white/30 text-[10px] mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-4">*מעל 500 שחקנים — תמחור Enterprise מותאם אישית</p>
            </div>

            {/* Scouting tokens */}
            <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 mb-8">
              <h2 className="text-white font-black text-lg mb-1">🪙 אסימוני סקאוטינג (Scouting Tokens)</h2>
              <p className="text-white/40 text-xs mb-5">כל שחקן במאגר נראה אנונימי (נתונים + רדאר). כדי לפתוח פרופיל מלא — אסימון אחד</p>
              <div className="grid grid-cols-3 gap-3">
                {SCOUTING_TOKENS.map(t => (
                  <div key={t.tokens} className="relative bg-[#0D1B2A] border border-white/10 rounded-lg p-4 text-center">
                    {t.badge && <span className="absolute -top-2.5 right-3 bg-[#D4AF37] text-[#0D1B2A] text-[9px] font-black px-2 py-0.5 rounded-full">{t.badge}</span>}
                    <div className="text-white font-black text-2xl">{t.tokens}</div>
                    <div className="text-white/40 text-xs">אסימונים</div>
                    <div className="text-[#D4AF37] font-black text-lg mt-2">{t.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success fee */}
            <div className="bg-[#1B263B] border border-[#D4AF37]/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <Coins size={22} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-white font-black text-lg mb-1">עמלת הצלחה — 2% בלבד</h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-3">
                    <span className="text-[#D4AF37] font-bold">1.5%</span> משולם על ידי המועדון הקולט ·
                    <span className="text-[#D4AF37] font-bold"> 0.5%</span> מהשחקן — רק אם שכרו מעל 10,000 ₪/חודש.
                    שחקני נוער ושחקנים בשכר נמוך <span className="text-green-400 font-bold">פטורים לחלוטין.</span>
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 inline-block">
                    <span className="text-green-400 text-xs font-bold">💚 20% מכל עמלת הצלחה → פעילות שטח + טורנירים עילית ישראלית</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REVENUE STREAMS */}
        {tab === 'revenue' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Building2, title: 'B2B SaaS — מועדונים', desc: 'מנוי חודשי מדרגי לפי שחקנים בסגל + אסימוני סקאוטינג. צמיחה אוטומטית ב-MRR ככל שהמועדון גדל.', color: 'text-[#D4AF37]' },
                { icon: TrendingDown, title: 'Success Fees — 2%', desc: 'גבייה אוטומטית מכל חוזה שנסגר. 1.5% מהמועדון, 0.5% מהשחקן (מעל 10K ₪). 20% לחל"צ.', color: 'text-emerald-400' },
                { icon: Landmark, title: 'B2G — רשויות מקומיות', desc: 'מכירת רישיונות דאשבורד שנתיים לעיריות ככלי EdTech למניעת נשירה ומעקב חוסן נוער.', color: 'text-blue-400' },
                { icon: Zap, title: 'Boost Players — Freemium', desc: '19 ₪/חודש לשחקן שרוצה חשיפה מוגברת. ויראליות — שחקנים מביאים שחקנים.', color: 'text-amber-400' },
                { icon: Coins, title: 'Scouting Token Economy', desc: 'מועדונים קונים חבילות אסימונים לפי צריכה. גמיש למועדונים קטנים, רווחי עבור גדולים.', color: 'text-purple-400' },
                { icon: Users, title: 'International Expansion', desc: 'כניסה לשוק הגלובלי: Stripe מולטי-מטבעות, TMS פיפ"א, Transfermarkt ID ככרטיס גלובלי.', color: 'text-cyan-400' },
              ].map((m, i) => (
                <div key={i} className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                  <m.icon size={22} className={`${m.color} mb-3`} />
                  <h3 className="text-white font-bold text-sm mb-2">{m.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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