import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import { EVALUATION_CATEGORIES } from '@/lib/evaluationEngine';
import FootballBalls from '@/components/player/FootballBalls';
import { Loader2, CheckCircle2, FileText } from 'lucide-react';

// ============================================================
// UnifiedReportForm — טופס דיווח מאוחד (SSOT)
//
// טופס יחיד המשמש בו-זמנית כ:
//   1. מזין נתונים לדאטה-בייס (UnifiedReport)
//   2. בסיס לעדכון פרופיל השחקן (5 חמיזיות + דירוג A5-B1)
//   3. מחולל אוטומטי של מסמך ההערכה הרשמי
//
// מבטל את הכפילות בין דוח מעקב להערכת שחקן.
// ============================================================

const REPORT_TYPES = ['אימון', 'משחק תחרותי', 'סדנה', 'מחנה', 'תצפית יחיד'];

export default function UnifiedReportForm({ player, evaluator, session, team, onSubmitted, onCancel }) {
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
  const [reportType, setReportType] = useState('אימון');
  const [qualitative, setQualitative] = useState({
    summary: '',
    strengths: '',
    improvements: '',
    action_items: '',
    private_note: '',
  });
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  const submitMutation = useMutation({
    mutationFn: async (reportData) => {
      // שליחה למנוע הסנכרון — לא ישירות לישות
      const res = await base44.functions.invoke('unified-report-engine', {
        action: 'submit',
        report: reportData,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unified-reports', player?.id] });
      queryClient.invalidateQueries({ queryKey: ['player-evaluations', player?.id] });
      setSyncResult(data);
      setError('');
      // איפוס הטופס
      setScores({ technique: 0, game_intelligence: 0, physicality: 0, decision_making: 0, mentality: 0 });
      setConfidenceLevel(null);
      setQualitative({ summary: '', strengths: '', improvements: '', action_items: '', private_note: '' });
      onSubmitted?.(data);
    },
    onError: (err) => setError(err?.response?.data?.error || err?.message || 'שגיאה בשמירת הדוח'),
  });

  const handleScoreChange = (category, value) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = () => {
    const missingCategories = EVALUATION_CATEGORIES.filter(cat => scores[cat] === 0);
    if (missingCategories.length > 0) {
      setError('יש לדרג את כל 5 הקטגוריות המקצועיות');
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
      team_id: team?.id || player.team_id || '',
      team_name: team?.name || player.team_name || '',
      session_id: session?.id || '',
      session_label: session?.name || '',
      session_date: session?.date_start || new Date().toISOString().slice(0, 10),
      report_type: reportType,
      technique_score: scores.technique,
      game_intelligence_score: scores.game_intelligence,
      physicality_score: scores.physicality,
      decision_making_score: scores.decision_making,
      mentality_score: scores.mentality,
      confidence_level: confidenceLevel,
      summary: qualitative.summary.trim(),
      strengths: qualitative.strengths.trim(),
      improvements: qualitative.improvements.trim(),
      action_items: qualitative.action_items.trim(),
      private_note: qualitative.private_note.trim(),
    });
  };

  const allRated = EVALUATION_CATEGORIES.every(cat => scores[cat] > 0);

  return (
    <div className="bg-panel border border-hairline rounded-xl p-5 space-y-6">
      {/* כותרת */}
      <div>
        <h3 className="text-ink font-black text-base mb-1 flex items-center gap-2">
          <FileText size={16} className="text-brand" /> דוח מאוחד — מקור אמת יחיד
        </h3>
        <p className="text-ink-muted text-xs">
          {player?.full_name}
          {session?.name && ` · ${session.name}`}
          {team?.name && ` · ${team.name}`}
        </p>
      </div>

      {/* סוג דוח */}
      <div>
        <label className="text-ink-muted text-sm font-bold mb-2 block">סוג דוח</label>
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map(type => (
            <button key={type} type="button" onClick={() => setReportType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                reportType === type
                  ? 'bg-brand-soft border-brand text-brand'
                  : 'bg-panel-alt border-hairline text-ink-muted hover:border-hairline-strong'
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 5 קטגוריות — כדורי רגל אינטראקטיביים */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-ink-muted text-sm font-bold">5 קטגוריות מקצועיות (1-5)</h4>
          {allRated && (
            <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> כל הקטגוריות דרגו
            </span>
          )}
        </div>
        {EVALUATION_CATEGORIES.map(cat => (
          <div key={cat} className="bg-panel-alt rounded-lg p-3 border border-hairline">
            <div className="flex items-center justify-between mb-2">
              <span className="text-ink text-sm font-bold">{strings.categories[cat]}</span>
              {scores[cat] > 0 && (
                <span className="text-[10px] font-bold text-brand">{strings.labels[scores[cat]]}</span>
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

      {/* רמת היכרות — משפיעה על משקל הדיווח */}
      <div>
        <h4 className="text-ink-muted text-sm font-bold mb-1">{strings.confidenceTitle}</h4>
        <p className="text-ink-faint text-[10px] mb-3">{strings.confidenceHint}</p>
        <div className="space-y-2">
          {[1, 2, 3].map(level => (
            <button key={level} type="button" onClick={() => setConfidenceLevel(level)}
              className={`w-full text-right p-3 rounded-lg border-2 transition-all flex items-center justify-between gap-3 ${
                confidenceLevel === level
                  ? 'bg-brand-soft border-brand'
                  : 'bg-panel-alt border-hairline hover:border-hairline-strong'
              }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  confidenceLevel === level ? 'border-brand bg-brand' : 'border-hairline-strong'
                }`}>
                  {confidenceLevel === level && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="var(--brand-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-ink text-xs font-medium">{strings.confidence[level]}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                level === 1 ? 'bg-green-500/15 text-green-400'
                : level === 2 ? 'bg-amber-500/15 text-amber-400'
                : 'bg-red-500/15 text-red-400'
              }`}>
                {strings.confidenceWeight[level]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* שדות איכותיים — מוזנים ישירות למסמך ההערכה */}
      <div className="space-y-3">
        <h4 className="text-ink-muted text-sm font-bold">תוכן מקצועי — מוזן אוטומטית למסמך ההערכה</h4>
        <QualitativeField label="סיכום חופשי" value={qualitative.summary}
          onChange={v => setQualitative(p => ({ ...p, summary: v }))} rows={2} />
        <QualitativeField label="נקודות חוזק" value={qualitative.strengths}
          onChange={v => setQualitative(p => ({ ...p, strengths: v }))} rows={2} />
        <QualitativeField label="תחומים לשיפור" value={qualitative.improvements}
          onChange={v => setQualitative(p => ({ ...p, improvements: v }))} rows={2} />
        <QualitativeField label="פעולות נדרשות / תכנון הבא" value={qualitative.action_items}
          onChange={v => setQualitative(p => ({ ...p, action_items: v }))} rows={2} />
        <QualitativeField label="הערה פנימית (לא מוצגת לשחקן)" value={qualitative.private_note}
          onChange={v => setQualitative(p => ({ ...p, private_note: v }))} rows={2} />
      </div>

      {/* שגיאה */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* תוצאת סנכרון — אישור ויזואלי */}
      {syncResult && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
            <CheckCircle2 size={16} /> דוח נשמר וסונכרן בהצלחה
          </div>
          <div className="text-xs text-ink-muted space-y-1">
            <div>רמת איכות מעודכנת: <span className="text-brand font-bold">{syncResult.aggregated?.tier}</span></div>
            <div>דוחות פעילים: {syncResult.aggregated?.effectiveCount} / {syncResult.aggregated?.evaluationCount}</div>
            <div>פרופיל עודכן: ✅ חמיזיות + דירוג + מסמך הערכה</div>
          </div>
        </div>
      )}

      {/* כפתורי פעולה */}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="flex-1 bg-brand text-brand-ink font-black text-sm py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {submitMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> שומר ומסנכרן...</>
          ) : (
            'שמור דוח + סנכרן פרופיל'
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 bg-panel-alt border border-hairline text-ink-muted text-sm font-bold rounded-lg hover:bg-surface-alt transition-colors">
            ביטול
          </button>
        )}
      </div>
    </div>
  );
}

function QualitativeField({ label, value, onChange, rows = 2 }) {
  return (
    <div>
      <label className="text-ink-muted text-xs font-bold mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-surface border border-hairline rounded-lg p-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-brand resize-none"
        placeholder={`${label}...`}
      />
    </div>
  );
}