import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileSignature, Lock, Loader2, CheckCircle2, AlertCircle,
  MessageSquarePlus, PenLine, Eye, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { getOfficialForm } from '@/lib/ifaOfficialForms';
import { signOriginalPdf } from '@/lib/signOriginalIfoPdf';
import SignatureCanvas from './SignatureCanvas';

// ============================================================
// מודל חתימה על חוזה רשמי ההתאחדות + משא ומתן על סעיפים.
// המנהל האישי יכול להציע ערכים לשדות הנגישים לניהול מו"מ.
// שחקן בוגר / אפוטרופוס הם בעלי סמכות החתימה הסופית בלבד.
// ============================================================

const SIGNER_LABELS = {
  player: 'שחקן',
  guardian: 'אפוטרופוס',
  coach: 'מאמן',
  club: 'נציג המועדון',
  manager: 'מנהל אישי',
  director: 'מנהל מקצועי',
};

export default function OfficialContractSignModal({
  contractKey,       // מפתח טופס מ-IFA_OFFICIAL_FORMS
  contract,          // רשומת Contract מהישות
  player,            // רשומת PlayerRegistration
  signerRole,        // 'player' | 'guardian' | 'coach' | 'club' | 'director'
  currentUser,       // אובייקט user (base44.auth.me())
  onClose,
  onSigned,
}) {
  const queryClient = useQueryClient();
  const form = getOfficialForm(contractKey);

  const [signatureName, setSignatureName] = useState('');
  const [negotiationValues, setNegotiationValues] = useState({});
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signerIp, setSignerIp] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [signingPdf, setSigningPdf] = useState(false);

  // סמכות חתימה — רק שחקן בוגר / הורה / מאמן (לא מנהל אישי)
  const hasSigningAuthority = ['player', 'guardian', 'coach', 'club', 'director'].includes(signerRole);
  const isManagerOnly = signerRole === 'manager';

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setSignerIp(d.ip))
      .catch(() => setSignerIp('unknown'));
  }, []);

  // טעינת כל בקשות המשא ומתן לחוזה זה (ממתינות + שאושרו)
  const { data: existingNegotiations = [] } = useQuery({
    queryKey: ['contract-negotiations', contract?.id],
    queryFn: () => base44.entities.NegotiationRequest.filter({
      transfer_id: contract?.id,
    }, '-created_date', 50),
    enabled: !!contract?.id,
  });

  // סינון: ממתינות (ממתינות לאישור) ושאושרו
  const pendingNegotiations = existingNegotiations.filter(n => n.status === 'pending');
  const acceptedNegotiations = existingNegotiations.filter(n => n.status === 'accepted');

  // מילוי אוטומטי של ערכים מהחוזה + מהמשא ומתן שאושר
  useEffect(() => {
    if (!form) return;
    const vals = {};
    form.negotiable_fields.forEach(f => {
      if (contract?.[f.key]) vals[f.key] = contract[f.key];
    });
    acceptedNegotiations.forEach(n => {
      if (n.clause_key && n.proposed_value) vals[n.clause_key] = n.proposed_value;
    });
    setNegotiationValues(vals);
  }, [form, contract, acceptedNegotiations]);

  const proposeNegotiation = useMutation({
    mutationFn: async ({ fieldKey, fieldLabel, proposedValue, reasoning }) => {
      await base44.entities.NegotiationRequest.create({
        transfer_id: contract.id,
        player_id: player?.id || contract?.player_id,
        player_name: player?.full_name || contract?.player_name,
        club_name: contract?.club_name || '',
        sender_role: 'manager',
        sender_name: currentUser?.full_name || '',
        clause_key: fieldKey,
        clause_label: fieldLabel,
        current_value: String(contract?.[fieldKey] || ''),
        proposed_value: String(proposedValue),
        reasoning,
        status: 'pending',
      });
      // התראה למנהל המקצועי
      await base44.entities.Notification.create({
        audience: 'director',
        type: 'contract_pending',
        title: `בקשת שינוי סעיף: ${fieldLabel}`,
        body: `המנהל האישי של ${player?.full_name || contract?.player_name} מציע שינוי: ${proposedValue}`,
        player_id: player?.id,
        player_name: player?.full_name,
        request_id: contract.id,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contract-negotiations'] }),
  });

  const signContract = useMutation({
    mutationFn: async () => {
      setSigningPdf(true);
      const now = new Date().toISOString();
      const patch = {};

      // ===== 1. חתימה על גבי ה-PDF של ההתאחדות — אם המנהל כבר מילא, נחתום על הגרסה המולאת, אחרת על המקורי =====
      let documentUrl = contract?.document_url;
      const basePdfUrl = contract?.document_url || form?.pdf_url;
      try {
        const blob = await signOriginalPdf({
          pdfUrl: basePdfUrl,
          signatureDataUrl,
          signerName: signatureName.trim(),
          signerRoleLabel: SIGNER_LABELS[signerRole] || signerRole,
          signerIp,
          contractLabel: form?.label,
          filledFields: [],   // לא מוטמע בלוק אוטומטי — המנהל מילא ידנית בעורך האינטראקטיבי
        });
        const file = new File([blob], `contract-${contract.id}.pdf`, { type: 'application/pdf' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        documentUrl = file_url;
        patch.document_url = file_url;
      } catch (e) {
        console.error('PDF signing failed', e);
        // נמשיך גם אם עריכת ה-PDF נכשלה — החתימה המטא-דאטית עדיין נשמרת
      }

      if (signerRole === 'player' || signerRole === 'coach') {
        patch.player_signature_name = signatureName.trim();
        patch.player_signed_at = now;
        patch.player_signed_ip = signerIp;
      } else if (signerRole === 'guardian') {
        patch.guardian_signature_name = signatureName.trim();
        patch.guardian_signed_at = now;
        patch.guardian_signed_ip = signerIp;
      }

      const needsGuardian = form?.requires_guardian || contract?.requires_guardian;
      const alreadyPlayerSigned = contract?.player_signed_at || signerRole === 'player';
      const alreadyGuardianSigned = contract?.guardian_signed_at || signerRole === 'guardian';
      const fullyDone = !needsGuardian ? alreadyPlayerSigned : (alreadyPlayerSigned && alreadyGuardianSigned);
      if (fullyDone) patch.status = 'חתום';
      if (!patch.status && signerRole !== 'guardian') patch.status = 'ממתין לחתימה';

      await base44.entities.Contract.update(contract.id, patch);

      await base44.entities.AuditLog.create({
        actor_id: currentUser?.id,
        actor_name: currentUser?.full_name || signatureName,
        actor_role: signerRole,
        action: 'sign_player',
        player_id: player?.id,
        details: `${SIGNER_LABELS[signerRole]} חתם על ${form?.label || contractKey} — ${player?.full_name || contract?.player_name} (IP: ${signerIp})`,
      });
      setSigningPdf(false);
    },
    onSuccess: () => {
      setSigned(true);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onSigned?.();
    },
    onError: () => setSigningPdf(false),
  });

  if (!form) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }}
          className="bg-[#0D1B2A] border border-white/15 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0D1B2A] border-b border-white/10 px-6 py-4 flex items-start justify-between gap-3 z-10">
            <div>
              <h2 className="text-white font-black text-base">{form.label}</h2>
              <p className="text-white/40 text-[11px] mt-0.5">
                {player?.full_name || contract?.player_name} · {contract?.club_name}
              </p>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {signed ? (
              <div className="text-center py-10">
                <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
                <div className="text-white font-bold text-base">החתימה הדיגיטלית נשמרה!</div>
                <p className="text-white/40 text-xs mt-2">
                  {signatureName} · {new Date().toLocaleString('he-IL')} · IP: {signerIp}
                </p>
                <button onClick={onClose} className="mt-4 text-white/40 hover:text-white text-sm">סגור</button>
              </div>
            ) : (
              <>
                {/* תצוגת PDF */}
                <div>
                  <button
                    onClick={() => setShowPdf(p => !p)}
                    className="w-full flex items-center justify-between bg-[#1B263B] border border-white/10 rounded-lg px-4 py-3 text-white/70 text-sm hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Eye size={15} /> צפה בטופס הרשמי של ההתאחדות
                    </span>
                    {showPdf ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {showPdf && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <iframe
                        src={form.pdf_url}
                        className="w-full"
                        style={{ height: '500px' }}
                        title={form.label}
                      />
                    </div>
                  )}
                </div>

                {/* התראת משא ומתן ממתין — שחקן/אפוטרופוס רואה מה ממתין לאישור */}
                {pendingNegotiations.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black mb-3">
                      <AlertCircle size={13} /> סעיפים שממתינים לאישור סופי ({pendingNegotiations.length})
                    </div>
                    <div className="text-amber-300/70 text-[11px] mb-2 leading-relaxed">
                      המנהל האישי הציע שינויים בסעיפים הבאים. הם ממתינים לאישור המועדון לפני שיהפכו לחלק מהחוזה.
                    </div>
                    <div className="space-y-2">
                      {pendingNegotiations.map(n => (
                        <div key={n.id} className="bg-[#0D1B2A]/60 border border-amber-500/15 rounded-sm p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white/70 text-[11px] font-bold">{n.clause_label}</span>
                            {n.sender_role === 'manager' && <span className="text-[9px] text-amber-400/60">מהמנהל האישי</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            {n.current_value && <span className="text-white/40 line-through">{n.current_value}</span>}
                            <span className="text-white/30">→</span>
                            <span className="text-amber-400 font-bold">{n.proposed_value}</span>
                          </div>
                          {n.reasoning && <div className="text-white/40 text-[10px] mt-1 italic">"{n.reasoning}"</div>}
                          <div className="text-amber-400/60 text-[9px] mt-1.5 font-bold">⏳ ממתין לאישור המועדון</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* סעיפים שאושרו במשא ומתן */}
                {acceptedNegotiations.length > 0 && (() => {
                  return (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                      <div className="text-green-400 text-[11px] font-bold mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> סעיפים שאושרו במשא ומתן ({acceptedNegotiations.length})
                      </div>
                      <div className="space-y-1.5">
                        {acceptedNegotiations.map(n => (
                          <div key={n.id} className="flex items-center justify-between text-[10px]">
                            <span className="text-white/40">{n.clause_label}</span>
                            <span className="text-green-400 font-bold">{n.proposed_value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* תצוגת שדות ממולאים ע"י המנהל המקצועי */}
                {contract?.filled_fields && (() => {
                  try {
                    const filled = JSON.parse(contract.filled_fields);
                    const keys = Object.keys(filled).filter(k => filled[k]);
                    if (keys.length === 0) return null;
                    const allFields = [...(form?.negotiable_fields || []), ...(form?.director_fillable_fields || [])];
                    return (
                      <div className="bg-[#1B263B] border border-green-500/20 rounded-lg p-4">
                        <div className="text-green-400 text-xs font-bold mb-3 flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> פרטי החוזה שמולאו על ידי המנהל המקצועי
                        </div>
                        <div className="space-y-1.5">
                          {keys.map(k => {
                            const fieldDef = allFields.find(f => f.key === k);
                            return (
                              <div key={k} className="flex items-start justify-between gap-3 text-xs">
                                <span className="text-white/40 flex-shrink-0">{fieldDef?.label || k}:</span>
                                <span className="text-white font-bold text-right break-words">{filled[k]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}

                {/* משא ומתן — רק למנהל אישי וגם לשחקן/מנהל מקצועי */}
                {form.negotiable_fields.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowNegotiation(p => !p)}
                      className="w-full flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-400 text-sm hover:bg-amber-500/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquarePlus size={15} />
                        {isManagerOnly ? 'הצע שינויים לסעיפי החוזה (משא ומתן)' : 'עיין בסעיפים הניתנים לשינוי'}
                      </span>
                      {showNegotiation ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {showNegotiation && (
                      <div className="mt-3 space-y-3">
                        {isManagerOnly && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-blue-300 text-xs flex items-start gap-2">
                            <Info size={14} className="flex-shrink-0 mt-0.5" />
                            כמנהל אישי, תוכל להציע שינויים בסעיפים שלהלן. הבקשות יועברו למנהל המקצועי של המועדון לאישור. רק לאחר הסכמת שני הצדדים תבוצע חתימה סופית.
                          </div>
                        )}
                        <NegotiationFields
                          fields={form.negotiable_fields}
                          values={negotiationValues}
                          onPropose={isManagerOnly ? proposeNegotiation.mutate : null}
                          contract={contract}
                          isManagerOnly={isManagerOnly}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* חתימה — רק בעלי סמכות */}
                {hasSigningAuthority && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 space-y-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold">
                      <Lock size={13} />
                      חתימה דיגיטלית על ה-PDF הרשמי — {SIGNER_LABELS[signerRole]}
                    </div>

                    <div className="bg-[#1B263B] border border-white/5 rounded-lg p-3 text-[11px] text-white/50">
                      בחתימה מאשר/ת {SIGNER_LABELS[signerRole]} קריאת הטופס הרשמי של ההתאחדות במלואו. החתימה תשובץ ישירות על קובץ ה-PDF המקורי, יחד עם שם, תאריך ו-IP לתיעוד משפטי.
                    </div>

                    <input
                      type="text"
                      value={signatureName}
                      onChange={e => setSignatureName(e.target.value)}
                      placeholder={`שם מלא של ${SIGNER_LABELS[signerRole]}`}
                      className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                    />

                    <SignatureCanvas onDrawn={setSignatureDataUrl} />

                    <div className="text-white/30 text-[10px]">IP לתיעוד: {signerIp || 'טוען...'}</div>

                    <button
                      onClick={() => signContract.mutate()}
                      disabled={signatureName.trim().length < 2 || signContract.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-bold py-3 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {signContract.isPending || signingPdf
                        ? <><Loader2 size={15} className="animate-spin" /> שומר חתימה על ה-PDF...</>
                        : <><FileSignature size={15} /> חתום וצור PDF חתום</>}
                    </button>
                  </div>
                )}

                {/* מנהל אישי — רק מו"מ, לא חתימה */}
                {isManagerOnly && (
                  <div className="bg-[#1B263B] border border-amber-500/20 rounded-lg p-4 text-amber-300 text-xs leading-relaxed">
                    <AlertCircle size={14} className="inline ml-1" />
                    כמנהל אישי, אין לך סמכות חתימה על חוזה זה. תפקידך לנהל משא ומתן על הסעיפים ולהציע שינויים לאישור המועדון. החתימה הסופית תיעשה על ידי השחקן (בוגר) או ההורה/אפוטרופוס (קטין) בלבד.
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ========== רכיב שדות משא ומתן ========== //
function NegotiationFields({ fields, values, onPropose, contract, isManagerOnly }) {
  const [proposing, setProposing] = useState(null); // fieldKey שמציעים עליו
  const [proposeVal, setProposeVal] = useState('');
  const [proposeReason, setProposeReason] = useState('');

  const handlePropose = async (field) => {
    if (!proposeVal.trim()) return;
    await onPropose({
      fieldKey: field.key,
      fieldLabel: field.label,
      proposedValue: proposeVal.trim(),
      reasoning: proposeReason.trim(),
    });
    setProposing(null);
    setProposeVal('');
    setProposeReason('');
  };

  return (
    <div className="space-y-2">
      {fields.map(field => {
        const currentVal = values[field.key];
        const isProposing = proposing === field.key;
        return (
          <div key={field.key} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white/50 text-[10px] font-bold">סעיף {field.clause} — {field.label}</div>
                <div className="text-white text-xs mt-0.5 font-bold">
                  {currentVal ? String(currentVal) : <span className="text-white/25">לא מוגדר</span>}
                </div>
              </div>
              {isManagerOnly && onPropose && (
                <button
                  onClick={() => {
                    setProposing(isProposing ? null : field.key);
                    setProposeVal(currentVal ? String(currentVal) : '');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                >
                  <PenLine size={11} /> הצע שינוי
                </button>
              )}
            </div>

            {isProposing && (
              <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                {field.type === 'select' ? (
                  <select
                    value={proposeVal}
                    onChange={e => setProposeVal(e.target.value)}
                    className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="">בחר...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={proposeVal}
                    onChange={e => setProposeVal(e.target.value)}
                    placeholder="הזן ערך מוצע..."
                    rows={3}
                    className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none resize-none"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={proposeVal}
                    onChange={e => setProposeVal(e.target.value)}
                    placeholder="ערך מוצע..."
                    className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none"
                  />
                )}
                <textarea
                  value={proposeReason}
                  onChange={e => setProposeReason(e.target.value)}
                  placeholder="נימוק / הסבר להצעה (רשות)"
                  rows={2}
                  className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePropose(field)}
                    disabled={!proposeVal.trim()}
                    className="flex-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 rounded-sm hover:bg-amber-500/25 transition-colors disabled:opacity-40"
                  >
                    שלח הצעה למנהל המקצועי
                  </button>
                  <button
                    onClick={() => setProposing(null)}
                    className="text-white/30 hover:text-white text-xs px-3"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}