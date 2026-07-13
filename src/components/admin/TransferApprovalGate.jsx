import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, FolderLock } from 'lucide-react';
import { computeTransferReadiness } from '@/lib/transferDocumentRequirements';
import TransferDocumentsChecklist from '../transfer/TransferDocumentsChecklist';

// Validates every regulatory rule required before a director can finally approve a
// transfer, and gives one-click access to every document the federation requires.
export default function TransferApprovalGate({ proposal, onReadyChange }) {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['transfer-documents', proposal.id],
    queryFn: () => base44.entities.TransferDocument.filter({ transfer_id: proposal.id }, '-created_date', 50),
  });

  const { category, checks, ready } = computeTransferReadiness(proposal, docs);

  useEffect(() => {
    onReadyChange?.(ready);
  }, [ready]);

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
            ⚠️ לא ניתן לאשר סופית עד להשלמת כל הדרישות מעלה — התאחדות הכדורגל דורשת תיעוד מלא לפני רישום ההעברה.
          </p>
        )}
      </div>

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-3 uppercase tracking-widest">
          <FolderLock size={12} /> כספת מסמכי העברה — גישה מלאה ({category})
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