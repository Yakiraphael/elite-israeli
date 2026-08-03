import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  GitMerge, Loader2, Shield, Activity, CheckCircle2, XCircle,
  Search, FileCheck2, TrendingUp, ArrowRight,
} from 'lucide-react';
import RoleToolbar from '../components/RoleToolbar';

export default function BridgeStudio() {
  const queryClient = useQueryClient();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('pipeline');

  useQuery({
    queryKey: ['bridge-me'],
    queryFn: async () => {
      const u = await base44.auth.me();
      const clubs = await base44.entities.Club.filter({ admin_ids: u.id }, '-created_date', 10);
      const out = { ...u, myClub: clubs[0] || null };
      setMe(out); return out;
    },
  });

  if (!me) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;

  const canManage = me.role === 'admin' || me.role === 'director';
  if (!canManage) return <Gate />;

  const tabs = [
    { id: 'pipeline', label: 'צינור מעבר', icon: GitMerge },
    { id: 'compliance', label: 'תיק תאימות קטינים', icon: FileCheck2 },
    { id: 'growth', label: 'התפתחות נוער', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <RoleToolbar activeLabel="גשר חובבני → מקצועי" activeIcon={GitMerge} />
      <div className="bg-panel border-b border-hairline py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-ink font-black text-xl flex items-center gap-2"><GitMerge size={18} className="text-brand" /> גשר חובבני → מקצועי</h1>
          <p className="text-ink-muted text-xs mt-0.5">מעבר מבוקר ממסגרות עממיות/בלתי-פורמליות למועדוני נוער רשמיים בהתאחדות · אימות תאימות קטינים · מעקב התפתחות אורך-שנתונים</p>
        </div>
      </div>
      <div className="bg-panel border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? 'text-brand border-brand' : 'text-ink-muted border-transparent hover:text-ink'}`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'pipeline' && <PipelineTab club={me.myClub} onDataChange={() => queryClient.invalidateQueries({ queryKey: ['bridge-transfers'] })} />}
        {tab === 'compliance' && <ComplianceTab />}
        {tab === 'growth' && <GrowthTab />}
      </div>
    </div>
  );
}

function Gate() {
  return <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
    <Shield size={28} className="text-ink-faint" />
    <div className="text-ink font-bold">גשר חובבני → מקצועי</div>
    <div className="text-ink-muted text-xs">גישה מוגבלת למנהל מקצועי / אדמין.</div>
  </div>;
}

function usePlayers() {
  const [players, setPlayers] = useState([]);
  useEffect(() => { base44.entities.PlayerRegistration.list('-created_date', 200).then(setPlayers).catch(() => {}); }, []);
  return players;
}

// ---------------- Pipeline ----------------
function PipelineTab({ club, onDataChange }) {
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['bridge-transfers'],
    queryFn: async () => (await base44.functions.invoke('bridge-engine', { action: 'list' })).data.transfers,
  });
  const list = filter ? transfers.filter(t => t.status === filter) : transfers;
  const pending = transfers.filter(t => t.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-ink-faint text-[10px]">{transfers.length} צינורות · {pending} ממתינים</span>
          {[{ v: '', l: 'הכל' }, { v: 'PENDING_REVIEW', l: 'ממתינים' }, { v: 'APPROVED', l: 'אושרו' }, { v: 'REJECTED', l: 'נדחו' }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-colors ${filter === f.v ? 'bg-brand text-brand-ink border-brand' : 'text-ink-muted border-hairline hover:text-ink'}`}>{f.l}</button>
          ))}
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1 text-xs font-bold bg-brand text-brand-ink rounded-md px-3 py-1.5"><GitMerge size={13} /> צור צינור מעבר</button>
      </div>
      {isLoading ? <div className="text-center py-10"><Loader2 className="animate-spin text-brand mx-auto" /></div> :
        !list.length ? <div className="text-center py-12 text-ink-faint text-sm">אין צינורות להצגה.</div> :
        <div className="space-y-2">{list.map(t => <TransferRow key={t.id} t={t} onDataChange={onDataChange} />)}</div>}
      {creating && <CreateTransferModal club={club} onClose={() => setCreating(false)} onDone={() => { setCreating(false); onDataChange(); }} />}
    </div>
  );
}

const STATUS_COLOR = {
  PENDING_REVIEW: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  APPROVED: 'text-green-400 bg-green-400/10 border-green-400/30',
  REJECTED: 'text-red-400 bg-red-400/10 border-red-400/30',
  COMPLETED: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  CANCELLED: 'text-ink-faint bg-white/5 border-hairline',
};
const STATUS_LABEL = { PENDING_REVIEW: 'ממתין לאישור', APPROVED: 'אושר', REJECTED: 'נדחה', COMPLETED: 'הושלם', CANCELLED: 'בוטל' };
const CLASSIFICATION_LABELS = { IFA_VERIFIED: 'מאומת התאחדות', YOUTH_DEPARTMENT: 'מחלקת נוער', AMATEUR_LEAGUE: 'ליגה חובבנית', ASSOCIATION: 'עמותה/איגוד' };

function TransferRow({ t, onDataChange }) {
  const [busy, setBusy] = useState(false);
  const act = async (action, extra = {}) => {
    setBusy(true);
    try { await base44.functions.invoke('bridge-engine', { action, transfer_id: t.id, ...extra }); onDataChange(); }
    finally { setBusy(false); }
  };
  return (
    <div className="bg-panel border border-hairline rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-ink font-bold text-sm">{t.player_name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.status] || STATUS_COLOR.PENDING_REVIEW}`}>{STATUS_LABEL[t.status] || t.status}</span>
            {t.source_org_classification && <span className="text-[10px] text-ink-muted">{CLASSIFICATION_LABELS[t.source_org_classification] || t.source_org_classification}</span>}
          </div>
          <div className="text-ink-muted text-xs mt-1 flex items-center gap-1.5 flex-wrap">
            <span>{t.source_org_name || '—'}</span> <ArrowRight size={10} /> <span className="text-ink">{t.target_club_name || '—'}</span> · {t.age_group || '—'}
          </div>
        </div>
        {t.status === 'PENDING_REVIEW' && (
          <div className="flex gap-2">
            <button onClick={() => act('approve', { director_notes: 'אושר מהגשר' })} disabled={busy} className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/30 rounded-md px-2.5 py-1.5 disabled:opacity-40"><CheckCircle2 size={12} /> אשר מעבר</button>
            <button onClick={() => act('reject', { director_notes: 'נדחה מהגשר' })} disabled={busy} className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/30 rounded-md px-2.5 py-1.5 disabled:opacity-40"><XCircle size={12} /> דחה</button>
          </div>
        )}
      </div>
      {t.development_snapshot && (
        <details className="mt-2 text-[11px] text-ink-muted">
          <summary className="cursor-pointer hover:text-ink">תמונת מצב התפתחותית (סנאפשוט)</summary>
          <pre className="text-ink-faint text-[10px] mt-1 max-h-32 overflow-auto whitespace-pre-wrap">{t.development_snapshot}</pre>
        </details>
      )}
    </div>
  );
}

function CreateTransferModal({ club, onClose, onDone }) {
  const players = usePlayers();
  const [form, setForm] = useState({ player_id: '', target_club_id: club?.id || '', target_club_name: club?.club_name || '', source_org_name: '', source_org_classification: 'AMATEUR_LEAGUE', bridge_fee: 0, sell_on_clause: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    setBusy(true);
    try { await base44.functions.invoke('bridge-engine', { action: 'scoutToAcademy', ...form }); onDone(); }
    catch (e) { alert(e.message); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-panel border border-hairline rounded-xl w-full max-w-lg p-5" dir="rtl">
        <h2 className="text-ink font-black text-sm mb-4 flex items-center gap-2"><GitMerge size={15} className="text-brand" /> צור צינור מעבר לאקדמיה</h2>
        <div className="space-y-3">
          <Lbl text="שחקן">
            <select value={form.player_id} onChange={e => set('player_id', e.target.value)} className={inp}>
              <option value="">— בחר שחקן —</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.full_name} · {p.team_name || p.position}</option>)}
            </select>
          </Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl text="מסגרת מקור"><input value={form.source_org_name} onChange={e => set('source_org_name', e.target.value)} className={inp} placeholder="עמותה / ליגת שכונה" /></Lbl>
            <Lbl text="סיווג מקור">
              <select value={form.source_org_classification} onChange={e => set('source_org_classification', e.target.value)} className={inp}>
                {['AMATEUR_LEAGUE', 'ASSOCIATION', 'YOUTH_DEPARTMENT', 'IFA_VERIFIED'].map(c => <option key={c} value={c}>{CLASSIFICATION_LABELS[c] || c}</option>)}
              </select>
            </Lbl>
          </div>
          <Lbl text="מועדון יעד (אקדמיה/התאחדות)"><input value={form.target_club_name} onChange={e => set('target_club_name', e.target.value)} className={inp} /></Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl text="דמי מעבר (₪)"><input type="number" value={form.bridge_fee} onChange={e => set('bridge_fee', Number(e.target.value))} className={inp} /></Lbl>
            <Lbl text="סעיף השבחה (Sell-On)"><input value={form.sell_on_clause} onChange={e => set('sell_on_clause', e.target.value)} className={inp} /></Lbl>
          </div>
          <button onClick={submit} disabled={busy || !form.player_id} className="w-full bg-brand text-brand-ink font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-1.5 disabled:opacity-40">{busy ? <Loader2 size={14} className="animate-spin" /> : <GitMerge size={14} />} פתח צינור</button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Compliance ----------------
function ComplianceTab() {
  const players = usePlayers();
  const [playerId, setPlayerId] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async () => { if (!playerId) return; setLoading(true); try { const r = await base44.functions.invoke('bridge-engine', { action: 'complianceList', player_id: playerId }); setDocs(r.data.docs); } finally { setLoading(false); } };
  const verify = async (d, verified, rejection_reason = '') => {
    await base44.functions.invoke('bridge-engine', { action: 'complianceVerify', doc_id: d.id, verified, rejection_reason });
    load();
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={playerId} onChange={e => setPlayerId(e.target.value)} className={inp + ' max-w-xs'}>
          <option value="">— בחר שחקן לתיק תאימות —</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
        <button onClick={load} disabled={!playerId} className="text-xs font-bold text-brand border border-brand-line rounded-md px-3 py-1.5 disabled:opacity-40"><Search size={12} className="inline ml-1" /> שלוף תיק</button>
      </div>
      {loading ? <Loader2 className="animate-spin text-brand" /> : !playerId ? <div className="text-ink-faint text-sm py-8 text-center">בחר שחקן לצפייה במסמכי תאימות — כל פתיחה מתועדת ביומן ביקורת.</div> :
        <div className="space-y-2">
          {docs.length === 0 && <div className="text-ink-faint text-sm">אין מסמכים.</div>}
          {docs.map(d => (
            <div key={d.id} className="bg-panel border border-hairline rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-ink font-bold text-sm flex items-center gap-2"><FileCheck2 size={13} className="text-brand" /> {docLabel(d.doc_type)} {d.is_verified ? <span className="text-[9px] text-green-400 bg-green-400/10 border-green-400/30 border px-1.5 py-0.5 rounded-full">מאומת</span> : <span className="text-[9px] text-amber-400 bg-amber-400/10 border-amber-400/30 border px-1.5 py-0.5 rounded-full">ממתין</span>}</div>
                <div className="text-ink-muted text-[11px] mt-0.5">הועלה ע״י {d.uploaded_by_name || '—'}{d.verified_at ? ` · אומת ע״י ${d.verified_by_name}` : ''}</div>
                {d.rejection_reason && <div className="text-red-400 text-[11px] mt-0.5">דחייה: {d.rejection_reason}</div>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-brand hover:underline">צפה</a>
                {!d.is_verified && <button onClick={() => verify(d, true)} className="text-[11px] font-bold text-green-400 hover:text-green-300">אשר</button>}
                <button onClick={() => verify(d, false, 'לא עומד בדרישות')} className="text-[11px] font-bold text-red-400 hover:text-red-300">דחה</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function docLabel(t) { return { MEDICAL_CERTIFICATE: 'אישור רפואי', PARENTAL_CONSENT: 'הסכמת הורה', IFA_REGISTRATION_FORM: 'טופס רישום התאחדות', MEDIA_CONSENT: 'אישור מדיה', POWER_OF_ATTORNEY: 'ייפוי כוח' }[t] || t; }

// ---------------- Growth ----------------
function GrowthTab() {
  const players = usePlayers();
  const [playerId, setPlayerId] = useState('');
  const [records, setRecords] = useState([]);
  useEffect(() => {
    if (!playerId) { setRecords([]); return; }
    base44.functions.invoke('bridge-engine', { action: 'growthList', player_id: playerId }).then(r => setRecords(r.data.records)).catch(() => {});
  }, [playerId]);
  const trends = useMemo(() => records.slice().reverse(), [records]);
  return (
    <div className="space-y-4">
      <select value={playerId} onChange={e => setPlayerId(e.target.value)} className={inp + ' max-w-xs'}>
        <option value="">— בחר שחקן למעקב התפתחות —</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
      </select>
      {!playerId ? <div className="text-ink-faint text-sm py-8 text-center">בחר שחקן לצפייה במדידות התפתחות אורך-שנתונים.</div> :
        !trends.length ? <div className="text-ink-faint text-sm py-8 text-center">אין מדידות עדיין.</div> :
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-ink-muted text-[10px]">
              <tr className="border-b border-hairline">
                <th className="text-right py-2 px-2">תאריך</th><th>שנתון</th><th>גובה</th><th>משקל</th><th>30מ</th><th>טכני</th><th>טקטי</th><th>מנטלי</th><th>פיזי</th><th>הערות</th>
              </tr>
            </thead>
            <tbody>
              {trends.map(g => (
                <tr key={g.id} className="border-b border-hairline text-ink">
                  <td className="py-2 px-2 text-ink-muted">{g.recorded_at}</td>
                  <td className="text-center">{g.age_group}</td>
                  <td className="text-center">{g.height_cm || '—'}</td>
                  <td className="text-center">{g.weight_kg || '—'}</td>
                  <td className="text-center">{g.sprint_30m_sec || '—'}</td>
                  <td className="text-center">{g.technical_score ?? '—'}</td>
                  <td className="text-center">{g.tactical_score ?? '—'}</td>
                  <td className="text-center">{g.mental_score ?? '—'}</td>
                  <td className="text-center">{g.physical_score ?? '—'}</td>
                  <td className="text-ink-muted max-w-[200px] truncate">{g.coach_notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

const inp = 'w-full bg-surface border border-hairline rounded-md px-3 py-2 text-ink text-sm focus:outline-none focus:border-brand-line';
function Lbl({ text, children }) { return <label className="block"><div className="text-ink-muted text-[11px] font-bold mb-1">{text}</div>{children}</label>; }