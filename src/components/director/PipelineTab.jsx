import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Target, Lock, Video, Check } from 'lucide-react';
import CaseNotesPanel from '../player/CaseNotesPanel';

export default function PipelineTab({ player }) {
  const queryClient = useQueryClient();
  const [goals, setGoals] = useState(player.season_development_goals || '');
  const [confNotes, setConfNotes] = useState(player.director_confidential_notes || '');
  const [savedGoals, setSavedGoals] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);

  const update = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dir-players'] }),
  });

  const saveGoals = () => { update.mutate({ season_development_goals: goals }); setSavedGoals(true); setTimeout(() => setSavedGoals(false), 1500); };
  const saveNotes = () => { update.mutate({ director_confidential_notes: confNotes }); setSavedNotes(true); setTimeout(() => setSavedNotes(false), 1500); };

  const links = [player.transfermarkt_url, ...(player.media_links || [])].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={13} /> תוכנית אישית — מטרות לעונה</h4>
        <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={2} placeholder="למשל: שיפור רגל שמאל, עלייה במסה"
          className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none mb-2" />
        <button onClick={saveGoals} className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
          {savedGoals && <Check size={12} className="text-green-400" />} שמור מטרות
        </button>
      </div>

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Lock size={13} /> חוות דעת מנהל מקצועי — חסוי</h4>
        <p className="text-white/25 text-[10px] mb-2">גלוי למנהל המקצועי בלבד. אינו מוצג למאמן או לשחקן.</p>
        <textarea value={confNotes} onChange={e => setConfNotes(e.target.value)} rows={3} placeholder="חוות דעת ניהולית חסויה..."
          className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none mb-2" />
        <button onClick={saveNotes} className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
          {savedNotes && <Check size={12} className="text-green-400" />} שמור הערה חסויה
        </button>
      </div>

      <CaseNotesPanel playerId={player.id} playerName={player.full_name} authorRole="מנהל מקצועי" />

      {links.length > 0 && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Video size={13} /> קישורים לניתוח משחקים</h4>
          <div className="space-y-1.5">
            {links.map((l, i) => (
              <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="block text-xs text-white/60 hover:text-[#D4AF37] truncate">{l}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}