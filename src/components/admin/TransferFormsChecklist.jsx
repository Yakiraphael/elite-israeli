import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Download, PenLine, ShieldCheck, CheckCircle2, Circle, FileSignature } from 'lucide-react';
import { generateFormPdf, generateBundleZip } from '@/lib/generateIfoFormPdf';
import {
  buildSubmissionBundle, IFA_FORM_CATALOG,
  deriveActionFromCategory, deriveTransferSubType, loanCategoryToAgeGroup,
} from '@/lib/ifaFormRegistry';
import IFAFormSignModal from './IFAFormSignModal';

// רשימת טפסי ההתאחדות הנדרשים לכל שלב במעבר/השאלה, עם מילוי+חתימה אינטראקטיביים.
// signerRole נקבע אוטומטית מההקשר של הקורא (admin/director) או מועבר explicit.
export default function TransferFormsChecklist({ proposal, signerRole = 'director' }) {
  const [busy, setBusy] = useState({});
  const [signModal, setSignModal] = useState(null); // form_key when open
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      try { setCurrentUser(await base44.auth.me()); } catch { setCurrentUser(null); }
    })();
  }, []);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['transfer-docs', proposal.id],
    queryFn: () => base44.entities.TransferDocument.filter({ transfer_id: proposal.id }, '-created_date', 50),
  });

  const { data: player = null } = useQuery({
    queryKey: ['ifa-form-player', proposal.player_elite_id],
    queryFn: () => base44.entities.PlayerRegistration.filter({ elite_id: proposal.player_elite_id }, '-created_date', 1)
      .then(r => r[0] || null),
    enabled: !!proposal.player_elite_id,
  });

  const isAdult = proposal.is_adult;
  const action = deriveActionFromCategory(proposal.transfer_category);
  const transfer_sub_type = deriveTransferSubType(proposal.transfer_category);
  const age_group = isAdult ? 'adult' : 'minor';
  const bundle = buildSubmissionBundle({
    action,
    age_group,
    transfer_sub_type,
    is_international: transfer_sub_type === 'international',
    transfer_category: proposal.transfer_category,
  });
  const allForms = [...bundle.mainForms, ...bundle.supporting];

  const sigStatus = (form) => {
    if (form.category !== 'supporting_doc') {
      const matching = docs.find(d => d.doc_type === form.key || d.doc_label === form.label);
      if (matching?.status === 'נחתם דיגיטלית' || matching?.status === 'אושר') return 'signed';
      if (matching?.file_url) return 'uploaded';
      return 'missing';
    }
    if (!player) return 'missing';
    if (form.key === 'medical_certificate') return player.medical_certificate_url ? 'uploaded' : 'missing';
    if (form.key === 'id_document') return player.id_document_url ? 'uploaded' : 'missing';
    if (form.key === 'id_suffix') return (player.id_suffix_url) ? 'uploaded' : 'missing';
    return 'missing';
  };

  const handleGenerate = async (form) => {
    setBusy(b => ({ ...b, [form.key]: true }));
    try {
      await generateFormPdf({
        form_key: form.key,
        player,
        club: { club_name: proposal.club_name, contact_name: proposal.contact_name },
        transfer: {
          club_to: proposal.club_name,
          club_from: player?.team_name,
          transfer_category: proposal.transfer_category,
          contract_value: proposal.contract_value,
          iefa_commission_fee: proposal.iefa_commission_fee,
          loan_start_date: proposal.loan_start_date,
          loan_end_date: proposal.loan_end_date,
        },
      });
    } finally {
      setBusy(b => ({ ...b, [form.key]: false }));
    }
  };

  const handleBundle = async () => {
    setBusy(b => ({ ...b, __bundle: true }));
    try {
      await generateBundleZip({
        action,
        player,
        club: { club_name: proposal.club_name, contact_name: proposal.contact_name },
        transfer: {
          club_to: proposal.club_name,
          club_from: player?.team_name,
          transfer_category: proposal.transfer_category,
          contract_value: proposal.contract_value,
          iefa_commission_fee: proposal.iefa_commission_fee,
          loan_start_date: proposal.loan_start_date,
          loan_end_date: proposal.loan_end_date,
        },
        transfer_category: proposal.transfer_category,
      });
    } finally {
      setBusy(b => ({ ...b, __bundle: false }));
    }
  };

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-[#D4AF37]" /></div>;

  const STATUS_UI = {
    signed: { label: 'נחתם דיגיטלית', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', Icon: CheckCircle2 },
    uploaded: { label: 'הועלה/נמצא', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', Icon: ShieldCheck },
    missing: { label: 'חסר', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', Icon: Circle },
  };

  const requirementSignatures = (form) => {
    const sigs = form.required_signatures || [];
    const done = [];
    if (sigs.includes('guardian')) done.push({ label: 'אפוטרופוס', ok: !!proposal.guardian_otp_verified });
    if (sigs.includes('player')) done.push({ label: 'שחקן', ok: !!proposal.player_consent });
    if (sigs.includes('club_sending') || sigs.includes('club_receiving') || sigs.includes('club') || sigs.includes('club_owner') || sigs.includes('club_loan')) {
      done.push({ label: 'מועדון', ok: docs.some(d => d.doc_type === form.key && d.status === 'נחתם דיגיטלית') });
    }
    return done;
  };

  const isLoan = action === 'loan';

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold">
          <FileText size={13} className="text-[#D4AF37]" />
          טפסי ההתאחדות ל{isLoan ? 'השאלה' : 'העברה'} — שלב נוכחי
        </div>
        <button
          onClick={handleBundle}
          disabled={busy.__bundle || !player}
          className="flex items-center gap-1.5 text-[10px] font-bold bg-[#D4AF37] text-[#0D1B2A] px-3 py-1.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40"
        >
          {busy.__bundle ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
          הורד ZIP מלא
        </button>
      </div>

      {!player && (
        <div className="text-amber-400/70 text-[10px] mb-3">⚠ שחקן לא מקושר — הפקת PDF תהיה לא מלאה. ודא Elite ID תואם.</div>
      )}

      {isLoan && (!proposal.loan_start_date || !proposal.loan_end_date) && (
        <div className="text-amber-400/70 text-[10px] mb-3 flex items-center gap-1">
          <ShieldCheck size={11} /> תקופת ההשאלה חסרה — עדכן תאריכי תחילה וסיום בכרטיס ההצעה.
        </div>
      )}

      <div className="space-y-2">
        {allForms.map((form, idx) => {
          const status = sigStatus(form);
          const ui = STATUS_UI[status];
          const isSupporting = form.category === 'supporting_doc';
          const canSign = !isSupporting && (form.category === 'transfer' || form.category === 'loan' || form.category === 'guardian_consent');
          const sigs = requirementSignatures(form);
          return (
            <div key={form.key + idx} className="flex items-center gap-3 p-2.5 bg-[#1B263B]/50 border border-white/5 rounded-sm">
              <ui.Icon size={13} className={ui.color} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold">{form.label}</div>
                <div className="text-white/30 text-[10px] truncate">{form.ifa_form_reference}</div>
                {sigs.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {sigs.map(s => (
                      <span key={s.label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.ok ? 'text-green-400 bg-green-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                        {s.ok ? '✓' : '⏳'} {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ui.color} ${ui.bg} ${ui.border} flex-shrink-0`}>{ui.label}</span>
              {!isSupporting && (
                <>
                  <button
                    onClick={() => setSignModal(form.key)}
                    disabled={busy[form.key]}
                    title="מילוי + חתימה דיגיטלית"
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-sm bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors flex-shrink-0 disabled:opacity-40"
                  >
                    <FileSignature size={11} /> מלא וחתום
                  </button>
                  <button
                    onClick={() => handleGenerate(form)}
                    disabled={busy[form.key]}
                    title="הפק PDF ללא חתימה"
                    className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40"
                  >
                    {busy[form.key] ? <Loader2 size={11} className="animate-spin text-white/50" /> : <PenLine size={11} className="text-white/50" />}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] flex-wrap">
        {proposal.guardian_otp_verified ? (
          <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={11} /> חתימת אפוטרופוס אומתה</span>
        ) : !isAdult && (
          <span className="text-amber-400 flex items-center gap-1"><PenLine size={11} /> ממתין לחתימת אפוטרופוס מהפורטל</span>
        )}
        {isAdult && proposal.player_consent && (
          <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={11} /> הסכמת שחקן נרשמה</span>
        )}
      </div>

      {signModal && (
        <IFAFormSignModal
          formKey={signModal}
          proposal={proposal}
          player={player}
          club={{ club_name: proposal.club_name, contact_name: proposal.contact_name }}
          transfer={{
            club_to: proposal.club_name,
            club_from: player?.team_name,
            transfer_category: proposal.transfer_category,
            contract_value: proposal.contract_value,
            iefa_commission_fee: proposal.iefa_commission_fee,
            loan_start_date: proposal.loan_start_date,
            loan_end_date: proposal.loan_end_date,
          }}
          signerRole={signerRole}
          currentUser={currentUser}
          onClose={() => setSignModal(null)}
        />
      )}
    </div>
  );
}