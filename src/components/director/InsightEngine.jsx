import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

export default function InsightEngine({ players, payments }) {
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['all-mental-assessments'],
    queryFn: () => base44.entities.MentalAssessment.list('assessment_date', 1000),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  // Talent detection: players with 2+ assessments and meaningful score improvement
  const talents = players.map(p => {
    const playerAssessments = assessments.filter(a => a.player_id === p.id).sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date));
    if (playerAssessments.length < 2) return null;
    const first = playerAssessments[0].mental_score_nlp;
    const last = playerAssessments[playerAssessments.length - 1].mental_score_nlp;
    const improvement = last - first;
    if (improvement >= 15) return { player: p, improvement, first, last };
    return null;
  }).filter(Boolean).sort((a, b) => b.improvement - a.improvement);

  // Churn risk: player has an overdue payment 60+ days past due
  const now = new Date();
  const churnRisks = players.map(p => {
    const overdue = payments.filter(pay => pay.player_id === p.id && pay.status === 'Overdue' && Math.ceil((now - new Date(pay.due_date)) / (1000 * 60 * 60 * 24)) >= 60);
    if (overdue.length === 0) return null;
    return { player: p, daysOverdue: Math.max(...overdue.map(pay => Math.ceil((now - new Date(pay.due_date)) / (1000 * 60 * 60 * 24)))) };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-[#1B263B] border border-green-500/20 rounded-lg p-5">
        <h3 className="text-green-400 font-black text-sm mb-3 flex items-center gap-2">
          <Sparkles size={14} /> זיהוי כישרונות — שיפור מנטלי משמעותי
        </h3>
        {talents.length === 0 ? <p className="text-white/30 text-xs">אין שיפורים משמעותיים לאחרונה</p> : (
          <div className="space-y-2">
            {talents.map(t => (
              <div key={t.player.id} className="flex items-center justify-between bg-[#0D1B2A] rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-white font-bold">{t.player.full_name}</span>
                  <span className="text-white/40">{t.player.position}</span>
                </div>
                <span className="text-green-400 font-bold">+{t.improvement.toFixed(0)} נק׳ ({t.first.toFixed(0)}→{t.last.toFixed(0)}) — כדאי לשקול חוזה נוער</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1B263B] border border-red-500/20 rounded-lg p-5">
        <h3 className="text-red-400 font-black text-sm mb-3 flex items-center gap-2">
          <AlertTriangle size={14} /> סיכון נטישה — חוב פתוח מעל 60 יום
        </h3>
        {churnRisks.length === 0 ? <p className="text-white/30 text-xs">אין סיכוני נטישה כרגע</p> : (
          <div className="space-y-2">
            {churnRisks.map(c => (
              <div key={c.player.id} className="flex items-center justify-between bg-[#0D1B2A] rounded-lg p-3 text-xs">
                <span className="text-white font-bold">{c.player.full_name}</span>
                <span className="text-red-400 font-bold">חוב פתוח {c.daysOverdue} יום — סיכון גבוה לעזיבה</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}