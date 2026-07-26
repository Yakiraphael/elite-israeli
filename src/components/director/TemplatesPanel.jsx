import { useState } from 'react';
import { BookOpen, ExternalLink, FileText, Baby, User, ShieldCheck, ArrowLeft, Scale, Briefcase } from 'lucide-react';
import { getContractForms } from '@/lib/ifaOfficialForms';

const CATEGORY_LABELS = {
  player_contract: 'חוזי שחקנים',
  coach_contract: 'חוזי מאמנים',
};

const LEAGUE_LABELS = {
  professional: 'ליגות מקצועניות',
  amateur: 'ליגות חובבניות / נוער',
  all: 'כל הליגות',
};

const LANG_FLAGS = { he: '🇮🇱', en: '🇬🇧' };

export default function TemplatesPanel({ onCreate }) {
  const [filter, setFilter] = useState('all');
  const forms = getContractForms();

  const filtered = filter === 'all' ? forms : forms.filter(f => f.category === filter);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-black text-base">טפסים רשמיים — ההתאחדות לכדורגל 2026/27</h3>
        <p className="text-white/40 text-xs mt-0.5">
          כל הטפסים מבוססים על קבצי ה-PDF המקוריים של ההתאחדות · חתימה דיגיטלית + משא ומתן על סעיפים
        </p>
      </div>

      {/* פילטר */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'הכל' },
          { id: 'player_contract', label: 'שחקנים' },
          { id: 'coach_contract', label: 'מאמנים' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${filter === f.id ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(form => (
          <div key={form.key} className="bg-[#1B263B] border border-white/10 rounded-lg p-5 flex flex-col card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                {form.category === 'coach_contract' ? (
                  <Briefcase size={18} className="text-[#D4AF37]" />
                ) : (
                  <Scale size={18} className="text-[#D4AF37]" />
                )}
              </div>
              <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#D4AF37] flex items-center gap-1 text-[10px] font-bold transition-colors">
                <ExternalLink size={11} /> PDF מקורי
              </a>
            </div>

            <h4 className="text-white font-black text-sm mb-1">
              {LANG_FLAGS[form.language]} {form.label}
            </h4>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">
                {LEAGUE_LABELS[form.league_type]}
              </span>
              {form.negotiable_fields.length > 0 && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {form.negotiable_fields.length} סעיפים לשינוי
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs flex-1">
              <div className="flex items-center gap-2 text-white/60">
                <User size={11} className="text-[#D4AF37]" />
                חתימת {form.category === 'coach_contract' ? 'מאמן' : 'שחקן'} נדרשת
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <ShieldCheck size={11} className="text-[#D4AF37]" />
                חתימת נציג המועדון נדרשת
              </div>
              {form.requires_guardian && (
                <div className="flex items-center gap-2 text-white/60">
                  <Baby size={11} className="text-[#D4AF37]" /> חתימת הורה/אפוטרופוס נדרשת
                </div>
              )}
            </div>

            <button onClick={() => onCreate && onCreate(form)}
              className="mt-4 w-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs py-2.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center gap-1.5">
              <FileText size={12} /> צור חוזה מטופס זה
              <ArrowLeft size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">איך זה עובד</h4>
        <ol className="text-white/60 text-xs space-y-1.5 list-decimal pr-4">
          <li>בחר טופס רשמי של ההתאחדות — הטופס מוצג בדיוק כפי שהוגש ע"י ההתאחדות.</li>
          <li>המנהל האישי של השחקן יכול להציע שינויים לסעיפים (שכר, בונוסים וכו') כחלק ממשא ומתן.</li>
          <li>המנהל המקצועי מאשר או דוחה הצעות — שינויים מאושרים מופיעים בחוזה.</li>
          <li>החתימה הסופית שייכת לשחקן בוגר בלבד, או לאפוטרופוס עבור שחקן קטין — המנהל האישי אינו רשאי לחתום.</li>
          <li>לאחר חתימה: סטטוס השחקן מתעדכן ל"פעיל" והמסמך נשמר בכספת.</li>
        </ol>
      </div>
    </div>
  );
}