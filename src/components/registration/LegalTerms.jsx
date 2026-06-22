import { ShieldCheck, FileSignature, HeartPulse, Briefcase, CreditCard } from 'lucide-react';

const YOUTH_TERMS = [
  {
    key: 'platform_terms',
    icon: ShieldCheck,
    title: 'אישור תקנון הפלטפורמה ופיתוח דיגיטלי',
    desc: 'הסכמה לכך ש"עילית ישראלית" מנהלת את הפרופיל הדיגיטלי, הדאטה והסקאוטינג של הילד, ומורשית להציג את נתוניו ומדיית הוויזיו שלו למועדונים מורשים.',
  },
  {
    key: 'digital_power_of_attorney',
    icon: FileSignature,
    title: 'ייפוי כוח בירוקרטי דיגיטלי',
    desc: 'ההורה מאשר למערכת להשתמש בצילום הת"ז והאישור הרפואי שהעלה לצורך הרכבת "תיק רישום להתאחדות" ומסירתו למועדון קולט, ברגע שההורה יאשר את ההעברה הספציפית ב-SMS.',
  },
  {
    key: 'medical_waiver',
    icon: HeartPulse,
    title: 'ויתור סודיות רפואית מוגבל',
    desc: 'אישור להציג את תוקף האישור הרפואי בלבד (תקין/לא תקין) למנהלי קבוצות.',
  },
];

const ADULT_TERMS = [
  {
    key: 'digital_representation',
    icon: Briefcase,
    title: 'בלעדיות ייצוג דיגיטלי (עמלת 5%)',
    desc: 'השחקן מאשר כי פלטפורמת IEFA היא הצינור הדיגיטלי הבלעדי שלו לקבלת הצעות מקוונות, וכי סגירת חוזה דרך הפלטפורמה כרוכה בעמלת תיווך מערכתית בגובה 5% משווי החוזה שנחתם.',
  },
  {
    key: 'payment_pre_auth',
    icon: CreditCard,
    title: 'אישור סליקה מראש (Pre-Authorization)',
    desc: 'השחקן מאשר לחברת הסליקה של המערכת להנפיק דרישות תשלום או לחייב את אמצעי התשלום שלו/של המועדון עבור דמי טיפול רשמיים עם השלמת ההעברה.',
  },
];

export default function LegalTerms({ isAdult, accepted, onToggle }) {
  const terms = isAdult ? ADULT_TERMS : YOUTH_TERMS;
  const allAccepted = terms.every(t => accepted[t.key]);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">חתימה דיגיטלית · {isAdult ? 'בוגר' : 'קטין'}</span>
        <h3 className="text-white font-black text-lg mt-2">אישור תנאים משפטיים</h3>
        <p className="text-white/40 text-xs mt-1">
          {isAdult
            ? 'השחקן חותם בעצמו על המסמכים הבאים'
            : 'ההורה חותם בשם הקטין על המסמכים הבאים'}
        </p>
      </div>

      <div className="space-y-3">
        {terms.map(term => {
          const isChecked = accepted[term.key] || false;
          return (
            <div
              key={term.key}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${isChecked ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 bg-[#0D1B2A] hover:border-white/20'}`}
              onClick={() => onToggle(term.key, !isChecked)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                  {isChecked && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <term.icon size={14} className={isChecked ? 'text-green-400' : 'text-[#D4AF37]'} />
                    <span className="text-white font-bold text-sm">{term.title}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{term.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!allAccepted && (
        <p className="text-amber-400/80 text-xs text-center mt-4">
          נא לאשר את כל התנאים כדי להשלים את הרישום
        </p>
      )}
    </div>
  );
}