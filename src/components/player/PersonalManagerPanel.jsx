import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { UserCog, Check, Loader2, ExternalLink } from 'lucide-react';

export default function PersonalManagerPanel({ player }) {
  const [email, setEmail] = useState(player.manager_email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!player.is_adult) return null;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.PlayerRegistration.update(player.id, { manager_email: email.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-1">
        <UserCog size={16} className="text-[#D4AF37]" />
        <h3 className="text-white font-black text-base">מנהל אישי</h3>
      </div>
      <p className="text-white/40 text-xs mb-4">שייך מנהל אישי/סוכן שיוכל לצפות בחוזים, בהצעות העברה ולאשר בשמך</p>

      <label className="text-white/40 text-xs font-bold mb-1.5 block">מייל המנהל האישי</label>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="מייל המנהל האישי"
          className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
        />
        <button onClick={handleSave} disabled={saving || !email.trim()}
          className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-3 py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 flex-shrink-0">
          {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
          {saving ? 'שומר...' : saved ? 'נשמר' : 'שייך'}
        </button>
      </div>

      {player.manager_email && (
        <div className="mt-3 flex items-center justify-between bg-[#0D1B2A] border border-green-500/20 rounded-sm px-3 py-2">
          <span className="text-green-400 text-xs">✓ מנהל אישי מקושר: {player.manager_email}</span>
          <Link to="/guardian-portal" className="text-[#D4AF37] text-xs hover:text-amber-300 flex items-center gap-1 flex-shrink-0">
            צפה בלוח <ExternalLink size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}