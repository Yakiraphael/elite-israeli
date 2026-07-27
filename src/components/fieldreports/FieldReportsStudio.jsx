import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Activity, FileText, Calendar, ChevronLeft } from 'lucide-react';
import TeamReportForm from './TeamReportForm';
import TeamReportDetailView from './TeamReportDetailView';
import SessionDrillModal from './SessionDrillModal';

// סטודיו דיווח מהשטח — משותף למאמן ולמנהל המקצועי.
// מציג 3 סוגי דוחות מפורטים על הקבוצה (מקצועי/מנטלי/אישי), ולשונית היסטוריה והתעמקות —
// כולל פתיחת כל אימות (TeamEvent) וצפייה בכל דיווחי השטח הפרטניים ובדוחות המקושרים.
export default function FieldReportsStudio({ team, players, authorRole = 'מאמן', teams, onPickTeam }) {
  const [view, setView] = useState('create'); // create | history
  const [drillSession, setDrillSession] = useState(null);
  const [drillReport, setDrillReport] = useState(null);

  const activeTeam = team || (teams && teams.length ? teams[0] : null);
  const teamId = activeTeam?.id;

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['team-reports', teamId],
    queryFn: () => base44.entities.TeamReport.filter({ team_id: teamId }, '-date_start', 30),
    enabled: !!teamId,
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['team-recent-events', teamId],
    queryFn: () => base44.entities.TeamEvent.list('-date_start', 20),
    enabled: !!teamId,
  });

  const reportsByType = (t) => reports.filter(r => r.report_type === t);

  return (
    <div className="space-y-5">
      {/* בורר קבוצה (מנהל מקצועי יכול לבחור מתוך רשימה) */}
      {teams && teams.length > 1 && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-3 flex items-center gap-2">
          <span className="text-white/40 text-xs font-bold">קבוצה:</span>
          <select value={teamId} onChange={e => onPickTeam?.(e.target.value)}
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60">
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      {/* שורת תצוגה */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => setView('create')}
          className={`px-3.5 py-2 rounded-md text-xs font-bold transition-colors ${view === 'create' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-[#1B263B] text-white/60 hover:text-white border border-white/10'}`}>
          ✍️ דוח חדש
        </button>
        <button onClick={() => setView('history')}
          className={`px-3.5 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${view === 'history' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-[#1B263B] text-white/60 hover:text-white border border-white/10'}`}>
          📚 היסטוריה והתעמקות {reports.length > 0 && <span className="bg-white/15 text-white text-[9px] px-1.5 py-0.5 rounded-full">{reports.length}</span>}
        </button>
        {activeTeam && <span className="text-white/30 text-[10px] mr-auto">{activeTeam.name} · {players.length} שחקנים</span>}
      </div>

      {!activeTeam && <div className="text-center text-white/30 py-10 text-sm">בחר/י קבוצה ליצירת דוח</div>}

      {activeTeam && view === 'create' && (
        <TeamReportForm team={activeTeam} players={players.filter(p => p.team_id === activeTeam.id || !activeTeam.id)} authorRole={authorRole} />
      )}

      {activeTeam && view === 'history' && (
        <div className="space-y-5">
          {/* דוחות מפורטים אחרונים — מקובצים לפי סוג */}
          {loadingReports ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center text-white/30 py-10 text-sm bg-[#1B263B] border border-white/10 rounded-lg">עדיין לא תועדו דוחות מפורטים לקבוצה זו</div>
          ) : (
            ['מקצועי', 'מנטלי', 'אישי'].map(t => reportsByType(t).length === 0 ? null : (
              <div key={t}>
                <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold mb-2">
                  <FileText size={12} className="text-[#D4AF37]" /> דוחות {t} ({reportsByType(t).length})
                </div>
                <div className="space-y-2">
                  {reportsByType(t).slice(0, 6).map(r => (
                    <button key={r.id} onClick={() => setDrillReport(r)}
                      className="w-full text-right bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg p-3.5 flex items-center justify-between gap-3 transition-colors">
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm">
                          {t === 'מקצועי' ? '🎯' : t === 'מנטלי' ? '🧠' : '👤'} {r.player_name || r.team_name}
                          {r.session_label && <span className="text-white/40 text-[10px]"> · {r.session_label}</span>}
                        </div>
                        <div className="text-white/40 text-[10px] flex items-center gap-1.5"><Calendar size={9} /> {r.date_start} · {r.author_role || '—'}</div>
                      </div>
                      <ChevronLeft size={14} className="text-white/30 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* אימונים אחרונים — התעמקות */}
          <div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold mb-2">
              <Activity size={12} className="text-[#D4AF37]" /> דיווחי שטח (אימונים/סדנות) — לחץ להתעמקות
            </div>
            {sessions.length === 0 ? (
              <div className="text-center text-white/30 py-8 text-sm bg-[#1B263B] border border-white/10 rounded-lg">אין אימונים תועדים</div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 8).map(s => (
                  <button key={s.id} onClick={() => setDrillSession(s)}
                    className="w-full text-right bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg p-3.5 flex items-center justify-between gap-3 transition-colors">
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm truncate">{s.name}</div>
                      <div className="text-white/40 text-[10px] flex items-center gap-1.5">
                        <Calendar size={9} /> {s.date_start || '—'} · {s.type} {s.region ? ` · ${s.region}` : ''}
                      </div>
                    </div>
                    <span className="text-[#D4AF37] text-xs font-bold flex-shrink-0">התעמק ›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {drillSession && <SessionDrillModal session={drillSession} onOpenReport={setDrillReport} onClose={() => setDrillSession(null)} />}
      {drillReport && <TeamReportDetailView report={drillReport} onClose={() => setDrillReport(null)} />}
    </div>
  );
}