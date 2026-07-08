import { useState, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Users, UserCheck, ListChecks, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { computeEligibility } from '@/lib/playerEligibility';
import PlayerCallupCard from './PlayerCallupCard';
import RedFlagsPanel from './RedFlagsPanel';
import ConfirmSquadModal from './ConfirmSquadModal';

const MIN_SQUAD = 11;
const MAX_SQUAD = 18;

export default function SquadCallupPanel({ players }) {
  const [subTab, setSubTab] = useState('build');
  const [matchLabel, setMatchLabel] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showIneligible, setShowIneligible] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedInfo, setConfirmedInfo] = useState(null);

  const byId = useMemo(() => Object.fromEntries(players.map(p => [p.id, p])), [players]);

  const available = players.filter(p => {
    if (selectedIds.includes(p.id)) return false;
    if (!showIneligible && computeEligibility(p).color === 'red') return false;
    return true;
  });
  const selected = selectedIds.map(id => byId[id]).filter(Boolean);

  const eligibleNotSelected = players.filter(p => !selectedIds.includes(p.id) && computeEligibility(p).eligible);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    if (destination.droppableId === 'selected') {
      const player = byId[draggableId];
      const elig = computeEligibility(player);
      if (elig.color === 'red') {
        setLockMessage(`לא ניתן לזמן את ${player.full_name} — ${elig.reasons.find(r => r.color === 'red')?.msg || 'לא כשיר'}`);
        return;
      }
      setSelectedIds(ids => [...ids, draggableId]);
    } else {
      setSelectedIds(ids => ids.filter(id => id !== draggableId));
    }
  };

  const countColor = selected.length < MIN_SQUAD || selected.length > MAX_SQUAD ? 'text-red-400' : 'text-green-400';

  if (confirmedInfo) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
        <h3 className="text-white font-black text-lg mb-1">הסגל אושר בהצלחה</h3>
        <p className="text-white/40 text-sm">{confirmedInfo.matchLabel} · {confirmedInfo.count} שחקנים</p>
        <button onClick={() => { setConfirmedInfo(null); setSelectedIds([]); setMatchLabel(''); setMatchDate(''); }}
          className="mt-4 text-[#D4AF37] text-xs font-bold hover:text-amber-300">התחל זימון חדש →</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setSubTab('build')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${subTab === 'build' ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
          <ListChecks size={12} /> בניית סגל
        </button>
        <button onClick={() => setSubTab('flags')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${subTab === 'flags' ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
          <AlertOctagon size={12} /> טיפול נדרש
        </button>
      </div>

      {subTab === 'flags' ? (
        <RedFlagsPanel players={players} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input value={matchLabel} onChange={e => setMatchLabel(e.target.value)} placeholder="שם המשחק / יריב"
              className="flex-1 min-w-[180px] bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)}
              className="bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none" />
            <label className="flex items-center gap-1.5 text-white/50 text-xs cursor-pointer">
              <input type="checkbox" checked={showIneligible} onChange={e => setShowIneligible(e.target.checked)} className="accent-[#D4AF37]" />
              הצג גם שחקנים לא כשירים
            </label>
          </div>

          <div className={`flex items-center justify-between bg-[#1B263B] border rounded-lg px-4 py-2.5 mb-4 ${countColor === 'text-red-400' ? 'border-red-500/30' : 'border-green-500/30'}`}>
            <span className="text-white font-bold text-sm flex items-center gap-2"><UserCheck size={15} className="text-[#D4AF37]" /> {selected.length}/{MAX_SQUAD} שחקנים נבחרו</span>
            {selected.length < MIN_SQUAD && <span className="text-red-400 text-xs font-bold">⚠️ מתחת למינימום ({MIN_SQUAD})</span>}
            {selected.length > MAX_SQUAD && <span className="text-red-400 text-xs font-bold">⚠️ חריגה מהמכסה המותרת</span>}
          </div>

          {lockMessage && (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-xs font-bold">
              {lockMessage}
              <button onClick={() => setLockMessage('')} className="text-red-400/60 hover:text-red-400">✕</button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Droppable droppableId="available">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 min-h-[300px]">
                    <div className="text-white/40 text-xs font-bold mb-2 flex items-center gap-1.5"><Users size={12} /> סגל זמין ({available.length})</div>
                    <div className="space-y-2">
                      {available.map((p, i) => <PlayerCallupCard key={p.id} player={p} index={i} />)}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <Droppable droppableId="selected">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="bg-[#0D1B2A] border border-[#D4AF37]/20 rounded-lg p-3 min-h-[300px]">
                    <div className="text-[#D4AF37] text-xs font-bold mb-2 flex items-center gap-1.5"><UserCheck size={12} /> נבחרו למשחק ({selected.length})</div>
                    <div className="space-y-2">
                      {selected.map((p, i) => <PlayerCallupCard key={p.id} player={p} index={i} />)}
                      {provided.placeholder}
                      {selected.length === 0 && <p className="text-white/20 text-xs text-center py-8">גרור שחקנים לכאן</p>}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>

          <button onClick={() => setShowConfirm(true)} disabled={!matchLabel.trim() || selected.length === 0}
            className="w-full mt-4 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm disabled:opacity-40 hover:bg-amber-400 transition-colors">
            אשר סגל למשחק
          </button>
        </>
      )}

      {showConfirm && (
        <ConfirmSquadModal
          matchLabel={matchLabel}
          matchDate={matchDate}
          selected={selected}
          needsReason={eligibleNotSelected}
          onClose={() => setShowConfirm(false)}
          onConfirmed={() => { setShowConfirm(false); setConfirmedInfo({ matchLabel, count: selected.length }); }}
        />
      )}
    </div>
  );
}