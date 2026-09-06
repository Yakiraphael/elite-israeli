import React from 'react';

// ============================================================
// FootballBalls — תצוגת כדורי רגל ויזואלית (Zero-Numbers UI)
//
// חוק הברזל: שום מספר יבש אינו מוצג. הממוצע מוצג באמצעות
// 5 כדורי רגל — מלאים, חצאי כדור, או ריקים/שקופים.
//
// תומך במצב תצוגה (display) ומצב אינטראקטיבי (interactive) לטופס הערכה.
// ============================================================

function FootballBall({ fillLevel, size = 20 }) {
  // fillLevel: 1 = full, 0.5 = half, 0 = empty
  const gold = '#D4AF37';
  const goldDark = '#B8941E';
  const emptyBorder = 'rgba(212,175,55,0.25)';
  const id = React.useId();

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`fb-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gold} />
          <stop offset="100%" stopColor={goldDark} />
        </linearGradient>
      </defs>
      {/* Base circle — always visible as outline */}
      <circle
        cx="12" cy="12" r="10"
        fill="transparent"
        stroke={fillLevel > 0 ? gold : emptyBorder}
        strokeWidth="1.5"
      />
      {/* Full fill */}
      {fillLevel === 1 && (
        <>
          <circle cx="12" cy="12" r="10" fill={`url(#fb-${id})`} />
          {/* Football pentagon pattern */}
          <polygon
            points="12,7 15.5,9.5 14,14 10,14 8.5,9.5"
            fill="rgba(11,15,26,0.35)"
          />
        </>
      )}
      {/* Half fill — left half */}
      {fillLevel === 0.5 && (
        <>
          <path d="M12 2 A10 10 0 0 0 12 22 Z" fill={`url(#fb-${id})`} />
          <polygon
            points="12,7 15.5,9.5 14,14 10,14 8.5,9.5"
            fill="rgba(11,15,26,0.35)"
            clipPath="polygon(0 0, 12 0, 12 24, 0 24)"
          />
        </>
      )}
    </svg>
  );
}

/**
 * @param {number} score - ציון 0-5 (מעוגל לחצאי כדורים)
 * @param {number} size - גודל כל כדור בpx
 * @param {boolean} interactive - האם ניתן ללחוץ לבחירת דירוג
 * @param {function} onChange - קולבאק כשנבחר דירוג (mצב אינטראקטיבי)
 * @param {string} className
 */
export default function FootballBalls({ score = 0, size = 20, interactive = false, onChange, className }) {
  const rounded = Math.round(score * 2) / 2;
  const fullBalls = Math.floor(rounded);
  const hasHalf = rounded % 1 !== 0;

  const balls = [];
  for (let i = 0; i < 5; i++) {
    let fillLevel = 0;
    if (i < fullBalls) fillLevel = 1;
    else if (i === fullBalls && hasHalf) fillLevel = 0.5;

    if (interactive) {
      balls.push(
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className="transition-transform hover:scale-125 active:scale-95"
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: 'pointer',
            lineHeight: 0,
          }}
          aria-label={`דרג ${i + 1}`}
        >
          <FootballBall fillLevel={fillLevel} size={size} />
        </button>
      );
    } else {
      balls.push(
        <div key={i} style={{ padding: '2px', lineHeight: 0 }}>
          <FootballBall fillLevel={fillLevel} size={size} />
        </div>
      );
    }
  }

  return (
    <div className={`inline-flex items-center gap-0.5 ${className || ''}`}>
      {balls}
    </div>
  );
}