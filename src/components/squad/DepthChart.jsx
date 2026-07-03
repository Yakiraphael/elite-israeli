const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];

// Visual roster grouped by position - positions with zero available players are flagged red.
export default function DepthChart({ players, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {POSITIONS.map(pos => {
        const posPlayers = players.filter(p => p.position === pos);
        const empty = posPlayers.length === 0;
        return (
          <div key={pos} className={`rounded-lg p-4 border ${empty ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-[#1B263B]'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-xs">{pos}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${empty ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50'}`}>
                {posPlayers.length}
              </span>
            </div>
            {empty ? (
              <div className="text-red-400 text-[10px] font-bold">⚠️ אין שחקן זמין בעמדה זו</div>
            ) : (
              <div className="space-y-1.5">
                {posPlayers.map(p => (
                  <button key={p.id} onClick={() => onSelect?.(p)}
                    className="w-full text-right text-[11px] text-white/70 hover:text-[#D4AF37] transition-colors truncate">
                    {p.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}