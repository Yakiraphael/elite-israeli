import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Inbox, Building2, FileText } from 'lucide-react';

const STATUS_STYLES = {
  'ממתין לאישור הנהלה': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  'מאושר — ממתין לאפוטרופוס': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  'מאושר — ממתין לשחקן (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'ממתין לאימות תשלום (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'ממתין לאימות ההתאחדות (IFA)': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'אושרה סופית': { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  'נדחתה': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  'נסגרה': { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10' },
};

export default function PlayerOffersPanel({ player }) {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['player-offers', player.id],
    queryFn: () => base44.entities.TransferProposal.filter({ player_elite_id: player.elite_id || player.id }, '-created_date', 20),
    enabled: !!player.id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <h3 className="text-white font-black text-base mb-1">📬 הצעות שהתקבלו</h3>
      <p className="text-white/50 text-xs mb-4">כל הצעה מקצועית שהוגשה עבורך על ידי מועדון או סקאוט מוסמך</p>

      {offers.length === 0 ? (
        <div className="text-center py-8">
          <Inbox size={24} className="text-white/25 mx-auto mb-2" />
          <p className="text-white/50 text-sm">עדיין לא התקבלו הצעות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(o => {
            const sc = STATUS_STYLES[o.status] || STATUS_STYLES['ממתין לאישור הנהלה'];
            const isYouth = !player.is_adult;
            return (
              <div key={o.id} className={`bg-[#0D1B2A] border rounded-lg p-4 ${sc.border}`}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-[#D4AF37]" />
                    <span className="text-white font-bold text-sm">{o.club_name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{o.status}</span>
                </div>
                {isYouth ? (
                  <p className="text-white/40 text-xs leading-relaxed">
                    🔒 מאחר שאתה שחקן נוער — פרטי ההצעה המלאים והמסמכים המצורפים חשופים לצפייה ולאישור האפוטרופוס שלך בלבד.
                  </p>
                ) : (
                  <>
                    <p className="text-white/70 text-xs leading-relaxed mb-2">{o.proposal_details}</p>
                    {o.contract_value ? (
                      <p className="text-[#D4AF37] text-xs font-bold mb-1">שווי חוזה: ₪{o.contract_value.toLocaleString()}</p>
                    ) : null}
                    {o.document_url && (
                      <a href={o.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 transition-colors">
                        <FileText size={12} /> צפה במסמך ההצעה
                      </a>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}