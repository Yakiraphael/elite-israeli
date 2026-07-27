// Context switcher for coaches assigned to multiple teams.
// Renders a compact dropdown of the coach's teams; selecting one
// locks the whole coach workspace to that team's data.

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Briefcase, CheckCircle2 } from 'lucide-react';

export default function TeamContextSwitcher({ assignments, activeTeamId, onSelect, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B263B] border border-white/10 text-white/40 text-xs">
        <Briefcase size={13} className="animate-pulse" /> טוען שיוכים...
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
        <Briefcase size={13} /> אין שיוך לקבוצה — פנה למנהל המקצועי
      </div>
    );
  }

  const active = assignments.find(a => a.team_id === activeTeamId) || assignments[0];

  return (
    <div className="relative" ref={ref} dir="rtl">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/40 text-white text-xs font-bold transition-colors"
      >
        <Briefcase size={13} className="text-[#D4AF37]" />
        <span className="truncate max-w-[200px]">{active?.team_label || 'בחר קבוצה'}</span>
        {assignments.length > 1 && (
          <span className="text-white/30 text-[10px]">({assignments.length})</span>
        )}
        <ChevronDown size={12} className="text-white/40" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-[#1B263B] border border-white/10 rounded-lg shadow-2xl z-40 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wide">
            החלפת קונטקסט פעיל
          </div>
          {assignments.map(a => (
            <button
              key={a.team_id}
              onClick={() => { onSelect(a.team_id); setOpen(false); }}
              className={`w-full text-right px-3 py-2.5 text-xs flex items-center justify-between gap-2 transition-colors hover:bg-white/5 ${a.team_id === activeTeamId ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white/70'}`}
            >
              <span className="flex items-center gap-2">
                {a.team_id === activeTeamId && <CheckCircle2 size={12} />}
                <span className="truncate">{a.team_label}</span>
              </span>
              {a.club_name && <span className="text-white/30 text-[10px] truncate max-w-[90px]">{a.club_name}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}