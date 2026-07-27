import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Save, CheckCircle2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RatingScale from './RatingScale';

// טופס דוח קבוצתי מפורט — מחליף שדות לפי סוג: מקצועי / מנטלי / אישי.
// 'אישי' מחייב בחירת שחקן/ית ונשמר עם player_id + player_name.
export default function TeamReportForm({ team, players = [], authorRole = 'מאמן' }) {
  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState('מקצועי');
  const [form, setForm] = useState({
    date_start: today,
    session_id: '',
    summary: '',
    player_id: '',
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessions = [] } = useQuery({
    queryKey: ['team-events-for-report', team?.id],
    queryFn: () => base44.entities.TeamEvent.list('-date_start', 20),
    enabled: !!team?.id,
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        report_type: type,
        team_id: team?.id,
        team_name: team?.name,
        date_start: form.date_start,
        session_id: form.session_id || '',
        session_label: sessions.find(s => s.id === form.session_id)?.name || '',
        author_name: '',
        author_role: authorRole,
        summary: form.summary,
      };
      if (type === 'אישי') {
        const p = players.find(x => x.id === form.player_id);
        if (!p) throw new Error('יש לבחור שחקן/ית לדוח אישי');
        payload.player_id = p.id;
        payload.player_name = p.full_name;
        payload.technical = form.technical;
        payload.tactical = form.tactical;
        payload.attitude = form.attitude;
        payload.work_ethic = form.work_ethic;
        payload.confidence = form.confidence;
        payload.social = form.social;
        payload.strengths = form.strengths;
        payload.improvements = form.improvements;
        payload.private_note = form.private_note;
        payload.action_items = form.action_items;
      } else if (type === 'מקצועי') {
        payload.intensity = form.intensity;
        payload.execution = form.execution;
        payload.pressing = form.pressing;
        payload.transitions = form.transitions;
        payload.set_pieces = form.set_pieces;
        payload.tactical_shape = form.tactical_shape;
        payload.tactical_focus = form.tactical_focus;
        payload.strengths = form.strengths;
        payload.weaknesses = form.weaknesses;
        payload.next_plan = form.next_plan;
      } else { // מנטלי
        payload.group_cohesion = form.group_cohesion;
        payload.energy_mood = form.energy_mood;
        payload.focus_mental = form.focus_mental;
        payload.resilience = form.resilience;
        payload.leadership_emergence = form.leadership_emergence;
        payload.pressure_handling = form.pressure_handling;
        payload.standout = form.standout;
        payload.concerns = form.concerns;
        payload.intervention = form.intervention;
      }
      return base44.entities.TeamReport.create(payload);
    },
    onSuccess: () => {
      toast({ title: 'דוח נשמר בהצלחה' });
      queryClient.invalidateQueries({ queryKey: ['team-reports', team?.id] });
      // reset numeric/text dirty state minimally
      setForm(f => ({ ...f, summary: '', session_id: '', player_id: '' }));
    },
    onError: (e) => toast({ variant: 'destructive', title: 'שגיאה', description: String(e?.message || e).slice(0, 120) }),
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 space-y-4">
      {/* בורר סוג */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['מקצועי', 'מנטלי', 'אישי'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-colors ${type === t ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-[#0D1B2A] text-white/60 hover:text-white border border-white/10'}`}>
            {t === 'מקצועי' ? '🎯 מקצועי' : t === 'מנטלי' ? '🧠 מנטלי' : '👤 אישי'} {t}
          </button>
        ))}
      </div>

      {/* כותרת + מטא */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-white/40 text-[11px] font-bold mb-1 block">תאריך</label>
          <input type="date" value={form.date_start} onChange={e => setField('date_start', e.target.value)}
            className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
        </div>
        <div className="md:col-span-2">
          <label className="text-white/40 text-[11px] font-bold mb-1 block">קישור לאימות (אופציונלי)</label>
          <select value={form.session_id} onChange={e => setField('session_id', e.target.value)}
            className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none">
            <option value="">— ללא קישור לאימות —</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} · {s.date_start || ''}</option>)}
          </select>
        </div>
      </div>

      {/* אישי — בורר שחקן */}
      {type === 'אישי' && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-md p-3">
          <label className="text-white/40 text-[11px] font-bold mb-1.5 flex items-center gap-1"><Users size={11} /> בחירת שחקן/ית לדוח אישי</label>
          <select value={form.player_id} onChange={e => setField('player_id', e.target.value)}
            className="w-full bg-[#1B263B] border border-white/15 rounded px-3 py-2 text-white text-sm focus:outline-none">
            <option value="">— בחר/י שחקן/ית —</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.full_name} · {p.position || ''}</option>)}
          </select>
          {form.player_id && (
            <div className="text-white/30 text-[10px] mt-1.5">
              {players.find(p => p.id === form.player_id)?.team_name || ''}
            </div>
          )}
        </div>
      )}

      {/* שדות לפי סוג */}
      {type === 'מקצועי' && (
        <div className="space-y-4">
          <Section title="ביצועי שטח (1-5)">
            <Field label="מאמץ עבודה"><RatingScale value={form.intensity} onChange={v => setField('intensity', v)} /></Field>
            <Field label="ביצוע תרגילים"><RatingScale value={form.execution} onChange={v => setField('execution', v)} /></Field>
            <Field label="לחץ / נשיאה"><RatingScale value={form.pressing} onChange={v => setField('pressing', v)} /></Field>
            <Field label="מעברים"><RatingScale value={form.transitions} onChange={v => setField('transitions', v)} /></Field>
            <Field label="מצבים קבועים"><RatingScale value={form.set_pieces} onChange={v => setField('set_pieces', v)} /></Field>
            <Field label="ארגון טקטי / צורה"><RatingScale value={form.tactical_shape} onChange={v => setField('tactical_shape', v)} /></Field>
          </Section>
          <TextAreaField label="מוקד טקטי — מה תרגלנו?" value={form.tactical_focus} onChange={v => setField('tactical_focus', v)} />
          <TextAreaField label="חוזקות" value={form.strengths} onChange={v => setField('strengths', v)} />
          <TextAreaField label="חלשויות" value={form.weaknesses} onChange={v => setField('weaknesses', v)} />
          <TextAreaField label="תכנון אימות הבא" value={form.next_plan} onChange={v => setField('next_plan', v)} />
        </div>
      )}

      {type === 'מנטלי' && (
        <div className="space-y-4">
          <Section title="מצב מנטלי קבוצתי (1-5)">
            <Field label="לכידות קבוצתית"><RatingScale value={form.group_cohesion} onChange={v => setField('group_cohesion', v)} color="#60a5fa" /></Field>
            <Field label="אנרגיה / מצב רוח"><RatingScale value={form.energy_mood} onChange={v => setField('energy_mood', v)} color="#60a5fa" /></Field>
            <Field label="ריכוז"><RatingScale value={form.focus_mental} onChange={v => setField('focus_mental', v)} color="#60a5fa" /></Field>
            <Field label="עמידות מול קושי"><RatingScale value={form.resilience} onChange={v => setField('resilience', v)} color="#60a5fa" /></Field>
            <Field label="הופעת מנהיגות"><RatingScale value={form.leadership_emergence} onChange={v => setField('leadership_emergence', v)} color="#60a5fa" /></Field>
            <Field label="התמודדות עם לחץ"><RatingScale value={form.pressure_handling} onChange={v => setField('pressure_handling', v)} color="#60a5fa" /></Field>
          </Section>
          <TextAreaField label="בלטויות חיוביות" value={form.standout} onChange={v => setField('standout', v)} />
          <TextAreaField label="דגלים אדומים / חששות" value={form.concerns} onChange={v => setField('concerns', v)} />
          <TextAreaField label="תוכנית התערבות / טיפול" value={form.intervention} onChange={v => setField('intervention', v)} />
        </div>
      )}

      {type === 'אישי' && (
        <div className="space-y-4">
          <Section title="פרופיל אישי (1-5)">
            <Field label="טכני"><RatingScale value={form.technical} onChange={v => setField('technical', v)} /></Field>
            <Field label="טקטי"><RatingScale value={form.tactical} onChange={v => setField('tactical', v)} /></Field>
            <Field label="גישה"><RatingScale value={form.attitude} onChange={v => setField('attitude', v)} /></Field>
            <Field label="אתיקת עבודה"><RatingScale value={form.work_ethic} onChange={v => setField('work_ethic', v)} /></Field>
            <Field label="ביטחון עצמי"><RatingScale value={form.confidence} onChange={v => setField('confidence', v)} /></Field>
            <Field label="דינמיקה חברתית"><RatingScale value={form.social} onChange={v => setField('social', v)} /></Field>
          </Section>
          <TextAreaField label="חוזקות" value={form.strengths} onChange={v => setField('strengths', v)} />
          <TextAreaField label="תחומים לשיפור" value={form.improvements} onChange={v => setField('improvements', v)} />
          <TextAreaField label="פעולות נדרשות" value={form.action_items} onChange={v => setField('action_items', v)} />
          <TextAreaField label="הערה פנימית לצוות" value={form.private_note} onChange={v => setField('private_note', v)} />
        </div>
      )}

      {/* תקציר כללי */}
      <TextAreaField label="תקציר חופשי — שורות מסכמות" value={form.summary} onChange={v => setField('summary', v)} rows={3} />

      {/* שמירה */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => create.mutate()} disabled={create.isPending || !team?.id || (type === 'אישי' && !form.player_id)}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-bold px-5 py-2.5 rounded hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed">
          {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          שמור דוח {type}
        </button>
        {create.isSuccess && <CheckCircle2 size={16} className="text-green-400" />}
        {create.isError && <span className="text-red-400 text-xs">{create.error?.message}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-white/50 text-[11px] font-bold mb-2">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 bg-[#0D1B2A] border border-white/10 rounded-md p-4">
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/60 text-xs">{label}</span>
      {children}
    </div>
  );
}
function TextAreaField({ label, value, onChange, rows = 2 }) {
  return (
    <div>
      <label className="text-white/40 text-[11px] font-bold mb-1 block">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder="…"
        className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
    </div>
  );
}