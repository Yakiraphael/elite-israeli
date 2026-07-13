import { BarChart2, GraduationCap, Activity } from 'lucide-react';

const STAT_LABELS = { pac: 'מהירות', sho: 'בעיטה', pas: 'מסירה', dri: 'כדרור', def: 'הגנה', phy: 'פיזיות', mental: 'מנטלי' };

export default function PlayerCentralDashboard({ player }) {
  const stats = player.stats || {};
  const statEntries = Object.entries(STAT_LABELS).filter(([key]) => stats[key] != null);
  const eduEntries = (player.elite_journey || []).filter(e => e.category === 'חינוכי').sort((a, b) => new Date(b.date) - new Date(a.date));
  const careerStats = player.transfermarkt_data?.career_stats || [];
  const minutes = player.last_match_minutes || [];
  const maxMin = Math.max(90, ...minutes);

  return (
    <div className="space-y-4">
      {/* Performance metrics */}
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <BarChart2 size={12} /> מדדי ביצוע
        </h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/50 text-xs">ציון כולל</span>
          <span className="text-white font-black text-lg">{player.overall_rating ?? '—'}</span>
        </div>
        {statEntries.length === 0 ? (
          <p className="text-white/30 text-xs">אין נתוני ביצועים עדיין</p>
        ) : (
          <div className="space-y-2">
            {statEntries.map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-white/50">{label}</span>
                  <span className="text-white font-bold">{stats[key]}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${Math.min(100, stats[key])}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational activity summary */}
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <GraduationCap size={12} /> סיכום פעילות לימודית-חינוכית
        </h4>
        {eduEntries.length === 0 ? (
          <p className="text-white/30 text-xs">אין רישומי פעילות חינוכית עדיין</p>
        ) : (
          <div className="space-y-2">
            {eduEntries.slice(0, 5).map((e, i) => (
              <div key={i} className="border-r-2 border-[#D4AF37]/40 pr-2.5">
                <div className="text-white text-xs font-bold">{e.title}</div>
                {e.description && <div className="text-white/50 text-[11px]">{e.description}</div>}
                {e.date && <div className="text-white/30 text-[10px] mt-0.5">{e.date}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sports statistics */}
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Activity size={12} /> סטטיסטיקה ספורטיבית
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
          <div className="text-white/50">כרטיסים צהובים: <span className="text-white font-bold">{player.yellow_cards_count || 0}</span></div>
          <div className="text-white/50">היעדרויות רצופות: <span className="text-white font-bold">{player.consecutive_absences || 0}</span></div>
        </div>
        {minutes.length > 0 && (
          <div className="mb-3">
            <div className="text-white/40 text-[10px] mb-1.5">דקות משחק — 5 משחקים אחרונים</div>
            <div className="flex items-end gap-2 h-14">
              {minutes.slice(-5).map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#D4AF37]/60 rounded-t-sm" style={{ height: `${Math.max(6, (m / maxMin) * 48)}px` }} />
                  <span className="text-white/30 text-[9px]">{m}'</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {careerStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="text-right py-1">עונה</th><th className="text-right py-1">קבוצה</th><th className="text-right py-1">מש'</th><th className="text-right py-1">שערים</th><th className="text-right py-1">בישולים</th>
                </tr>
              </thead>
              <tbody>
                {careerStats.slice(0, 5).map((c, i) => (
                  <tr key={i} className="border-b border-white/5 text-white/70">
                    <td className="py-1">{c.season}</td><td className="py-1">{c.club}</td><td className="py-1">{c.appearances}</td><td className="py-1">{c.goals}</td><td className="py-1">{c.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : minutes.length === 0 ? (
          <p className="text-white/30 text-xs">אין נתוני קריירה זמינים</p>
        ) : null}
      </div>
    </div>
  );
}