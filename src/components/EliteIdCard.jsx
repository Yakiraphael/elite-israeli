import { motion } from 'framer-motion';

// Hebrew position -> FIFA abbreviation + flag color accent
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
  if (v == null) return 'text-white/40';
  if (v >= 85) return 'text-emerald-400';
  if (v >= 75) return 'text-[#D4AF37]';
  if (v >= 65) return 'text-amber-500';
  return 'text-red-400';
}

/**
 * FIFA-style Elite ID card.
 * Props: name, eliteId, position (hebrew), stats {}, avatarUrl, rating, age, city, subtitle
 */
export default function EliteIdCard({
  name = 'שחקן לדוגמה',
  eliteId = 'ELITE-2026-0000',
  position = 'קשר התקפי',
  stats = {},
  avatarUrl,
  rating,
  age,
  city,
}) {
  const overall = rating != null ? rating : computeOverall(stats);
  const posAbbr = POSITION_MAP[position] || 'CM';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-[300px] mx-auto select-none"
    >
      {/* Card glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-[#D4AF37]/20 rounded-2xl blur-md" />

      <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-gradient-to-b from-[#1B2A44] via-[#0F1B30] to-[#0A1422] shadow-2xl">
        {/* Top bar */}
        <div className="bg-gradient-to-l from-[#D4AF37]/90 to-[#b8941e]/90 px-4 py-1.5 flex items-center justify-between">
          <span className="text-[10px] font-black text-[#0A1422] tracking-widest">ELITE LEAGUE · 25/26</span>
          <span className="text-[10px] font-black text-[#0A1422]">עילית ישראלית</span>
        </div>

        <div className="p-5">
          {/* Head: rating + avatar + position */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-[#D4AF37] leading-none">{overall ?? '--'}</div>
              <div className="text-xs font-black text-white tracking-widest mt-1">{posAbbr}</div>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 bg-[#1B2A44] flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">⚽</span>
              )}
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white/70">
                <span>🇮🇱 ISR</span>
              </div>
              <div className="text-white font-black text-sm leading-tight mt-1">{name}</div>
              {(age || city) && (
                <div className="text-white/40 text-[10px] mt-0.5">
                  {age != null && <>גיל: {age}</>}
                  {age != null && city && ' · '}
                  {city}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-transparent my-4" />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {STAT_KEYS.slice(0, 6).map(s => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/45 tracking-wider">{s.label}</span>
                <span className={`text-sm font-black ${statColor(stats[s.key])}`}>{stats[s.key] ?? '--'}</span>
              </div>
            ))}
          </div>

          {/* Mental — emphasized */}
          <div className="mt-2 flex items-center justify-between border-t border-[#D4AF37]/15 pt-2">
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider">MENTAL · חוסן מנטלי</span>
            <span className={`text-sm font-black ${statColor(stats.mental)}`}>{stats.mental ?? '--'}</span>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-white/5 text-center">
            <span className="text-[9px] font-bold text-[#D4AF37]/70 tracking-widest">{eliteId}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}