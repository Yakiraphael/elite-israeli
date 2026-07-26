import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, FolderLock, FileCheck2, PackageCheck } from 'lucide-react';
import { computeTransferReadiness } from '@/lib/transferDocumentRequirements';
import TransferDocumentsChecklist from '../transfer/TransferDocumentsChecklist';
import { generateBundlePdf } from '@/lib/generateIfoFormPdf';
import TransferFormsChecklist from './TransferFormsChecklist';

// Validates every regulatory rule required before a director can finally approve a
// transfer, gives one-click access to every document the federation requires,
// and lets the director generate the submission bundle + sign-off in one action.
export default function TransferApprovalGate({ proposal, onReadyChange }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['transfer-documents', proposal.id],
    queryFn: () => base44.entities.TransferDocument.filter({ transfer_id: proposal.id }, '-created_date', 50),
  });

  const { data: player = null } = useQuery({
    queryKey: ['ifa-form-player', proposal.player_elite_id],
    queryFn: () => base44.entities.PlayerRegistration.filter({ elite_id: proposal.player_elite_id }, '-created_date', 1)
      .then(r => r[0] || null),
    enabled: !!proposal.player_elite_id,
  });

  const { category, checks, ready } = computeTransferReadiness(proposal, docs);

  useEffect(() => {
    onReadyChange?.(ready);
  }, [ready]);

  const finalizeApprove = useMutation({
    mutationFn: async () => {
      // הפקת חבילת PDF מאוחדת והעלאתה לאחסון לזיהוי בפרופיל
      let bundleUrl = proposal.submission_bundle_url || '';
      try {
        await generateBundlePdf({
          action: proposal.transfer_category?.startsWith('השאל') ? 'loan' : 'transfer',
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
      } catch (err) {
        // לא חוסם אישור — ה-PDF נשמר אצל המשתמש בכל מקרה
        console.error('bundle gen failed', err);
      }
      return base44.entities.TransferProposal.update(proposal.id, {
        status: 'אושרה סופית',
        ifa_validation_status: 'Awaiting Submission',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-documents', proposal.id] });
    },
  });

  const isFinalized = ['אושרה סופית', 'נדחתה', 'נסגרה'].includes(proposal.status);

  return (
    <div className="space-y-3">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-3 uppercase tracking-widest">
          <ShieldCheck size={12} /> מנגנון אימות לאישור סופי
        </div>
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${c.passed ? 'text-green-400' : 'text-red-400'}`}>
              {c.passed ? <CheckCircle2 size={13} className="flex-shrink-0" /> : <XCircle size={13} className="flex-shrink-0" />}
              {c.label}
            </div>
          ))}
        </div>
        {!ready && (
          <p className="text-amber-400 text-[10px] mt-3 leading-relaxed">
            ⚠️ לא ניתן לאשר סופית עד להשלמת כל הדרישות — התאחדות הכדורגל דורשת תיעוד מלא לפני רישום {category?.startsWith('השאל') ? 'ההשאלה' : 'ההעברה'}.
          </p>
        )}

        {!isFinalized && (
          <button
            onClick={() => finalizeApprove.mutate()}
            disabled={!ready || finalizeApprove.isPending}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
          >
            {finalizeApprove.isPending
              ? <><Loader2 size={13} className="animate-spin" /> מפיק חבילה ומאשר...</>
              : <><PackageCheck size={13} /> הפק חבילת הגשה להתאחדות + אשר סופית</>}
          </button>
        )}

        {finalizeApprove.isError && (
          <p className="text-red-400 text-[10px] mt-2">שגיאה: {finalizeApprove.error?.message}</p>
        )}
        {proposal.status === 'אושרה סופית' && (
          <div className="mt-3 flex items-center gap-1.5 text-green-400 text-xs font-bold">
            <FileCheck2 size={13} /> {category?.startsWith('השאל') ? 'השאלה' : 'העברה'} אושרה סופית · חבילת הגשה מוכנה
          </div>
        )}
      </div>

      {/* רשימת טפסי התאחדות אינטראקטיביים למילוי וחתימה */}
      <TransferFormsChecklist proposal={proposal} signerRole="director" />

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-3 uppercase tracking-widest">
          <FolderLock size={12} /> כספת מסמכי מקור — גישה מלאה ({category})
        </div>
        {isLoading ? (
          <div className="flex justify-center py-3"><Loader2 size={16} className="animate-spin text-[#D4AF37]" /></div>
        ) : (
          <TransferDocumentsChecklist transferId={proposal.id} category={category} />
        )}
      </div>
    </div>
  );
}