import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Target, ChevronDown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const RADAR_KEYS_17 = [
  { key: 'resilience_error_recovery', label: 'תגובה לטעות', category: 'resilience' },
  { key: 'resilience_disadvantage_drive', label: 'עמידה בפיגור', category: 'resilience' },
  { key: 'resilience_squad_status', label: 'סבל ספסל', category: 'resilience' },
  { key: 'resilience_emotional_control', label: 'ויסות כעסים', category: 'resilience' },
  { key: 'leadership_vocal', label: 'הכוונה ורבלית', category: 'leadership' },
  { key: 'leadership_body_language', label: 'שפת גוף', category: 'leadership' },
  { key: 'leadership_coachability', label: 'קבלת סמכות', category: 'leadership' },
  { key: 'leadership_clutch', label: 'לחץ = ריכוז', category: 'leadership' },
  { key: 'cognitive_late_game', label: 'דקות סיום', category: 'cognitive' },
  { key: 'cognitive_distraction_filter', label: 'פילטר רעשים', category: 'cognitive' },
  { key: 'cognitive_decision_making', label: 'החלטות לחץ', category: 'cognitive' },
  { key: 'cognitive_tactical_adaptability', label: 'גמישות טקטית', category: 'cognitive' },
  { key: 'drive_training_intensity', label: 'מוסר אימונים', category: 'drive' },
  { key: 'drive_aggression_grit', label: 'קשיחות פיזית', category: 'drive' },
  { key: 'drive_consistency', label: 'עקביות', category: 'drive' },
  { key: 'drive_injury_rehab', label: 'גריט פציעות', category: 'drive' },
  { key: 'drive_team_first', label: 'EQ קבוצתי', category: 'drive' },
];

const CATEGORY_COLORS = { resilience: '#ef4444', leadership: '#D4AF37', cognitive: '#3b82f6', drive: '#10b981' };
const CATEGORY_LABELS = { resilience: 'חוסן', leadership: 'מנהיגות', cognitive: 'קוגניטיבי', drive: 'מניע' };

function buildRadarData(assessment) {
  return RADAR_KEYS_17.map(k => ({ subject: k.label, value: (assessment[k.key] || 0) * 20, category: k.category, fullMark: 100 }));
}

function buildTimelineData(assessments) {
  return assessments
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date))
    .map(a => ({
      date: a.assessment_date?.slice(0, 7),
      team: a.associated_team || '',
      score: a.mental_score_nlp || 0,
      comments: a.analyst_comments || '',
      label: a.mental_score_nlp >= 90 ? '🏆' : a.mental_score_nlp >= 75 ? '📈' : '📉',
    }));
}

export default function MentalJourneyChart({ playerId, isEliteOrg }) {
  const [activePoint, setActivePoint] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['mental-assessments', playerId],
    queryFn: () => base44.entities.MentalAssessment.filter({ player_id: playerId, is_elite_org: true }, '-assessment_date', 20),
    enabled: !!playerId && !!isEliteOrg,
  });

  if (!isEliteOrg) {
    return (
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-8 text-center">
        <Lock size={26} className="text-white/25 mx-auto mb-3" />
        <p className="text-white/60 text-sm font-bold mb-1">אין מידע מנטלי מאושר</p>
        <p className="text-white/40 text-xs max-w-xs mx-auto">מבדקים מנטליים זמינים רק לשחקני עילית שטופחו וקיבלו חוות דעת מקצועית מאושרת דרך ליגות "עילית ישראלית".</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestAssessment = assessments[0];

  if (!latestAssessment) {
    return (
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-8 text-center">
        <Brain size={28} className="text-white/25 mx-auto mb-3" />
        <p className="text-white/60 text-sm">אין מבדקים מנטליים זמינים עדיין</p>
      </div>
    );
  }

  const timelineData = buildTimelineData(assessments);
  const radarData = buildRadarData(latestAssessment);
  const categories = ['resilience', 'leadership', 'cognitive', 'drive'];

  return (
    <div>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between text-right">
        <div>
          <h3 className="text-white font-black text-base">מסע החוסן המנטלי</h3>
          <p className="text-white/50 text-xs">The Mental Resilience Journey · {assessments.length} מבדקים</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <Brain size={14} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-black text-sm">{latestAssessment.mental_score_nlp}</span>
            <span className="text-white/50 text-xs">/99</span>
          </div>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown size={18} className="text-white/50" /></motion.span>
        </div>
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 mt-6 overflow-hidden">
          {timelineData.length > 1 && (
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-xs mb-3">ציר הזמן — ציון מנטלי משוקלל</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={timelineData} onClick={(d) => d?.activePayload && setActivePoint(d.activePayload[0]?.payload)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff60' }} />
                  <YAxis domain={[0, 99]} tick={{ fontSize: 10, fill: '#ffffff60' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #D4AF3730', borderRadius: 8, fontSize: 12 }} formatter={(v, _, p) => [`${v} (${p.payload.label})`, 'ציון מנטלי']} />
                  <Line type="monotone" dataKey="score" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              {activePoint && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 bg-[#1B263B] border border-[#D4AF37]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#D4AF37] font-bold text-xs">{activePoint.date}</span>
                    <span className="text-white/50 text-xs">· {activePoint.team}</span>
                    <span className="text-lg">{activePoint.label}</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{activePoint.comments || 'אין הערות'}</p>
                </motion.div>
              )}
            </div>
          )}

          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-3">גרף רדאר — 17 מדדי חוסן (מבדק אחרון)</p>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#ffffff80' }} />
                <Radar name="מנטלי" dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.18} strokeWidth={2.5} />
                <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #D4AF3730', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${Math.round(v / 20 * 10) / 10}/5`, '']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => {
              const catKeys = RADAR_KEYS_17.filter(k => k.category === cat);
              const avg = catKeys.reduce((sum, k) => sum + (latestAssessment[k.key] || 0), 0) / catKeys.length;
              return (
                <div key={cat} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: CATEGORY_COLORS[cat] }}>{CATEGORY_LABELS[cat]}</span>
                    <span className="text-white font-black text-sm">{avg.toFixed(1)}/5</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(avg / 5) * 100}%`, backgroundColor: CATEGORY_COLORS[cat] }} />
                  </div>
                </div>
              );
            })}
          </div>

          {latestAssessment.analyst_comments && (
            <div className="bg-[#0D1B2A] border border-[#D4AF37]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-bold">הערכת אנליסט</span>
                {latestAssessment.assessment_date && <span className="text-white/50 text-xs">· {latestAssessment.assessment_date}</span>}
              </div>
              <p className="text-white/70 text-xs leading-relaxed">{latestAssessment.analyst_comments}</p>
              {latestAssessment.recommender_name && <p className="text-white/40 text-[10px] mt-2">— {latestAssessment.recommender_name}</p>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}