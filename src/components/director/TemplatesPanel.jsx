import { useState, useMemo } from 'react';
import {
  ExternalLink, FileText, Baby, User, ShieldCheck, ArrowLeft, Scale, Briefcase,
  Repeat, FileSignature, Building2, Activity, Stethoscope, Users, Gavel,
  FolderTree, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertTriangle, Sparkles
} from 'lucide-react';
import { getAllForms } from '@/lib/ifaOfficialForms';

const CATEGORIES = [
  { key: 'player_contract', label: 'חוזי שחקנים', icon: Scale, color: '#D4AF37' },
  { key: 'coach_contract', label: 'חוזי מאמנים', icon: Briefcase, color: '#6366F1' },
  { key: 'transfer', label: 'טפסי העברה / מעבר', icon: Repeat, color: '#3B82F6' },
  { key: 'protocol', label: 'פרוטוקולים (נוער / בוגרים)', icon: Building2, color: '#10B981' },
  { key: 'insurance', label: 'ביטוח', icon: ShieldCheck, color: '#8B5CF6' },
  { key: 'registration', label: 'רישום / הצהרות', icon: FileSignature, color: '#F59E0B' },
  { key: 'medical', label: 'כוח אדם רפואי', icon: Stethoscope, color: '#EC4899' },
  { key: 'match', label: 'משחקים / שופטים', icon: Activity, color: '#06B6D4' },
  { key: 'special', label: 'מיוחדים (חריגי גיל / צו פיוס)', icon: Users, color: '#F97316' },
  { key: 'admin', label: 'אדמיניסטרציה', icon: Gavel, color: '#64748B' },
  { key: 'other', label: 'אחר', icon: FileText, color: '#94A3B8' },
];

const AGE_FILTERS = [
  { id: 'all', label: 'כל הגילאים' },
  { id: 'minor', label: 'נוער' },
  { id: 'adult', label: 'בוגרים' },
];

const LANG_FLAGS = { he: '🇮🇱', en: '🇬🇧' };

const LEAGUE_LABELS = {
  professional: 'מקצועניות',
  amateur: 'חובבניות',
  youth: 'נוער',
  all: 'כל הליגות',
};

export default function TemplatesPanel({ onCreate }) {
  const [ageFilter, setAgeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const allForms = getAllForms();

  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      forms: allForms.filter(f => f.category === cat.key)
        .filter(f => ageFilter === 'all' || f.age_group === ageFilter || f.age_group === 'all')
        .filter(f => !search || f.label.includes(search)),
    })).filter(c => c.forms.length > 0);
  }, [ageFilter, search]);

  const toggle = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="text-white font-black text-base flex items-center gap-2">
              <FolderTree size={16} className="text-[#D4AF37]" />
              בנק התבניות — טפסי ההתאחדות 2026/27
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              {allForms.length} טפסים רשמיים · ממופים אוטומטית לנתוני שחקן/מועדון · מסווגים לפי סוג וגיל
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Sparkles size={11} className="text-[#D4AF37]" /> מיפוי נתונים חכם זמין
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש טופס..."
            className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
          />
          <div className="flex gap-1.5">
            {AGE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setAgeFilter(f.id)}
                className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${ageFilter === f.id ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped categories */}
      {grouped.length === 0 && (
        <div className="text-center py-12 text-white/30 text-sm">אין טפסים תואמים</div>
      )}

      <div className="space-y-3">
        {grouped.map(cat => {
          const CatIcon = cat.icon;
          const isCollapsed = collapsed[cat.key];
          return (
            <div key={cat.key} className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(cat.key)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors text-right"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}40` }}>
                  <CatIcon size={16} style={{ color: cat.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-black text-sm">{cat.label}</div>
                  <div className="text-white/40 text-[11px] mt-0.5">{cat.forms.length} טפסים</div>
                </div>
                {isCollapsed ? <ChevronDown size={16} className="text-white/30" /> : <ChevronUp size={16} className="text-white/30" />}
              </button>

              {!isCollapsed && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 border-t border-white/5 pt-3">
                  {cat.forms.map(form => (
                    <FormCard key={form.key} form={form} onCreate={onCreate} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guide */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">איך זה עובד</h4>
        <ol className="text-white/60 text-xs space-y-1.5 list-decimal pr-4">
          <li>בחר קטגוריה וטופס רשמי — כל טופס מבוסס על PDF מקורי של ההתאחדות.</li>
          <li>המערכת ממלא אוטומטית פרטי שחקן/מועדון/העברה מתוך מסד הנתונים (מנגנון מיפוי חכם).</li>
          <li>המנהל האישי יכול להציע שינויים לסעיפים; המנהל המקצועי מאשר/דוחה.</li>
          <li>החתימה הסופית — שחקן בוגר או אפוטרופוס לקטין.</li>
        </ol>
      </div>
    </div>
  );
}

function FormCard({ form, onCreate }) {
  const [initiating, setInitiating] = useState(false);
  const handleCreate = () => {
    if (!onCreate) return;
    setInitiating(true);
    onCreate(form);
    setTimeout(() => setInitiating(false), 800);
  };

  const fieldCount = (form.negotiable_fields?.length || 0) + (form.director_fillable_fields?.length || 0);

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 flex flex-col card-hover">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-white font-bold text-sm flex items-center gap-1.5 flex-1">
          <span className="text-[10px]">{LANG_FLAGS[form.language]}</span>
          {form.label}
        </h4>
        <a href={form.pdf_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="text-white/30 hover:text-[#D4AF37] flex items-center gap-0.5 text-[10px] flex-shrink-0 transition-colors">
          <ExternalLink size={10} />
        </a>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">
          {LEAGUE_LABELS[form.league_type] || form.league_type}
        </span>
        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
          {form.age_group === 'minor' ? 'נוער' : form.age_group === 'adult' ? 'בוגרים' : 'כל הגילאים'}
        </span>
        {fieldCount > 0 && (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
            {fieldCount} שדות
          </span>
        )}
      </div>

      {/* Signers */}
      <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
        {form.signers?.map(s => (
          <span key={s} className="bg-white/5 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
            {signerLabel(s)}
          </span>
        ))}
        {form.requires_guardian && (
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Baby size={9} /> אפוטרופוס
          </span>
        )}
      </div>

      <div className="flex-1" />

      <button
        onClick={handleCreate}
        disabled={initiating || !onCreate}
        className="w-full mt-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs py-2.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
      >
        {initiating ? <Loader2 size={12} className="animate-spin" /> : <ArrowLeft size={11} />}
        {form.category?.includes('contract') ? 'צור חוזה' : 'פתח טופס'}
      </button>
    </div>
  );
}

function signerLabel(s) {
  const map = {
    player: 'שחקן',
    coach: 'מאמן',
    guardian: 'אפוטרופוס',
    club: 'מועדון',
    parents: 'הורים',
    lawyer: 'עו"ד',
    medical_staff: 'צוות רפואי',
    field_owner: 'בעל מגרש',
  };
  return map[s] || s;
}