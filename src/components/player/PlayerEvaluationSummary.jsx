import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import { computeAggregatedEvaluation, EVALUATION_CATEGORIES } from '@/lib/evaluationEngine';
import FootballBalls from './FootballBalls';
import TierBadge from './TierBadge';
import PlayerEvaluationForm from './PlayerEvaluationForm';

// ============================================================
// PlayerEvaluationSummary — תצוגת פרופיל הערכה מצטברת
//
// חוק הברזל: אף מספר יבש אינו מוצג. הממוצע המשוקלל מוצג
// באמצעות כדורי רגל + כרטיס דירוג רמה (A5–B1).
// ============================================================

export default function PlayerEvaluationSummary({ player, evaluator, canEvaluate = false }) {
  const { lang } = useTranslation();
  const strings = getEvaluationStrings(lang);
  const [showForm, setShowForm] = useState(false);

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['player-evaluations', player?.id],
    queryFn: () => base44.entities.PlayerEvaluation.filter({ player_id: player.id }, '-created_date', 50),
    enabled: !!player?.id,
  });

  const aggregated = computeAggregatedEvaluation(evaluations);

  if (isLoading) {
    return (
      <div className="bg-[#1B263B] border border-white/10 rounded-xl p-5 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aggregated Evaluation Card */}
      <div className="bg-[#1B263B] border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base">{strings.overallTier}</h3>
          {aggregated.evaluationCount > 0 && (
            <span className="text-[10px] text-white/30">
              {aggregated.effectiveCount} {strings.effectiveReports} · {aggregated.evaluationCount} {strings.totalReports}
            </span>
          )}
        </div>

        {aggregated.evaluationCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm">{strings.noEvaluations}</p>
            {canEvaluate && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#D4AF37]/20 transition-colors"
              >
                + {strings.submit}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Overall Tier + Balls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <TierBadge tier={aggregated.tier} size="lg" showLabel strings={strings} />
            </div>
            <div className="flex items-center justify-center mb-6">
              <FootballBalls score={aggregated.overall} size={36} />
            </div>

            {/* Category Breakdown */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white/50 text-xs font-bold mb-3">{strings.categoryBreakdown}</h4>
              <div className="space-y-3">
                {EVALUATION_CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-medium">{strings.categories[cat]}</span>
                    <div className="flex items-center gap-3">
                      <FootballBalls score={aggregated.categoryScores[cat]} size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-weight note */}
            {aggregated.zeroWeightCount > 0 && (
              <div className="mt-4 text-[10px] text-white/25 text-center">
                {aggregated.zeroWeightCount} {strings.archivedReports}
              </div>
            )}

            {/* Add Evaluation Button */}
            {canEvaluate && !showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold py-2.5 rounded-lg hover:bg-[#D4AF37]/20 transition-colors"
              >
                + {strings.submit}
              </button>
            )}
          </>
        )}
      </div>

      {/* Evaluation Form (collapsible) */}
      {showForm && canEvaluate && evaluator && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">{strings.title}</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-white/40 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <PlayerEvaluationForm player={player} evaluator={evaluator} onSubmitted={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}