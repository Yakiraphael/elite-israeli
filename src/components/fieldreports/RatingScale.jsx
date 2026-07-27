import { Star } from 'lucide-react';

// סולם דירוג 1-5 עם תווית מילה.
const WORDS = ['חלש', 'חלש-בינוני', 'בינוני', 'טוב', 'מצוין'];

export default function RatingScale({ value, onChange, max = 5, color = '#D4AF37' }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const active = value >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex flex-col items-center gap-0.5 group"
          >
            <Star
              size={16}
              className={active ? 'transition-all' : 'text-white/15 group-hover:text-white/40 transition-all'}
              style={active ? { color, fill: color } : undefined}
            />
          </button>
        );
      })}
      {value > 0 && <span className="text-white/40 text-[10px] mr-1">{WORDS[value - 1]}</span>}
    </div>
  );
}