import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileSignature, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  PenLine, Lock, UserCheck, Sparkles, FileText
} from 'lucide-react';
import {
  IFA_FORM_CATALOG, getFormFieldSchema, resolveFieldValue,
  deriveActionFromCategory, deriveTransferSubType, loanCategoryToAgeGroup,
} from '@/lib/ifaFormRegistry';
import { generateFormPdf } from '@/lib/generateIfoFormPdf';
import { resolveFormOrDeclaration } from '@/lib/formFallbackResolver';

// פורטל אינטראקטיבי למילוי וחתימה על טופסי ההתאחדות לכדורגל.
// מציג את הטופס הרשמי, ממלא אוטומטית שדות שהמערכת יודעת (שם שחקן/מועדון/ת.ז. וכו'),
// מסמן שדות שדורשים השלמה ידנית של המנהל המקצועי, ומאפשר חתימה דיגיטלית לכל תפקיד.
// תומך בהעברות ובהשאלות (תקופת השאלה + מועדון בעלים/שואל).

const SIGNER_LABELS = {
  guardian: 'אפוטרופוס',
  player: 'שחקן בוגר',
  club: 'נציג המועדון',
  director: 'מנהל מקצועי',
};

export default function IFAFormSignModal({ formKey, proposal, player, club, transfer, signerRole, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [editableValues, setEditableValues] = useState({});
  const [signatureName, setSignatureName] = useState('');
  const [signed, setSigned] = useState(false);
  const [signerIp, setSignerIp] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fallback Logic: סריקת בנק התבניות → אם אין, יצירת הצהרה דיגיטלית דינמית.
  const ctx = { player: player || {}, club: club || {}, transfer: transfer || {} };
  const { form, schema, declarationText, source: formSource } = resolveFormOrDeclaration(formKey, ctx);

  // זיהוי כתובת IP של החותם לתיעוד משפטי
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setSignerIp(d.ip))
      .catch(() => setSignerIp('unknown'));
  }, []);

  // טעינת מסמך חתום קיים (אם נחתם בעבר) כדי לאפשר עריכת השלמה
  const { data: existingDoc = null } = useQuery({
    queryKey: ['ifa-form-signed', proposal.id, formKey],
    queryFn: () => base44.entities.TransferDocument.filter({
      transfer_id: proposal.id, doc_type: formKey,
    }, '-created_date', 1).then(r => r[0] || null),
  });

  useEffect(() => {
    if (existingDoc?.digital_content) {
      try {
        const parsed = JSON.parse(existingDoc.digital_content);
        setEditableValues(parsed.editableValues || parsed);
      } catch { /* ignore */ }
    }
  }, [existingDoc]);

  // אתחול ברירת מחדל לשדות editable (default values מהסכמה)
  useEffect(() => {
    const init = {};
    schema.filter(f => f.kind !== 'auto').forEach(f => {
      if (f.default) init[f.key] = f.default;
    });
    setEditableValues(prev => ({ ...init, ...prev }));
  }, [formKey]);

  const directorFields = schema.filter(f => f.kind === 'editable_director');
  const userFields = schema.filter(f => f.kind === 'editable_user');
  const autoFields = schema.filter(f => f.kind === 'auto');

  // תיקון באג מערכתי: שדות editable_director נדרשים רק כשהחותם הוא מנהל מקצועי/מועדון.
  // אפוטרופוס/שחקן יכולים לחתום על חלקם בלבד — המנהל ישלים את שדותיו במעבר החתימה שלו.
  const isDirectorSigner = signerRole === 'director' || signerRole === 'club';
  const missingDirectorFields = isDirectorSigner
    ? directorFields.filter(f => f.required && !editableValues[f.key])
    : [];
  const canSign = signatureName.trim().length >= 2 && missingDirectorFields.length === 0;

  const persistDoc = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const digital_content = JSON.stringify({
        formKey,
        formSource,
        declarationText: formSource === 'dynamic' ? declarationText : undefined,
        editableValues,
        autoSnapshot: autoFields.reduce((acc, f) => ({ ...acc, [f.key]: resolveFieldValue(f, ctx) }), {}),
        signedBy: SIGNER_LABELS[signerRole] || signerRole,
      });
      const baseRec = {
        transfer_id: proposal.id,
        transfer_category: proposal.transfer_category,
        doc_type: formKey,
        doc_label: form?.label || formKey,
        method: 'digital',
        digital_content,
        signature_name: signatureName.trim(),
        signed_at: now,
        signed_ip: signerIp || 'unknown',
        status: 'נחתם דיגיטלית',
        required: true,
      };
      let docRec;
      if (existingDoc?.id) {
        docRec = await base44.entities.TransferDocument.update(existingDoc.id, baseRec);
      } else {
        docRec = await base44.entities.TransferDocument.create(baseRec);
      }

      // עדכון סטטוס חתימה על ההצעה בהתאם לתפקיד
      const proposalPatch = {};
      if (signerRole === 'guardian') {
        proposalPatch.guardian_otp_verified = true;
        proposalPatch.guardian_consent_name = signatureName.trim();
        proposalPatch.guardian_consent_at = now;
      } else if (signerRole === 'player') {
        proposalPatch.player_consent = true;
      }
      if (Object.keys(proposalPatch).length) {
        await base44.entities.TransferProposal.update(proposal.id, proposalPatch);
      }

      // תיעוד ב-AuditLog
      if (currentUser?.id) {
        await base44.entities.AuditLog.create({
          actor_id: currentUser.id,
          actor_name: currentUser.full_name || signatureName.trim(),
          actor_role: signerRole,
          action: 'sign_player',
          player_id: player?.id,
          details: `${SIGNER_LABELS[signerRole] || signerRole} חתם דיגיטלית על ${form?.label} עבור ${player?.full_name || proposal.player_name}${formSource === 'dynamic' ? ' (הצהרה דיגיטלית מותאמת — Fallback)' : ''}`,
        });
      }

      return docRec;
    },
    onSuccess: () => {
      setSigned(true);
      queryClient.invalidateQueries({ queryKey: ['ifa-form-signed'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-documents'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-docs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['guardian-children'] });
    },
    onError: (err) => setError(err.message),
  });

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await generateFormPdf({
        form_key: formKey,
        player,
        club,
        transfer,
        editableValues,
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!form) {
    return (
      <Backdrop onClose={onClose}>
        <div className="text-red-400 text-sm">טופס לא נמצא: {formKey}</div>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-[#0D1B2A] border border-white/15 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0D1B2A] border-b border-white/10 px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-start gap-2.5">
            <FileSignature className="text-[#D4AF37] flex-shrink-0 mt-0.5" size={22} />
            <div>
              <h2 className="text-white font-black text-base">{form.label}</h2>
              <p className="text-white/40 text-[11px] mt-0.5">{form.ifa_form_reference}</p>
              {form.reference_url && (
                <a href={form.reference_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:text-amber-300 text-[10px] inline-flex items-center gap-0.5 mt-1">
                  צפה בתבנית המקור <FileText size={9} />
                </a>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {signed ? (
            <div className="text-center py-10">
              <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
              <div className="text-white font-bold">החתימה הדיגיטלית נשמרה בהצלחה</div>
              <p className="text-white/40 text-xs mt-2">
                נתוני החתימה תועדו: {signatureName} · {new Date().toLocaleString('he-IL')} · IP: {signerIp || '—'}
              </p>
              <button onClick={handleDownloadPdf} disabled={downloading}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold bg-[#D4AF37] text-[#0D1B2A] px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40">
                {downloading ? <Loader2 size={13} className="animate-spin" /> : <PenLine size={13} />}
                הורד עותק PDF חתום
              </button>
              <button onClick={onClose} className="block mx-auto mt-3 text-white/40 hover:text-white text-xs">
                סגור
              </button>
            </div>
          ) : (
            <>
              {/* הסבר — מה מעולאוטומטי, מה ידני */}
              <div className="bg-[#1B263B]/50 border border-white/5 rounded-lg p-3 text-[11px] text-white/50 leading-relaxed">
                <Sparkles size={12} className="text-[#D4AF37] inline ml-1" />
                המערכת מילאה אוטומטית שדות שבידיה (שם שחקן, ת.ז., מועדון וכו) מתוך תיק השחקן. שדות שלא ידועים דורשים השלמה — שדות <span className="text-amber-400 font-bold">בכתום</span> מחייבים מילוי ידני של המנהל המקצועי לפני החתימה.
              </div>

              {/* חלק 1: שדות אוטומטיים (ממולאים מתיק השחקן) */}
              {autoFields.length > 0 && (
                <Section title="פרטים ממולאים אוטומטית מתיק השחקן" icon={ShieldCheck}>
                  <div className="grid grid-cols-2 gap-2">
                    {autoFields.map(f => (
                      <AutoField key={f.key} label={f.label}
                        value={editableValues[f.key] !== undefined ? editableValues[f.key] : resolveFieldValue(f, ctx)} />
                    ))}
                  </div>
                </Section>
              )}

              {/* חלק 2: השאלה / פעילות — תקופה ומועדונים */}
              {form.category === 'loan' && (
                <Section title="פרטי תקופת ההשאלה" icon={FileSignature}>
                  <div className="grid grid-cols-2 gap-2">
                    <AutoField label="תחילת השאלה" value={editableValues.loan_start_date || transfer?.loan_start_date || '—'} />
                    <AutoField label="סיום השאלה" value={editableValues.loan_end_date || transfer?.loan_end_date || '—'} />
                  </div>
                  <div className="mt-2 text-[10px] text-amber-400/80">עדכן תאריכים בהצעה כדי לשנות את תקופת ההשאלה.</div>
                </Section>
              )}

              {/* חלק 3: הצהרה דיגיטלית מותאמת (Fallback) — מוצגת רק כשאין תבנית בבנק המוסדי */}
              {formSource === 'dynamic' && declarationText && (
                <Section title="גוף ההצהרה המשפטית הדיגיטלית (Fallback)" icon={FileText} highlight>
                  <pre className="text-white/75 text-[11px] whitespace-pre-wrap leading-relaxed font-sans">{declarationText}</pre>
                </Section>
              )}

              {/* חלק 3ב: שדות למילוי ידני של המנהל המקצועי — מוצגים רק לחותם מנהל/מועדון */}
              {directorFields.length > 0 && isDirectorSigner && (
                <Section title={`שדות להשלמה ידנית — ${SIGNER_LABELS.director}`} icon={AlertCircle} highlight>
                  <div className="grid grid-cols-2 gap-3">
                    {directorFields.map(f => (
                      <EditableField key={f.key} field={f}
                        value={editableValues[f.key] || ''}
                        onChange={v => setEditableValues(prev => ({ ...prev, [f.key]: v }))}
                      />
                    ))}
                  </div>
                  {missingDirectorFields.length > 0 && (
                    <div className="text-amber-400 text-[10px] mt-2 flex items-center gap-1">
                      <AlertCircle size={11} /> נדרש למלא לפני החתימה: {missingDirectorFields.map(f => f.label).join(', ')}
                    </div>
                  )}
                </Section>
              )}

              {/* הודעת שקיפות לאפוטרופוס/שחקן: שדות המנהל יושלמו במעבר נפרד */}
              {directorFields.length > 0 && !isDirectorSigner && (
                <div className="text-white/40 text-[10px] bg-white/[0.02] border border-white/10 rounded-md px-3 py-2">
                  שדות טכניים (תאריך העברה, מועדונים) יושלמו ע"י המנהל המקצועי בחתימתו — חתימתך תקפה ותועדה.
                </div>
              )}

              {/* חלק 4: שדות השלמה אישית של החותם */}
              {userFields.length > 0 && (
                <Section title="השלמות נוספות" icon={UserCheck}>
                  <div className="grid grid-cols-1 gap-3">
                    {userFields.map(f => (
                      <EditableField key={f.key} field={f}
                        value={editableValues[f.key] || ''}
                        onChange={v => setEditableValues(prev => ({ ...prev, [f.key]: v }))}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* הורדת PDF מקדימה ללא חתימה */}
              <button onClick={handleDownloadPdf} disabled={downloading}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-white/5 text-white/60 border border-white/15 py-2.5 rounded-sm hover:bg-white/10 transition-colors disabled:opacity-40">
                {downloading ? <Loader2 size={13} className="animate-spin" /> : <PenLine size={13} />}
                הורד טיוטת PDF (ללא חתימה) — לעיון בלבד
              </button>

              {/* חלק 5: חתימה דיגיטלית */}
              <Section title={`חתימה דיגיטלית — ${SIGNER_LABELS[signerRole] || signerRole}`} icon={Lock}>
                <p className="text-white/40 text-[11px] mb-3 leading-relaxed">
                  בחתימה יתועדו שם החותם, תאריך, שעה וכתובת IP. החתימה מהווה הצהרה משפטית בהתאם לתקנון ההתאחדות לכדורגל בישראל.
                </p>
                <input
                  type="text"
                  value={signatureName}
                  onChange={e => setSignatureName(e.target.value)}
                  placeholder={`שם מלא — ${SIGNER_LABELS[signerRole] || signerRole}`}
                  className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                  dir="rtl"
                />
                <div className="text-white/30 text-[10px] mt-2">כתובת IP לתיעוד: {signerIp || 'טוען...'}</div>

                {error && (
                  <div className="text-red-400 text-[11px] mt-2">{error}</div>
                )}

                <button
                  onClick={() => persistDoc.mutate()}
                  disabled={!canSign || persistDoc.isPending}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-bold bg-[#D4AF37] text-[#0D1B2A] py-3 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {persistDoc.isPending ? <Loader2 size={15} className="animate-spin" /> : <FileSignature size={15} />}
                  {persistDoc.isPending ? 'שומר חתימה...' : `חתום דיגיטלית ושמור מסמך`}
                </button>
                {!canSign && missingDirectorFields.length === 0 && (
                  <div className="text-white/40 text-[10px] mt-2 text-center">יש להזין שם מלא לפני החתימה.</div>
                )}
              </Section>
            </>
          )}
        </div>
      </motion.div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }) {
  // נעילת גלילת הגוף ברקע כל עוד המודאל פתוח — מונע גלילה כפולה (Zero Double Scrollbars).
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <AnimatePresence>{children}</AnimatePresence>
    </div>
  );
}

function Section({ title, icon: Icon, children, highlight }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white/[0.02] border border-white/10'}`}>
      <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${highlight ? 'text-amber-400' : 'text-white/70'}`}>
        <Icon size={13} /> {title}
      </div>
      {children}
    </div>
  );
}

function AutoField({ label, value }) {
  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-sm p-2.5">
      <div className="text-white/40 text-[10px] mb-0.5">{label}</div>
      <div className="text-white text-xs font-bold truncate">{String(value || '—')}</div>
    </div>
  );
}

function EditableField({ field, value, onChange }) {
  const isDate = field.key === 'loan_start_date' || field.key === 'loan_end_date' || field.key === 'transfer_date';
  const isNumber = field.key === 'contract_value';
  return (
    <label className="block">
      <div className="text-white/70 text-[11px] font-bold mb-1 flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-amber-400">*</span>}
      </div>
      <input
        type={isDate ? 'date' : isNumber ? 'number' : 'text'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={isDate ? 'בחר תאריך' : 'הזן ערך'}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
        dir="rtl"
      />
    </label>
  );
}