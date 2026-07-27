import { AlertTriangle, TrendingDown, ShieldCheck, Clock, Ban } from 'lucide-react';

// וידג'ט "דורשי טיפול / חריגים":
// שחקן מופיע בזרם אם לפחות אחד מהתנאים הבאים מתקיים:
//   - is_suspended === true
//   - סטטוס רפואי אדום (לא תקין, פג תוקף או חסר אישור)
//   - attendance_rate < 75 (כאשר מוגדר)
//   - discipline_avg < 3  (כאשר מוגדר)
//   - סטטוס רפואי צהוב (תוקף עומד לפקוע בקרוב)
export default function CoachAlertsStream({ players, medicalStatusOf, onPick }) {
  const alerts = [];

  for (const p of players) {
    const med = medicalStatusOf?.(p) || { color: 'green', label: '', days: null };

    if (p.is_suspended) {
      alerts.push({ kind: 'suspended', player: p, label: 'מושעה', color: 'red', icon: Ban });
      continue;
    }
    if (med.color === 'red') {
      alerts.push({ kind: 'medical', player: p, label: med.label || 'רפואי לא תקין', color: 'red', icon: Clock });
      continue;
    }
    if (typeof p.attendance_rate === 'number' && p.attendance_rate < 75) {
      alerts.push({
        kind: 'attendance', player: p,
        label: `נוכחות ${p.attendance_rate}%`,
        color: 'amber', icon: TrendingDown,
      });
      continue;
    }
    if (typeof p.discipline_avg === 'number' && p.discipline_avg < 3) {
      alerts.push({
        kind: 'discipline', player: p,
        label: `משמעת ${p.discipline_avg}`,
        color: 'amber', icon: TrendingDown,
      });
      continue;
    }
    if (med.color === 'yellow') {
      alerts.push({
        kind: 'medical_warn', player: p,
        label: med.days != null ? `רפואי — ${med.days} ימים` : 'רפואי בקרוב',
        color: 'amber', icon: Clock,
      });
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-green-400 text-sm flex items-center gap-2">
        <ShieldCheck size={15} /> אין חריגים — כל השחקנים כשירים כעת.
      </div>
    );
  }

  return (
    <div className="bg-amber-500/[0.04] border border-amber-500/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/5">
        <AlertTriangle size={14} className="text-amber-400" />
        <span className="text-amber-300 text-xs font-black">דורשי טיפול / חריגים</span>
        <span className="text-amber-400/60 text-[10px] font-bold">({alerts.length})</span>
      </div>
      <div className="divide-y divide-white/5">
        {alerts.slice(0, 8).map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={() => onPick?.(a.player)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors text-right"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <span className="text-white text-xs font-bold truncate">{a.player.full_name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] font-bold ${a.color === 'red' ? 'text-red-400' : 'text-amber-400'}`}>
                  {a.label}
                </span>
                <Icon size={12} className={a.color === 'red' ? 'text-red-400' : 'text-amber-400'} />
              </div>
            </button>
          );
        })}
        {alerts.length > 8 && (
          <div className="px-4 py-2 text-white/30 text-[10px] text-center">
            + {alerts.length - 8} חריגים נוספים
          </div>
        )}
      </div>
    </div>
  );
}