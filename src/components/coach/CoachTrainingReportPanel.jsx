import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar, Loader2, CheckCircle2, Save, Users, Plus, Activity, ClipboardList,
} from 'lucide-react';
import FieldReportsStudio from '@/components/fieldreports/FieldReportsStudio';

// פאנל דיווח אימון / סדנה — מאפשר למאמן:
//   1) לפתוח אירוע TeamEvent עם סיכום עיבוד פסיכולוגי.
//   2) לסמן נוכחות + ציון משמעת + הערות עבור כל שחקן באזור.
//   3) לבצע bulk insert של רשומות BehaviorLog — מה שמפעיל אוטומציה שמחשבת מחדש attendance/dicipline.
export default function CoachTrainingReportPanel({ region, team, teamPlayers = [] }) {
  const queryClient = useQueryClient();
  const [subtab, setSubtab] = useState('reports');

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    sessionDate: today,
    sessionType: 'אימון',
    sessionName: `אימון ${region && region !== 'all' ? region : ''} ${new Date().toLocaleDateString('he-IL')}`.trim(),
    psychologicalNotes: '',
  });
  const [roster, setRoster] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const regionFilter = region && region !== 'all' ? { region } : {};

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['training-roster-players', region],
    queryFn: () =>
      region && region !== 'all'
        ? base44.entities.PlayerRegistration.filter(regionFilter, '-created_date', 200)
        : base44.entities.PlayerRegistration.list('-created_date', 200),
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['recent-training-events', region],
    queryFn: () =>
      region && region !== 'all'
        ? base44.entities.TeamEvent.filter(regionFilter, '-date_start', 10)
        : base44.entities.TeamEvent.list('-date_start', 10),
  });

  const submit = useMutation({
    mutationFn: async () => {
      const session = await base44.entities.TeamEvent.create({
        name: form.sessionName.trim() || 'אימון',
        type: form.sessionType,
        region: region && region !== 'all' ? region : 'אחר',
        location: '',
        date_start: form.sessionDate,
        date_end: form.sessionDate,
        age_group: 'כל הגילאים',
        description: '',
        psychological_notes: form.psychologicalNotes,
        is_active: true,
      });

      const entries = Object.entries(roster).map(([pid, r]) => {
        const player = players.find(p => p.id === pid);
        return {
          session_id: session.id,
          session_label: form.sessionName,
          session_date: form.sessionDate,
          region: region && region !== 'all' ? region : 'אחר',
          player_id: pid,
          player_name: player?.full_name || '',
          attended: r.attended ?? false,
          discipline_score: r.discipline_score ?? 7,
          leadership_score: r.leadership_score ?? null,
          notes: r.notes || '',
        };
      });

      if (entries.length) {
        await base44.entities.BehaviorLog.bulkCreate(entries);
      }
      return { sessionId: session.id, count: entries.length };
    },
    onSuccess: () => {
      setSubmitted(true);
      setRoster({});
      queryClient.invalidateQueries({ queryKey: ['recent-training-events'] });
      queryClient.invalidateQueries({ queryKey: ['coach-players'] });
      setTimeout(() => setSubmitted(false), 2500);
    },
  });

  const ensureEntry = (pid) =>
    setRoster(o => ({
      ...o,
      [pid]: { attended: true, discipline_score: 7, notes: '', ...(o[pid] || {}) },
    }));

  const removeEntry = (pid) =>
    setRoster(o => {
      const copy = { ...o };
      delete copy[pid];
      return copy;
    });

  const setField = (pid, key, value) =>
    setRoster(o => ({
      ...o,
      [pid]: { attended: true, discipline_score: 7, notes: '', ...(o[pid] || {}), [key]: value },
    }));

  const rosterCount = Object.keys(roster).length;

  if (subtab === 'reports') {
    return (
      <div className="space-y-4">
        <div className="flex gap-1 border-b border-white/10">
          <button onClick={() => setSubtab('reports')}
            className="px-4 py-2.5 text-xs font-bold border-b-2 text-[#D4AF37] border-[#D4AF37] flex items-center gap-1.5">
            <ClipboardList size={13} /> דוחות וסיכומים
          </button>
          <button onClick={() => setSubtab('attendance')}
            className="px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-white/40 hover:text-white/70 flex items-center gap-1.5">
            <Calendar size={13} /> דיווח נוכחות ואימון
          </button>
        </div>
        <FieldReportsStudio team={team} players={teamPlayers} authorRole="מאמן" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-white/10">
        <button onClick={() => setSubtab('reports')}
          className="px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-white/40 hover:text-white/70 flex items-center gap-1.5">
          <ClipboardList size={13} /> דוחות וסיכומים
        </button>
        <button onClick={() => setSubtab('attendance')}
          className="px-4 py-2.5 text-xs font-bold border-b-2 text-[#D4AF37] border-[#D4AF37] flex items-center gap-1.5">
          <Calendar size={13} /> דיווח נוכחות ואימון
        </button>
      </div>
      {/* Session header */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <Calendar size={15} className="text-[#D4AF37]" /> דיווח אימון / סדנה / תחרות
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-white/40 text-[11px] font-bold mb-1 block">שם האימון / האירוע</label>
            <input
              type="text"
              value={form.sessionName}
              onChange={e => setForm(f => ({ ...f, sessionName: e.target.value }))}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60"
            />
          </div>
          <div>
            <label className="text-white/40 text-[11px] font-bold mb-1 block">תאריך</label>
            <input
              type="date"
              value={form.sessionDate}
              onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60"
            />
          </div>
          <div>
            <label className="text-white/40 text-[11px] font-bold mb-1 block">סוג</label>
            <select
              value={form.sessionType}
              onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60"
            >
              <option value="אימון">אימון</option>
              <option value="טורניר עם סדנה">טורניר עם סדנה</option>
              <option value="משחק תחרותי">משחק תחרותי</option>
              <option value="מחנה">מחנה</option>
              <option value="בחינות כושר">בחינות כושר</option>
              <option value="אירוע מיוחד">אירוע מיוחד</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-white/40 text-[11px] font-bold mb-1 block">סיכום עיבוד פסיכולוגי בזמן אמת</label>
          <textarea
            value={form.psychologicalNotes}
            onChange={e => setForm(f => ({ ...f, psychologicalNotes: e.target.value }))}
            placeholder="תצפית מסכמת — אווירה, משברים, מופעים של הובלה, רגעים חינוכיים..."
            rows={2}
            className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none"
          />
        </div>
      </div>

      {/* Roster */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-sm font-bold">
            <Users size={14} className="text-[#D4AF37]" /> סמן דיווח שטח
            {region && region !== 'all' && (
              <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                {region}
              </span>
            )}
            <span className="text-white/40 text-xs">· {players.length} שחקנים</span>
          </div>
          <span className="text-white/50 text-xs">נבחרו: <b className="text-[#D4AF37]">{rosterCount}</b></span>
        </div>

        {loadingPlayers ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#D4AF37]" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-10">
            אין שחקנים באזור — אפשר להגדיר את השחקן בשדה "אזור פעילות" בפרופיל, או לבחור "כל האזורים".
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
            {players.map(p => {
              const r = roster[p.id];
              const isSet = !!r;
              return (
                <div key={p.id} className={`px-5 py-3 ${isSet ? 'bg-[#D4AF37]/[0.04]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => (isSet ? removeEntry(p.id) : ensureEntry(p.id))}
                      className={`w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSet
                          ? 'bg-green-500/15 border-green-500/40 text-green-400 hover:bg-green-500/25'
                          : 'bg-[#0D1B2A] border-white/20 text-white/25 hover:border-[#D4AF37]/50 hover:text-white/60'
                      }`}
                    >
                      {isSet ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-bold">{p.full_name}</div>
                      <div className="text-white/40 text-[10px]">
                        {p.position}
                        {p.team_name ? ` · ${p.team_name}` : ''}
                        {typeof p.attendance_rate === 'number' && ` · נוכחות ${p.attendance_rate}%`}
                        {typeof p.discipline_avg === 'number' && ` · משמעת ${p.discipline_avg}`}
                      </div>
                    </div>

                    {isSet && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setField(p.id, 'attended', !r.attended)}
                          className={`text-[10px] px-2.5 py-1.5 rounded font-bold border transition-colors ${
                            r.attended
                              ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'
                              : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                          }`}
                        >
                          {r.attended ? 'נכח' : 'נעדר'}
                        </button>
                        <label className="text-white/40 text-[10px] font-bold">משמעת</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={r.discipline_score}
                          onChange={e =>
                            setField(p.id, 'discipline_score', Math.max(1, Math.min(10, Number(e.target.value))))
                          }
                          className="w-12 bg-[#0D1B2A] border border-white/15 rounded px-1.5 py-1 text-white text-xs text-center focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {isSet && (
                    <input
                      type="text"
                      value={r.notes || ''}
                      onChange={e => setField(p.id, 'notes', e.target.value)}
                      placeholder="הערה / תצפית אישית / רגע חינוכי (ניתן לרוקן)"
                      className="mt-2 w-full bg-[#0D1B2A] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      {recentEvents.length > 0 && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs font-bold mb-2">
            <Activity size={12} className="text-[#D4AF37]" />
            {region && region !== 'all' ? `דיווחים אחרונים · ${region}` : 'דיווחים אחרונים (כל האזורים)'}
          </div>
          <div className="space-y-1.5">
            {recentEvents.slice(0, 5).map(ev => (
              <div key={ev.id} className="flex items-center justify-between text-xs">
                <span className="text-white/70 truncate">{ev.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{ev.type}</span>
                  <span className="text-white/30 text-[10px]">{ev.date_start || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending || rosterCount === 0}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-bold px-5 py-2.5 rounded hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submit.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          שמור דיווח ({rosterCount})
        </button>
        {submitted && <CheckCircle2 size={16} className="text-green-400" />}
        {submit.isError && (
          <span className="text-red-400 text-xs">{submit.error?.message}</span>
        )}
      </div>
    </div>
  );
}