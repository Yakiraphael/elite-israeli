import { CheckCircle2, Circle, XCircle } from 'lucide-react';

const YOUTH_STEPS = [
  'ממתין לאישור הנהלה',
  'מאושר — ממתין לאפוטרופוס',
  'ממתין לאימות התאחדות (IFA)',
  'אושרה סופית',
];

const ADULT_STEPS = [
  'ממתין לאישור הנהלה',
  'מאושר — ממתין לשחקן (בוגר)',
  'ממתין לאימות תשלום (בוגר)',
  'ממתין לאימות התאחדות (IFA)',
  'אושרה סופית',
];

export default function TransferPipelineStepper({ status, isAdult }) {
  const steps = isAdult ? ADULT_STEPS : YOUTH_STEPS;
  const isTerminated = status === 'נדחתה' || status === 'נסגרה';
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {isTerminated ? (
        <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold">
          <XCircle size={13} /> {status}
        </div>
      ) : (
        steps.map((step, i) => {
          const done = currentIndex >= 0 && i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-1 text-[9px] font-bold ${done ? 'text-green-400' : active ? 'text-[#D4AF37]' : 'text-white/25'}`}>
                {done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                <span className="whitespace-nowrap max-w-[90px] truncate">{step}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-4 h-px ${done ? 'bg-green-400/50' : 'bg-white/15'}`} />}
            </div>
          );
        })
      )}
    </div>
  );
}