import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/lib/i18n/LanguagesContext';
import { getEvaluationStrings } from '@/lib/i18n/evaluationStrings';
import {
  computeAggregatedEvaluation,
  EVALUATION_CATEGORIES,
} from '@/lib/evaluationEngine';
import FootballBalls from './FootballBalls';
import TierBadge from './TierBadge';

// ============================================================
// UltimatePlayerCard — כרטיס שחקן נוער אולטימטיבי
//
// רכיב פרימיום המאחד:
//   1. זהות + שנתון + אימוג'ים ארגוניים
//   2. דירוג ליגה + מעמד תחרותי
//   3. הערכה ויזואלית — כדורי רגל (Zero-Numbers Rule)
//   4. דירוג רמה A5–B1
//   5. אינדיקטור רמת היכרות ומשקל מעריכים
//
// תומך ב-3 שפות (HE/AR/EN), RTL מלא, רספונסיבי.
// ============================================================

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const POSITION_EMOJI = {
  'שוער': '🧤', 'בלם': '🛡️', 'מגן צד': '↔️', 'קשר מגן': '⚙️',
  'קשר': '🎯', 'קשר התקפי': '⚡', 'חלוץ צד': '🏃', 'חלוץ': '⚽',
};

// תגי ארגון — אקו-סיסטם נוער
function OrgBadges({ player, strings }) {
  const badges = [];
  // 🌟 מצוינות — שחקן עם elite_id או ifa_ready
  if (player.elite_id || player.ifa_ready) {
    badges.push({ emoji: '🌟', label: strings.orgExcellence, color: 'gold' });
  }
  // 🛡️ מועדון מאושר
  if (player.organization_name || player.club_name) {
    badges.push({ emoji: '🛡️', label: strings.orgVerified, color: 'blue' });
  }
  // ⚽ מחלקת נוער פעילה
  if (player.team_name) {
    badges.push({ emoji: '⚽', label: strings.orgYouth, color: 'green' });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            b.color === 'gold' ? 'bg-brand-soft border-brand-line text-brand' :
            b.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-green-500/10 border-green-500/20 text-green-400'
          }`}
        >
          {b.emoji} {b.label}
        </span>
      ))}
      {/* תג מותג פלטפורמה */}
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-brand text-brand-ink">
        {strings.brandBadge}
      </span>
    </div>
  );
}

// חלק זהות השחקן
function CardHeader({ player, aggregated, strings, lang }) {
  const ageGroup = player.age_group || extractAgeGroup(player) || 'U18';
  const posEmoji = POSITION_EMOJI[player.position] || '⚽';

  return (
    <div className="flex items-start gap-4">
      {/* אווטאר */}
      <div className="w-12 h-12 rounded-xl bg-brand-soft border-2 border-brand flex items-center justify-center flex-shrink-0 overflow-hidden">
        {player.avatar_url ? (
          <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{posEmoji}</span>
        )}
      </div>

      {/* שם + פרטים */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-ink font-black text-base leading-tight truncate">{player.full_name}</h3>
            <p className="text-ink-muted text-xs mt-0.5">
              {player.position} · {ageGroup} · {player.organization_name || player.club_name || player.team_name || ''}
            </p>
          </div>
          {/* דירוג רמה */}
          {aggregated.evaluationCount > 0 && (
            <TierBadge tier={aggregated.tier} size="md" strings={strings} />
          )}
        </div>
        <div className="mt-2">
          <OrgBadges player={player} strings={strings} />
        </div>
      </div>
    </div>
  );
}

// חלק דירוג ליגה
function LeagueRanking({ standings, player, strings }) {
  if (!standings || standings.length === 0) return null;

  const teamStanding = standings.find(s =>
    s.team_name === player.team_name || s.team_name === player.organization_name
  );
  const position = teamStanding ? standings.indexOf(teamStanding) + 1 : null;
  if (!position) return null;

  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[position - 1] || `#${position}`;

  return (
    <div className="flex items-center justify-between bg-panel-alt rounded-lg px-4 py-3 border border-hairline">
      <div className="flex items-center gap-2">
        <span className="text-base">🏆</span>
        <span className="text-ink-muted text-xs font-bold">{strings.leagueRanking}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-ink font-black text-base">{medal}</span>
        {teamStanding?.points != null && (
          <span className="text-ink-muted">{teamStanding.points} {strings.points}</span>
        )}
        <span className="text-ink-faint">{teamStanding?.played || 0} {strings.played}</span>
      </div>
    </div>
  );
}

// חלק הערכה כללית
function EvaluationOverview({ aggregated, strings }) {
  if (aggregated.evaluationCount === 0) return null;

  return (
    <div className="bg-panel-alt rounded-lg p-3 border border-hairline">
      <div className="flex items-center justify-between mb-2">
        <span className="text-ink-muted text-xs font-bold flex items-center gap-1.5">
          <span>⚽</span> {strings.professionalEvaluation}
        </span>
        <span className="text-ink-faint text-[10px]">
          {aggregated.effectiveCount} {strings.activeReports}
        </span>
      </div>
      <div className="flex items-center justify-center py-1">
        <FootballBalls score={aggregated.overall} size={28} />
      </div>
    </div>
  );
}

// חלק פירוט קטגוריות
function CategoryBreakdown({ aggregated, strings }) {
  if (aggregated.evaluationCount === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-ink-faint text-[10px] font-bold uppercase tracking-wider">{strings.categoryBreakdown}</h4>
      {EVALUATION_CATEGORIES.map(cat => (
        <div key={cat} className="flex items-center justify-between">
          <span className="text-ink-muted text-xs font-medium">{strings.categories[cat]}</span>
          <FootballBalls score={aggregated.categoryScores[cat]} size={14} />
        </div>
      ))}
    </div>
  );
}

// חילוץ שנתון משם קבוצה (למשל "נערים א' - U16" → "U16")
function extractAgeGroup(player) {
  const text = `${player.team_name || ''} ${player.league_name || ''}`;
  // תופס כל שנתון נוער U10–U21 (כולל U11, U13, U15, U17, U19, U20)
  const match = text.match(/U(1[0-9]|2[01])/i);
  return match ? match[0].toUpperCase() : null;
}

// ============================================================
// רכיב ראשי
// ============================================================

export default function UltimatePlayerCard({ player, clubId, className }) {
  const { lang } = useTranslation();
  const strings = getEvaluationStrings(lang);

  // הוספת מחרוזות ייעודיות לכרטיס
  const cardStrings = {
    ...strings,
    orgExcellence: lang === 'ar' ? 'تميز' : lang === 'en' ? 'Excellence' : 'מצוינות',
    orgVerified: lang === 'ar' ? 'نادي معتمد' : lang === 'en' ? 'Verified Club' : 'מועדון מאושר',
    orgYouth: lang === 'ar' ? 'قسم شباب نشط' : lang === 'en' ? 'Active Youth Dept' : 'מחלקת נוער',
    brandBadge: lang === 'ar' ? 'إيليت إسرائيلي' : lang === 'en' ? 'Elite Israeli' : 'עילית ישראלית',
    leagueRanking: lang === 'ar' ? 'ترتيب الدوري' : lang === 'en' ? 'League Ranking' : 'דירוג ליגה',
    points: lang === 'ar' ? 'نقطة' : lang === 'en' ? 'pts' : 'נק\'',
    played: lang === 'ar' ? 'مباراة' : lang === 'en' ? 'played' : 'משחקים',
    professionalEvaluation: lang === 'ar' ? 'التقييم المهني' : lang === 'en' ? 'Professional Evaluation' : 'הערכה מקצועית',
    activeReports: lang === 'ar' ? 'تقارير نشطة' : lang === 'en' ? 'active reports' : 'דוחות פעילים',
    confidenceFull: lang === 'ar' ? 'وزن كامل' : lang === 'en' ? 'Full Weight' : 'משקל מלא',
    confidenceMixed: lang === 'ar' ? 'وزن مختلط' : lang === 'en' ? 'Mixed Weight' : 'משקל מעורב',
    confidencePartial: lang === 'ar' ? 'وزن جزئي' : lang === 'en' ? 'Partial Weight' : 'משקל חלקי',
    confidenceNone: lang === 'ar' ? 'تقارير ملغاة' : lang === 'en' ? 'Nullified Reports' : 'דוחות מבוטלים',
    confidenceArchived: lang === 'ar' ? 'ملغى' : lang === 'en' ? 'archived' : 'מבוטל',
    noEvaluations: lang === 'ar' ? 'لا توجد تقييمات بعد' : lang === 'en' ? 'No evaluations yet' : 'אין עדיין הערכות',
  };

  // שליפת הערכות שחקן
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['player-evaluations', player?.id],
    queryFn: () => base44.entities.PlayerEvaluation.filter({ player_id: player.id }, '-created_date', 50),
    enabled: !!player?.id,
  });

  // שליפת טבלת ליגה
  const { data: standings = [] } = useQuery({
    queryKey: ['standings-ultimate', clubId],
    queryFn: () => base44.entities.LeagueStanding.filter({ club_id: clubId }, '-points', 20),
    enabled: !!clubId,
  });

  const aggregated = computeAggregatedEvaluation(evaluations);

  if (isLoading) {
    return (
      <div className={`bg-panel border border-hairline rounded-2xl p-5 flex justify-center items-center min-h-[200px] ${className || ''}`}>
        <div className="w-6 h-6 border-2 border-hairline border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`bg-panel border border-hairline rounded-2xl overflow-hidden ${className || ''}`}>
      {/* פס זהב עליון */}
      <div className="h-1 bg-gradient-to-l from-transparent via-brand to-transparent" />

      <div className="p-4 space-y-3">
        {/* חלק זהות */}
        <CardHeader player={player} aggregated={aggregated} strings={cardStrings} lang={lang} />

        {/* דירוג ליגה */}
        <LeagueRanking standings={standings} player={player} strings={cardStrings} />

        {/* הערכה כללית */}
        {aggregated.evaluationCount > 0 ? (
          <>
            <EvaluationOverview aggregated={aggregated} strings={cardStrings} />
            <CategoryBreakdown aggregated={aggregated} strings={cardStrings} />
          </>
        ) : (
          <div className="text-center py-5 bg-panel-alt rounded-lg border border-hairline">
            <span className="text-2xl block mb-1 opacity-40">⚽</span>
            <p className="text-ink-faint text-xs">{cardStrings.noEvaluations}</p>
          </div>
        )}
      </div>
    </div>
  );
}