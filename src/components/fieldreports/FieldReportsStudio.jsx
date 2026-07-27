import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ClipboardList, Plus, Calendar, ChevronLeft } from 'lucide-react';
import FieldReportsSummaries from './FieldReportsSummaries';
import TeamReportForm from './TeamReportForm';
import SessionDrillModal from './SessionDrillModal';

// סטודיו דיווח שטח — מרכז את חוויית הדיווח המפורט למאמן ולמנהל המקצועי.
// 3 תצוגות: סיכומי דיווחים (ברירת מחדל) · דוח חדש · היסטוריית אימונים (עם התעמקות לסשן).
const SUBTABS = [
  { id: 'summaries', label: 'סיכומי דיווחים', icon: ClipboardList },
  { id: 'create', label: 'דוח חדש', icon: Plus },
  { id: 'history', label: 'היסטוריית אימונים', icon: Calendar },
];

export default function FieldReportsStudio({ team, teams, players = [], authorRole = 'מאמן', onPickTeam }) {
  const [subtab, setSubtab] = useState('summaries');
  const [drillSession, setDrillSession] = useState(null);
  const [presetSession, setPresetSession] = useState(null);

  // בורר קבוצה — רלוונטי למנהל מקצועי (teams נשלח). למאמן, team נקבע מראש ע"י הקונטקסט.
  const showPicker = teams && teams.length > 1;
  const activeTeam = team || (teams && teams[0]) || null;

  const handlePick = (id) => { onPickTeam?.(id); setSubtab('summaries'); };

  return (
    <div className="space-y-4">
      {/* בורר קבוצה */}
      {showPicker && (
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs">קבוצה:</span>
          <select value={activeTeam?.id || ''} onChange={e => handlePick(e.target.value)}
            className="bg-[#1B263B] border border-white/15 rounded-md px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}{t.age_group ? ` · ${t.age_group}` : ''}</option>)}
          </select>
        </div>
      )}

      {/* תת-לשוניות */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {SUBTABS.map(st => (
          <button key={st.id} onClick={() => setSubtab(st.id)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${subtab === st.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
            <st.icon size={13} /> {st.label}
          </button>
        ))}
      </div>

      {/* תוכן */}
      {!activeTeam ? (
        <div className="text-white/30 text-xs text-center py-10">בחר קבוצה כדי להתחיל לדווח</div>
      ) : (
        <>
          {subtab === 'summaries' && <FieldReportsSummaries team={activeTeam} players={players} />}
          {subtab === 'create' && (
            <TeamReportForm team={activeTeam} players={players} authorRole={authorRole}
              presetSession={presetSession}
              onSaved={() => { setPresetSession(null); setSubtab('summaries'); }}
              onCancel={() => setSubtab('summaries')} />
          )}
          {subtab === 'history' && (
            <SessionsHistory team={activeTeam} onDrill={setDrillSession} onCreateFromSession={(s) => { setPresetSession(s); setSubtab('create'); }} />
          )}
        </>
      )}

      {drillSession && (
        <SessionDrillModal session={drillSession}
          onOpenReport={() => { setPresetSession(drillSession); setDrillSession(null); setSubtab('create'); }}
          onClose={() => setDrillSession(null)} />
      )}
    </div>
  );
}

function SessionsHistory({ team, onDrill, onCreateFromSession }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['fr-sessions-list', team?.id],
    queryFn: () => base44.entities.TeamEvent.list('-date_start', 30),
  });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>;
  if (sessions.length === 0) return <div className="text-center py-10 text-white/30 text-sm border border-dashed border-white/15 rounded-lg">אין אימונים רשומים. צור אימון דרך הדשבורד כדי לדווח נוכחות.</div>;

  return (
    <div className="space-y-2">
      <div className="text-white/50 text-[11px] font-bold">היסטוריית אימונים וסדנאות ({sessions.length})</div>
      {sessions.map(s => (
        <div key={s.id} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-white text-xs font-bold truncate">{s.name}</div>
            <div className="text-white/40 text-[10px]">{s.type} · {s.date_start || ''}{s.location ? ` · ${s.location}` : ''}</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => onDrill(s)}
              className="flex items-center gap-1 text-[#D4AF37] text-[11px] font-bold px-2.5 py-1.5 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30">
              <Calendar size={11} /> התעמק
            </button>
            <button onClick={() => onCreateFromSession(s)}
              className="flex items-center gap-1 text-blue-300 text-[11px] font-bold px-2.5 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30">
              <Plus size={11} /> דוח מסשן
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}