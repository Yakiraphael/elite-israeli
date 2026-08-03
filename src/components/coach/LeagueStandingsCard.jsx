import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Loader2 } from 'lucide-react';
import { StandingsTable } from '@/pages/LeagueStudio.jsx';

// טבלת ליגה חיה למאמן — מאותחל מהקבוצה הפעילה של המאמן (גילאי/שנתון).
export default function LeagueStandingsCard({ teamId }) {
  const [ageGroup, setAgeGroup] = useState('');

  // 1. משיכת פרטי הקבוצה הפעילה כדי לגלות את השנתון/מועדון
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => teamId ? await base44.entities.Team.get(teamId) : null,
    enabled: !!teamId,
  });
  useQuery({
    queryKey: ['team-agegroup', teamId],
    queryFn: async () => { if (team?.age_group) setAgeGroup(team.age_group); return team?.age_group; },
    enabled: !!team?.age_group,
  });

  // 2. טבלת ליגה ממונוע הליגה (clubId מתקבל מפרט המאמן — מקושר לקבוצה)
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const clubId = me?.club_id || team?.club_id;
  const ag = ageGroup || team?.age_group || '';

  const { data: rows, isLoading } = useQuery({
    queryKey: ['coach-standings', clubId, ag],
    queryFn: async () => (await base44.functions.invoke('league-engine', { action: 'standings', club_id: clubId, age_group: ag, club_name: me?.full_name || '' }).then(r => r.data)).standings,
    enabled: !!clubId && !!ag,
  });

  if (!teamId) return <Empty label="אין קבוצה פעילה לתצוגת טבלת ליגה." />;
  if (!ag) return <Empty label="לקבוצה הפעילה אין שנתון מוגדר." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-base flex items-center gap-2"><Trophy size={14} className="text-[#D4AF37]" /> טבלת ליגה — {ag}</h3>
        <span className="text-white/30 text-[10px]">מתעדכנת אוטומטית עם אימות תוצאות המשחקים</span>
      </div>
      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#D4AF37]" /></div>
        : (!rows || !rows.length) ? <Empty label="טרם אומתו תוצאות משחקים בשנתון זה." />
        : <StandingsTable rows={rows} highlightTeam={team?.name} />}
    </div>
  );
}

function Empty({ label }) {
  return <div className="bg-[#1B263B] border border-white/10 rounded-lg p-8 text-center text-white/30 text-sm">{label}</div>;
}