import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronUp, FileText, User, Calendar, ClipboardList } from 'lucide-react';

// סיכומי דיווחים — רשימת דוחות TeamReport עם תקציר + מדדים מרכזיים, מקובצים לפי קבוצה.
// מאפשר למנהל מקצועי ולמאמן המדווח לראות סיכום של כל דיווח שדווח.

const TYPE_META = {
  'מקצועי': { emoji: '📊', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  'מנטלי': { emoji: '🧠', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  'אישי': { emoji: '👤', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
};

function MetricChip({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
      {label} <span className="text-[#D4AF37]">{value}</span>
    </span>
  );
}

const PRO_METRICS = [
  ['intensity', 'מאמץ'], ['execution', 'ביצוע'], ['pressing', 'לחץ'],
  ['transitions', 'מעברים'], ['set_pieces', 'מצבים'], ['tactical_shape', 'צורה'],
];
const MENTAL_METRICS = [
  ['group_cohesion', 'לכידות'], ['energy_mood', 'מצב'], ['focus_mental', 'ריכוז'],
  ['resilience', 'עמידות'], ['leadership_emergence', 'מנהיגות'], ['pressure_handling', 'לחץ'],
];
const IND_METRICS = [
  ['technical', 'טכני'], ['tactical', 'טקטי'], ['attitude', 'גישה'],
  ['work_ethic', 'אתיקה'], ['confidence', 'ביטחון'], ['social', 'חברתי'],
];

function ReportCard({ r }) {
  const [open, setOpen] = useState(false);
  const meta = TYPE_META[r.report_type] || TYPE_META['מקצועי'];
  const metrics = r.report_type === 'מנטלי' ? MENTAL_METRICS : r.report_type === 'אישי' ? IND_METRICS : PRO_METRICS;
  const textFields = r.report_type === 'מנטלי'
    ? [['tactical_focus', 'מוקד'], ['standout', 'בלטויות'], ['concerns', 'חששות'], ['intervention', 'התערבות']]
    : r.report_type === 'אישי'
      ? [['improvements', 'תחומים לשיפור'], ['private_note', 'הערה פנימית'], ['action_items', 'פעולות נדרשות']]
      : [['tactical_focus', 'מוקד טקטי'], ['strengths', 'חוזקות'], ['weaknesses', 'חלשיות'], ['next_plan', 'תכנון הבא']];

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full p-3 text-right flex items-start gap-3 hover:bg-white/[0.03]">
        <span className={`text-xs font-black px-2 py-1 rounded-full border flex-shrink-0 ${meta.color}`}>
          {meta.emoji} {r.report_type}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-xs font-bold">{r.player_name || r.team_name || 'דוח קבוצתי'}</span>
            {r.session_label && <span className="text-white/40 text-[10px]">· {r.session_label}</span>}
          </div>
          {r.summary && <p className="text-white/60 text-[11px] mt-0.5 line-clamp-2">{r.summary}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {r.author_name && <span className="inline-flex items-center gap-1 text-white/40 text-[10px]"><User size={9} /> {r.author_name}</span>}
            <span className="inline-flex items-center gap-1 text-white/40 text-[10px]"><Calendar size={9} /> {r.date_start || ''}</span>
            {metrics.slice(0, 3).map(([k, l]) => <MetricChip key={k} label={l} value={r[k]} />)}
          </div>
        </div>
        {open ? <ChevronUp size={14} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={14} className="text-white/30 flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-white/10 p-3 space-y-2.5 bg-[#0D1B2A]/60">
          <div className="flex flex-wrap gap-1.5">
            {metrics.map(([k, l]) => <MetricChip key={k} label={l} value={r[k]} />)}
          </div>
          {textFields.map(([k, l]) => r[k] && (
            <div key={k}>
              <div className="text-[#D4AF37] text-[10px] font-bold">{l}</div>
              <p className="text-white/70 text-[11px] leading-relaxed whitespace-pre-wrap mt-0.5">{r[k]}</p>
            </div>
          ))}
          {r.private_note && r.report_type === 'אישי' && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2">
              <div className="text-amber-400 text-[10px] font-bold">הערה פנימית לצוות</div>
              <p className="text-white/60 text-[11px] mt-0.5">{r.private_note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FieldReportsSummaries({ team, players = [] }) {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['fr-summaries', team?.id],
    queryFn: () => base44.entities.TeamReport.filter({ team_id: team?.id }, '-date_start', 100),
    enabled: !!team?.id,
  });

  if (!team?.id) return <div className="text-white/30 text-xs text-center py-8">בחר קבוצה כדי לראות סיכומי דיווחים</div>;
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>;

  const byType = {
    'מקצועי': reports.filter(r => r.report_type === 'מקצועי'),
    'מנטלי': reports.filter(r => r.report_type === 'מנטלי'),
    'אישי': reports.filter(r => r.report_type === 'אישי'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={15} className="text-[#D4AF37]" />
          <h3 className="text-white font-black text-base">סיכומי דיווחים — {team.name}</h3>
        </div>
        <span className="text-white/40 text-[11px]">{reports.length} דוחות</span>
      </div>

      {/* קלפי ספירה לפי סוג */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(TYPE_META).map(([type, m]) => (
          <div key={type} className={`rounded-lg border p-3 ${m.color}`}>
            <div className="text-lg">{m.emoji}</div>
            <div className="text-white font-black text-lg">{byType[type]?.length || 0}</div>
            <div className="text-[10px] opacity-80">{type}</div>
          </div>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-10 text-white/30 text-sm border border-dashed border-white/15 rounded-lg">
          <FileText size={20} className="text-white/20 mx-auto mb-2" />
          עדיין לא דווחו דוחות לקבוצה זו. עבור ל"דוח חדש" ליצירת דוח ראשון.
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(r => <ReportCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}