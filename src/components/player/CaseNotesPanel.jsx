import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, FileText } from 'lucide-react';

export default function CaseNotesPanel({ playerId, playerName, authorRole }) {
  const [authorName, setAuthorName] = useState('');
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['case-notes', playerId],
    queryFn: () => base44.entities.PlayerCaseNote.filter({ player_id: playerId }, '-created_date', 30),
    enabled: !!playerId,
  });

  const addNote = useMutation({
    mutationFn: () => base44.entities.PlayerCaseNote.create({
      player_id: playerId, player_name: playerName, author_name: authorName, author_role: authorRole, note,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-notes', playerId] }); setNote(''); },
  });

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
      <h4 className="text-white font-black text-sm mb-3 flex items-center gap-2">
        <FileText size={14} className="text-[#D4AF37]" /> קייסנוטים מקצועיים
      </h4>
      <div className="space-y-2 mb-3">
        <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="שמך"
          className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none" />
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="כתוב הערה מקצועית..." rows={2}
          className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none resize-none" />
        <button onClick={() => addNote.mutate()} disabled={!note.trim() || !authorName.trim() || addNote.isPending}
          className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-3 py-1.5 rounded-sm disabled:opacity-40 flex items-center gap-1.5">
          {addNote.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} הוסף הערה
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-3"><Loader2 size={16} className="animate-spin text-[#D4AF37]" /></div>
      ) : notes.length === 0 ? (
        <p className="text-white/30 text-xs text-center py-2">אין הערות עדיין</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} className="bg-[#1B263B] rounded p-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#D4AF37] font-bold">{n.author_name} · {n.author_role}</span>
                <span className="text-white/25">{n.created_date?.slice(0, 10)}</span>
              </div>
              <p className="text-white/60">{n.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}