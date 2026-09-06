import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import { EVALUATION_CATEGORIES } from '@/lib/evaluationEngine';
import FootballBalls from './FootballBalls';

// ============================================================
// PlayerEvaluationForm — טופס הערכת שחקן
//
// 5 קטגוריות חובה (סולם 1-5) + רמת היכרות (3 רמות משקל).
// תצוגת כדורי רגל אינטראקטיבית — ללא מספרים יבשים.
// ============================================================

export default function PlayerEvaluationForm({ player, evaluator, onSubmitted }) {
  const { lang } = useTranslation();
  const strings = getEvaluationStrings(lang);
  const queryClient = useQueryClient();

  const [scores, setScores] = useState({
    technique: 0,
    game_intelligence: 0,
    physicality: 0,
    decision_making: 0,
    mentality: 0,
  });
  const [confidenceLevel, setConfidenceLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.PlayerEvaluation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-evaluations', player?.id] });
      setScores({ technique: 0, game_intelligence: 0, physicality: 0, decision_making: 0, mentality: 0 });
      setConfidenceLevel(null);
      setNotes('');
      setError('');
      onSubmitted?.();
    },
    onError: (err) => setError(err?.message || 'שגיאה בשמירת ההערכה'),
  });

  const handleScoreChange = (category, value) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = () => {
    // Validation: all 5 categories must be rated + confidence level selected
    const missingCategories = EVALUATION_CATEGORIES.filter(cat => scores[cat] === 0);
    if (missingCategories.length > 0) {
      setError('יש לדרג את כל 5 הקטגוריות');
      return;
    }
    if (!confidenceLevel) {
      setError('יש לבחור רמת היכרות');
      return;
    }

    submitMutation.mutate({
      player_id: player.id,
      player_name: player.full_name,
      club_id: player.club_id || evaluator?.data?.club_id || '',
      club_name: player.club_name || '',
      age_group: player.age_group || 'U18',
      evaluator_id: evaluator.id,
      evaluator_name: evaluator.full_name || '',
      evaluator_role: evaluator.role || 'coach',
      technique_score: scores.technique,
      game_intelligence_score: scores.game_intelligence,
      physicality_score: scores.physicality,
      decision_making_score: scores.decision_making,
      mentality_score: scores.mentality,
      confidence_level: confidenceLevel,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-xl p-5 space-y-6">
      <div>
        <h3 className="text-white font-black text-base mb-1">{strings.title}</h3>
        <p className="text-white/40 text-xs">{player?.full_name}</p>
      </div>

      {/* Category Ratings — Interactive Football Balls */}
      <div className="space-y-4">
        {EVALUATION_CATEGORIES.map(cat => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/70 text-sm font-bold">{strings.categories[cat]}</span>
              {scores[cat] > 0 && (
                <span className="text-[10px] font-bold text-[#D4AF37]">{strings.labels[scores[cat]]}</span>
              )}
            </div>
            <FootballBalls
              score={scores[cat]}
              size={28}
              interactive
              onChange={(val) => handleScoreChange(cat, val)}
            />
          </div>
        ))}
      </div>

      {/* Confidence Level Selector */}
      <div>
        <h4 className="text-white/70 text-sm font-bold mb-2">{strings.confidenceTitle}</h4>
        <p className="text-white/30 text-[10px] mb-3">{strings.confidenceHint}</p>
        <div className="space-y-2">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setConfidenceLevel(level)}
              className={`w-full text-right p-3 rounded-lg border-2 transition-all flex items-center justify-between gap-3 ${
                confidenceLevel === level
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                  : 'bg-[#0D1B2A] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  confidenceLevel === level ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'
                }`}>
                  {confidenceLevel === level && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#0B0F1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-white/80 text-xs font-medium">{strings.confidence[level]}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                level === 1
                  ? 'bg-green-500/15 text-green-400'
                  : level === 2
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-red-500/15 text-red-400'
              }`}>
                {strings.confidenceWeight[level]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-white/70 text-sm font-bold mb-2 block">{strings.notes}</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={strings.notesPlaceholder}
          rows={3}
          className="w-full bg-[#0D1B2A] border border-white/10 rounded-lg p-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/40 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="w-full bg-[#D4AF37] text-[#0B0F1A] font-black text-sm py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? strings.submitting : strings.submit}
      </button>
    </div>
  );
}