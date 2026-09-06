import React from 'react';

// ============================================================
// TierBadge — כרטיס דירוג רמות (A5 עד B1)
//
// מציג את רמת השחקן האיכותית: A = רמה עליונה, B = רמה בסיסית.
// מספר 1-5 = תת-דרג (5=גבוה, 1=נמוך).
// דרג A = זהב/מוקפד, דרג B = ניטרלי/כסוף.
// ============================================================

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3.5 py-1.5 gap-2',
};

export default function TierBadge({ tier = 'B1', size = 'md', showLabel = false, strings }) {
  const isATier = tier.startsWith('A');

  const tierLabel = strings?.tierLabels?.[tier];

  return (
    <div
      className={`inline-flex items-center rounded-full font-black border-2 ${SIZE_CLASSES[size]} ${
        isATier
          ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-[#0B0F1A] border-[#D4AF37] shadow-md shadow-[#D4AF37]/20'
          : 'bg-[#1B263B] text-white/70 border-white/15'
      }`}
    >
      <span className="tracking-wider">{tier}</span>
      {showLabel && tierLabel && (
        <span className="font-medium opacity-80 hidden sm:inline">· {tierLabel}</span>
      )}
    </div>
  );
}