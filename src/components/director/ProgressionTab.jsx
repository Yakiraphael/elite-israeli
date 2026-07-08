import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

export default function ProgressionTab({ player, mentalHistory, teammates }) {
  const growthData = mentalHistory.map(m => ({ date: m.assessment_date, score: m.mental_score_nlp }));
  const radarData = player.stats ? Object.entries(player.stats).map(([k, v]) => ({ subject: k.toUpperCase(), value: v || 0, fullMark: 99 })) : [];
  const ranked = [...teammates].sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));

  return (
    <div className="space-y-4">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={13} /> גרף התקדמות — ציון מנטלי לאורך זמן</h4>
        {growthData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={growthData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#ffffff40' }} />
              <YAxis domain={[0, 99]} tick={{ fontSize: 9, fill: '#ffffff40' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #ffffff20', fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white/25 text-xs">נדרשות לפחות 2 הערכות מנטליות להצגת מגמה</p>
        )}
      </div>

      {radarData.length > 0 && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2">מדדי איכות פיזיים/טכניים</h4>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#ffffff40' }} />
              <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            {player.height_cm && <span className="text-white/50">גובה: <span className="text-white">{player.height_cm} ס״מ</span></span>}
            {player.weight_kg && <span className="text-white/50">משקל: <span className="text-white">{player.weight_kg} ק״ג</span></span>}
          </div>
        </div>
      )}

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={13} /> השוואת עמדות — {player.position}</h4>
        <div className="space-y-1.5">
          {ranked.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between text-xs rounded px-3 py-2 ${p.id === player.id ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30' : 'bg-[#1B263B]'}`}>
              <span className={p.id === player.id ? 'text-[#D4AF37] font-bold' : 'text-white/60'}>#{i + 1} {p.full_name}</span>
              <span className="text-white font-bold">{p.overall_rating ?? '—'}</span>
            </div>
          ))}
          {ranked.length === 0 && <p className="text-white/25 text-xs">אין שחקנים נוספים באותה עמדה לצורך השוואה</p>}
        </div>
      </div>
    </div>
  );
}