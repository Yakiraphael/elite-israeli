import { MapPin } from 'lucide-react';

// סינון אזורי רב-מתחם — נתיבות, קריית גת, באר שבע.
// טוען/שומר את הבחירה ב-localStorage דרך הורה() כדי לשמור על הגדרת המאמן בין כניסות.
export const COACH_REGIONS = [
  { id: 'all', label: 'כל האזורים' },
  { id: 'נתיבות', label: 'נתיבות' },
  { id: 'קריית גת', label: 'קריית גת' },
  { id: 'באר שבע', label: 'באר שבע' },
  { id: 'אחר', label: 'אחר / לא מוגדר' },
];

export const COACH_REGION_STORAGE_KEY = 'coachRegion';

export default function CoachRegionalFilter({ region, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-white/40 text-xs">
        <MapPin size={13} className="text-[#D4AF37]" /> אזור פעילות
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {COACH_REGIONS.map(r => (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
              region === r.id
                ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]'
                : 'text-white/55 border-white/15 hover:text-white hover:border-white/40'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}