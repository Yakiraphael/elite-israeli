import { motion } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

// Hebrew position -> short role code (internal, not branded)
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

function statColor(v) {
  if (v == null) return 'text-white/35';
  if (v >= 85) return 'text-emerald-400';
  if (v >= 75) return 'text-[#E8C547]';
  if (v >= 65) return 'text-amber-500';
  return 'text-red-400';
}

function ratingTier(v) {
  if (v == null) return { label: '—', color: '#6B7280' };
  if (v >= 90) return { label: 'ELITE', color: '#10B981' };
  if (v >= 80) return { label: 'GOLD', color: '#D4AF37' };
  if (v >= 70) return { label: 'SILVER', color: '#9CA3AF' };
  return { label: 'BRONZE', color: '#B87333' };
}

/**
 * Elite ID Player Card — premium branded card for the Elite Israeli program.
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
  const tier = ratingTier(overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-[320px] mx-auto select-none"
    >
      {/* Outer glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-br from-[#D4AF37]/25 via-[#D4AF37]/5 to-[#D4AF37]/20 rounded-2xl blur-lg" />

      <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-gradient-to-b from-[#15233B] via-[#0E1A2E] to-[#080F1C] shadow-2xl">
        {/* Watermark logo */}
        <img
          src={LOGO_URL}
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] opacity-[0.04] pointer-events-none"
        />

        {/* Header bar */}
        <div className="relative flex items-center justify-between px-5 py-2.5 border-b border-[#D4AF37]/20">
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-6 w-auto" />
          <span className="text-[9px] font-black text-[#D4AF37] tracking-[0.25em]">ELITE ID</span>
        </div>

        <div className="relative p-5">
          {/* Top section: rating + avatar + identity */}
          <div className="flex items-center gap-4">
            {/* Rating badge */}
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#1B2A44] to-[#0A1422] border border-[#D4AF37]/40 flex-shrink-0">
              <span className="text-3xl font-black text-[#D4AF37] leading-none tabular-nums">{overall ?? '--'}</span>
              <span className="text-[8px] font-black text-white/40 tracking-widest mt-1">{tier.label}</span>
            </div>

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#1B2A44] to-[#0A1422] flex items-center justify-center flex-shrink-0 shadow-lg">
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
                <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-black tracking-wider">{posCode}</span>
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
          <div className="h-px bg-gradient-to-l from-transparent via-[#D4AF37]/30 to-transparent my-4" />

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
          <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-l from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 px-3 py-2">
            <span className="text-[10px] font-black text-[#D4AF37] tracking-wider">MENTAL · חוסן מנטלי</span>
            <span className={`text-lg font-black tabular-nums ${statColor(stats.mental)}`}>{stats.mental ?? '--'}</span>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
            <span className="text-[10px] font-bold text-[#D4AF37]/60 tracking-[0.2em]">{eliteId}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}