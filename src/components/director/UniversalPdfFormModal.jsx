/**
 * UniversalPdfFormModal — מודל אוניברסלי למילוי וחתימה על כל טופס רשמי של ההתאחדות.
 *
 * זרימה:
 *   1) אם לטופס יש pdf_url — נפתח עורך PdfFieldEditor ישירות על ה-PDF המקורי.
 *   2) אם אין pdf_url (טופס בהמתנה להעלאת PDF רשמי) — נבקש מהמשתמש להעלות PDF,
 *      ולאחר מכן נפתח עליו את העורך.
 *   3) לאחר שמירת הטקסטים — מיוצא PDF מולא ומועלה ל-vault.
 *   4) אופציונלי — חתימה דיגיטלית (ידנית/הקלדה) על גבי ה-PDF המולא.
 *
 * התוצאה: PDF מולא+חתום זמין להורדה/צפייה.
 */
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Upload, FileCheck2, Download, PenTool, FileText,
  CheckCircle2, AlertCircle, Info,
} from 'lucide-react';
import { getOfficialForm } from '@/lib/ifaOfficialForms';
import { pdfWithAnnotations, signOriginalPdf } from '@/lib/signOriginalIfoPdf';
import PdfFieldEditor from '@/components/contracts/PdfFieldEditor';
import SignatureCanvas from '@/components/contracts/SignatureCanvas';
import SendToPlayerCard from './SendToPlayerCard';

const SIGNER_LABELS = {
  player: 'שחקן',
  guardian: 'אפוטרופוס',
  coach: 'מאמן',
  club: 'נציג המועדון',
  director: 'מנהל מקצועי',
  lawyer: 'עו"ד',
  medical_staff: 'צוות רפואי',
};

export default function UniversalPdfFormModal({
  formKey,
  signerRole = 'director',
  signerName = '',
  onClose,
  onSaved,
}) {
  const form = getOfficialForm(formKey);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filledDocUrl, setFilledDocUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [sigName, setSigName] = useState(signerName || '');
  const [sigIp, setSigIp] = useState('unknown');
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => { if (!cancelled) setSigIp(d.ip); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!form) return null;

  const effectivePdfUrl = form.pdf_url || uploadedPdfUrl;
  const loanPendingUpload = !form.pdf_url && form.requires_pdf_upload;

  const handleUploadPdf = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedPdfUrl(file_url);
    } catch (e) {
      setError('העלאת ה-PDF נכשלה — נא לנסות שנית.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditorSaved = async (annotations) => {
    setSaving(true);
    setError(null);
    try {
      const blob = await pdfWithAnnotations({ pdfUrl: effectivePdfUrl, annotations });
      const file = new File([blob], `${formKey}-filled.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFilledDocUrl(file_url);
    } catch (e) {
      setError('שמירת המסמך נכשלה — נא לנסות שנית.');
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!signatureDataUrl || sigName.trim().length < 2) return;
    setSigning(true);
    setError(null);
    try {
      const blob = await signOriginalPdf({
        pdfUrl: filledDocUrl || effectivePdfUrl,
        signatureDataUrl,
        signerName: sigName.trim(),
        signerRoleLabel: SIGNER_LABELS[signerRole] || signerRole,
        signerIp: sigIp,
        contractLabel: form.label,
        filledFields: [],
      });
      const file = new File([blob], `${formKey}-signed.pdf`, { type: 'application/pdf' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFilledDocUrl(file_url);
      onSaved?.(file_url);
    } catch (e) {
      setError('החתימה נכשלה — נא לנסות שנית.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }}
          className="bg-[#1B263B] border border-white/10 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1B263B] border-b border-white/10 px-6 py-4 flex items-start justify-between gap-3 z-10">
            <div className="flex items-start gap-2.5">
              <FileText className="text-[#D4AF37] flex-shrink-0 mt-1" size={20} />
              <div>
                <h2 className="text-white font-black text-base">{form.label}</h2>
                <p className="text-white/40 text-[11px] mt-0.5">
                  קטגוריה: {categoryLabel(form.category)} · {form.requires_guardian ? 'דורש אפוטרופוס' : 'ללא אפוטרופוס'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {loanPendingUpload && !uploadedPdfUrl && (
              <UploadScreen onUpload={handleUploadPdf} uploading={uploading} />
            )}

            {effectivePdfUrl && !filledDocUrl && (
              <PdfFieldEditor
                pdfUrl={effectivePdfUrl}
                initialAnnotations={[]}
                onSaved={handleEditorSaved}
                onClose={onClose}
              />
            )}

            {saving && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-xs py-4">
                <Loader2 size={14} className="animate-spin" /> שומר את המסמך המולא...
              </div>
            )}

            {filledDocUrl && (
              <div className="space-y-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-2">
                    <CheckCircle2 size={14} /> המסמך מולא ונשמר בהצלחה
                  </div>
                  <a href={filledDocUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-[#D4AF37] text-xs font-bold hover:bg-white/5 transition-colors">
                    <Download size={13} /> הורד / צפה ב-PDF המולא
                  </a>
                </div>

                <SendToPlayerCard documentUrl={filledDocUrl} documentLabel={form.label} formKey={formKey} />

                {/* חתימה דיגיטלית אופציונלית */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <button
                    onClick={() => setShowSignPad(s => !s)}
                    className="flex items-center gap-2 text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors"
                  >
                    <PenTool size={13} /> {showSignPad ? 'סגור חתימה' : 'חתימה דיגיטלית על ה-PDF'}
                  </button>

                  {showSignPad && (
                    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-3">
                      <p className="text-white/40 text-[11px]">
                        החתימה תשובץ ישירות על גבי ה-PDF יחד עם שם חותם, תאריך וכתובת IP לתיעוד משפטי.
                      </p>
                      <SignatureCanvas onDrawn={setSignatureDataUrl} />
                      <input
                        type="text"
                        value={sigName}
                        onChange={e => setSigName(e.target.value)}
                        placeholder={`שם מלא — ${SIGNER_LABELS[signerRole] || signerRole}`}
                        className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleSign}
                          disabled={signing || !signatureDataUrl || sigName.trim().length < 2}
                          className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-bold text-sm px-4 py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {signing ? <Loader2 size={14} className="animate-spin" /> : <PenTool size={14} />}
                          חתום וצור PDF חתום
                        </button>
                        <span className="text-white/30 text-[10px]">IP לתיעוד: {sigIp}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-3 text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function UploadScreen({ onUpload, uploading }) {
  return (
    <div className="bg-[#0D1B2A] border border-amber-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-3">
        <Info size={14} /> טופס זה ממתין להעלאת PDF רשמי
      </div>
      <p className="text-white/50 text-xs leading-relaxed mb-4">
        מקור ה-PDF הרשמי של טופס זה טרם הועלה למערכת. נא להעלות את קובץ ה-PDF הרשמי של ההתאחדות, ולאחר מכן יפתח העורך האינטראקטיבי למילוי וחתימה על גביו.
      </p>
      <label className="flex items-center justify-center gap-2 border border-dashed border-[#D4AF37]/40 rounded-lg py-6 text-[#D4AF37] text-sm cursor-pointer hover:bg-[#D4AF37]/5 transition-colors">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? 'מעלה...' : 'בחר קובץ PDF להעלאה'}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => onUpload(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

function categoryLabel(c) {
  return {
    player_contract: 'חוזה שחקן',
    coach_contract: 'חוזה מאמן',
    transfer: 'העברה / השאלה',
    protocol: 'פרוטוקול',
    insurance: 'ביטוח',
    registration: 'רישום',
    medical: 'כוח אדם רפואי',
    match: 'משחק',
    special: 'מיוחד',
    admin: 'מנהלה',
    other: 'אחר',
  }[c] || c;
}