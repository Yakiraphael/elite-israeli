import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, FileSignature, ScrollText, ShieldCheck } from 'lucide-react';
import { buildFullClauseMatrix } from '@/lib/contractClauses';
import ClauseCard from './ClauseCard';
import NegotiationTimeline from './NegotiationTimeline';

// מסך מובנה ייעודי לתיעוד מלא של כל סעיפי החוזה ומשא ומתן סעיף-אחר-סעיף.
// עקרונות: שקיפות מוחלטת · הפרדת הרשאות קשיחה · תיעוד היסטורי עם Logged By.
export default function ContractClausesView({ proposal, player, role = 'club', currentUser }) {
  const { user: authUser } = useAuth();
  const curUser = currentUser || authUser;
  const [showTimeline, setShowTimeline] = useState(true);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['negotiation-requests', proposal.id],
    queryFn: () => base44.entities.NegotiationRequest.filter({ transfer_id: proposal.id }, '-created_date', 200),
    enabled: !!proposal?.id,
  });

  const matrix = buildFullClauseMatrix(requests, proposal || {});
  const activeDrafts = requests.filter(r => r.status === 'pending').length;
  const resolvedClauses = matrix.reduce((n, g) => n + g.clauses.filter(c => c.clubValue && !c.history.some(h => h.status === 'pending')).length, 0);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={16} className="animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת */}
      <div className="bg-[#0D1B2A] border border-[#D4AF37]/20 rounded-lg p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileSignature size={16} className="text-[#D4AF37]" />
            <h3 className="text-white font-black text-sm">תיק סעיפי חוזה — תיעוד מלא</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded-full">{activeDrafts} הצעות פתוחות</span>
            <span className="text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">{resolvedClauses} סעיפים רשמיים</span>
            <span className="text-white/40 bg-white/5 border border-white/20 px-2 py-1 rounded-full">{role === 'club' ? 'מצב מנהל מקצועי' : 'מצב שחקן/אפוטרופוס'}</span>
          </div>
        </div>
        <p className="text-white/40 text-[11px] leading-relaxed mt-2 flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-[#D4AF37]" />
          כל סעיף מוצג בנפרד עם הגרסה הנוכחית, הגורם האחרון שנגע בו, וסטטוס ההסכמה. עריכה ישירה נעולה למועדון; שחקן/אפוטרופוס רשאים להגיש הצעות (Draft) בלבד. כל פעולה נרשמת ב-Audit Trail.
        </p>
      </div>

      {/* קטגוריות מובנות */}
      {matrix.map(cat => {
        if (!cat.clauses.length) return null;
        return (
          <div key={cat.id} className="bg-[#0D1B2A]/40 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ScrollText size={12} className="text-[#D4AF37]" />
              <h4 className="text-[#D4AF37] text-xs font-black">{cat.label}</h4>
            </div>
            <p className="text-white/40 text-[10px] mb-3">{cat.description}</p>
            <div className="space-y-2">
              {cat.clauses.map(clause => (
                <ClauseCard key={clause.clauseKey + clause.clauseLabel}
                  clause={clause} proposal={proposal} player={player} role={role} currentUser={curUser} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ציר זמן — Audit Trail מלא (קריסה כברירת מחדל) */}
      <div className="bg-[#0D1B2A]/40 border border-white/10 rounded-lg p-3">
        <button onClick={() => setShowTimeline(s => !s)}
          className="w-full flex items-center justify-between text-white/60 text-xs font-bold mb-3">
          <span className="flex items-center gap-1.5"><ScrollText size={12} /> ציר זמן — יומן ביקורת מלא (Audit Trail)</span>
          <span className="text-white/40 text-[10px]">{showTimeline ? '▲ הסתר' : '▼ הצג'}</span>
        </button>
        {showTimeline && <NegotiationTimeline proposalId={proposal.id} proposal={proposal} />}
      </div>
    </div>
  );
}