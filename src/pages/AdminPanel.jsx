import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus, Trash2, Edit2, CheckCircle2, X, Loader2, ArrowRight, Users, Calendar, Send, Star, ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransfersManager from '../components/admin/TransfersManager';
import EliteIdEditorModal from '../components/admin/EliteIdEditorModal';
import PlayerVerificationModal from '../components/admin/PlayerVerificationModal';
import PermissionsManager from '../components/admin/PermissionsManager';
import AuditLogPanel from '../components/admin/AuditLogPanel';

const ADMIN_PASSWORD = 'elite2025';

export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setUnlocked(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <img src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png" alt="עילית ישראלית" className="h-16 mx-auto mb-6" />
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-[#D4AF37]" />
            </div>
            <h1 className="text-white font-black text-xl">ממשק ניהול</h1>
            <p className="text-white/40 text-sm mt-1">הכנס סיסמת כניסה</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              placeholder="סיסמה"
              className={`w-full bg-[#1B263B] border rounded-sm px-4 py-3 text-white text-sm text-center tracking-widest placeholder-white/20 focus:outline-none transition-colors ${pwError ? 'border-red-500 animate-pulse' : 'border-white/15 focus:border-[#D4AF37]/60'}`}
            />
            {pwError && <p className="text-red-400 text-xs text-center">סיסמה שגויה</p>}
            <button type="submit" className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm hover:bg-amber-400 transition-colors">
              כניסה
            </button>
          </form>
          <div className="text-center mt-6">
            <Link to="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">חזרה לאתר</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setUnlocked(false)} />;
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('events');

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 py-4 px-6 bg-[#1B263B]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png" alt="עילית ישראלית" className="h-9" />
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">ממשק ניהול</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/40 hover:text-white text-xs transition-colors flex items-center gap-1">
              <ArrowRight size={13} /> אתר
            </Link>
            <button onClick={onLogout} className="text-white/30 hover:text-red-400 text-xs transition-colors flex items-center gap-1">
              <Lock size={13} /> יציאה
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-[#1B263B]">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {[{ id: 'events', label: 'אירועים', icon: Calendar }, { id: 'players', label: 'שחקנים', icon: Users }, { id: 'transfers', label: 'העברות', icon: Send }, { id: 'permissions', label: 'הרשאות', icon: ShieldCheck }, { id: 'audit', label: 'יומן ביקורת', icon: History }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {tab === 'events' && <EventsManager />}
        {tab === 'players' && <PlayersViewer />}
        {tab === 'transfers' && <TransfersManager />}
        {tab === 'permissions' && <PermissionsManager />}
        {tab === 'audit' && <AuditLogPanel />}
      </div>
    </div>
  );
}

// ---- Events CRUD ----
function EventsManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.TeamEvent.list('-created_date', 50),
  });

  const save = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.TeamEvent.update(editing.id, data)
      : base44.entities.TeamEvent.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); closeForm(); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.TeamEvent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
  });

  function openEdit(ev) { setEditing(ev); setForm({ ...ev }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyEvent()); }
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl">אירועים וטורנירים</h2>
        <button onClick={() => setShowForm(true)} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-5 py-2.5 rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-2">
          <Plus size={14} /> אירוע חדש
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black">{editing ? 'עריכת אירוע' : 'אירוע חדש'}</h3>
              <button onClick={closeForm}><X size={16} className="text-white/40 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AField label="שם האירוע *" name="name" value={form.name} onChange={handleChange} />
              <ASelect label="סוג" name="type" value={form.type} onChange={handleChange}
                options={['טורניר', 'אימון', 'מחנה', 'בחינות כושר', 'אירוע מיוחד']} />
              <AField label="מיקום" name="location" value={form.location} onChange={handleChange} />
              <AField label="עיר" name="city" value={form.city} onChange={handleChange} />
              <AField label="תאריך התחלה" name="date_start" value={form.date_start} onChange={handleChange} type="date" />
              <AField label="תאריך סיום" name="date_end" value={form.date_end} onChange={handleChange} type="date" />
              <ASelect label="קבוצת גיל" name="age_group" value={form.age_group} onChange={handleChange}
                options={['ילדים (8-10)', 'צעירים (11-13)', 'נוער (14-16)', 'בוגרים (17-20)', 'כל הגילאים']} />
              <AField label="מקסימום שחקנים" name="max_players" value={form.max_players} onChange={handleChange} type="number" />
              <div className="sm:col-span-2">
                <AField label="תיאור" name="description" value={form.description} onChange={handleChange} textarea />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => save.mutate(form)} disabled={!form.name || save.isPending}
                className="bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-6 py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {editing ? 'שמור שינויים' : 'צור אירוע'}
              </button>
              <button onClick={closeForm} className="text-white/40 text-sm hover:text-white transition-colors">ביטול</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">אין אירועים עדיין — צור את הראשון!</div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-bold text-sm">{ev.name}</div>
                <div className="text-[#D4AF37] text-xs mt-1">{ev.type}{ev.city ? ` · ${ev.city}` : ''}{ev.age_group ? ` · ${ev.age_group}` : ''}</div>
                <div className="text-white/30 text-xs mt-0.5">{ev.date_start}{ev.date_end ? ` — ${ev.date_end}` : ''}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(ev)} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Edit2 size={13} className="text-white/50" />
                </button>
                <button onClick={() => remove.mutate(ev.id)} className="w-8 h-8 rounded bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <Trash2 size={13} className="text-white/50 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Players Viewer ----
function PlayersViewer() {
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [verifyingPlayer, setVerifyingPlayer] = useState(null);
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 100),
  });

  const queryClient = useQueryClient();
  const logStatusChange = async (playerName, details) => {
    let user = null;
    try { user = await base44.auth.me(); } catch { /* ignore */ }
    base44.entities.AuditLog.create({
      actor_id: user?.id || 'unknown', actor_name: user?.full_name, actor_role: user?.role,
      action: 'status_change', details: `${playerName}: ${details}`,
    });
  };
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, playerName }) => {
      await logStatusChange(playerName, `סטטוס רישום עודכן ל-${status}`);
      return base44.entities.PlayerRegistration.update(id, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
  });

  const STATUS_COLORS = { 'ממתין': 'text-yellow-400 bg-yellow-400/10', 'מאושר': 'text-green-400 bg-green-400/10', 'פעיל': 'text-blue-400 bg-blue-400/10' };
  const ACCOUNT_STATUS_COLORS = { 'לא מאומת': 'text-white/40 bg-white/5', 'ממתין לאישור': 'text-amber-400 bg-amber-400/10', 'מאושר': 'text-green-400 bg-green-400/10', 'מושעה': 'text-red-400 bg-red-400/10' };

  const updateAccountStatus = useMutation({
    mutationFn: async ({ id, account_status, playerName }) => {
      await logStatusChange(playerName, `סטטוס חשבון עודכן ל-${account_status}`);
      return base44.entities.PlayerRegistration.update(id, { account_status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl">שחקנים רשומים</h2>
        <span className="text-white/40 text-xs">{players.length} שחקנים</span>
      </div>
      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : players.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">אין שחקנים רשומים עדיין</div>
      ) : (
        <div className="space-y-3">
          {players.map(p => (
            <div key={p.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{p.full_name}</div>
                  <div className="text-white/50 text-xs mt-1">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}{p.city ? ` · ${p.city}` : ''}</div>
                  {p.event_name && <div className="text-[#D4AF37] text-xs mt-0.5">אירוע: {p.event_name}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setVerifyingPlayer(p)} title="בדיקה מקיפה"
                    className="w-8 h-8 rounded bg-white/5 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                    <ShieldCheck size={13} className="text-blue-400" />
                  </button>
                  <button onClick={() => setEditingPlayer(p)} title="כרטיס Elite ID"
                    className="w-8 h-8 rounded bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors">
                    <Star size={13} className="text-[#D4AF37]" />
                  </button>
                  <select
                    value={p.status || 'ממתין'}
                    onChange={e => updateStatus.mutate({ id: p.id, status: e.target.value, playerName: p.full_name })}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[p.status || 'ממתין']}`}
                    style={{ background: 'transparent' }}
                  >
                    {['ממתין', 'מאושר', 'פעיל'].map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">אימות זהות:</span>
                  {p.verification_link ? (
                    <a href={p.verification_link} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300">
                      {p.verification_source || 'קישור'} ↗
                    </a>
                  ) : <span className="text-white/20">לא סופק</span>}
                </div>
                <select
                  value={p.account_status || 'ממתין לאישור'}
                  onChange={e => updateAccountStatus.mutate({ id: p.id, account_status: e.target.value, playerName: p.full_name })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:outline-none cursor-pointer ${ACCOUNT_STATUS_COLORS[p.account_status || 'ממתין לאישור']}`}
                  style={{ background: 'transparent' }}
                >
                  {['ממתין לאישור', 'מאושר', 'מושעה'].map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingPlayer && <EliteIdEditorModal player={editingPlayer} onClose={() => setEditingPlayer(null)} />}
      {verifyingPlayer && <PlayerVerificationModal player={verifyingPlayer} onClose={() => setVerifyingPlayer(null)} />}
    </div>
  );
}

// ---- Helpers ----
function emptyEvent() {
  return { name: '', type: '', location: '', city: '', date_start: '', date_end: '', age_group: '', max_players: '', description: '', is_active: true };
}

function AField({ label, name, value, onChange, type = 'text', textarea }) {
  const cls = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors";
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">{label}</label>
      {textarea
        ? <textarea name={name} value={value || ''} onChange={onChange} rows={3} className={cls + " resize-none"} />
        : <input type={type} name={name} value={value || ''} onChange={onChange} className={cls} />}
    </div>
  );
}

function ASelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">{label}</label>
      <select name={name} value={value || ''} onChange={onChange} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors">
        <option value="">בחר...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}