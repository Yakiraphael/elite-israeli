import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeftCircle, Users } from 'lucide-react';
import { WORKFLOW_STAGES, getNextStage } from '@/lib/transferDocumentRequirements';

export default function TransferWorkflowBadge({ transfer, canAdvance }) {
  const queryClient = useQueryClient();
  const category = transfer.transfer_category || 'העברת נוער';
  const stages = WORKFLOW_STAGES[category] || WORKFLOW_STAGES['העברת נוער'];
  const currentStage = transfer.approval_stage || stages[0];
  const nextStage = getNextStage(category, currentStage);

  const advance = useMutation({
    mutationFn: async () => {
      await base44.entities.TransferTracker.update(transfer.id, { approval_stage: nextStage });
      await base44.entities.Notification.create({
        audience: 'director',
        type: 'request_status',
        title: 'התקדמות בתהליך העברה',
        body: `העברת ${transfer.player_name}: השלב עבר ל"${nextStage}"`,
        player_id: transfer.player_id,
        player_name: transfer.player_name,
        link_tab: 'squad',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfer-tracker'] }),
  });

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2 text-white/40 text-[10px] font-bold"><Users size={11} /> שלבי אישור (Workflow)</div>
      <div className="flex items-center gap-1 flex-wrap">
        {stages.map((s, i) => {
          const idx = stages.indexOf(currentStage);
          const done = i < idx;
          const active = s === currentStage;
          return (
            <span key={s} className={`text-[10px] font-bold px-2 py-1 rounded-full border ${active ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : done ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-white/30 border-white/10'}`}>
              {s}
            </span>
          );
        })}
      </div>
      {canAdvance && nextStage && (
        <button onClick={() => advance.mutate()} disabled={advance.isPending}
          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-amber-300 transition-colors disabled:opacity-40">
          <ArrowLeftCircle size={13} /> אשר ועבור לשלב "{nextStage}"
        </button>
      )}
    </div>
  );
}