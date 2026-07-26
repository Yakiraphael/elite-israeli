/**
 * signOriginalIfoPdf — משבץ חתימה דיגיטלית על גבי ה-PDF המקורי של ההתאחדות.
 * משתמש ב-pdf-lib לעריכת ה-PDF המקורי והוספת:
 *   1) חתימה ידנית שצוירה במסך (PNG שקוף)
 *   2) בלוק אישור חתימה דיגיטלית (שם, תפקיד, תאריך, IP) — מומר מ-canvas כ-PNG כדי לאפשר עברית
 * פלט: Blob של PDF חתום על בסיס ה-PDF המקורי.
 */
import { PDFDocument } from 'pdf-lib';

/**
 * ממיר שם + מטא-דאטה ל-PNG שקוף/רקע בהיר — כדי שטקסט עברי יוצג נכון בלי תלות בפונטים של pdf-lib.
 */
async function renderSignatureBlockPng({ signerName, signerRoleLabel, signerIp, contractLabel }) {
  const timestamp = new Date().toLocaleString('he-IL');
  const lines = [
    { text: 'אישור חתימה דיגיטלית · טופס ההתאחדות', size: 16, bold: true, color: '#0D1B2A' },
    { text: `נחתם על ידי: ${signerName}`, size: 15, bold: true, color: '#0D1B2A' },
    { text: `תפקיד: ${signerRoleLabel}`, size: 13, bold: false, color: '#333' },
    { text: `תאריך: ${timestamp}`, size: 13, bold: false, color: '#333' },
    { text: `IP לתיעוד: ${signerIp || 'unknown'}`, size: 13, bold: false, color: '#666' },
  ];
  if (contractLabel) {
    lines.push({ text: `טופס: ${contractLabel}`, size: 11, bold: false, color: '#888' });
  }

  const w = 360;
  const lineH = 24;
  const h = lines.length * lineH + 18;
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // רקע בהיר עם מסגרת
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#0D1B2A';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  // פס עליון
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(2, 2, w - 4, 3);

  // טקסט RTL
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  let y = 12;
  for (const line of lines) {
    ctx.fillStyle = line.color || '#000';
    ctx.font = `${line.bold ? 'bold ' : ''}${line.size}px Arial, sans-serif`;
    ctx.fillText(line.text, w - 14, y);
    y += lineH;
  }

  const arr = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('canvas blob failed'));
      b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
    }, 'image/png');
  });
  return arr;
}

/**
 * מקבל data URL של חתימה שצוירה ומחזיר Uint8Array של PNG.
 */
function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * ממיר שם מוקלד ל-PNG בכתב יד (cursive) — כדי שאפשר לחתום גם בלי לצייר.
 * משתמש בפונט 'cursive' הנתמך בכל הדפדפנים המובילים. עברית/לטינית עובדות.
 */
async function renderTypedSignaturePng(name) {
  const w = 360;
  const h = 90;
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0D1B2A';
  ctx.font = 'italic 400 44px "Brush Script MT", "Segoe Script", "Bradley Hand", cursive';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  ctx.fillText(name, w - 14, h / 2);
  const arr = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('canvas blob failed'));
      b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
    }, 'image/png');
  });
  return arr;
}

/**
 * מייצר בלוק PNG של פרטי מילוי (label + value) מהמאגר, לשיבוץ על ה-PDF המקורי.
 * מאפשר תצוגת עברית בלי תלות בפונטים של pdf-lib.
 * @param {Array<{label:string, value:string}>} fields
 */
async function renderFilledDataPng(fields) {
  const lines = (fields || [])
    .filter(f => f.value !== undefined && f.value !== '' && f.value !== null)
    .map(f => ({ label: f.label, value: String(f.value) }));

  const w = 380;
  const lineH = 22;
  const h = Math.max(40, lines.length * lineH + 34);
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // רקע חצי-שקוף בהיר
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  // כותרת
  ctx.fillStyle = '#0D1B2A';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('פרטי מילוי אוטומטי · ממופה מהמערכת', w - 14, 10);

  // שורות
  ctx.font = '13px Arial, sans-serif';
  let y = 34;
  for (const line of lines) {
    ctx.fillStyle = '#555';
    ctx.fillText(`${line.label}:`, w - 14, y);
    ctx.fillStyle = '#0D1B2A';
    const labelW = ctx.measureText(`${line.label}: `).width;
    ctx.fillText(line.value, w - 14 - labelW - 8, y);
    y += lineH;
  }

  const arr = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('canvas blob failed'));
      b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
    }, 'image/png');
  });
  return arr;
}

/**
 * משבץ את החתימה ובלוק האישור על ה-PDF המקורי של ההתאחדות.
 * @param {object} opts
 * @param {string} opts.pdfUrl — כתובת ה-PDF המקורי של הטופס
 * @param {string} opts.signatureDataUrl — (אופציונלי) data URL של חתימה שצוירה
 * @param {string} opts.signerName
 * @param {string} opts.signerRoleLabel
 * @param {string} opts.signerIp
 * @param {string} opts.contractLabel
 * @returns {Promise<Blob>} — Blob של PDF חתום
 */
export async function signOriginalPdf({ pdfUrl, signatureDataUrl, signerName, signerRoleLabel, signerIp, contractLabel, filledFields }) {
  if (!pdfUrl) throw new Error('חסר כתובת PDF מקורי');

  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`טעינת PDF נכשלה (${res.status})`);
  const bytes = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // ===== בלוק פרטי מילוי אוטומטי (מוטמע בעמוד הראשון, למעלה מימין) =====
  if (filledFields?.length) {
    const fillPngBytes = await renderFilledDataPng(filledFields);
    const fillImg = await pdfDoc.embedPng(fillPngBytes);
    const { width: pw0 } = firstPage.getSize();
    const fillScale = Math.min((pw0 - 60) / fillImg.width, 1);
    const fw = fillImg.width * fillScale;
    const fh = fillImg.height * fillScale;
    firstPage.drawImage(fillImg, {
      x: pw0 - fw - 30,
      y: firstPage.getSize().height - fh - 30,
      width: fw,
      height: fh,
    });
  }

  const lastPage = pages[pages.length - 1];
  const { width: pw, height: ph } = lastPage.getSize();

  // ===== בלוק אישור חתימה =====
  const blockPngBytes = await renderSignatureBlockPng({ signerName, signerRoleLabel, signerIp, contractLabel });
  const blockImg = await pdfDoc.embedPng(blockPngBytes);
  const blockScale = Math.min((pw - 60) / blockImg.width, 1);
  const blockW = blockImg.width * blockScale;
  const blockH = blockImg.height * blockScale;
  lastPage.drawImage(blockImg, {
    x: pw - blockW - 30,
    y: 30,
    width: blockW,
    height: blockH,
  });

  // ===== החתימה עצמה: מצוירת או מוקלדת =====
  let sigBytes = null;
  if (signatureDataUrl) {
    sigBytes = dataUrlToBytes(signatureDataUrl);
  } else if (signerName && signerName.trim().length >= 2) {
    // אין ציור — צור חתימה מוקלדת בכתב יד
    sigBytes = await renderTypedSignaturePng(signerName.trim());
  }

  if (sigBytes) {
    const sigImg = await pdfDoc.embedPng(sigBytes);
    const sigScale = Math.min((blockW - 20) / sigImg.width, 1);
    const sigW = sigImg.width * sigScale;
    const sigH = sigImg.height * sigScale;
    lastPage.drawImage(sigImg, {
      x: pw - sigW - 38,
      y: 30 + blockH + 6,
      width: sigW,
      height: sigH,
    });
  }

  const out = await pdfDoc.save();
  return new Blob([out], { type: 'application/pdf' });
}

/**
 * מילוי ה-PDF המקורי בלבד — בלי חתימה. להורדת טופס מולא ומוכן לחתימה.
 * @param {object} opts
 * @param {string} opts.pdfUrl
 * @param {Array<{label:string, value:string}>} opts.filledFields
 * @param {string} opts.contractLabel
 * @returns {Promise<Blob>}
 */
export async function fillOriginalPdf({ pdfUrl, filledFields, contractLabel }) {
  if (!pdfUrl) throw new Error('חסר כתובת PDF מקורי');
  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`טעינת PDF נכשלה (${res.status})`);
  const bytes = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const firstPage = pdfDoc.getPages()[0];

  // בלוק פרטי מילוי
  if (filledFields?.length) {
    const fillPngBytes = await renderFilledDataPng(filledFields);
    const fillImg = await pdfDoc.embedPng(fillPngBytes);
    const { width: pw } = firstPage.getSize();
    const { height: ph } = firstPage.getSize();
    const fillScale = Math.min((pw - 60) / fillImg.width, 1);
    const fw = fillImg.width * fillScale;
    const fh = fillImg.height * fillScale;
    firstPage.drawImage(fillImg, {
      x: pw - fw - 30,
      y: ph - fh - 30,
      width: fw,
      height: fh,
    });
  }

  // חותמת "מוכן לחתימה דיגיטלית" בתחתית העמוד האחרון
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const readyPng = await renderReadyPng(contractLabel);
  const readyImg = await pdfDoc.embedPng(readyPng);
  const { width: pw2 } = lastPage.getSize();
  const rscale = Math.min((pw2 - 60) / readyImg.width, 1);
  lastPage.drawImage(readyImg, {
    x: pw2 - readyImg.width * rscale - 30,
    y: 30,
    width: readyImg.width * rscale,
    height: readyImg.height * rscale,
  });

  const out = await pdfDoc.save();
  return new Blob([out], { type: 'application/pdf' });
}

async function renderReadyPng(contractLabel) {
  const lines = [
    'טופס מולא אוטומטית · מוכן לחתימה',
    contractLabel ? `טופס: ${contractLabel}` : '',
    `הופק על ידי מערכת עילית ישראלית`,
    new Date().toLocaleString('he-IL'),
  ].filter(Boolean);
  const lineH = 22;
  const w = 360;
  const h = lines.length * lineH + 16;
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(2, 2, w - 4, 3);
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  let y = 12;
  ctx.fillStyle = '#0D1B2A';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText(lines[0], w - 14, y); y += lineH;
  ctx.fillStyle = '#555';
  ctx.font = '13px Arial, sans-serif';
  for (let i = 1; i < lines.length; i++) {
    ctx.fillText(lines[i], w - 14, y); y += lineH;
  }
  const arr = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('canvas blob failed'));
      b.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
    }, 'image/png');
  });
  return arr;
}