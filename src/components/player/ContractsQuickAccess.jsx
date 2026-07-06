import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  'ממתין לחתימה': 'text-amber-400 bg-amber-400/10',
  'חתום': 'text-green-400 bg-green-400/10',
  'פג תוקף': 'text-white/40 bg-white/5',
  'בוטל': 'text-red-400 bg-red-400/10',
};

export default function ContractsQuickAccess({ playerId }) {
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['player-contracts', playerId],
    queryFn: () => base44.entities.Contract.filter({ player_id: playerId }, '-created_date', 10),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 text-center">
        <Loader2 size={16} className="animate-spin text-[#D4AF37] mx-auto" />
      </div>
    );
  }

  if (!contracts.length) return null;

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-black text-base mb-1">📄 חוזים — גישה מהירה</h3>
      <p className="text-white/40 text-xs mb-4">כל החוזים שלך בלחיצת כפתור אחת</p>
      <div className="space-y-2.5">
        {contracts.map(c => (
          <div key={c.id} className="flex items-center justify-between gap-3 bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText size={15} className="text-[#D4AF37] flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-white text-xs font-bold truncate">{c.contract_type}</div>
                <div className="text-white/40 text-[10px]">{c.start_date} — {c.end_date}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'text-white/40 bg-white/5'}`}>{c.status}</span>
              {c.document_url && (
                <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300">
                  <Download size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}