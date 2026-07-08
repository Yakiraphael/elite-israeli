import { computeSubmissionProgress, getProgressStage } from '@/lib/registrationProgress';

export default function SubmissionProgressBar({ player, compact }) {
  const pct = computeSubmissionProgress(player);
  const stage = getProgressStage(pct);

  if (compact) {
    return (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: stage.color, borderColor: `${stage.color}50`, backgroundColor: `${stage.color}15` }}>
        {pct}% · {stage.label}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="font-bold" style={{ color: stage.color }}>{stage.label}</span>
        <span className="text-white/40">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
      </div>
    </div>
  );
}