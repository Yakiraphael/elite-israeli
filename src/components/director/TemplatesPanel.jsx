import { BookOpen, ExternalLink, FileText, Baby, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { IFA_TEMPLATES } from '@/lib/contractTemplates';

// ספריית תבניות חוזים חכמות המוצגות למנהל המקצועי — כל תבנית מבוססת על טפסי ההתאחדות לכדורגל.
// מכאן המנהל יכול לדפדף את התבניות הרשמיות, להבין את מבנה החתימות הנדרשות,
// ולעבור ללשונית החוזים ליצירת חוזה חכם מהתבנית שבחר.
export default function TemplatesPanel({ onCreate }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-black text-base">בנק תבניות משפטיות — ההתאחדות לכדורגל</h3>
        <p className="text-white/40 text-xs mt-0.5">
          ספריית תבניות חוזים חכמות מבוססות טפסי football.org.il · יצירה אוטומטית, מילוי מפרטי שחקן וחתימה דיגיטלית רב-צדדית
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {IFA_TEMPLATES.map(t => (
          <div key={t.key} className="bg-[#1B263B] border border-white/10 rounded-lg p-5 flex flex-col card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <BookOpen size={18} className="text-[#D4AF37]" />
              </div>
              <a href={t.reference_url} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#D4AF37] flex items-center gap-1 text-[10px] font-bold transition-colors">
                <ExternalLink size={11} /> מקור
              </a>
            </div>
            <h4 className="text-white font-black text-sm mb-1">{t.label}</h4>
            <p className="text-white/40 text-xs mb-3 flex-1 leading-relaxed">{t.description}</p>

            <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-white/60">
                <User size={11} className="text-[#D4AF37]" /> חתימת שחקן נדרשת
              </div>
              {t.requires_guardian ? (
                <div className="flex items-center gap-2 text-white/60">
                  <Baby size={11} className="text-[#D4AF37]" /> חתימת אפוטרופוס נדרשת
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/30">
                  <ShieldCheck size={11} /> לשחקן בוגר בלבד
                </div>
              )}
            </div>

            <button onClick={() => onCreate && onCreate(t)}
              className="mt-4 w-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs py-2.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center gap-1.5">
              <FileText size={12} /> צור חוזה מתבנית זו
              <ArrowLeft size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">איך זה עובד</h4>
        <ol className="text-white/60 text-xs space-y-1.5 list-decimal pr-4">
          <li>בחר תבנית רשמית מבוססת טפסי ההתאחדות לכדורגל (football.org.il).</li>
          <li>המערכת מייצרת אוטומטית תוכן משפטי מובנה וממלא מפרטי השחקן והמועדון.</li>
          <li>החוזה נשלח לחתימה דיגיטלית — שחקן ואפוטרופוס (לקטינים) חותמים בנפרד.</li>
          <li>לאחר השלמת כל החתימות הנדרשות: סטטוס השחקן מתעדכן אוטומטית ל"פעיל" והדגל IFA Ready מופעל.</li>
        </ol>
      </div>
    </div>
  );
}