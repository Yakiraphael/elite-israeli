import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RoleToolbar from '../components/RoleToolbar';
import {
  Trophy, Plus, X, Loader2, CalendarDays, GitMerge, Shield, ListChecks,
  CheckCircle2, AlertTriangle, RotateCcw, Save, ChevronLeft, Settings2, Flag,
} from 'lucide-react';

const call = (action, payload = {}) => base44.functions.invoke('league-engine', { action, ...payload }).then(r => r.data);

export default function LeagueStudio() {
  const [tab, setTab] = useState('teams');
  const [ageGroup, setAgeGroup] = useState('נערים א׳');
  const [club, setClub] = useState(null);

  useQuery({
    queryKey: ['league-me'],
    queryFn: async () => { const u = await base44.auth.me(); setClub({ id: u.club_id, name: u.full_name || '' }); return u; },
  });

  useQuery({
    queryKey: ['league-myclub'],
    queryFn: async () => {
      const all = await base44.entities.Club.list('-created_date', 50);
      const u = await base44.auth.me();
      const c = all.find(x => (x.admin_ids || []).includes(u.id)) || all[0];
      if (c) setClub({ id: c.id, name: c.club_name });
      return c;
    },
  });

  // שנתונים זמינים — נאספים מקבוצות ותחרויות קיימות + ברירות מחדל נפוצות
  const AGE_DEFAULTS = ['נערים א׳', 'נערים ב׳', 'נוער', 'ילדים א׳', 'ילדים ב׳', 'ילדים ג׳', 'טרום-ילדים', 'בוגרים'];
  const { data: ageGroups = AGE_DEFAULTS } = useQuery({
    queryKey: ['league-agegroups', club?.id],
    queryFn: async () => {
      const [teams, comps] = await Promise.all([
        base44.entities.LeagueTeam.filter({ club_id: club.id }, 'age_group', 200),
        base44.entities.Competition.filter({ club_id: club.id }, '-created_date', 100),
      ]);
      const fromData = [...new Set([...teams.map(t => t.age_group), ...comps.map(c => c.age_group)])].filter(Boolean);
      return [...new Set([...AGE_DEFAULTS, ...fromData])];
    },
    enabled: !!club?.id,
  });

  if (!club) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <RoleToolbar activeLabel="ליגה והגרלה" activeIcon={Trophy} />
      <div className="bg-panel border-b border-hairline py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-ink font-black text-xl flex items-center gap-2"><Trophy size={16} className="text-brand" /> מנוע ליגה והגרלה</h1>
            <p className="text-ink-muted text-xs">{club.name} · הגרלה שוויונית · חוקי צוות מקצועי · תיאום דו-צדדי · אימות תוצאות · טבלה חיה</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
              className="bg-surface border border-hairline rounded-lg px-3 py-2 text-ink text-xs w-44 focus:outline-none focus:border-brand-line">
              {ageGroups.map(ag => <option key={ag} value={ag}>{ag}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-panel border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {[
            { id: 'teams', label: 'קבוצות רשומות', icon: ListChecks },
            { id: 'rules', label: 'הגדרות צוות', icon: Settings2 },
            { id: 'competitions', label: 'תחרויות', icon: Flag },
            { id: 'generate', label: 'הגרלת ליגה', icon: GitMerge },
            { id: 'fixtures', label: 'משחקים ותיאום', icon: CalendarDays },
            { id: 'standings', label: 'טבלת ליגה', icon: Trophy },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'text-brand border-brand' : 'text-ink-muted border-transparent hover:text-ink'}`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'teams' && <TeamsTab club={club} ageGroup={ageGroup} />}
        {tab === 'rules' && <RulesTab club={club} ageGroup={ageGroup} />}
        {tab === 'competitions' && <CompetitionsTab club={club} ageGroup={ageGroup} />}
        {tab === 'generate' && <GenerateTab club={club} ageGroup={ageGroup} />}
        {tab === 'fixtures' && <FixturesTab club={club} ageGroup={ageGroup} />}
        {tab === 'standings' && <StandingsTab club={club} ageGroup={ageGroup} />}
      </div>
    </div>
  );
}

function TeamsTab({ club, ageGroup }) {
  const qc = useQueryClient();
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['league-teams', club.id, ageGroup],
    queryFn: async () => (await call('teams', { club_id: club.id, age_group: ageGroup })).teams,
  });
  const [name, setName] = useState('');
  const [tier, setTier] = useState(1);

  const add = useMutation({
    mutationFn: async () => {
      if (!name.trim()) return;
      await base44.entities.LeagueTeam.create({ club_id: club.id, club_name: club.name, team_name: name.trim(), age_group: ageGroup, is_registered: true, seed_tier: tier });
      setName('');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-teams', club.id, ageGroup] }),
  });
  const remove = useMutation({
    mutationFn: (id) => base44.entities.LeagueTeam.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-teams', club.id, ageGroup] }),
  });

  return (
    <div className="space-y-4">
      <div className="bg-panel border border-hairline rounded-lg p-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-ink-faint text-[10px]">שם קבוצה</label>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add.mutate()}
            className="w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line" />
        </div>
        <div>
          <label className="text-ink-faint text-[10px]">דרג זריעה</label>
          <input type="number" min={1} max={9} value={tier} onChange={e => setTier(+e.target.value)}
            className="w-20 bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line" />
        </div>
        <button onClick={() => add.mutate()} className="bg-brand text-brand-ink font-bold text-sm px-4 py-2 rounded hover:brightness-110 flex items-center gap-1"><Plus size={14} /> הוסף</button>
      </div>
      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {teams.map(t => (
            <div key={t.id} className="bg-panel border border-hairline rounded-lg p-3 flex items-center justify-between">
              <div><span className="text-ink font-bold text-sm">{t.team_name}</span> <span className="text-ink-faint text-[10px] mr-2">דרג {t.seed_tier || '—'}</span></div>
              <button onClick={() => remove.mutate(t.id)} className="text-ink-faint hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
          {teams.length === 0 && <div className="text-ink-faint text-sm col-span-2 text-center py-8">אין קבוצות רשומות לשנתון זה.</div>}
        </div>
      )}
    </div>
  );
}

function RulesTab({ club, ageGroup }) {
  const qc = useQueryClient();
  const { data: rules } = useQuery({
    queryKey: ['league-rules', club.id, ageGroup],
    queryFn: async () => (await call('getRules', { club_id: club.id, age_group: ageGroup })).rules,
  });
  const DEFAULT_RULES = { max_games_per_week: 1, allowed_match_days: [0, 1, 2, 3, 4], avoid_consecutive_home_games: true, seeding_mode: 'BALANCED_RANDOM', double_round: false };
  const [form, setForm] = useState(DEFAULT_RULES);
  useEffect(() => {
    if (rules) setForm({
      max_games_per_week: rules.max_games_per_week ?? 1,
      allowed_match_days: rules.allowed_match_days ?? [0, 1, 2, 3, 4],
      avoid_consecutive_home_games: rules.avoid_consecutive_home_games ?? true,
      seeding_mode: rules.seeding_mode || 'BALANCED_RANDOM',
      double_round: rules.double_round ?? false,
    });
  }, [rules]);
  const DAYS = [{ k: 0, l: 'א׳' }, { k: 1, l: 'ב׳' }, { k: 2, l: 'ג׳' }, { k: 3, l: 'ד׳' }, { k: 4, l: 'ה׳' }, { k: 5, l: 'ו׳' }, { k: 6, l: 'ש׳' }];
  const save = useMutation({
    mutationFn: async () => call('saveRules', { club_id: club.id, club_name: club.name, age_group: ageGroup, ...form }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['league-rules', club.id, ageGroup] }),
  });
  const tog = (k) => setForm(f => ({ ...f, allowed_match_days: f.allowed_match_days.includes(k) ? f.allowed_match_days.filter(x => x !== k) : [...f.allowed_match_days, k] }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-panel border border-hairline rounded-lg p-5 space-y-4">
        <Section><Settings2 size={14} className="text-brand" /> הגבלות עומס וימים</Section>
        <div><label className="text-ink-faint text-[10px]">מקסימום משחקים לקבוצה בשבוע</label>
          <input type="number" min={1} max={5} value={form.max_games_per_week} onChange={e => setForm({ ...form, max_games_per_week: +e.target.value })} className="w-24 bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none" /></div>
        <div><label className="text-ink-faint text-[10px]">ימי משחק מותרים</label>
          <div className="flex gap-1 flex-wrap mt-1">
            {DAYS.map(d => <button key={d.k} onClick={() => tog(d.k)} className={`px-3 py-1.5 rounded text-xs font-bold border ${form.allowed_match_days.includes(d.k) ? 'bg-brand text-brand-ink border-brand' : 'bg-surface text-ink-muted border-hairline'}`}>{d.l}</button>)}
          </div></div>
        <label className="flex items-center gap-2 text-ink-muted text-xs"><input type="checkbox" checked={form.avoid_consecutive_home_games} onChange={e => setForm({ ...form, avoid_consecutive_home_games: e.target.checked })} className="accent-brand" /> מניעת משחקי בית רצופים</label>
        <label className="flex items-center gap-2 text-ink-muted text-xs"><input type="checkbox" checked={form.double_round} onChange={e => setForm({ ...form, double_round: e.target.checked })} className="accent-brand" /> סבב בית-חוץ כפול</label>
      </div>
      <div className="bg-panel border border-hairline rounded-lg p-5 space-y-4">
        <Section><Flag size={14} className="text-brand" /> מצב זריעה (Seeding)</Section>
        {[['BALANCED_RANDOM', 'הגרלה מאוזנת'], ['TIERED', 'מדורג (לפי דרג זריעה)'], ['MANUAL_SEED', 'סדר רישום ידני']].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-ink-muted text-xs"><input type="radio" checked={form.seeding_mode === k} onChange={() => setForm({ ...form, seeding_mode: k })} className="accent-brand" /> {l}</label>
        ))}
        <button onClick={() => save.mutate()} className="w-full bg-brand text-brand-ink font-bold text-sm py-2.5 rounded hover:brightness-110 flex items-center justify-center gap-1"><Save size={14} /> שמור הגדרות</button>
      </div>
    </div>
  );
}

function GenerateTab({ club, ageGroup }) {
  const qc = useQueryClient();
  const { data: teams = [] } = useQuery({ queryKey: ['league-teams', club.id, ageGroup], queryFn: async () => (await call('teams', { club_id: club.id, age_group: ageGroup })).teams });
  const { data: rules } = useQuery({ queryKey: ['league-rules', club.id, ageGroup], queryFn: async () => (await call('getRules', { club_id: club.id, age_group: ageGroup })).rules });
  const { data: comps = [] } = useQuery({ queryKey: ['league-comps', club.id, ageGroup], queryFn: async () => (await call('listCompetitions', { club_id: club.id, age_group: ageGroup })).competitions });
  const [competition, setCompetition] = useState('ליגת הארגון');
  const [compId, setCompId] = useState('');
  const [res, setRes] = useState(null);
  const selectedComp = comps.find(c => c.id === compId);
  const gen = useMutation({
    mutationFn: async () => await call('generateLeague', {
      club_id: club.id, club_name: club.name, age_group: ageGroup,
      competition: selectedComp?.competition_name || competition,
      double_round: selectedComp?.competition_format === 'DOUBLE_ROUND_ROBIN' || rules?.double_round,
      competition_id: compId || undefined,
    }),
    onSuccess: (d) => { setRes(d); qc.invalidateQueries({ queryKey: ['league-fixtures', club.id, ageGroup] }); },
  });
  return (
    <div className="space-y-4">
      <div className="bg-panel border border-hairline rounded-lg p-5">
        <Section><GitMerge size={14} className="text-brand" /> הגרלת ליגה — Round-Robin</Section>
        <div className="text-ink-muted text-xs mt-2">{teams.length} קבוצות רשומות · מצב זריעה: <span className="text-ink font-bold">{rules?.seeding_mode || 'BALANCED_RANDOM'}</span> · {(selectedComp?.competition_format === 'DOUBLE_ROUND_ROBIN' || rules?.double_round) ? 'סבב כפול' : 'סבב יחיד'}</div>
        {/* בחירת תחרות מוגדרת — קובעת פורמט/כמות שחקנים/מגרש/ניקוד */}
        <div className="mt-3">
          <label className="text-ink-faint text-[10px]">תחרות (אופציונלי — מהגדרות מתקדמות)</label>
          <select value={compId} onChange={e => setCompId(e.target.value)} className="w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line">
            <option value="">— ללא — (שם מסגרת חופשי)</option>
            {comps.map(c => <option key={c.id} value={c.id}>{c.competition_name} · {c.competition_format} · {c.player_count}</option>)}
          </select>
        </div>
        {!compId && (
          <input value={competition} onChange={e => setCompetition(e.target.value)} placeholder="שם מסגרת" className="mt-3 w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line" />
        )}
        {selectedComp && (
          <div className="mt-2 text-ink-faint text-[10px] flex flex-wrap gap-x-3 gap-y-1">
            <span>פורמט: {selectedComp.competition_format}</span>
            <span>· שחקנים: {selectedComp.player_count}</span>
            <span>· מגרש: {selectedComp.pitch_type}</span>
            <span>· משך: {selectedComp.match_duration_minutes} דק׳</span>
            <span>· ניקוד: {selectedComp.points_for_win}/{selectedComp.points_for_draw}/{selectedComp.points_for_loss}</span>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={() => gen.mutate()} disabled={teams.length < 2} className="bg-brand text-brand-ink font-bold text-sm px-4 py-2.5 rounded hover:brightness-110 disabled:opacity-40 flex items-center gap-1"><GitMerge size={14} /> הגרל מחדש</button>
          {gen.isPending && <Loader2 size={16} className="animate-spin text-brand self-center" />}
        </div>
        {res && (
          <div className="mt-4 space-y-3">
            <div className="text-green-400 text-sm font-bold flex items-center gap-2"><CheckCircle2 size={14} /> {res.created} משחקים נוצרו · {res.rounds} מחזורים</div>
            {res.matches?.length > 0 && (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {[...new Set(res.matches.map(m => m.matchday))].sort((a, b) => a - b).map(md => {
                  const isSecondLeg = md > res.rounds;
                  return (
                    <div key={md} className="bg-surface border border-hairline rounded-lg p-3">
                      <div className={`font-black text-xs mb-2 pb-1 border-b ${isSecondLeg ? 'text-sky-400 border-sky-400/30' : 'text-brand border-brand-line/40'}`}>
                        מחזור {md}{isSecondLeg ? ' (סבב שני)' : ''}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {res.matches.filter(m => m.matchday === md).map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-ink font-bold flex-1 text-right truncate">{m.home_team}</span>
                            <span className="text-ink-faint text-[10px] flex-shrink-0">נגד</span>
                            <span className="text-ink font-bold flex-1 truncate">{m.away_team}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {teams.length < 2 && <div className="mt-2 text-amber-400 text-xs">נדרשות לפחות 2 קבוצות רשומות לשנתון זה.</div>}
        <div className="text-ink-faint text-[10px] mt-3">⚠️ הגרלה מחודשת מוחקת משחקים קודמים שטרם שוחקו. משחקים שנערכו ואומתו נשמרים.</div>
      </div>
    </div>
  );
}

function CompetitionsTab({ club, ageGroup }) {
  const qc = useQueryClient();
  const { data: comps = [], isLoading } = useQuery({ queryKey: ['league-comps', club.id, ageGroup], queryFn: async () => (await call('listCompetitions', { club_id: club.id, age_group: ageGroup })).competitions });
  const [editing, setEditing] = useState(null);
  const empty = { competition_name: '', age_group: ageGroup, competition_format: 'SINGLE_ROUND_ROBIN', player_count: '7V7', pitch_type: 'SYNTHETIC_TURF', match_duration_minutes: 40, max_squad_size: 14, allowed_substitutions: 5, points_for_win: 3, points_for_draw: 1, points_for_loss: 0, is_active: true };
  const [form, setForm] = useState(empty);
  const save = useMutation({
    mutationFn: async () => call('saveCompetition', { id: editing?.id, club_id: club.id, club_name: club.name, ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['league-comps', club.id, ageGroup] }); setEditing(null); setForm(empty); },
  });
  const sel = (c) => { setEditing(c); setForm({ ...empty, ...c, match_duration_minutes: c.match_duration_minutes ?? 40, max_squad_size: c.max_squad_size ?? 14, allowed_substitutions: c.allowed_substitutions ?? 5, points_for_win: c.points_for_win ?? 3, points_for_draw: c.points_for_draw ?? 1, points_for_loss: c.points_for_loss ?? 0 }); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cancel = () => { setEditing(null); setForm(empty); };
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div>;
  return (
    <div className="space-y-4">
      <div className="bg-panel border border-hairline rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <Section><Flag size={14} className="text-brand" /> תחרויות ופורמטים (Competition Configuration Engine)</Section>
          <button onClick={() => sel({})} className="bg-brand text-brand-ink font-bold text-xs px-3 py-2 rounded hover:brightness-110 flex items-center gap-1"><Plus size={12} /> תחרות חדשה</button>
        </div>
        <div className="text-ink-muted text-xs mb-3">{comps.length} תחרויות מוגדרות לשנתון {ageGroup}</div>
        <div className="space-y-2">
          {comps.map(c => (
            <div key={c.id} className="bg-surface border border-hairline rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-ink font-bold text-sm">{c.competition_name} {!c.is_active && <span className="text-ink-faint text-[10px]">(לא פעילה)</span>}</div>
                <div className="text-ink-faint text-[10px] mt-0.5">{c.competition_format} · {c.player_count} · {c.pitch_type} · {c.match_duration_minutes} דק׳ · סגל {c.max_squad_size} · חילופים {c.allowed_substitutions} · ניקוד {c.points_for_win}/{c.points_for_draw}/{c.points_for_loss}</div>
              </div>
              <button onClick={() => sel(c)} className="text-brand text-[11px] font-bold">ערוך</button>
            </div>
          ))}
          {comps.length === 0 && <div className="text-ink-faint text-sm text-center py-4">אין תחרויות מוגדרות. צור תחרות כדי להגדיר פורמט, כמות שחקנים, מגרש וניקוד.</div>}
        </div>
      </div>

      {editing !== null && (
        <div className="bg-panel border border-hairline rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Section><Flag size={14} className="text-brand" /> {editing?.id ? 'עריכת תחרות' : 'תחרות חדשה'}</Section>
            <button onClick={cancel}><X size={14} className="text-ink-faint" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="שם תחרות"><input value={form.competition_name} onChange={e => setF('competition_name', e.target.value)} className={inp} placeholder="ליגת נוער א׳" /></Field>
            <Field label="פורמט"><select value={form.competition_format} onChange={e => setF('competition_format', e.target.value)} className={inp}>
              {['SINGLE_ROUND_ROBIN','DOUBLE_ROUND_ROBIN','GROUP_STAGE_KNOCKOUT','FESTIVAL_TOURNAMENT'].map(o => <option key={o} value={o}>{o}</option>)}
            </select></Field>
            <Field label="כמות שחקנים"><select value={form.player_count} onChange={e => setF('player_count', e.target.value)} className={inp}>
              {['5V5','7V7','9V9','11V11','FUTSAL'].map(o => <option key={o} value={o}>{o}</option>)}
            </select></Field>
            <Field label="סוג מגרש"><select value={form.pitch_type} onChange={e => setF('pitch_type', e.target.value)} className={inp}>
              {['SYNTHETIC_TURF','NATURAL_GRASS','MULTICOURT_ASPHALT','INDOOR_HALL'].map(o => <option key={o} value={o}>{o}</option>)}
            </select></Field>
            <Field label="משך משחק (דק׳)"><input type="number" value={form.match_duration_minutes} onChange={e => setF('match_duration_minutes', +e.target.value)} className={inp} /></Field>
            <Field label="מכסת סגל"><input type="number" value={form.max_squad_size} onChange={e => setF('max_squad_size', +e.target.value)} className={inp} /></Field>
            <Field label="חילופים מותרים"><input type="number" value={form.allowed_substitutions} onChange={e => setF('allowed_substitutions', +e.target.value)} className={inp} /></Field>
            <Field label="נק׳ ניצחון"><input type="number" value={form.points_for_win} onChange={e => setF('points_for_win', +e.target.value)} className={inp} /></Field>
            <Field label="נק׳ תיקו"><input type="number" value={form.points_for_draw} onChange={e => setF('points_for_draw', +e.target.value)} className={inp} /></Field>
            <Field label="נק׳ הפסד"><input type="number" value={form.points_for_loss} onChange={e => setF('points_for_loss', +e.target.value)} className={inp} /></Field>
          </div>
          <button onClick={() => save.mutate()} disabled={!form.competition_name || save.isPending} className="w-full bg-brand text-brand-ink font-bold text-sm py-2.5 rounded hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-1"><Save size={14} /> שמור תחרות</button>
        </div>
      )}
    </div>
  );
}

function FixturesTab({ club, ageGroup }) {
  const qc = useQueryClient();
  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ['league-fixtures', club.id, ageGroup],
    queryFn: async () => (await call('fixtures', { club_id: club.id, age_group: ageGroup })).fixtures,
  });
  const [modal, setModal] = useState(null);
  const [resultFx, setResultFx] = useState(null);
  const [disputeFx, setDisputeFx] = useState(null);
  const sorted = [...fixtures].sort((a, b) => (a.matchday || 99) - (b.matchday || 99) || (a.match_date || 'z').localeCompare(b.match_date || 'z'));

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div>;
  if (!sorted.length) return <div className="text-center py-12 text-ink-faint text-sm">אין משחקי ליגה. הגרל תחילה משחקים.</div>;

  return (
    <div className="space-y-2">
      {sorted.map(f => {
        const coordState = COORD_STATE[f.coordination_status] || COORD_STATE.PENDING_COORDINATION;
        const resState = RES_STATE[f.result_status] || RES_STATE.PENDING_REPORT;
        return (
          <div key={f.id} className="bg-panel border border-hairline rounded-lg p-3 flex items-center gap-3 flex-wrap">
            <div className="w-7 text-center"><span className="text-[10px] text-ink-faint">מ׳</span><div className="text-ink font-black text-sm">{f.matchday || '—'}</div></div>
            <div className="flex-1 min-w-[180px]">
              <div className="text-ink font-bold text-sm">{f.home_team} <span className="text-ink-faint mx-1">נגד</span> {f.away_team}</div>
              <div className="text-ink-faint text-[10px]">
                {f.match_date ? new Date(f.match_date).toLocaleDateString('he-IL', { day: '2-digit', month: 'short' }) : 'ללא תאריך'} · {f.kickoff_time || '—'} · {f.stadium_name || '—'}
              </div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${coordState.cls}`}>{coordState.label}</span>
            {!['PENDING_REPORT'].includes(f.result_status) && <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${resState.cls}`}>{resState.label}</span>}
            {f.result_status === 'VERIFIED_AND_APPROVED' && <span className="text-ink font-black text-sm">{f.home_score} – {f.away_score}</span>}
            <div className="flex items-center gap-1">
              {!f.match_date && <button onClick={() => setModal(f)} className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-1 rounded hover:bg-sky-500/20">תיאום</button>}
              {f.match_date && f.result_status !== 'VERIFIED_AND_APPROVED' && f.result_status !== 'DISPUTED' && <button onClick={() => setResultFx(f)} className="text-[10px] font-bold bg-brand text-brand-ink px-2 py-1 rounded hover:brightness-110">דיווח תוצאה</button>}
              {f.result_status === 'DISPUTED' && <button onClick={() => setDisputeFx(f)} className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/20">מחלוקת</button>}
            </div>
          </div>
        );
      })}
      {modal && <CoordinationModal fx={modal} club={club} onClose={() => setModal(null)} onDone={() => { setModal(null); qc.invalidateQueries({ queryKey: ['league-fixtures', club.id, ageGroup] }); }} />}
      {resultFx && <ResultModal fx={resultFx} onClose={() => setResultFx(null)} onDone={() => { setResultFx(null); qc.invalidateQueries({ queryKey: ['league-fixtures', club.id, ageGroup], refetchType: 'all' }); }} />}
      {disputeFx && <DisputeModal fx={disputeFx} onClose={() => setDisputeFx(null)} onDone={() => { setDisputeFx(null); qc.invalidateQueries({ queryKey: ['league-fixtures', club.id, ageGroup], refetchType: 'all' });qc.invalidateQueries({queryKey:['league-standings',club.id,ageGroup]}); }} />}
    </div>
  );
}

function CoordinationModal({ fx, onClose, onDone }) {
  const [match_date, setD] = useState(fx.home_proposed_date || '');
  const [kickoff_time, setT] = useState(fx.home_proposed_time || '');
  const [stadium_name, setS] = useState(fx.home_proposed_stadium || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (mode) => {
    setBusy(true); setErr('');
    try {
      await call(mode === 'propose' ? 'proposeCoordination' : 'confirmCoordination', { fixture_id: fx.id, match_date, kickoff_time, stadium_name });
      onDone();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    setBusy(false);
  };
  return (
    <Modal onClose={onClose} title="תיאום משחק — מועד ומגרש">
      <div className="space-y-3 text-sm">
        <div className="text-ink-muted text-xs">{fx.home_team} נגד {fx.away_team} · מחזור {fx.matchday}</div>
        <Field label="תאריך"><input type="date" value={match_date} onChange={e => setD(e.target.value)} className={inp} /></Field>
        <Field label="שעה"><input type="time" value={kickoff_time} onChange={e => setT(e.target.value)} className={inp} /></Field>
        <Field label="מגרש"><input value={stadium_name} onChange={e => setS(e.target.value)} className={inp} placeholder="מגרש עירוני א׳" /></Field>
        {err && <div className="text-red-400 text-xs">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button disabled={busy || !match_date} onClick={() => submit('propose')} className="flex-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold py-2 rounded hover:bg-sky-500/30 disabled:opacity-40">הצע מועד</button>
          <button disabled={busy} onClick={() => submit('confirm')} className="flex-1 bg-brand text-brand-ink font-bold py-2 rounded hover:brightness-110 disabled:opacity-40">אשר תיאום</button>
        </div>
      </div>
    </Modal>
  );
}

function ResultModal({ fx, onClose, onDone }) {
  const [side, setSide] = useState('home');
  const [score, setScore] = useState('');
  const [scorers, setScorers] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const s = Number(score);
      if (Number.isNaN(s) || s < 0) throw { message: 'תוצאה לא תקינה' };
      await call('reportResult', { fixture_id: fx.id, side, score: s, scorers: scorers.split(',').map(x => x.trim()).filter(Boolean) });
      onDone();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
    setBusy(false);
  };
  return (
    <Modal onClose={onClose} title="דיווח תוצאת משחק">
      <div className="space-y-3 text-sm">
        <div className="text-ink-muted text-xs">{fx.home_team} (בית) vs {fx.away_team} (חוץ) · {fx.match_date}</div>
        <Field label="דיווח מטעם"><select value={side} onChange={e => setSide(e.target.value)} className={inp}><option value="home">{fx.home_team} — בית</option><option value="away">{fx.away_team} — חוץ</option></select></Field>
        <Field label={`סך שערים (${side === 'home' ? fx.home_team : fx.away_team})`}><input type="number" min={0} value={score} onChange={e => setScore(e.target.value)} className={inp} /></Field>
        <Field label="מבקיעים (מופרדים בפסיק)"><input value={scorers} onChange={e => setScorers(e.target.value)} className={inp} placeholder="יוסי כהן, דני לוי" /></Field>
        <div className="text-ink-faint text-[10px]">התוצאה מאומתת אוטומטית רק כאשר דיווחי הבית והחוץ תואמים. אי-תאימות נועלת להכרעת הנהלת הארגון.</div>
        {err && <div className="text-red-400 text-xs">{err}</div>}
        <button disabled={busy} onClick={submit} className="w-full bg-brand text-brand-ink font-bold py-2.5 rounded hover:brightness-110 disabled:opacity-40">שלח דיווח</button>
      </div>
    </Modal>
  );
}

function DisputeModal({ fx, onClose, onDone }) {
  const [home_score, setH] = useState(fx.home_reported_score ?? 0);
  const [away_score, setA] = useState(fx.away_reported_score ?? 0);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await call('resolveDispute', { fixture_id: fx.id, home_score: Number(home_score), away_score: Number(away_score) }); onDone(); } catch (e) { /* */ }
    setBusy(false);
  };
  return (
    <Modal onClose={onClose} title="הכרעת מחלוקת תוצאה (אדמין/הנהלה)">
      <div className="space-y-3 text-sm">
        <div className="text-red-400 text-xs">{fx.disputed_reason || 'מחלוקת בין דיווחי הצדדים'}</div>
        <div className="text-ink-muted text-xs">דיווח בית: {fx.home_reported_score ?? '—'} · דיווח חוץ: {fx.away_reported_score ?? '—'}</div>
        <Field label={`שערי ${fx.home_team}`}><input type="number" min={0} value={home_score} onChange={e => setH(e.target.value)} className={inp} /></Field>
        <Field label={`שערי ${fx.away_team}`}><input type="number" min={0} value={away_score} onChange={e => setA(e.target.value)} className={inp} /></Field>
        <button disabled={busy} onClick={submit} className="w-full bg-brand text-brand-ink font-bold py-2.5 rounded hover:brightness-110">אשר תוצאה רשמית</button>
      </div>
    </Modal>
  );
}

function StandingsTab({ club, ageGroup }) {
  const { data, isLoading } = useQuery({
    queryKey: ['league-standings', club.id, ageGroup],
    queryFn: async () => (await call('standings', { club_id: club.id, age_group: ageGroup, club_name: club.name })).standings,
  });
  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div>;
  if (!data || !data.length) return <div className="text-center py-12 text-ink-faint text-sm">טבלת הליגה תחושב אוטומטית עם אימות תוצאות המשחקים.</div>;
  return <StandingsTable rows={data} compact={false} />;
}

export function StandingsTable({ rows, compact, highlightTeam }) {
  return (
    <div className="bg-panel border border-hairline rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead className="text-ink-muted text-[10px] bg-panel-alt border-b border-hairline">
          <tr>
            <th className="text-right py-2.5 px-3">#</th>
            <th className="text-right">קבוצה</th>
            <th className="text-center">מש</th>
            <th className="text-center">נ</th>
            <th className="text-center">ת</th>
            <th className="text-center">ה</th>
            <th className="text-center">זכ</th>
            <th className="text-center">חס</th>
            <th className="text-center">הפרש</th>
            <th className="text-center text-brand">נק׳</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team_name} className={`border-b border-hairline text-ink hover:bg-panel-alt ${highlightTeam && r.team_name === highlightTeam ? 'bg-brand-soft' : ''}`}>
              <td className="py-2.5 px-3 text-ink-faint font-bold">{i + 1}</td>
              <td className="text-right font-bold">{r.team_name}</td>
              <td className="text-center text-ink-muted">{r.played}</td>
              <td className="text-center text-green-400">{r.won}</td>
              <td className="text-center text-amber-400">{r.drawn}</td>
              <td className="text-center text-red-400">{r.lost}</td>
              <td className="text-center text-ink-muted">{r.goals_for}</td>
              <td className="text-center text-ink-muted">{r.goals_against}</td>
              <td className="text-center text-ink">{r.goal_difference > 0 ? `+${r.goal_difference}` : r.goal_difference}</td>
              <td className="text-center text-brand font-black">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- helpers ----
const inp = 'w-full bg-surface border border-hairline rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line';
function Field({ label, children }) { return <div><label className="text-ink-faint text-[10px] block mb-1">{label}</label>{children}</div>; }
function Section({ children }) { return <h3 className="text-ink font-bold text-sm flex items-center gap-2">{children}</h3>; }
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-panel border border-hairline rounded-xl p-5" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-ink font-black text-base">{title}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const COORD_STATE = {
  PENDING_COORDINATION: { label: 'ממתין לתיאום', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  HOME_APPROVED: { label: 'הוצע מועד', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  AWAY_APPROVED: { label: 'אושר חוץ', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  FULLY_COORDINATED: { label: 'מתואם', cls: 'text-green-400 bg-green-400/10 border-green-400/30' },
};
const RES_STATE = {
  PENDING_REPORT: { label: 'ממתין לדיווח', cls: 'text-ink-faint bg-panel-alt border-hairline' },
  HOME_REPORTED: { label: 'בית דיווח', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  AWAY_REPORTED: { label: 'חוץ דיווח', cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  VERIFIED_AND_APPROVED: { label: 'אומתה', cls: 'text-green-400 bg-green-400/10 border-green-400/30' },
  DISPUTED: { label: 'מחלוקת', cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
};