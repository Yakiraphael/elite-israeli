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
export async function signOriginalPdf({ pdfUrl, signatureDataUrl, signerName, signerRoleLabel, signerIp, contractLabel }) {
  if (!pdfUrl) throw new Error('חסר כתובת PDF מקורי');

  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`טעינת PDF נכשלה (${res.status})`);
  const bytes = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  // בלוק האישור
  const blockPngBytes = await renderSignatureBlockPng({ signerName, signerRoleLabel, signerIp, contractLabel });
  const blockImg = await pdfDoc.embedPng(blockPngBytes);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width: pw, height: ph } = lastPage.getSize();

  // גודל בלוק (יחס שמירה)
  const blockScale = Math.min((pw - 60) / blockImg.width, 1);
  const blockW = blockImg.width * blockScale;
  const blockH = blockImg.height * blockScale;
  lastPage.drawImage(blockImg, {
    x: pw - blockW - 30,
    y: 30,
    width: blockW,
    height: blockH,
  });

  // חתימה ידנית — מתחת/מעל הבלוק
  if (signatureDataUrl) {
    const sigBytes = dataUrlToBytes(signatureDataUrl);
    const sigImg = await pdfDoc.embedPng(sigBytes);
    // מקסימום רוחב = רוחב הבלוק; מתחת לבלוק
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