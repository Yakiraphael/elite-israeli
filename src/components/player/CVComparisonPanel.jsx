import { ShieldCheck, ShieldAlert } from 'lucide-react';

function normalize(str) { return (str || '').toLowerCase().trim(); }

export default function CVComparisonPanel({ player }) {
  const tm = player.transfermarkt_data;
  if (!tm) return null;

  const tmClubs = (tm.transfer_history || []).map(t => t.to_club).filter(Boolean);
  const tmAchievementsCount = (tm.achievements || []).length;
  const cvAchievementsCount = (player.achievements || '').split(',').filter(s => s.trim()).length;

  const rows = [
    {
      label: 'מועדון נוכחי',
      cv: player.team_name || '—',
      tm: tmClubs[0] || '—',
      match: !!player.team_name && tmClubs.some(c => normalize(c).includes(normalize(player.team_name)) || normalize(player.team_name).includes(normalize(c))),
    },
    {
      label: 'קבוצות קודמות',
      cv: player.previous_clubs || '—',
      tm: tmClubs.slice(1, 4).join(', ') || '—',
      match: !!player.previous_clubs && tmClubs.some(c => normalize(player.previous_clubs).includes(normalize(c))),
    },
    {
      label: 'מספר הישגים מדווח',
      cv: cvAchievementsCount || '—',
      tm: tmAchievementsCount || '—',
      match: cvAchievementsCount > 0 && tmAchievementsCount > 0 && Math.abs(cvAchievementsCount - tmAchievementsCount) <= 2,
    },
  ];

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-black text-base mb-1">🔎 השוואת אמינות מול Transfermarkt</h3>
      <p className="text-white/40 text-xs mb-4">בדיקת התאמה בין הנתונים שהוזנו בקורות החיים לבין מקור חיצוני מאומת</p>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <div className="text-white/40 text-[10px] font-bold mb-1">{r.label}</div>
              <div className="text-white text-xs truncate">CV: {r.cv}</div>
              <div className="text-white/50 text-xs truncate">Transfermarkt: {r.tm}</div>
            </div>
            <div className="flex-shrink-0">
              {r.match ? (
                <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold"><ShieldCheck size={13} /> תואם</span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold"><ShieldAlert size={13} /> לבדיקה</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}