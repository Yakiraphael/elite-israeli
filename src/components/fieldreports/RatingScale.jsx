import { Star } from 'lucide-react';

// סקלת דירוג 1-5 כוכבים לשדות מספריים בדוחות שטח.
export default function RatingScale({ value, onChange, label, max = 5 }) {
  const v = Number(value) || 0;
  return (
    <div className="space-y-1">
      {label && <div className="text-white/50 text-[11px] font-bold">{label}</div>}
      <div className="flex items-center gap-1" dir="ltr">
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const filled = n <= v;
          return (
            <button key={n} type="button" onClick={() => onChange(v === n ? 0 : n)}
              className="p-0.5 rounded transition-colors hover:bg-white/5">
              <Star size={16}
                className={filled ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-white/25'} />
            </button>
          );
        })}
        <span className="text-white/60 text-[11px] font-bold mr-1">{v || '—'}</span>
      </div>
    </div>
  );
}