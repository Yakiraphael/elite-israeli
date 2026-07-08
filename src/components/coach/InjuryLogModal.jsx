import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, HeartPulse, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InjuryLogModal({ player, onClose, onSaved }) {
  const [note, setNote] = useState(player.active_injury_note || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await base44.entities.PlayerRegistration.update(player.id, {
      active_injury: true,
      active_injury_note: note.trim(),
      active_injury_date: new Date().toISOString().slice(0, 10),
      is_available_next_match: false,
      unavailability_reason: note.trim(),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-red-500/30 rounded-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse size={16} className="text-red-400" />
          <h3 className="text-white font-black text-base">תיעוד פציעה — {player.full_name}</h3>
        </div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">תיאור הפציעה *</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="לדוגמה: נקע קרסול, יעדר כ-3 שבועות"
          className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-red-400/60 resize-none" />
        <p className="text-white/30 text-[10px] mt-2">השחקן יסומן אוטומטית כלא זמין וכ"פציעה פעילה" בכל מסכי התקינות עד לסימון החלמה.</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2 rounded-sm hover:bg-white/5">ביטול</button>
          <button onClick={handleSave} disabled={saving || !note.trim()} className="flex-1 bg-red-500 text-white font-black text-sm py-2 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <HeartPulse size={14} />} תעד פציעה
          </button>
        </div>
      </motion.div>
    </div>
  );
}