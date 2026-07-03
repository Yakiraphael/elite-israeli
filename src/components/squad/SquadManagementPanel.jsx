import { useState } from 'react';
import { Users, LayoutGrid, ChevronRight } from 'lucide-react';
import DepthChart from './DepthChart';

// Combined squad management view: roster list with status + visual depth chart by position.
export default function SquadManagementPanel({ players, onSelect }) {
  const [view, setView] = useState('list');

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-white/30 text-xs">{players.length} שחקנים בסגל</span>
        <div className="flex gap-1 bg-[#1B263B] border border-white/10 rounded-lg p-1">
          <button onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${view === 'list' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/50 hover:text-white'}`}>
            <Users size={12} /> רשימה
          </button>
          <button onClick={() => setView('depth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${view === 'depth' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/50 hover:text-white'}`}>
            <LayoutGrid size={12} /> מבנה עמדות
          </button>
        </div>
      </div>

      {players.length === 0 && <div className="text-center py-12 text-white/30 text-sm">אין שחקנים בסגל</div>}

      {view === 'list' && players.length > 0 && (
        <div className="space-y-2">
          {players.map(p => (
            <button key={p.id} onClick={() => onSelect?.(p)}
              className="w-full bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-4 transition-all text-right group">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{p.full_name}</div>
                <div className="text-white/40 text-xs">{p.position}{p.team_name ? ` · ${p.team_name}` : ''}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_free_agent ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/10 text-white/50 border-white/10'}`}>
                {p.is_free_agent ? 'Free Agent' : 'Under Contract'}
              </span>
              {p.ifa_ready && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">IFA ✓</span>}
              <ChevronRight size={14} className="text-white/20 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {view === 'depth' && players.length > 0 && (
        <DepthChart players={players} onSelect={onSelect} />
      )}
    </div>
  );
}