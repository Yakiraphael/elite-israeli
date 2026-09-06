import { motion } from 'framer-motion';
import FootballBalls from './player/FootballBalls';
import TierBadge from './player/TierBadge';
import { EVALUATION_CATEGORIES, scoreToTier } from '@/lib/evaluationEngine';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

// Hebrew position -> short role code
export const POSITION_MAP = {
  'שוער': 'GK',
  'בלם': 'CB',
  'מגן צד': 'FB',
  'קשר מגן': 'CDM',
  'קשר': 'CM',
  'קשר התפורס': 'CAM',
  'קשר התקפי': 'CAM',
  'חלוץ צד': 'WG',
  'חלוץ': 'ST',
};

// Re-export the 5 standardized evaluation categories (1-5 scale)
export { EVALUATION_CATEGORIES };

// Fallback labels (Hebrew) — overridden by `categoryLabels` prop
const FALLBACK_LABELS = {
  technique: 'טכניקה',
  game_intelligence: 'הבנת משחק',
  physicality: 'פיזיות',
  decision_making: 'קבלת החלטות',
  mentality: 'מנטליות',
};

// Average of the 5 categories on a 1-5 scale
export function computeOverall(stats = {}) {
  const vals = EVALUATION_CATEGORIES.map(k => stats[k]).filter(v => typeof v === 'number');
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ---- Theme color: map 1-5 overall → 40-99 (internal only, never shown) ----
function overallToColorValue(overall) {
  if (overall == null) return 40;
  const v = Math.max(1, Math.min(5, overall));
  return Math.round(40 + (v - 1) / 4 * 59);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function interpolateColor(c1, c2, t) {
  return { r: Math.round(lerp(c1.r, c2.r, t)), g: Math.round(lerp(c1.g, c2.g, t)), b: Math.round(lerp(c1.b, c2.b, t)) };
}
const COLOR_STOPS = [
  { stop: 40, rgb: { r: 92,  g: 58,  b: 38  } },
  { stop: 55, rgb: { r: 184, g: 115, b: 51  } },
  { stop: 70, rgb: { r: 160, g: 145, b: 125 } },
  { stop: 75, rgb: { r: 200, g: 200, b: 205 } },
  { stop: 80, rgb: { r: 212, g: 175, b: 55  } },
  { stop: 87, rgb: { r: 245, g: 205, b: 50  } },
  { stop: 95, rgb: { r: 16,  g: 185, b: 129 } },
  { stop: 99, rgb: { r: 60,  g: 230, b: 160 } },
];
function getThemeColor(rating) {
  if (rating == null) return { r: 107, g: 114, b: 128 };
  const v = Math.max(40, Math.min(99, rating));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i], hi = COLOR_STOPS[i + 1];
    if (v >= lo.stop && v <= hi.stop) {
      const t = (v - lo.stop) / (hi.stop - lo.stop);
      return interpolateColor(lo.rgb, hi.rgb, t);
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1].rgb;
}
function rgba(c, a = 1) { return `rgba(${c.r},${c.g},${c.b},${a})`; }

/**
 * Elite ID Player Card — Zero-Numbers edition (5 standardized evaluation categories, 1-5 scale).
 * No raw numeric scores exposed; visual proxies only (FootballBalls + TierBadge A5-B1).
 */
export default function EliteIdCard({
  name = 'שחקן',
  eliteId = 'ELITE-2026-0000',
  position = 'קשר',
  stats = {},
  avatarUrl,
  rating,
  age,
  city,
  categoryLabels,
}) {
  const overall = rating != null ? rating : computeOverall(stats);
  const posCode = POSITION_MAP[position] || '—';
  const tier = scoreToTier(overall ?? 0);
  const labels = categoryLabels || FALLBACK_LABELS;
  const c = getThemeColor(overallToColorValue(overall));
  const transition = 'all 0.7s cubic-bezier(0.4,0,0.2,1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-[320px] mx-auto select-none"
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-1.5 rounded-2xl blur-lg"
        style={{ background: `linear-gradient(135deg, ${rgba(c, 0.35)}, ${rgba(c, 0.05)} 50%, ${rgba(c, 0.25)})`, transition }}
      />

      <div
        className="relative rounded-2xl overflow-hidden border shadow-2xl"
        style={{
          borderColor: rgba(c, 0.4),
          background: `linear-gradient(180deg, ${rgba(c, 0.12)} 0%, #0E1A2E 45%, #080F1C 100%)`,
          transition,
        }}
      >
        {/* Watermark logo */}
        <img src={LOGO_URL} alt="" aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] opacity-[0.04] pointer-events-none" />

        {/* Header bar */}
        <div
          className="relative flex items-center justify-between px-5 py-2.5 border-b"
          style={{ background: `linear-gradient(90deg, ${rgba(c, 0.15)}, ${rgba(c, 0.05)})`, borderColor: rgba(c, 0.25), transition }}
        >
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-6 w-auto" />
          <span className="text-[9px] font-black tracking-[0.25em]" style={{ color: rgba(c, 0.9), transition }}>ELITE ID</span>
        </div>

        <div className="relative p-5">
          {/* Top: tier badge + avatar + identity */}
          <div className="flex items-center gap-4">
            <div
              className="flex flex-col items-center justify-center w-16 h-16 rounded-xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${rgba(c, 0.2)}, ${rgba(c, 0.05)})`, border: `1.5px solid ${rgba(c, 0.5)}`, transition }}
            >
              <TierBadge tier={tier} size="sm" />
              <span className="text-[8px] font-black tracking-widest mt-1.5" style={{ color: rgba(c, 0.6), transition }}>דירוג</span>
            </div>

            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ border: `2px solid ${rgba(c, 0.5)}`, background: `linear-gradient(135deg, ${rgba(c, 0.1)}, #0A1422)`, transition }}
            >
              {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl">⚽</span>}
            </div>

            <div className="flex-1 text-right min-w-0">
              <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-white/50">
                <span>🇮🇱 ישר</span>
                <span className="px-1.5 py-0.5 rounded font-black tracking-wider" style={{ background: rgba(c, 0.15), color: rgba(c, 0.95), transition }}>{posCode}</span>
              </div>
              <div className="text-white font-black text-sm leading-tight mt-1 truncate">{name}</div>
              <div className="text-white/35 text-[10px] mt-0.5">
                {age != null && <>גיל {age}</>}
                {age != null && city && ' · '}
                {city}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px my-4" style={{ background: `linear-gradient(90deg, transparent, ${rgba(c, 0.35)}, transparent)`, transition }} />

          {/* 5 standardized evaluation categories — FootballBalls only */}
          <div className="space-y-2.5">
            {EVALUATION_CATEGORIES.map(key => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-white/55 tracking-wide">{labels[key]}</span>
                <FootballBalls score={stats[key] ?? 0} size={14} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: rgba(c, 0.5), transition }} />
            <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: rgba(c, 0.6), transition }}>{eliteId}</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: rgba(c, 0.5), transition }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}