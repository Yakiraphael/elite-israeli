/**
 * PdfFieldEditor — עורך אינטראקטיבי למילוי ידני של חלקים חסרים על גבי ה-PDF המקורי.
 * המנהל רואה את העמודים המוצגים (pdf.js), לוחץ על מיקום, מקליד טקסט,
 * והטקסט מוצמד לאותו מיקום על העמוד. בשמירה מיוצא PDF חדש עם כל ההערות.
 *
 * אנוטציות נשמרות ברמת יחס (0..1) כדי לשמור על יציבות בין רזולוציות.
 */
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, X, Plus, Trash2, Save, Eraser, Type, Move } from 'lucide-react';

// ה-worker חייב להיות מאותה גרסה בדיוק כמו ה-API המותקן, אחרת עלולים להיווצר
// פגמי רינדור (תווים מרוחקים, גליפים שגויים, עברית מרווחת). לכן נורה על גרסה דינמית.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * @param {string} pdfUrl
 * @param {Array<{pageNumber:number, xRatio:number, yRatio:number, text:string, fontSize?:number}>} initialAnnotations
 * @param {(annotations)=>void} onSaved
 * @param {()=>void} onClose
 */
export default function PdfFieldEditor({ pdfUrl, initialAnnotations = [], onSaved, onClose }) {
  const containerRef = useRef(null);
  const pagesRef = useRef([]);     // { pageNumber, viewport, canvas, containerEl }
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [activeDraft, setActiveDraft] = useState(null);   // { pageNumber, xRatio, yRatio } — בהליך הקלדה
  const [draftText, setDraftText] = useState('');
  const [draftFontSize, setDraftFontSize] = useState(13);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const draftInputRef = useRef(null);

  // טעינת PDF — משתמשים ב-pdf.js אך ורק לשליפת מספר העמודים ויחס העמוד.
  // את ה-PDF עצמו מציגים ישירות ב-iframe דרך ה-viewer המובנה של הדפדפן (Chrome PDFium),
  // שמטפל בעברית בצורה תקינה. pdf.js canvas rendering מתקשה עם פונטים עבריים מוטמעים
  // ומרנדר את הגליפים מרווחים/שבורים — ולכן איננו נשען עליו לתצוגה עוד.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, useSystemFonts: true }).promise;
        if (cancelled) { pdf.destroy(); return; }
        const n = pdf.numPages;
        const firstPage = await pdf.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        const pageAspect = vp.height / vp.width;
        pdf.destroy();

        const container = containerRef.current;
        container.innerHTML = '';
        pagesRef.current = [];

        const pageWrap = document.createElement('div');
        // יחס העמוד × מספר העמודים → גובה המעטפת שיכיל את כל העמודים מוערמים
        pageWrap.style.cssText = `position:relative;margin:0 auto 16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);aspect-ratio: 1 / ${(pageAspect * n).toFixed(4)};`;

        const iframe = document.createElement('iframe');
        iframe.src = `${pdfUrl}#toolbar=0&navpanes=0&view=FitH`;
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;background:#fff;';
        pageWrap.appendChild(iframe);

        const clickLayer = document.createElement('div');
        clickLayer.style.cssText = 'position:absolute;inset:0;cursor:crosshair;';
        pageWrap.appendChild(clickLayer);

        container.appendChild(pageWrap);
        pagesRef.current = [{ pageNumber: 'all', clickLayer, numPages: n }];

        clickLayer.addEventListener('click', (e) => {
          const rect = clickLayer.getBoundingClientRect();
          const xRatio = (e.clientX - rect.left) / rect.width;
          const yRatioFull = (e.clientY - rect.top) / rect.height;
          const pageNumber = Math.min(n, Math.floor(yRatioFull * n) + 1);
          const yRatio = yRatioFull * n - (pageNumber - 1);
          setActiveDraft({ pageNumber, xRatio, yRatio });
          setDraftText('');
          setDraftFontSize(13);
          setTimeout(() => draftInputRef.current?.focus(), 30);
        });

        setLoading(false);
      } catch (e) {
        console.error('pdf load failed', e);
        setError('טעינת ה-PDF נכשלה — ייתכן שהקובץ מוגן בפני CORS או חסום.');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // הצמדת אנוטציות קיימות — מיקום יחסי לעמוד בתוך כל ה-PDF
  useEffect(() => {
    const rec = pagesRef.current[0];
    if (!rec) return;
    const existing = rec.clickLayer.querySelectorAll('[data-ann]');
    existing.forEach((el) => el.remove());
    for (const a of annotations) {
      const el = document.createElement('div');
      el.dataset.ann = a.id;
      const topPct = ((a.pageNumber - 1 + a.yRatio) / rec.numPages) * 100;
      el.style.cssText = `position:absolute;left:${a.xRatio * 100}%;top:${topPct}%;transform:translate(-50%,-50%);
        background:rgba(212,175,55,0.18);border:1px dashed #D4AF37;padding:2px 6px;border-radius:3px;
        font-size:${(a.fontSize || 13) - 1}px;color:#0D1B2A;font-weight:bold;white-space:nowrap;pointer-events:auto;
        cursor:pointer;font-family:Arial,sans-serif;`;
      el.textContent = a.text;
      el.title = 'לחץ למחיקה';
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setAnnotations((arr) => arr.filter((x) => x.id !== a.id));
      });
      rec.clickLayer.appendChild(el);
    }
  }, [annotations]);

  // הדראפט מוצג בראש שכבת הקליק
  useEffect(() => {
    const rec = pagesRef.current[0];
    if (rec) {
      const d = rec.clickLayer.querySelector('[data-draft]');
      if (d) d.remove();
    }
    if (!activeDraft || !rec) return;
    const el = document.createElement('div');
    el.dataset.draft = '1';
    const topPct = ((activeDraft.pageNumber - 1 + activeDraft.yRatio) / rec.numPages) * 100;
    el.style.cssText = `position:absolute;left:${activeDraft.xRatio * 100}%;top:${topPct}%;
      transform:translate(-50%,-50%);background:rgba(13,27,42,0.95);color:#fff;padding:4px 10px;border-radius:4px;
      font-size:${draftFontSize}px;font-weight:bold;font-family:Arial,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.4);
      white-space:nowrap;`;
    el.textContent = draftText || 'הקלד טקסט...';
    rec.clickLayer.appendChild(el);
  }, [activeDraft, draftText, draftFontSize]);

  const commitDraft = () => {
    if (!activeDraft || !draftText.trim()) { setActiveDraft(null); return; }
    const ann = {
      id: `ann_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      pageNumber: activeDraft.pageNumber,
      xRatio: activeDraft.xRatio,
      yRatio: activeDraft.yRatio,
      text: draftText.trim(),
      fontSize: draftFontSize,
    };
    setAnnotations((arr) => [...arr, ann]);
    setActiveDraft(null);
    setDraftText('');
  };

  const handleSave = async () => {
    if (saving) return; // מונע לחיצות כפולות בזמן יצירת ה-PDF
    setSaving(true);
    try {
      await onSaved?.(annotations);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex flex-col" dir="rtl">
      {/* כלים */}
      <div className="bg-[#1B263B] border-b border-white/10 px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Type size={16} className="text-[#D4AF37] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-white font-black text-sm truncate">עריכת מילוי על גבי ה-PDF המקורי</div>
            <div className="text-white/40 text-[11px]">לחץ על נקודה בעמוד → הקלד טקסט → אישור. לחץ על הערה קיימת למחיקה.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/50 text-xs hidden md:inline">{annotations.length} הערות</span>
          {annotations.length > 0 && (
            <button onClick={() => setAnnotations([])}
              className="flex items-center gap-1 text-xs text-white/50 border border-white/15 px-2.5 py-1.5 rounded hover:bg-white/5">
              <Eraser size={12} /> נקה
            </button>
          )}
          <button onClick={handleSave}
            disabled={annotations.length === 0 || saving}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#D4AF37] text-[#0D1B2A] px-3 py-1.5 rounded hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'שומר...' : 'שמור וסגור'}
          </button>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* אזור ההקלדה צף */}
      {activeDraft && (
        <div className="bg-[#0D1B2A] border-b border-white/10 px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
          <Plus size={14} className="text-[#D4AF37]" />
          <input
            ref={draftInputRef}
            type="text"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitDraft(); if (e.key === 'Escape') setActiveDraft(null); }}
            placeholder="הקלד טקסט להצמדה במיקום שנבחר..."
            className="flex-1 bg-[#1B263B] border border-white/15 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60"
          />
          <select value={draftFontSize} onChange={(e) => setDraftFontSize(Number(e.target.value))}
            className="bg-[#1B263B] border border-white/15 rounded px-2 py-1.5 text-white text-xs">
            {[10, 11, 12, 13, 14, 15, 16, 18, 20].map((s) => (<option key={s} value={s}>{s}px</option>))}
          </select>
          <button onClick={commitDraft}
            disabled={!draftText.trim()}
            className="bg-[#D4AF37] text-[#0D1B2A] text-xs font-bold px-3 py-1.5 rounded hover:bg-amber-400 disabled:opacity-40 flex items-center gap-1">
            <Plus size={13} /> הצמד
          </button>
          <button onClick={() => setActiveDraft(null)} className="text-white/40 hover:text-white text-xs px-2">בטל</button>
        </div>
      )}

      {/* אזור התצוגה */}
      <div className="flex-1 overflow-auto bg-[#0D1B2A] p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
            <div className="text-white/40 text-sm">טוען את ה-PDF המקורי...</div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <X size={28} className="text-red-400" />
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        )}
        <div ref={containerRef} style={{ maxWidth: '780px', margin: '0 auto', display: loading ? 'none' : 'block' }} />
      </div>
    </div>
  );
}