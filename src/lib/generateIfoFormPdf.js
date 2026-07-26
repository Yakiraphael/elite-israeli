// מנגנון ייצור PDF רשמיים של טפסי ההתאחדות לכדורגל, ממולאים אוטומטית בנתוני השחקן והמועדון.
// משתמש ב-html2canvas + jsPDF לייצור קובץ PDF שמשקף את תבנית המקור של ההתאחדות (RTL, עברית).
// קובץ ה-PDF מוכן להורדה על-ידי המנהל המקצועי ולצירוף ל-ZIP שנשלח להתאחדות.

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { IFA_FORM_CATALOG, buildSubmissionBundle } from './ifaFormRegistry';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('he-IL') : '____');

function fieldRow(label, value, opts = {}) {
  const { wide = false, bold = false } = opts;
  return `<div class="row ${wide ? 'row--wide' : ''}">
    <span class="lbl">${esc(label)}</span>
    <span class="val ${bold ? 'val--bold' : ''}">${esc(value || '—')}</span>
  </div>`;
}

function signatureBlock(items) {
  return `<div class="sig-grid">${items.map((s) => `
    <div class="sig-cell">
      <div class="sig-label">${esc(s.label)}</div>
      <div class="sig-line"></div>
      <div class="sig-name">${esc(s.name || '________________')}</div>
      <div class="sig-meta">${esc(s.signedAt || 'תאריך: __ / __ / ____')}</div>
    </div>`).join('')}</div>`;
}

function buildFormHtml(form, { player, club, transfer }) {
  const isAdult = player?.is_adult;
  const guardianName = player?.guardian_name || (transfer?.guardian_consent_name) || '';
  const clubId = club?.id || player?.event_id || '';

  const header = `
    <div class="header">
      <div class="header-title">${esc(form.label)}</div>
      <div class="header-sub">מסמך ייחוס: ${esc(form.ifa_form_reference)}</div>
      ${form.reference_url ? `<div class="header-url">מקור: ${esc(form.reference_url)}</div>` : ''}
      <div class="header-meta">הופק אוטומטית על-ידי מערכת עילית ישראלית · ${new Date().toLocaleString('he-IL')}</div>
    </div>`;

  const parties = `
    <div class="section">
      <div class="section-title">פרטי הצדדים</div>
      ${fieldRow('שם השחקן', player?.full_name, { bold: true })}
      ${fieldRow('תעודת זהות', player?.id_number)}
      ${fieldRow('תאריך לידה', fmtDate(player?.birth_date))}
      ${fieldRow('עמדה ראשית', player?.position)}
      ${isAdult ? '' : fieldRow('שם האפוטרופוס', guardianName, { bold: true })}
      ${isAdult ? '' : fieldRow('תעודת זהות אפוטרופוס', player?.guardian_id)}
      ${fieldRow('כתובת', [player?.street_address, player?.city].filter(Boolean).join(', '))}
      ${fieldRow('טלפון', player?.phone)}
      ${fieldRow('מועדון נוכחי', club?.club_name || player?.team_name, { bold: true })}
      ${fieldRow('מספר כרטיס שחקן (IFA ID)', player?.ifa_id)}
    </div>`;

  let transferSection = '';
  if (form.category === 'transfer' && transfer) {
    transferSection = `
      <div class="section">
        <div class="section-title">פרטי ההעברה</div>
        ${fieldRow('מועדון מעביר', transfer.club_from || player?.team_name)}
        ${fieldRow('מועדון קולט', transfer.club_to || transfer.club_name)}
        ${fieldRow('סוג העברה', transfer.transfer_category || form.label)}
        ${transfer.contract_value ? fieldRow('שווי חוזה (₪)', transfer.contract_value.toLocaleString('he-IL')) : ''}
        ${transfer.iefa_commission_fee ? fieldRow('עמלת IEFA 5% (₪)', transfer.iefa_commission_fee.toLocaleString('he-IL')) : ''}
      </div>`;
  } else if (form.category === 'contract') {
    transferSection = `
      <div class="section">
        <div class="section-title">תקופת ההסכם</div>
        ${fieldRow('תאריך התחלה', fmtDate(player?.contract_start_date))}
        ${fieldRow('תאריך סיום', fmtDate(player?.contract_end_date))}
      </div>`;
  }

  const consent = isAdult
    ? 'אני השחקן הנ"ל, מאשר/ת בחתימתי דיגיטלית את האמור לעיל, בהתאם לתקנון ההתאחדות לכדורגל בישראל.'
    : 'אני האפוטרופוס החוקי של הקטין/ה הנ"ל, מאשר/ת בחתימתי דיגיטלית את האמור לעיל, בהתאם לתקנון מעמד והעברות של שחקנים קטינים של ההתאחדות לכדורגל בישראל.';

  const sigItems = [];
  if (form.required_signatures?.includes('club') || form.required_signatures?.includes('club_sending') || form.required_signatures?.includes('club_receiving') || form.required_signatures?.includes('club_owner') || form.required_signatures?.includes('club_loan')) {
    sigItems.push({ label: 'חתימת נציג המועדון', name: club?.contact_name });
  }
  if (form.required_signatures?.includes('club_sending')) sigItems.push({ label: 'חתימת המועדון המעביר', name: '' });
  if (form.required_signatures?.includes('club_receiving')) sigItems.push({ label: 'חתימת המועדון הקולט', name: transfer?.club_name });
  if (form.required_signatures?.includes('club_owner')) sigItems.push({ label: 'חתימת המועדון הבעלים', name: '' });
  if (form.required_signatures?.includes('club_loan')) sigItems.push({ label: 'חתימת המועדון השואל', name: '' });
  if (form.required_signatures?.includes('player')) sigItems.push({ label: 'חתימת השחקן הבוגר', name: player?.full_name });
  if (form.required_signatures?.includes('guardian')) sigItems.push({ label: 'חתימת האפוטרופוס', name: guardianName });
  if (form.required_signatures?.includes('fifa_tms')) sigItems.push({ label: 'אישור FIFA TMS', name: '' });

  const consentSection = `
    <div class="section">
      <div class="section-title">הצהרת הסכמה וחתימה דיגיטלית</div>
      <p class="consent-text">${consent}</p>
      ${signatureBlock(sigItems)}
      <p class="audit-note">בעת חתימה דיגיטלית יתועדו שם החותם, תאריך, שעה וכתובת IP לצורך תוקף משפטי.</p>
    </div>`;

  return `<div class="page" dir="rtl">${header}${parties}${transferSection}${consentSection}</div>`;
}

const STYLES = `
  * { box-sizing: border-box; }
  .page { background:#fff; padding:56px 64px; font-family:'Assistant','Arial',sans-serif; color:#0a0a0a; font-size:13px; line-height:1.5; }
  .header { text-align:center; border-bottom:3px solid #0D1B2A; padding-bottom:12px; margin-bottom:24px; }
  .header-title { font-size:20px; font-weight:800; color:#0D1B2A; }
  .header-sub { font-size:12px; color:#444; margin-top:4px; }
  .header-url { font-size:10px; color:#888; margin-top:2px; }
  .header-meta { font-size:10px; color:#D4AF37; margin-top:6px; font-weight:700; }
  .section { margin-bottom:22px; }
  .section-title { font-size:14px; font-weight:800; color:#0D1B2A; border-right:4px solid #D4AF37; padding-right:10px; margin-bottom:10px; }
  .row { display:flex; justify-content:space-between; align-items:flex-start; padding:7px 0; border-bottom:1px solid #eee; gap:16px; }
  .row--wide { flex-direction:column; }
  .lbl { color:#666; font-weight:700; min-width:220px; flex-shrink:0; }
  .val { color:#0a0a0a; text-align:left; max-width:55%; word-break:break-word; }
  .val--bold { font-weight:800; }
  .consent-text { background:#f8f8f8; border-right:3px solid #D4AF37; padding:12px; margin:8px 0 16px; font-size:12px; }
  .sig-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:18px; margin-top:12px; }
  .sig-cell { border:1px solid #ccc; padding:10px; min-height:96px; }
  .sig-label { font-size:10px; font-weight:700; color:#444; margin-bottom:6px; }
  .sig-line { border-top:1px solid #333; height:28px; margin:8px 0 4px; }
  .sig-name { font-size:11px; color:#0a0a0a; font-weight:700; }
  .sig-meta { font-size:10px; color:#888; margin-top:2px; }
  .audit-note { font-size:9px; color:#999; margin-top:12px; text-align:center; }
`;

async function renderHtmlToPdf(html, filename) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;right:-99999px;top:0;width:794px;background:#fff;z-index:-1;';
  container.innerHTML = `<style>${STYLES}</style>${html}`;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;

    if (imgH <= pageH) {
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, imgH);
    } else {
      // חיתוך למספר עמודים לפי גובה ה-A4
      const pagePxHeight = Math.floor((canvas.width * pageH) / pageW);
      let rendered = 0;
      let pageIdx = 0;
      while (rendered < canvas.height) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pagePxHeight, canvas.height - rendered);
        const ctx = sliceCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, rendered, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        if (pageIdx > 0) pdf.addPage();
        const sliceImgH = (sliceCanvas.height * pageW) / sliceCanvas.width;
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, sliceImgH);
        rendered += sliceCanvas.height;
        pageIdx += 1;
      }
    }
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateFormPdf({ form_key, player, club, transfer }) {
  const form = IFA_FORM_CATALOG[form_key];
  if (!form) throw new Error(`טופס לא מוכר: ${form_key}`);
  const html = buildFormHtml(form, { player, club: club || {}, transfer: transfer || null });
  const safeName = (player?.full_name || 'player').replace(/[^\w\u0590-\u05FF\s-]/g, '').trim();
  await renderHtmlToPdf(html, `${form.label} - ${safeName}.pdf`);
}

export async function generateBundleZip({ action, player, club, transfer }) {
  const age_group = player?.is_adult ? 'adult' : 'minor';
  const transfer_sub_type = transfer?.transfer_category?.includes('בינלאומי') ? 'international' : 'domestic';
  const is_international = transfer_sub_type === 'international';
  const bundle = buildSubmissionBundle({ action, age_group, transfer_sub_type, is_international });
  const all = [...bundle.mainForms, ...bundle.supporting].filter((f, i, arr) => arr.findIndex(x => x.key === f.key) === i);
  for (const form of all) {
    if (form.category === 'supporting_doc') continue; // מסמכי תמיכה נשמרים בכספת — לא מפיקים אותם מחדש
    try {
      await generateFormPdf({ form_key: form.key, player, club, transfer });
    } catch (err) {
      console.error('form gen failed', form.key, err);
    }
  }
}