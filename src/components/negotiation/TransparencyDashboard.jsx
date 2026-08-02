import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, GitCompareArrows, ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle, Building2, User } from 'lucide-react';
import { buildClauseMatrix } from '@/lib/negotiationAudit';
import { computeTransferReadiness, REQUIRED_DOCS } from '@/lib/transferDocumentRequirements';

// לוח שקיפות — "מסלול ההתנגשות" בין המועדון לשחקן/אפוטרופוס.
// מציג לכל סעיף: עמדת המועדון (current) מול הצעת השחקן (latest) + סטטוס + חיווי תקינות מול ההתאחדות.
// משולב בדשבורד המנהל (עריכה) ובפורטל השחקן/אפוטרופוס (צפייה בלבד).

const STATUS_META = {
  pending:  { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: 'ממתין לתגובת המועדון' },
  accepted: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', label: 'אושר ויושם' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'נדחה' },
};

export default function TransparencyDashboard({ proposal, role = 'club' }) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['negotiation-requests', proposal?.id],
    queryFn: () => base44.entities.NegotiationRequest.filter({ transfer_id: proposal.id }, '-created_date', 100),
    enabled: !!proposal?.id,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['transfer-docs', proposal?.id],
    queryFn: () => base44.entities.TransferDocument.filter({ transfer_id: proposal.id }, '-created_date', 50),
    enabled: !!proposal?.id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-white/30" /></div>;
  }

  const matrix = buildClauseMatrix(requests, proposal || {});
  const readiness = computeTransferReadiness(proposal || {}, docs);
  const requiredDocs = (REQUIRED_DOCS[readiness.category] || []).filter(d => !d.optional);
  const pendingDocs = readiness.checks.find(c => Array.isArray(c.missingDocs))?.missingDocs || [];

  return (
    <div className="space-y-3" dir="rtl">
      {/* כותרת לוח שקיפות */}
      <div className="bg-[#0D1B2A] border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-black">
            <GitCompareArrows size={14} /> מסלול השקיפות — עמדות הצדדים לכל סעיף
          </div>
          <span className="text-white/30 text-[9px]">{role === 'club' ? 'מצב מנהל מקצועי' : 'מצב שחקן/אפוטרופוס'}</span>
        </div>
        <p className="text-white/40 text-[10px] leading-relaxed mt-1.5">
          כל סעיף מציג את עמדת המועדון הנוכחית אל מול הצעת השחקן/אפוטרופוס. עריכה ישירה נעולה למועדון; השחקן מציע שינויים דרך מרכז המשא ומתן.
        </p>
      </div>

      {/* טבלת מסלול ההתנגשות */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#0D1B2A]/60 border-b border-white/10 text-[9px] font-black uppercase tracking-wide text-white/40">
          <div className="col-span-3">סעיף</div>
          <div className="col-span-3 flex items-center gap-1"><Building2 size={10} /> עמדת המועדון</div>
          <div className="col-span-3 flex items-center gap-1"><User size={10} /> הצעת השחקן</div>
          <div className="col-span-3">סטטוס</div>
        </div>

        {matrix.length === 0 ? (
          <div className="px-3 py-6 text-center text-white/30 text-[11px]">
            עדיין לא הוגשו הצעות שינוי. הסעיפים משקפים את טיוטת המועדון הראשונית.
          </div>
        ) : (
          matrix.map((c) => {
            const sm = STATUS_META[c.latestStatus] || STATUS_META.pending;
            const SIcon = sm.icon;
            const conflict = c.clubValue && c.latestProposal && c.clubValue !== c.latestProposal && c.latestStatus === 'pending';
            return (
              <div key={c.clauseKey} className={`grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 text-[11px] ${conflict ? 'bg-amber-500/5' : ''}`}>
                <div className="col-span-3 text-white font-bold">{c.clauseLabel}</div>
                <div className="col-span-3 text-white/80">{c.clubValue || '—'}</div>
                <div className="col-span-3 text-[#D4AF37] font-bold">{c.latestProposal || '—'}</div>
                <div className="col-span-3">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${sm.bg} ${sm.color} ${sm.border}`}>
                    <SIcon size={10} /> {sm.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* שער תקינות מול ההתאחדות — חיווי חסמים מערכתיים לפני הגשת הטיוטה */}
      <div className="bg-[#0D1B2A] border border-cyan-500/20 rounded-lg p-3">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black mb-2">
          <ShieldCheck size={13} /> חסמים מערכתיים מול ההתאחדות ({readiness.category})
        </div>
        <div className="space-y-1.5">
          {readiness.checks.map((chk, i) => {
            const ok = chk.passed;
            const missing = chk.missingDocs || [];
            return (
              <div key={i} className="flex items-start gap-1.5 text-[11px]">
                {ok
                  ? <CheckCircle2 size={11} className="text-green-400 mt-0.5 flex-shrink-0" />
                  : <AlertTriangle size={11} className="text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="min-w-0">
                  <span className={ok ? 'text-white/60' : 'text-red-400 font-bold'}>{chk.label}</span>
                  {!ok && missing.length > 0 && (
                    <div className="text-white/30 text-[9px] mt-0.5">חסרים: {missing.map(m => m.label).join(', ')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
          <span className="text-white/40">מסמכים נדרשים: {requiredDocs.length - pendingDocs.length}/{requiredDocs.length}</span>
          <span className={readiness.ready ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {readiness.ready ? '✓ מוכן להגשה' : '✗ חסום — השלם דרישות'}
          </span>
        </div>
      </div>
    </div>
  );
}