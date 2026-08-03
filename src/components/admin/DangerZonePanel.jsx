import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';

// אזור מסוכן — מחיקת/איפוס נתונים של מועדון או קבוצה בודדת.
// זרימה: בחירת מועדון → (אופציונלי) בחירת קבוצה מתוך המועדון → הקלדת DELETE → סימון תיבת אישור → מחיקה.
// כל פעולה מתועדת ביומן ביקורת. נגיש ל-admin בלבד (הפונקציה מאכפת זאת גם בשרת).
export default function DangerZonePanel({ user }) {
  const qc = useQueryClient();
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['dz-clubs'],
    queryFn: () => base44.entities.Club.list('-created_date', 100),
  });
  const [clubId, setClubId] = useState('');
  const [teamName, setTeamName] = useState('');
  const { data: teams = [] } = useQuery({
    queryKey: ['dz-teams', clubId],
    queryFn: () => clubId ? base44.entities.LeagueTeam.filter({ club_id: clubId }, 'team_name', 200) : [],
    enabled: !!clubId,
  });
  const [typed, setTyped] = useState('');
  const [confirmChk, setConfirmChk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const scope = teamName ? 'team' : 'club';
  const ready = clubId && typed === 'DELETE' && confirmChk && !busy;

  const run = async () => {
    setBusy(true); setErr(''); setResult(null);
    try {
      const res = await base44.functions.invoke('purge-org-data', { club_id: clubId, team_name: teamName || undefined, confirm: 'DELETE' });
      setResult(res.data || res);
      setTyped(''); setConfirmChk(false);
      qc.invalidateQueries({ queryKey: ['dz-clubs'] });
      qc.invalidateQueries({ queryKey: ['dz-teams', clubId] });
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    setBusy(false);
  };

  return (
    <div className="bg-panel border border-red-500/30 rounded-lg p-5 mt-8">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={16} className="text-red-400" />
        <h3 className="text-ink font-black text-base">אזור מסוכן — מחיקת/איפוס נתונים</h3>
      </div>
      <p className="text-ink-muted text-xs mb-4">
        מוחק לצמיתות נתוני ליגה/תחרויות/קבוצות/משחקים/טבלאות של מועדון (או קבוצה בודדת). הפעולה אינה הפיכה ותירשם ביומן ביקורת על שמך.
      </p>

      {isLoading ? <div className="flex justify-center py-6"><Loader2 className="animate-spin text-red-400" /></div> : (
        <div className="space-y-3">
          <div>
            <label className="text-ink-faint text-[10px] block mb-1">1. בחר מועדון</label>
            <select value={clubId} onChange={e => { setClubId(e.target.value); setTeamName(''); setResult(null); }}
              className="w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-red-500/60">
              <option value="">— בחר מועדון —</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.club_name}</option>)}
            </select>
          </div>

          {clubId && (
            <div>
              <label className="text-ink-faint text-[10px] block mb-1">2. בחר קבוצה מתוך המועדון (אופציונלי — ריק = איפוס מלא של המועדון)</label>
              <select value={teamName} onChange={e => { setTeamName(e.target.value); setResult(null); }}
                className="w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-red-500/60">
                <option value="">איפוס מלא של המועדון</option>
                {teams.map(t => <option key={t.id} value={t.team_name}>{t.team_name} ({t.age_group})</option>)}
              </select>
            </div>
          )}

          {clubId && (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-300 text-[11px] flex items-start gap-2">
                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  היקף המחיקה: {scope === 'club'
                    ? 'כל המשחקים, קבוצות הליגה, הקבוצות, התחרויות, חוקי הצוות וטבלאות הליגה של המועדון'
                    : `קבוצה "${teamName}" בלבד — משחקים, רישום ליגה, קבוצה ושורת טבלה`}. נתוני שחקנים עצמם אינם נמחקים.
                </span>
              </div>

              <div>
                <label className="text-ink-faint text-[10px] block mb-1">3. הקלד <span className="text-red-400 font-black">DELETE</span> לאישור</label>
                <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="DELETE" dir="ltr"
                  className="w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-red-500/60" />
              </div>

              <label className="flex items-center gap-2 text-ink-muted text-xs">
                <input type="checkbox" checked={confirmChk} onChange={e => setConfirmChk(e.target.checked)} className="accent-red-500" />
                4. אני מאשר/ת שהפעולה בלתי-הפיכה ותירשם ביומן ביקורת על שמי ({user?.full_name || 'admin'})
              </label>

              <button onClick={run} disabled={!ready}
                className="w-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-sm py-2.5 rounded hover:bg-red-500/30 disabled:opacity-30 flex items-center justify-center gap-1.5">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {scope === 'club' ? 'מחק נתוני מועדון' : 'מחק נתוני קבוצה'}
              </button>

              {err && <div className="text-red-400 text-xs">{err}</div>}
              {result && (
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-green-300 text-xs">
                  <CheckCircle2 size={12} className="inline ml-1" /> האיפוס הושלם ({result.scope === 'team' ? 'קבוצה' : 'מועדון'}).
                  <pre className="mt-2 text-[10px] text-green-200/80 overflow-x-auto" dir="ltr">{JSON.stringify(result.counts, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}