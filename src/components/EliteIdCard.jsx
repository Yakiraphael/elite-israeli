import { motion } from 'framer-motion';

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

export const STAT_KEYS = [
  { key: 'pac', label: 'PAC', he: 'מהירות' },
  { key: 'sho', label: 'SHO', he: 'בעיטה' },
  { key: 'pas', label: 'PAS', he: 'מסירה' },
  { key: 'dri', label: 'DRI', he: 'כדרור' },
  { key: 'def', label: 'DEF', he: 'הגנה' },
  { key: 'phy', label: 'PHY', he: 'פיזיות' },
  { key: 'mental', label: 'MENTAL', he: 'חוסן מנטלי' },
];

export function computeOverall(stats = {}) {
  const vals = STAT_KEYS.map(s => stats[s.key]).filter(v => typeof v === 'number');
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ---- Smooth color interpolation across rating spectrum ----
function lerp(a, b, t) { return a + (b - a) * t; }

function interpolateColor(c1, c2, t) {
  return {
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t)),
  };
}

// Spectrum: dark bronze → bronze → silver → gold → emerald
const COLOR_STOPS = [
  { stop: 0,  rgb: { r: 92,  g: 58,  b: 38  } },
  { stop: 45, rgb: { r: 184, g: 115, b: 51  } },
  { stop: 68, rgb: { r: 160, g: 145, b: 125 } },
  { stop: 72, rgb: { r: 200, g: 200, b: 205 } },
  { stop: 79, rgb: { r: 220, g: 220, b: 225 } },
  { stop: 80, rgb: { r: 212, g: 175, b: 55  } },
  { stop: 87, rgb: { r: 245, g: 205, b: 50  } },
  { stop: 90, rgb: { r: 16,  g: 185, b: 129 } },
  { stop: 99, rgb: { r: 60,  g: 230, b: 160 } },
];

function getThemeColor(rating) {
  if (rating == null) return { r: 107, g: 114, b: 128 };
  const v = Math.max(0, Math.min(99, rating));
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

function tierLabel(v) {
  if (v == null) return '—';
  if (v >= 90) return 'ELITE';
  if (v >= 80) return 'GOLD';
  if (v >= 70) return 'SILVER';
  return 'BRONZE';
}

function statColor(v) {
  if (v == null) return 'text-white/35';
  if (v >= 85) return 'text-emerald-400';
  if (v >= 75) return 'text-[#E8C547]';
  if (v >= 65) return 'text-amber-500';
  return 'text-red-400';
}

/**
 * Elite ID Player Card — premium branded card with smooth tier-based color transitions.
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
}) {
  const overall = rating != null ? rating : computeOverall(stats);
  const posCode = POSITION_MAP[position] || '—';
  const c = getThemeColor(overall);

  const transition = 'all 0.7s cubic-bezier(0.4,0,0.2,1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-[320px] mx-auto select-none"
    >
      {/* Outer glow — smooth color transition */}
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
        <img
          src={LOGO_URL}
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] opacity-[0.04] pointer-events-none"
        />

        {/* Header bar — tier-colored */}
        <div
          className="relative flex items-center justify-between px-5 py-2.5 border-b"
          style={{ background: `linear-gradient(90deg, ${rgba(c, 0.15)}, ${rgba(c, 0.05)})`, borderColor: rgba(c, 0.25), transition }}
        >
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-6 w-auto" />
          <span className="text-[9px] font-black tracking-[0.25em]" style={{ color: rgba(c, 0.9), transition }}>ELITE ID</span>
        </div>

        <div className="relative p-5">
          {/* Top: rating + avatar + identity */}
          <div className="flex items-center gap-4">
            {/* Rating badge */}
            <div
              className="flex flex-col items-center justify-center w-16 h-16 rounded-xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${rgba(c, 0.2)}, ${rgba(c, 0.05)})`, border: `1.5px solid ${rgba(c, 0.5)}`, transition }}
            >
              <span className="text-3xl font-black leading-none tabular-nums" style={{ color: rgba(c, 1), transition }}>{overall ?? '--'}</span>
              <span className="text-[8px] font-black tracking-widest mt-1" style={{ color: rgba(c, 0.6), transition }}>{tierLabel(overall)}</span>
            </div>

            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ border: `2px solid ${rgba(c, 0.5)}`, background: `linear-gradient(135deg, ${rgba(c, 0.1)}, #0A1422)`, transition }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">⚽</span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 text-right min-w-0">
              <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-white/50">
                <span>🇮🇱 ISR</span>
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
          <div
            className="h-px my-4"
            style={{ background: `linear-gradient(90deg, transparent, ${rgba(c, 0.35)}, transparent)`, transition }}
          />

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
            {STAT_KEYS.slice(0, 6).map(s => (
              <div key={s.key} className="flex flex-col items-center">
                <span className={`text-lg font-black leading-none tabular-nums ${statColor(stats[s.key])}`}>{stats[s.key] ?? '--'}</span>
                <span className="text-[9px] font-bold text-white/40 tracking-wider mt-1">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Mental — emphasized */}
          <div
            className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: `linear-gradient(90deg, ${rgba(c, 0.12)}, transparent)`, border: `1px solid ${rgba(c, 0.2)}`, transition }}
          >
            <span className="text-[10px] font-black tracking-wider" style={{ color: rgba(c, 0.85), transition }}>MENTAL · חוסן מנטלי</span>
            <span className={`text-lg font-black tabular-nums ${statColor(stats.mental)}`}>{stats.mental ?? '--'}</span>
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