import { MessageCircle, Mail, AlertTriangle } from 'lucide-react';
import { computeEligibility } from '@/lib/playerEligibility';
import { whatsappLink, mailtoLink } from '@/lib/contactLinks';

export default function RedFlagsPanel({ players }) {
  const flagged = players
    .map(p => ({ player: p, elig: computeEligibility(p) }))
    .filter(({ elig }) => elig.color !== 'green');

  if (flagged.length === 0) {
    return <div className="text-center py-12 text-white/30 text-sm">✓ אין דגלים אדומים — כל הסגל תקין</div>;
  }

  return (
    <div className="space-y-3">
      {flagged.map(({ player, elig }) => {
        const missing = elig.reasons.map(r => r.msg).join(', ');
        const message = `שלום, חסר לך: ${missing} — נא להשלים לקראת המשחק הקרוב. תודה, צוות המועדון.`;
        const wa = whatsappLink(player, message);
        const mail = mailtoLink(player, 'נדרשת השלמת מסמכים', message);
        return (
          <div key={player.id} className={`bg-[#1B263B] border rounded-lg p-4 ${elig.color === 'red' ? 'border-red-500/20' : 'border-amber-500/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-bold text-sm">{player.full_name}</div>
                <div className="text-white/40 text-xs">{player.position}{player.team_name ? ` · ${player.team_name}` : ''}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${elig.color === 'red' ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-amber-400 bg-amber-400/10 border-amber-400/30'}`}>
                {elig.color === 'red' ? 'לא כשיר' : 'דורש תשומת לב'}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {elig.reasons.map((r, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-xs ${r.color === 'red' ? 'text-red-400' : 'text-amber-400'}`}>
                  <AlertTriangle size={11} /> {r.msg}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/15 text-green-400 border border-green-500/30 text-[11px] font-bold py-1.5 rounded-sm hover:bg-green-500/25 transition-colors">
                  <MessageCircle size={12} /> שלח וואטסאפ
                </a>
              )}
              {mail && (
                <a href={mail}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold py-1.5 rounded-sm hover:bg-blue-500/25 transition-colors">
                  <Mail size={12} /> שלח מייל להורה
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}