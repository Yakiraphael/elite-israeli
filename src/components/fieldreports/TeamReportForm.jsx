import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Save, X } from 'lucide-react';
import RatingScale from './RatingScale';

// טופס יצירת דוח קבוצתי מפורט — 3 סוגים:
//   מקצועי (טקטי-טכני) · מנטלי (מצב/לכידות/עמידות) · אישי (שחקן/ית — בוחרים שחקן וממלאים).
// סשן (TeamEvent) אופציונלי — מאפשר לקשר דוח לאימות ספציפי מתוך ההיסטוריה.

const REPORT_TYPES = [
  { id: 'מקצועי', label: 'מקצועי', emoji: '📊', desc: 'טקטי · טכני · ביצוע תרגילים' },
  { id: 'מנטלי', label: 'מנטלי', emoji: '🧠', desc: 'לכידות · מצב · עמידות · מנהיגות' },
  { id: 'אישי', label: 'אישי', emoji: '👤', desc: 'שחקן/ית — דוח ממוקד' },
];

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-white/50 text-[11px] font-bold">{label}</label>
      {children}
      {hint && <div className="text-white/30 text-[10px]">{hint}</div>}
    </div>
  );
}

const inputCls = 'w-full bg-[#0D1B2A] border border-white/15 rounded-md px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60';
const areaCls = inputCls + ' min-h-[70px] resize-y leading-relaxed';

export default function TeamReportForm({ team, players = [], authorRole = 'מאמן', presetSession, onSaved, onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    report_type: 'מקצועי',
    team_id: team?.id || '',
    team_name: team?.name || '',
    session_id: presetSession?.id || '',
    session_label: presetSession?.name || '',
    date_start: new Date().toISOString().slice(0, 10),
    player_id: '',
    player_name: '',
    summary: '',
    // מקצועי
    intensity: 0, execution: 0, pressing: 0, transitions: 0, set_pieces: 0, tactical_shape: 0,
    tactical_focus: '', strengths: '', weaknesses: '', next_plan: '',
    // מנטלי
    group_cohesion: 0, energy_mood: 0, focus_mental: 0, resilience: 0, leadership_emergence: 0, pressure_handling: 0,
    standout: '', concerns: '', intervention: '',
    // אישי
    technical: 0, tactical: 0, attitude: 0, work_ethic: 0, confidence: 0, social: 0,
    improvements: '', private_note: '', action_items: '',
  });
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    (async () => {
      try { const u = await base44.auth.me(); setAuthorName(u?.full_name || ''); } catch { /* */ }
    })();
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['fr-sessions', team?.id],
    queryFn: () => base44.entities.TeamEvent.list('-date_start', 30),
    enabled: !!team?.id,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: (payload) => base44.entities.TeamReport.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-reports'] });
      queryClient.invalidateQueries({ queryKey: ['fr-summaries'] });
      onSaved?.();
    },
  });

  const submit = () => {
    const payload = { ...form, author_name: authorName, author_role: authorRole };
    if (!payload.team_id || !payload.team_name) { save.mutate(payload); return; }
    if (form.report_type === 'אישי' && !payload.player_id) return;
    save.mutate(payload);
  };

  const t = form.report_type;
  const canSave = !!form.team_id && form.date_start && (t !== 'אישי' || form.player_id) && !save.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-base">דוח חדש — {team?.name || 'בחר קבוצה'}</h3>
        {onCancel && <button onClick={onCancel} className="text-white/40 hover:text-white"><X size={16} /></button>}
      </div>

      {/* סוג דוח */}
      <div className="grid grid-cols-3 gap-2">
        {REPORT_TYPES.map(rt => (
          <button key={rt.id} type="button" onClick={() => set('report_type', rt.id)}
            className={`p-3 rounded-lg border text-center transition-colors ${t === rt.id ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50' : 'bg-[#0D1B2A] border-white/10 hover:border-white/30'}`}>
            <div className="text-lg">{rt.emoji}</div>
            <div className={`text-xs font-black ${t === rt.id ? 'text-[#D4AF37]' : 'text-white'}`}>{rt.label}</div>
            <div className="text-white/40 text-[9px] mt-0.5">{rt.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-[#0D1B2A]/60 border border-white/10 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="קבוצה">
            <input value={form.team_name} onChange={e => { set('team_name', e.target.value); }} className={inputCls} placeholder="שם קבוצה" />
          </Field>
          <Field label="תאריך">
            <input type="date" value={form.date_start} onChange={e => set('date_start', e.target.value)} className={inputCls} />
          </Field>
          <Field label="סשן / אימון (אופציונלי)">
            <select value={form.session_id} onChange={e => { const s = sessions.find(x => x.id === e.target.value); set('session_id', e.target.value); set('session_label', s?.name || ''); }} className={inputCls}>
              <option value="">— עצמאי —</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name} · {s.date_start || ''}</option>)}
            </select>
          </Field>
          {t === 'אישי' && (
            <Field label="שחקן/ית" hint="חובה לדוח אישי">
              <select value={form.player_id} onChange={e => { const p = players.find(x => x.id === e.target.value); set('player_id', e.target.value); set('player_name', p?.full_name || ''); }} className={inputCls}>
                <option value="">בחר שחקן/ית...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.full_name} · {p.position || ''}</option>)}
              </select>
            </Field>
          )}
        </div>

        <Field label="תקציר חופשי">
          <textarea value={form.summary} onChange={e => set('summary', e.target.value)} className={areaCls} placeholder="סיכום קצר של הדוח..." />
        </Field>

        {/* גוף הדוח לפי סוג */}
        {t === 'מקצועי' && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            <div className="text-[#D4AF37] text-xs font-black">הערכה טקטית-טכנית</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <RatingScale label="מאמץ עבודה" value={form.intensity} onChange={v => set('intensity', v)} />
              <RatingScale label="ביצוע תרגילים" value={form.execution} onChange={v => set('execution', v)} />
              <RatingScale label="לחץ / נשיאה" value={form.pressing} onChange={v => set('pressing', v)} />
              <RatingScale label="מעברים" value={form.transitions} onChange={v => set('transitions', v)} />
              <RatingScale label="מצבים קבועים" value={form.set_pieces} onChange={v => set('set_pieces', v)} />
              <RatingScale label="ארגון/צורה" value={form.tactical_shape} onChange={v => set('tactical_shape', v)} />
            </div>
            <Field label="מוקד טקטי"><input value={form.tactical_focus} onChange={e => set('tactical_focus', e.target.value)} className={inputCls} /></Field>
            <Field label="חוזקות"><textarea value={form.strengths} onChange={e => set('strengths', e.target.value)} className={areaCls} /></Field>
            <Field label="חלשיות"><textarea value={form.weaknesses} onChange={e => set('weaknesses', e.target.value)} className={areaCls} /></Field>
            <Field label="תכנון אימון הבא"><textarea value={form.next_plan} onChange={e => set('next_plan', e.target.value)} className={areaCls} /></Field>
          </div>
        )}

        {t === 'מנטלי' && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            <div className="text-[#D4AF37] text-xs font-black">הערכה מנטלית-קבוצתית</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <RatingScale label="לכידות קבוצתית" value={form.group_cohesion} onChange={v => set('group_cohesion', v)} />
              <RatingScale label="אנרגיה / מצב" value={form.energy_mood} onChange={v => set('energy_mood', v)} />
              <RatingScale label="ריכוז" value={form.focus_mental} onChange={v => set('focus_mental', v)} />
              <RatingScale label="עמידות מול קושי" value={form.resilience} onChange={v => set('resilience', v)} />
              <RatingScale label="הופעת מנהיגות" value={form.leadership_emergence} onChange={v => set('leadership_emergence', v)} />
              <RatingScale label="התמודדות עם לחץ" value={form.pressure_handling} onChange={v => set('pressure_handling', v)} />
            </div>
            <Field label="בלטויות חיוביות"><textarea value={form.standout} onChange={e => set('standout', e.target.value)} className={areaCls} /></Field>
            <Field label="דגלים אדומים / חששות"><textarea value={form.concerns} onChange={e => set('concerns', e.target.value)} className={areaCls} /></Field>
            <Field label="תכנית התערבות / טיפול"><textarea value={form.intervention} onChange={e => set('intervention', e.target.value)} className={areaCls} /></Field>
          </div>
        )}

        {t === 'אישי' && (
          <div className="space-y-3 border-t border-white/10 pt-3">
            <div className="text-[#D4AF37] text-xs font-black">דוח אישי — {form.player_name || 'בחר שחקן/ית'}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <RatingScale label="טכני" value={form.technical} onChange={v => set('technical', v)} />
              <RatingScale label="טקטי" value={form.tactical} onChange={v => set('tactical', v)} />
              <RatingScale label="גישה" value={form.attitude} onChange={v => set('attitude', v)} />
              <RatingScale label="אתיקת עבודה" value={form.work_ethic} onChange={v => set('work_ethic', v)} />
              <RatingScale label="ביטחון עצמי" value={form.confidence} onChange={v => set('confidence', v)} />
              <RatingScale label="דינמיקה חברתית" value={form.social} onChange={v => set('social', v)} />
            </div>
            <Field label="תחומים לשיפור"><textarea value={form.improvements} onChange={e => set('improvements', e.target.value)} className={areaCls} /></Field>
            <Field label="הערה פנימית לצוות"><textarea value={form.private_note} onChange={e => set('private_note', e.target.value)} className={areaCls} /></Field>
            <Field label="פעולות נדרשות"><textarea value={form.action_items} onChange={e => set('action_items', e.target.value)} className={areaCls} /></Field>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-white/40 text-[10px]">מחבר: {authorName || '...'} · {authorRole}</div>
        <div className="flex items-center gap-2">
          {save.isError && <span className="text-red-400 text-xs">{save.error?.message}</span>}
          <button onClick={submit} disabled={!canSave}
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0D1B2A] text-sm font-black px-4 py-2 rounded-md disabled:opacity-40 hover:bg-amber-300 transition-colors">
            {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} שמור דוח
          </button>
        </div>
      </div>
    </div>
  );
}