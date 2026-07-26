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

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

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
  const draftInputRef = useRef(null);

  // טעינת PDF + רינדור עמודים
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        pagesRef.current = [];
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) pages.push(await pdf.getPage(i));

        const container = containerRef.current;
        container.innerHTML = '';

        for (const page of pages) {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const pageWrap = document.createElement('div');
          pageWrap.style.cssText = 'position:relative;margin:0 auto 16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);';

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = 'display:block;width:100%;height:auto;';
          pageWrap.appendChild(canvas);

          const clickLayer = document.createElement('div');
          clickLayer.style.cssText = 'position:absolute;inset:0;cursor:crosshair;';
          pageWrap.appendChild(clickLayer);

          container.appendChild(pageWrap);

          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;

          const pageNumber = page.pageNumber;
          const record = { pageNumber, viewport, canvas, clickLayer, pageWrap };
          pagesRef.current.push(record);

          clickLayer.addEventListener('click', (e) => {
            const rect = clickLayer.getBoundingClientRect();
            const xRatio = (e.clientX - rect.left) / rect.width;
            const yRatio = (e.clientY - rect.top) / rect.height;
            setActiveDraft({ pageNumber, xRatio, yRatio });
            setDraftText('');
            setDraftFontSize(13);
            setTimeout(() => draftInputRef.current?.focus(), 30);
          });
        }
        setLoading(false);
      } catch (e) {
        console.error('pdf load failed', e);
        setError('טעינת ה-PDF נכשלה — ייתכן שהקובץ מוגן בפני CORS או חסום.');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // הצמדת אנוטציות קיימות על העמודים
  useEffect(() => {
    // נשאף למחדש את ההצגה בכל פעם שהרשימה משתנה
    // מסיר ישנים ומוסיף חדשים
    pagesRef.current.forEach((p) => {
      const existing = p.clickLayer.querySelectorAll('[data-ann]');
      existing.forEach((el) => el.remove());
    });
    for (const a of annotations) {
      const page = pagesRef.current.find((p) => p.pageNumber === a.pageNumber);
      if (!page) continue;
      const el = document.createElement('div');
      el.dataset.ann = a.id;
      el.style.cssText = `position:absolute;left:${a.xRatio * 100}%;top:${a.yRatio * 100}%;transform:translate(-50%,-50%);
        background:rgba(212,175,55,0.18);border:1px dashed #D4AF37;padding:2px 6px;border-radius:3px;
        font-size:${(a.fontSize || 13) - 1}px;color:#0D1B2A;font-weight:bold;white-space:nowrap;pointer-events:auto;
        cursor:pointer;font-family:Arial,sans-serif;`;
      el.textContent = a.text;
      el.title = 'לחץ למחיקה';
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setAnnotations((arr) => arr.filter((x) => x.id !== a.id));
      });
      page.clickLayer.appendChild(el);
    }
  }, [annotations]);

  // הדראפט מוצג בראש הקליק-לייר
  useEffect(() => {
    if (!activeDraft) return;
    pagesRef.current.forEach((p) => {
      const d = p.clickLayer.querySelector('[data-draft]');
      if (d) d.remove();
    });
    const page = pagesRef.current.find((p) => p.pageNumber === activeDraft.pageNumber);
    if (!page) return;
    const el = document.createElement('div');
    el.dataset.draft = '1';
    el.style.cssText = `position:absolute;left:${activeDraft.xRatio * 100}%;top:${activeDraft.yRatio * 100}%;
      transform:translate(-50%,-50%);background:rgba(13,27,42,0.95);color:#fff;padding:4px 10px;border-radius:4px;
      font-size:${draftFontSize}px;font-weight:bold;font-family:Arial,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.4);
      white-space:nowrap;`;
    el.textContent = draftText || 'הקלד טקסט...';
    page.clickLayer.appendChild(el);
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

  const handleSave = () => {
    onSaved?.(annotations);
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
            disabled={annotations.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#D4AF37] text-[#0D1B2A] px-3 py-1.5 rounded hover:bg-amber-400 disabled:opacity-40">
            <Save size={13} /> שמור וסגור
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