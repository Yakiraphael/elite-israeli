import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, CalendarDays, MapPin, ShieldCheck, Flag } from 'lucide-react';

// תצוגת לוז קרוב למאמן — משחקים מתוכננים של הקבוצה הפעילה בלבד (RLS מבודד למועדון).
// קריאה בלבד — שמירת/עריכת משחקים נעשית ע"י המנהל המקצועי ב-ScheduleStudio.
export default function CoachTeamSchedule({ teamLabel }) {
  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ['coach-team-schedule', teamLabel],
    queryFn: () => base44.entities.MatchFixture.list('-match_date', 80),
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = fixtures
    .filter(f => f.status === 'SCHEDULED' && f.match_date && new Date(f.match_date) >= today)
    .filter(f => !teamLabel || f.home_team === teamLabel || f.away_team === teamLabel || (f.age_group && teamLabel && f.age_group.includes(teamLabel)))
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-black text-base flex items-center gap-2"><CalendarDays size={16} className="text-[#D4AF37]" /> לוז הקבוצה הקרוב</h3>
        <span className="text-white/40 text-[10px]">{upcoming.length} משחקים · {teamLabel || 'כל הקבוצות'}</span>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">אין משחקים מתוכננים לקבוצה בקרוב.</div>
      ) : (
        upcoming.map(f => (
          <div key={f.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4 hover:border-[#D4AF37]/30 transition-colors">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-center flex-shrink-0 w-12">
                  <div className="text-[10px] text-white/40">{new Date(f.match_date).toLocaleDateString('he-IL', { day: '2-digit', month: 'short' })}</div>
                  <div className="text-[#D4AF37] font-black text-sm mt-0.5">{f.kickoff_time || '—'}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm truncate">{f.home_team} <span className="text-white/30 mx-1 text-xs">נגד</span> {f.away_team}</div>
                  <div className="text-white/40 text-xs flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {f.stadium_name || '—'}</span>
                    {f.competition && <span>· {f.competition}</span>}
                    {f.age_group && <span>· {f.age_group}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {f.referee_status === 'CONFIRMED'
                  ? <span className="text-[10px] font-bold flex items-center gap-1 text-green-400 bg-green-500/10 border-green-500/30 border px-2 py-1 rounded-full"><ShieldCheck size={11} /> שופט אושר</span>
                  : <span className="text-[10px] font-bold flex items-center gap-1 text-amber-400 bg-amber-500/10 border-amber-500/30 border px-2 py-1 rounded-full"><Flag size={11} /> שופט ממתין</span>}
                {f.round && <span className="text-[10px] text-white/40">{f.round}</span>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}