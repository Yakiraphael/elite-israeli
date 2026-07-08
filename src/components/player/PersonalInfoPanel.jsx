import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Pencil, Check, Loader2 } from 'lucide-react';
import GuardianContactCard from './GuardianContactCard';

const FIELDS = [
  { key: 'height_cm', label: '⚡ גובה (ס״מ)', type: 'number' },
  { key: 'weight_kg', label: '💪 משקל (ק״ג)', type: 'number' },
  { key: 'experience_years', label: '📅 שנות ניסיון', type: 'number' },
  { key: 'dominant_foot', label: '👟 רגל דומיננטית', type: 'select', options: ['ימין', 'שמאל', 'שתיים'] },
  { key: 'secondary_position', label: '🎯 עמדה משנית', type: 'text' },
  { key: 'city', label: '📍 עיר מגורים', type: 'text' },
  { key: 'phone', label: '📞 טלפון', type: 'text' },
  { key: 'team_name', label: '🏟️ קבוצה נוכחית', type: 'text' },
];

export default function PersonalInfoPanel({ player }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(player);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data = {};
    FIELDS.forEach(f => { data[f.key] = form[f.key]; });
    await base44.entities.PlayerRegistration.update(player.id, data);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="space-y-4">
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase">נתוני שחקן</h3>
        <button onClick={() => (editing ? handleSave() : setEditing(true))} disabled={saving}
          className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[10px] font-bold">
          {saving ? <Loader2 size={12} className="animate-spin" /> : editing ? <Check size={12} /> : <Pencil size={12} />}
          {saving ? 'שומר...' : editing ? 'שמור' : 'ערוך'}
        </button>
      </div>

      {!editing ? (
        <div className="space-y-2.5">
          {FIELDS.map(f => {
            const value = player[f.key];
            if (!value) return null;
            return (
              <div key={f.key} className="flex justify-between text-xs">
                <span className="text-white/60">{f.label}</span>
                <span className="text-white font-semibold">{value}</span>
              </div>
            );
          })}
          {player.contract_end_date && (
            <div className="flex justify-between text-xs">
              <span className="text-white/60">📄 סיום חוזה</span>
              <span className="text-white font-semibold">{player.contract_end_date}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-white/40 text-[10px] font-bold mb-1 block">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60">
                  <option value="">בחר...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    <GuardianContactCard player={player} />
    </div>
  );
}