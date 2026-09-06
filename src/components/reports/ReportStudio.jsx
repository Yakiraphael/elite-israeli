import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleToolbar from '@/components/RoleToolbar';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import { computeAggregatedEvaluation, EVALUATION_CATEGORIES } from '@/lib/evaluationEngine';
import UnifiedReportForm from './UnifiedReportForm';
import FootballBalls from '@/components/player/FootballBalls';
import TierBadge from '@/components/player/TierBadge';
import useActiveTeam from '@/components/coach/useActiveTeam';
import TeamContextSwitcher from '@/components/coach/TeamContextSwitcher';
import {
  ClipboardList, Plus, FileText, Loader2, Search, ChevronRight, Calendar, User
} from 'lucide-react';

// ============================================================
// ReportStudio — סטודיו דיווח מאוחד (SSOT Hub)
//
// מרכז את חוויית הדיווח המקצועי למאמן ולמנהל המקצועי.
// 3 תצוגות:
//   1. סיכומים — היסטוריית דוחות + סיכום מצטבר לכל שחקן
//   2. דוח חדש — טופס דיווח מאוחד (מקור אמת יחיד)
//   3. מסמך הערכה — תצוגה/ייצוא של מסמך ההערכה האוטומטי
// ============================================================

const SUBTABS = [
  { id: 'summaries', label: 'סיכומי דוחות', icon: ClipboardList },
  { id: 'create', label: 'דוח חדש', icon: Plus },
  { id: 'document', label: 'מסמך הערכה', icon: FileText },
];

export default function ReportStudio() {
  const { t, lang } = useTranslation();
  const strings = getEvaluationStrings(lang);
  const queryClient = useQueryClient();
  const [subtab, setSubtab] = useState('summaries');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // קונטקסט קבוצה פעילה
  const { assignments, activeTeamId, activeAssignment, setActiveTeam, loading: loadingTeam } = useActiveTeam();

  React.useEffect(() => {
    (async () => {
      try { setCurrentUser(await base44.auth.me()); } catch {}
    })();
  }, []);

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['studio-players', activeTeamId],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 300),
  });

  // סינון לפי קבוצה פעילה + חיפוש
  const filtered = players.filter(p =>
    (!activeTeamId || p.team_id === activeTeamId) &&
    (!search || p.full_name?.includes(search) || p.team_name?.includes(search))
  );

  return (
    <div className="min-h-screen bg-[#0D1B2A] overflow-x-hidden">
      <RoleToolbar activeLabel="סטודיו דיווח מאוחד" activeIcon={FileText} />

      {/* כותרת */}
      <div className="pt-20 pb-0 border-b border-white/10 bg-[#1B263B]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-white font-black text-xl">סטודיו דיווח מאוחד — SSOT</h1>
              <p className="text-white/40 text-xs">
                טופס יחיד → פרופיל + מסמך הערכה אוטומטי · בלי כפילויות
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TeamContextSwitcher
                assignments={assignments}
                activeTeamId={activeTeamId}
                onSelect={setActiveTeam}
                loading={loadingTeam}
              />
            </div>
          </div>

          {/* חיפוש */}
          <div className="relative">
            <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש שחקן..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg pr-10 pl-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>

          {/* תת-לשוניות */}
          <div className="flex gap-1 border-t border-white/10 mt-4 overflow-x-auto">
            {SUBTABS.map(st => (
              <button key={st.id} onClick={() => setSubtab(st.id)}
                className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                  subtab === st.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'
                }`}>
                <st.icon size={13} /> {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* תוכן */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {subtab === 'summaries' && (
          <SummariesView
            players={filtered}
            loading={loadingPlayers}
            onSelect={p => { setSelectedPlayer(p); setSubtab('create'); }}
          />
        )}
        {subtab === 'create' && (
          <CreateView
            player={selectedPlayer}
            evaluator={currentUser}
            team={activeAssignment ? { id: activeTeamId, name: activeAssignment.team_label } : null}
            onSubmitted={() => {
              queryClient.invalidateQueries({ queryKey: ['unified-reports'] });
              setSubtab('summaries');
            }}
            onCancel={() => setSubtab('summaries')}
          />
        )}
        {subtab === 'document' && (
          <DocumentView players={filtered} loading={loadingPlayers} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SummariesView — היסטוריית דוחות + סיכום מצטבר לכל שחקן
// ============================================================
function SummariesView({ players, loading, onSelect }) {
  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="space-y-3">
      <div className="text-white/50 text-[11px] font-bold">דוחות מאוחדים — {players.length} שחקנים בסגל</div>
      {players.length === 0 && (
        <div className="text-center py-12 text-white/30 text-sm border border-dashed border-white/15 rounded-lg">
          אין שחקנים תואמים
        </div>
      )}
      {players.map(p => <PlayerReportSummary key={p.id} player={p} onSelect={onSelect} />)}
    </div>
  );
}

function PlayerReportSummary({ player, onSelect }) {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['unified-reports', player.id],
    queryFn: () => base44.entities.UnifiedReport.filter({ player_id: player.id }, '-created_date', 50),
  });

  const aggregated = computeAggregatedEvaluation(reports);

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-4 hover:border-[#D4AF37]/30 transition-colors">
      <button onClick={() => onSelect(player)} className="w-full flex items-center gap-4 text-right">
        {/* אווטאר */}
        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-[#D4AF37]" />
        </div>
        {/* שם + פרטים */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm">{player.full_name}</div>
          <div className="text-white/40 text-xs">{player.position} · {player.team_name || 'ללא קבוצה'}</div>
        </div>
        {/* דירוג */}
        {aggregated.evaluationCount > 0 ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-left">
              <div className="text-white/30 text-[10px]">דוחות פעילים</div>
              <div className="text-white text-sm font-bold">{aggregated.effectiveCount}</div>
            </div>
            <FootballBalls score={aggregated.overall} size={18} />
            <TierBadge tier={aggregated.tier} size="sm" strings={getEvaluationStrings('he')} />
          </div>
        ) : (
          <span className="text-white/30 text-xs flex-shrink-0">אין דוחות עדיין</span>
        )}
        <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
      </button>

      {/* דוחות אחרונים */}
      {!isLoading && reports.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
          {reports.slice(0, 3).map(r => (
            <div key={r.id} className="flex items-center gap-2 text-[11px]">
              <Calendar size={10} className="text-white/30" />
              <span className="text-white/50">{r.session_date}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/70">{r.report_type}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/50">{r.evaluator_name}</span>
              {r.confidence_level === 3 && (
                <span className="text-red-400/60 text-[10px]">(מבוטל)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CreateView — טופס דיווח מאוחד
// ============================================================
function CreateView({ player, evaluator, team, onSubmitted, onCancel }) {
  if (!player) {
    return (
      <div className="text-center py-12 text-white/30 text-sm border border-dashed border-white/15 rounded-lg">
        בחר שחקן מרשימת הסיכומים כדי לפתוח דוח חדש
      </div>
    );
  }
  return (
    <UnifiedReportForm
      player={player}
      evaluator={evaluator}
      team={team}
      onSubmitted={onSubmitted}
      onCancel={onCancel}
    />
  );
}

// ============================================================
// DocumentView — מסמך הערכה אוטומטי
// ============================================================
function DocumentView({ players, loading }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* רשימת שחקנים */}
      <div className="md:col-span-1 space-y-2">
        <div className="text-white/50 text-[11px] font-bold mb-2">בחר שחקן למסמך הערכה</div>
        {players.map(p => (
          <button key={p.id} onClick={() => setSelectedPlayer(p)}
            className={`w-full text-right p-3 rounded-lg border transition-all flex items-center gap-2 ${
              selectedPlayer?.id === p.id
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40'
                : 'bg-[#1B263B] border-white/10 hover:border-white/20'
            }`}>
            <User size={14} className="text-white/40" />
            <span className="text-white text-xs font-bold flex-1">{p.full_name}</span>
          </button>
        ))}
      </div>

      {/* תצוגת מסמך */}
      <div className="md:col-span-2">
        {selectedPlayer ? <EvaluationDocumentPreview playerId={selectedPlayer.id} playerName={selectedPlayer.full_name} /> : (
          <div className="text-center py-12 text-white/30 text-sm border border-dashed border-white/15 rounded-lg h-full flex items-center justify-center">
            בחר שחקן כדי לצפות במסמך ההערכה הרשמי
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationDocumentPreview({ playerId, playerName }) {
  const { data, isLoading } = useQuery({
    queryKey: ['evaluation-document', playerId],
    queryFn: async () => {
      const res = await base44.functions.invoke('unified-report-engine', {
        action: 'document',
        player_id: playerId,
      });
      return res.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-black text-base">מסמך הערכה רשמי — {playerName}</h3>
        <button onClick={() => {
          const blob = new Blob([data?.document || ''], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `evaluation-${playerName}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
          className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0B0F1A] text-xs font-black px-3 py-1.5 rounded hover:brightness-110">
          <FileText size={12} /> ייצוא
        </button>
      </div>
      <pre className="text-white/70 text-xs whitespace-pre-wrap font-mono leading-relaxed bg-[#0D1B2A] p-4 rounded-lg border border-white/10 max-h-[500px] overflow-y-auto">
        {data?.document || 'אין מסמך זמין — שלח דוח ראשון כדי ליצור מסמך הערכה'}
      </pre>
      {data?.aggregated && (
        <div className="mt-4 flex items-center gap-3">
          <FootballBalls score={data.aggregated.overall} size={20} />
          <TierBadge tier={data.aggregated.tier} size="md" strings={getEvaluationStrings('he')} />
          <span className="text-white/40 text-xs">
            {data.aggregated.effectiveCount} דוחות פעילים מתוך {data.aggregated.evaluationCount}
          </span>
        </div>
      )}
    </div>
  );
}