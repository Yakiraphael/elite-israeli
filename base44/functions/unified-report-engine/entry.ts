import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  computeAggregatedEvaluation,
  scoreToTier,
  scoreToBalls,
  CONFIDENCE_WEIGHTS,
  EVALUATION_CATEGORIES,
} from '../../shared/evaluationEngine.ts';

// ============================================================
// unified-report-engine — מנוע סנכרון SSOT (Single Source of Truth)
//
// מבטל את הכפילות בין דוחות מעקב להערכות שחקן.
// טופס דיווח יחיד (UnifiedReport) מזין בזרימה חד-כיוונית:
//   טופס → מנוע אגרגציה → פרופיל שחקן + מסמך הערכה אוטומטי
//
// פעולות (action):
//   submit   — שמירת דוח + אגרגציה מיידית + סנכרון פרופיל + יצירת מסמך
//   aggregate — חישוב מחדש של שחקן (ללא שמירת דוח חדש)
//   document — יצירת/שליפת מסמך הערכה רשמי
//
// RBAC: מאמן/מנהל מקצועי/אדמין יכולים לשלוח דוחות.
//       אגרגציה זמינה לכל משתמש מאומת בתחום המועדון.
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ---------- submit: שמירת דוח + אגרגציה + סנכרון ----------
    if (action === 'submit') {
      const canReport = ['admin', 'director', 'coach'].includes(user.role);
      if (!canReport) return Response.json({ error: 'Forbidden — דיווח מותר למאמן/מנהל מקצועי/אדמין' }, { status: 403 });

      const r = body.report;
      if (!r) return Response.json({ error: 'נדרש report' }, { status: 400 });
      if (!r.player_id || !UUID_RE.test(r.player_id)) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
      }

      // ולידציית 5 קטגוריות חובה
      for (const cat of EVALUATION_CATEGORIES) {
        const score = r[`${cat}_score`];
        if (typeof score !== 'number' || score < 1 || score > 5) {
          return Response.json({ error: 'Invalid request' }, { status: 400 });
        }
      }
      // ולידציית רמת היכרות
      if (![1, 2, 3].includes(r.confidence_level)) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
      }

      // 1. שמירת הדוח בישות UnifiedReport
      const report = await base44.entities.UnifiedReport.create({
        player_id: r.player_id,
        player_name: r.player_name || '',
        club_id: r.club_id || user.data?.club_id || '',
        club_name: r.club_name || '',
        age_group: r.age_group || 'U18',
        team_id: r.team_id || '',
        team_name: r.team_name || '',
        session_id: r.session_id || '',
        session_label: r.session_label || '',
        session_date: r.session_date || new Date().toISOString().slice(0, 10),
        report_type: r.report_type || 'אימון',
        technique_score: r.technique_score,
        game_intelligence_score: r.game_intelligence_score,
        physicality_score: r.physicality_score,
        decision_making_score: r.decision_making_score,
        mentality_score: r.mentality_score,
        confidence_level: r.confidence_level,
        summary: r.summary || '',
        strengths: r.strengths || '',
        improvements: r.improvements || '',
        action_items: r.action_items || '',
        private_note: r.private_note || '',
        evaluator_id: user.id,
        evaluator_name: user.full_name || '',
        evaluator_role: user.role || 'coach',
      });

      // 2. אגרגציה מיידית — שליפת כל דוחות השחקן וחישוב ממוצע משוקלל
      const allReports = await base44.asServiceRole.entities.UnifiedReport.filter(
        { player_id: r.player_id }, '-created_date', 200
      );
      const aggregated = computeAggregatedEvaluation(allReports);

      // 3. סנכרון לפרופיל השחקן — עדכון overall_rating + tier + timestamp
      const playerPatch: Record<string, any> = {
        overall_rating: Math.round(aggregated.overall * 100) / 100,
        evaluation_tier: aggregated.tier,
        last_evaluation_at: new Date().toISOString(),
      };

      // 4. יצירת מסמך הערכה רשמי אוטומטי
      const latestReport = allReports[0]; // already sorted -created_date
      const docContent = generateEvaluationDocument({
        playerName: r.player_name || '',
        tier: aggregated.tier,
        overall: aggregated.overall,
        categoryScores: aggregated.categoryScores,
        evaluationCount: aggregated.evaluationCount,
        effectiveCount: aggregated.effectiveCount,
        zeroWeightCount: aggregated.zeroWeightCount,
        latestReport,
      });
      playerPatch.evaluation_doc_content = docContent;

      await base44.asServiceRole.entities.PlayerRegistration.update(r.player_id, playerPatch);

      // 5. תיעוד ביומן ביקורת
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          actor_id: user.id,
          actor_name: user.full_name || '',
          actor_role: user.role,
          action: 'status_change',
          player_id: r.player_id,
          club_id: r.club_id || user.data?.club_id || '',
          details: `דוח מאוחד נשמר — רמה ${aggregated.tier}, ${aggregated.effectiveCount} דוחות פעילים`,
        });
      } catch { /* תיעוד בלבד */ }

      return Response.json({
        report,
        aggregated,
        syncedProfile: {
          overall_rating: playerPatch.overall_rating,
          evaluation_tier: playerPatch.evaluation_tier,
          last_evaluation_at: playerPatch.last_evaluation_at,
        },
        evaluationDocument: docContent,
      });
    }

    // ---------- aggregate: חישוב מחדש ללא שמירת דוח ----------
    if (action === 'aggregate') {
      const { player_id } = body;
      if (!player_id || !UUID_RE.test(player_id)) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
      }

      const allReports = await base44.asServiceRole.entities.UnifiedReport.filter(
        { player_id }, '-created_date', 200
      );
      const aggregated = computeAggregatedEvaluation(allReports);

      // סנכרון פרופיל
      const playerPatch = {
        overall_rating: Math.round(aggregated.overall * 100) / 100,
        evaluation_tier: aggregated.tier,
        last_evaluation_at: new Date().toISOString(),
      };
      await base44.asServiceRole.entities.PlayerRegistration.update(player_id, playerPatch);

      return Response.json({ aggregated, synced: playerPatch });
    }

    // ---------- document: יצירת/שליפת מסמך הערכה ----------
    if (action === 'document') {
      const { player_id } = body;
      if (!player_id || !UUID_RE.test(player_id)) {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
      }

      const allReports = await base44.asServiceRole.entities.UnifiedReport.filter(
        { player_id }, '-created_date', 200
      );
      const aggregated = computeAggregatedEvaluation(allReports);
      const player = await base44.asServiceRole.entities.PlayerRegistration.get(player_id);

      const docContent = generateEvaluationDocument({
        playerName: player?.full_name || '',
        tier: aggregated.tier,
        overall: aggregated.overall,
        categoryScores: aggregated.categoryScores,
        evaluationCount: aggregated.evaluationCount,
        effectiveCount: aggregated.effectiveCount,
        zeroWeightCount: aggregated.zeroWeightCount,
        latestReport: allReports[0],
      });

      return Response.json({ document: docContent, aggregated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('unified-report-engine error:', error?.message || error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ============================================================
// generateEvaluationDocument — מחולל מסמך הערכה רשמי אוטומטי
//
// מייצר טקסט מובנה המשמש כמסמך ההערכה הרשמי של השחקן.
// מבוסס על הנתונים המצטברים + הדוח האחרון + גרף ההתפתחות.
// ============================================================

function generateEvaluationDocument({
  playerName,
  tier,
  overall,
  categoryScores,
  evaluationCount,
  effectiveCount,
  zeroWeightCount,
  latestReport,
}): string {
  const date = new Date().toLocaleDateString('he-IL');
  const CATEGORY_LABELS_HE: Record<string, string> = {
    technique: 'טכניקה',
    game_intelligence: 'הבנת משחק',
    physicality: 'פיזיות',
    decision_making: 'קבלת החלטות',
    mentality: 'מנטליות',
  };

  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════');
  lines.push('  מסמך הערכה רשמי — עילית ישראלית / Mabat 360');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`שם השחקן: ${playerName || '—'}`);
  lines.push(`תאריך עדכון: ${date}`);
  lines.push(`רמת איכות: ${tier}`);
  lines.push('');
  lines.push('─── 5 קטגוריות מקצועיות (ממוצע משוקלל) ───');
  for (const cat of EVALUATION_CATEGORIES) {
    const score = categoryScores[cat] || 0;
    const balls = scoreToBalls(score);
    const ballVisual = '⚽'.repeat(balls.fullBalls) + (balls.hasHalf ? '◐' : '') + '○'.repeat(5 - balls.fullBalls - (balls.hasHalf ? 1 : 0));
    lines.push(`  ${CATEGORY_LABELS_HE[cat]}: ${ballVisual}`);
  }
  lines.push('');
  lines.push('─── סיכום מקצועי ───');
  if (latestReport) {
    if (latestReport.summary) lines.push(`סיכום: ${latestReport.summary}`);
    if (latestReport.strengths) lines.push(`נקודות חוזק: ${latestReport.strengths}`);
    if (latestReport.improvements) lines.push(`תחומים לשיפור: ${latestReport.improvements}`);
    if (latestReport.action_items) lines.push(`פעולות נדרשות: ${latestReport.action_items}`);
  }
  lines.push('');
  lines.push('─── נתוני מקור ───');
  lines.push(`סך דוחות: ${evaluationCount}`);
  lines.push(`דוחות פעילים (משקל מלא/חלקי): ${effectiveCount}`);
  lines.push(`דוחות מתועדים (משקל אפסי): ${zeroWeightCount}`);
  lines.push('');
  lines.push('═══════════════════════════════════════════');
  lines.push('מסמך זה הופק אוטומטית על בסיס דוחות מאוחדים');
  lines.push('במערכת עילית ישראלית — Single Source of Truth');
  lines.push('═══════════════════════════════════════════');

  return lines.join('\n');
}