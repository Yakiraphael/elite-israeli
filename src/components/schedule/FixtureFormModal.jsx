import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Save, Gavel } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AGE_GROUPS = ['טרום-ילדים', 'ילדים א׳', 'ילדים ב׳', 'נערים א׳', 'נערים ב׳', 'נוער', 'בוגרים'];

export default function FixtureFormModal({ club, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || {
    age_group: 'נערים א׳', home_team: '', away_team: '', match_date: '',
    kickoff_time: '16:00', stadium_name: '', competition: '', round: '', notes: '',
    status: 'SCHEDULED',
  });
  const [conflicts, setConflicts] = useState([]);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const runValidate = async () => {
    if (!form.match_date || !form.kickoff_time || !form.stadium_name || !form.home_team || !form.away_team) {
      setConflicts([]); return;
    }
    setChecking(true);
    try {
      const res = await base44.functions.invoke('fixtures-engine', {
        action: 'validate',
        fixture: { ...form, club_id: club.id, club_name: club.club_name },
        excludeId: form.id,
      });
      setConflicts(res.data.conflicts || []);
    } catch { /* ignore — ה-Shield ייתפס בשמירה */ }
    setChecking(false);
  };

  useEffect(() => { runValidate(); /* eslint-disable-next-line */ }, [form.match_date, form.kickoff_time, form.stadium_name, form.home_team, form.away_team, form.age_group]);

  const save = async () => {
    setSaving(true); setErr('');
    try {
      if (conflicts.length) {
        setErr('קיימות התנגשויות פתוחות — יש לפתור אותן לפני השמירה.');
        setSaving(false); return;
      }
      const payload = { ...form, club_id: club.id, club_name: club.club_name };
      const action = form.id ? 'update' : 'create';
      const res = await base44.functions.invoke('fixtures-engine', { action, fixture: payload });
      if (res.status === 409) {
        setConflicts(res.data.conflicts || []);
        setErr(res.data.error || 'התנגשות');
      } else {
        onSaved?.(res.data.fixture);
      }
    } catch (e) {
      const data = e?.response?.data;
      if (data?.conflicts) { setConflicts(data.conflicts); setErr(data.error || 'התנגשות'); }
      else setErr(e.message || 'שגיאה');
    }
    setSaving(false);
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-panel border border-hairline rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <Header title={form.id ? 'עריכת משחק' : 'משחק חדש'} onClose={onClose} />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="שנתון"><select value={form.age_group} onChange={e => set('age_group', e.target.value)} className={inp}>
              {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
            </select></Field>
            <Field label="מסגרת / ליגה"><input value={form.competition} onChange={e => set('competition', e.target.value)} className={inp} placeholder="ליגת נערים א׳" /></Field>
            <Field label="קבוצת בית"><input value={form.home_team} onChange={e => set('home_team', e.target.value)} className={inp} /></Field>
            <Field label="קבוצת חוץ"><input value={form.away_team} onChange={e => set('away_team', e.target.value)} className={inp} /></Field>
            <Field label="תאריך"><input type="date" value={form.match_date} onChange={e => set('match_date', e.target.value)} className={inp} /></Field>
            <Field label="שעת פתיחה"><input type="time" value={form.kickoff_time} onChange={e => set('kickoff_time', e.target.value)} className={inp} /></Field>
            <Field label="מגרש" full><input value={form.stadium_name} onChange={e => set('stadium_name', e.target.value)} className={inp} placeholder="מגרש עירוני א׳" /></Field>
            <Field label="מחזור / שלב" full><input value={form.round} onChange={e => set('round', e.target.value)} className={inp} /></Field>
          </div>

          <ConflictsBlock conflicts={conflicts} checking={checking} />

          {err && <div className="text-red-400 text-xs">{err}</div>}

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || conflicts.length > 0} className="flex-1 bg-brand text-brand-ink font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-1.5 disabled:opacity-40">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} שמור משחק
            </button>
            <button onClick={onClose} className="px-4 text-ink-muted hover:text-ink text-sm">ביטול</button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}

const inp = 'w-full bg-surface border border-hairline rounded-md px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line';

function Field({ label, children, full }) {
  return <label className={full ? 'col-span-2 block' : 'block'}>
    <div className="text-ink-muted text-[11px] font-bold mb-1">{label}</div>
    {children}
  </label>;
}

function ConflictsBlock({ conflicts, checking }) {
  if (checking) return <div className="flex items-center gap-2 text-ink-faint text-xs"><Loader2 size={12} className="animate-spin" /> בודק התנגשויות מול לו״ז קיים…</div>;
  if (!conflicts.length) return <div className="flex items-center gap-2 text-green-400 text-xs"><Save size={12} /> אין התנגשויות — החלון פנוי.</div>;
  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><AlertTriangle size={13} /> זוהו {conflicts.length} התנגשויות</div>
      {conflicts.map((c, i) => (
        <div key={i} className="text-red-300 text-[11px] leading-relaxed">
          <span className="font-bold">{c.type === 'STADIUM_CONFLICT' ? 'מגרש תפוס' : c.type === 'TEAM_CONFLICT' ? 'קבוצה משובצת' : 'הפרת מנוחת נוער'}: </span>
          {c.message}
        </div>
      ))}
    </div>
  );
}

function Header({ title, onClose }) {
  return <div className="sticky top-0 bg-panel border-b border-hairline px-5 py-3 flex items-center justify-between">
    <h2 className="text-ink font-black text-sm flex items-center gap-2"><Gavel size={15} className="text-brand" /> {title}</h2>
    <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={18} /></button>
  </div>;
}

function Backdrop({ children, onClose }) {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow; root.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}