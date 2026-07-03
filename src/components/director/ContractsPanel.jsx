import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Loader2, FileText, ShieldAlert } from 'lucide-react';

function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

function statusBadge(contract) {
  if (contract.status === 'ממתין לחתימה') return { label: '⏳ ממתין לחתימה', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  if (contract.status === 'בוטל') return { label: '✗ בוטל', cls: 'bg-white/10 text-white/40 border-white/10' };
  const days = daysLeft(contract.end_date);
  if (days !== null && days < 0) return { label: '🔴 פג תוקף', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (days !== null && days < 30) return { label: `🟡 ${days} ימים`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  if (days !== null && days < 90) return { label: `🟢 ${days} ימים`, cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  return { label: '✓ חתום', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

export default function ContractsPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 100),
  });

  const { data: settingsList = [] } = useQuery({
    queryKey: ['compliance-settings'],
    queryFn: () => base44.entities.ComplianceSettings.list(),
  });
  const settings = settingsList[0];

  const toggleBlocking = useMutation({
    mutationFn: () => settings
      ? base44.entities.ComplianceSettings.update(settings.id, { enforce_medical_blocking: !settings.enforce_medical_blocking })
      : base44.entities.ComplianceSettings.create({ enforce_medical_blocking: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compliance-settings'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-base">ניהול חוזים — Contract Lifecycle</h3>
        <button onClick={() => setShowCreate(true)}
          className="min-h-[44px] flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 rounded-sm hover:bg-amber-400 transition-colors">
          <Plus size={14} /> חוזה חדש
        </button>
      </div>

      <div className="bg-[#1B263B] border border-amber-500/20 rounded-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-xs">מצב חסימה — Compliance Enforcement</div>
            <p className="text-white/40 text-[10px]">שחקן ללא אישור רפואי בתוקף לא יופיע בסגל הפעיל של המאמן</p>
          </div>
        </div>
        <button onClick={() => toggleBlocking.mutate()}
          className={`min-h-[44px] min-w-[70px] rounded-full px-1 transition-colors relative flex-shrink-0 ${settings?.enforce_medical_blocking ? 'bg-green-500' : 'bg-white/15'}`}>
          <span className={`block w-8 h-8 bg-white rounded-full transition-transform ${settings?.enforce_medical_blocking ? 'translate-x-[-38px]' : ''}`} />
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[#D4AF37]" /></div>}

      <div className="space-y-2">
        {!isLoading && contracts.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">אין חוזים עדיין — לחץ על "חוזה חדש" כדי להתחיל</div>
        )}
        {contracts.map(c => {
          const badge = statusBadge(c);
          return (
            <div key={c.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4 flex items-center gap-4">
              <FileText size={16} className="text-[#D4AF37] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">{c.player_name}</div>
                <div className="text-white/40 text-xs">{c.contract_type} · {c.start_date || '—'} עד {c.end_date}</div>
                {c.status === 'חתום' && c.signed_at && (
                  <div className="text-white/25 text-[10px] mt-1">נחתם ע"י {c.signer_name} · {new Date(c.signed_at).toLocaleString('he-IL')}</div>
                )}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateContractModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateContractModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ player_name: '', player_id: '', contract_type: 'חוזה נוער', start_date: '', end_date: '' });
  const [search, setSearch] = useState('');

  const { data: players = [] } = useQuery({
    queryKey: ['contract-player-search', search],
    queryFn: () => base44.entities.PlayerRegistration.filter({}, '-created_date', 200),
    enabled: search.length > 1,
  });
  const matches = players.filter(p => p.full_name?.includes(search)).slice(0, 6);

  const create = useMutation({
    mutationFn: () => base44.entities.Contract.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); onClose(); },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base">יצירת חוזה חדש</h3>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs">חפש שחקן</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="שם שחקן..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
            {matches.length > 0 && (
              <div className="mt-1 bg-[#0D1B2A] border border-white/10 rounded-lg overflow-hidden">
                {matches.map(p => (
                  <button key={p.id} onClick={() => { set('player_id', p.id); set('player_name', p.full_name); setSearch(p.full_name); }}
                    className="w-full text-right px-3 py-2 text-white/70 text-xs hover:bg-white/5">{p.full_name}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-white/40 text-xs">סוג חוזה</label>
            <select value={form.contract_type} onChange={e => set('contract_type', e.target.value)}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none">
              <option>חוזה נוער</option>
              <option>חוזה חובבני</option>
              <option>חוזה מקצועי</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs">תאריך תחילה</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs">תאריך סיום</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
          </div>
          <button disabled={!form.player_id || !form.end_date || create.isPending} onClick={() => create.mutate()}
            className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : 'צור חוזה ושלח לחתימה'}
          </button>
        </div>
      </div>
    </div>
  );
}