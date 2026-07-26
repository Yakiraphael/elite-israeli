/**
 * SignatureCanvas — לוח ציור חתימה ידנית (עכבר / מגע).
 * פלט כ-PNG שקוף המועבר להורה דרך onDrawn.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser } from 'lucide-react';

export default function SignatureCanvas({ onDrawn }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = 2;
    c.width = 600 * dpr;
    c.height = 160 * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0D1B2A';
    ctx.lineWidth = 2.4;
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = pos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    const l = lastPt.current;
    if (l) {
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    lastPt.current = p;
  };

  const end = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPt.current = null;
    setHasSig(true);
    onDrawn?.(canvasRef.current.toDataURL('image/png'));
  }, [onDrawn]);

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const dpr = 2;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    setHasSig(false);
    onDrawn?.(null);
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-white/15">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#0D1B2A]/70 text-xs font-bold">חתום כאן ✍️</span>
        {hasSig && (
          <button onClick={clear} className="flex items-center gap-1 text-[#0D1B2A]/60 hover:text-[#0D1B2A] text-[10px] font-bold">
            <Eraser size={11} /> נקה
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className="w-full bg-white border border-dashed border-[#0D1B2A]/30 rounded h-40 cursor-crosshair touch-none"
        style={{ aspectRatio: '15/4' }}
      />
      <p className="text-[#0D1B2A]/40 text-[10px] mt-1.5 text-center">
        החתימה תשובץ ישירות על ה-PDF הרשמי של ההתאחדות בעת האישור.
      </p>
    </div>
  );
}