import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ConfirmSquadModal({ matchLabel, matchDate, selected, needsReason, onClose, onConfirmed }) {
  const [reasons, setReasons] = useState({});
  const [saving, setSaving] = useState(false);
  const allFilled = needsReason.every(p => reasons[p.id]?.trim());

  const handleConfirm = async () => {
    setSaving(true);
    let user = null;
    try { user = await base44.auth.me(); } catch { /* public context */ }
    await base44.entities.MatchSquad.create({
      match_label: matchLabel,
      match_date: matchDate || undefined,
      selected_player_ids: selected.map(p => p.id),
      excluded_players: needsReason.map(p => ({ player_id: p.id, player_name: p.full_name, reason: reasons[p.id] })),
      confirmed: true,
      confirmed_by: user?.full_name || user?.email || 'מאמן',
      confirmed_at: new Date().toISOString(),
    });
    setSaving(false);
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base">אישור סופי — {matchLabel}</h3>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>
        <p className="text-white/50 text-xs mb-4">{selected.length} שחקנים נבחרו למשחק.</p>

        {needsReason.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-amber-400 text-xs font-bold">שחקנים כשירים שלא נבחרו — נדרש נימוק:</p>
            {needsReason.map(p => (
              <div key={p.id}>
                <label className="text-white/60 text-xs">{p.full_name}</label>
                <input value={reasons[p.id] || ''} onChange={e => setReasons(r => ({ ...r, [p.id]: e.target.value }))}
                  placeholder="סיבת אי-זימון (שיקול מקצועי, עומס, וכו')"
                  className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 mt-1" />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2 rounded-sm hover:bg-white/5">חזור</button>
          <button onClick={handleConfirm} disabled={saving || !allFilled} className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-2 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} אשר סגל סופית
          </button>
        </div>
      </motion.div>
    </div>
  );
}