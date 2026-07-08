import { Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { Users, ExternalLink } from 'lucide-react';
import { computeEligibility } from '@/lib/playerEligibility';

const DOT = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
const ICON = { green: '✓', yellow: '!', red: '✗' };

export default function PlayerCallupCard({ player, index }) {
  const elig = computeEligibility(player);
  return (
    <Draggable draggableId={player.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={`bg-[#1B263B] border rounded-lg p-2.5 flex items-center gap-2.5 transition-colors ${snapshot.isDragging ? 'border-[#D4AF37] shadow-lg' : 'border-white/10'} ${elig.color === 'red' ? 'opacity-60' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
            <Users size={12} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-xs truncate">{player.full_name}</div>
            <div className="text-white/40 text-[10px] truncate">{player.position}</div>
          </div>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ backgroundColor: `${DOT[elig.color]}25`, color: DOT[elig.color] }}>
            {ICON[elig.color]}
          </span>
          <Link to={`/player-profile?id=${player.id}`} target="_blank" onClick={e => e.stopPropagation()} className="text-white/25 hover:text-[#D4AF37] transition-colors flex-shrink-0">
            <ExternalLink size={12} />
          </Link>
        </div>
      )}
    </Draggable>
  );
}