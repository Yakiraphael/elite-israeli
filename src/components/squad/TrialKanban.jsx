import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Loader2 } from 'lucide-react';

const COLUMNS = [
  { id: 'Trialist', label: 'הגיע למבחן' },
  { id: 'Contract Pending', label: 'בתהליך הערכה' },
  { id: 'Signed', label: 'הוחתם' },
  { id: 'Rejected', label: 'נדחה' },
];

export default function TrialKanban({ currentUser }) {
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['trial-candidates'],
    queryFn: () => base44.entities.TransferTracker.list('-created_date', 100),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TransferTracker.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trial-candidates'] }),
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const candidate = candidates.find(c => c.id === result.draggableId);
    if (!candidate || candidate.status === newStatus) return;

    await updateStatus.mutateAsync({ id: candidate.id, status: newStatus });

    if (newStatus === 'Signed') {
      await base44.entities.AuditLog.create({
        actor_id: currentUser?.id || 'director',
        actor_name: currentUser?.full_name || 'מנהל מקצועי',
        actor_role: 'admin',
        action: 'sign_player',
        player_id: candidate.player_id,
        details: `הוחתם: ${candidate.player_name}`
      });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const items = candidates.filter(c => c.status === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="bg-[#1B263B] border border-white/10 rounded-lg p-3 min-h-[200px]">
                  <div className="text-white/50 text-xs font-bold mb-3 flex items-center justify-between">
                    {col.label} <span className="text-white/30">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((c, i) => (
                      <Draggable key={c.id} draggableId={c.id} index={i}>
                        {(dragProvided) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                            className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing">
                            <div className="text-white text-xs font-bold truncate">{c.player_name}</div>
                            <div className="text-white/30 text-[10px] mt-1">{c.club_from || '—'}</div>
                            {c.offer_amount ? <div className="text-[#D4AF37] text-[10px] mt-1">{c.offer_amount.toLocaleString()} {c.currency}</div> : null}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}