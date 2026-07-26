import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Loader2, PenLine } from 'lucide-react';
import { signatureStatus } from '@/lib/contractTemplates';
import ContractSignModal from '../contracts/ContractSignModal';

const STATUS_COLORS = {
  'ממתין לחתימה': 'text-amber-400 bg-amber-400/10',
  'חתום': 'text-green-400 bg-green-400/10',
  'פג תוקף': 'text-white/40 bg-white/5',
  'בוטל': 'text-red-400 bg-red-400/10',
};

export default function ContractsQuickAccess({ playerId }) {
  const [signing, setSigning] = useState(null);
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
      <h3 className="text-white font-black text-base mb-1">📄 חוזים — גישה וחתימה מהירה</h3>
      <p className="text-white/40 text-xs mb-4">החוזים שלך וחתימה דיגיטלית ישירות מהמערכת</p>
      <div className="space-y-2.5">
        {contracts.map(c => {
          const sig = signatureStatus(c);
          const fullySigned = c.status === 'חתום';
          return (
            <div key={c.id} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={15} className="text-[#D4AF37] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-white text-xs font-bold truncate">{c.contract_type}</div>
                    <div className="text-white/40 text-[10px]">{c.start_date} — {c.end_date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {c.document_url && (
                    <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300" title="הורד חוזה">
                      <Download size={14} />
                    </a>
                  )}
                  {!fullySigned && (
                    <button onClick={() => setSigning(c)} className="flex items-center gap-1 text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full hover:bg-[#D4AF37]/25 transition-colors">
                      <PenLine size={11} /> חתום
                    </button>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'text-white/40 bg-white/5'}`}>{c.status}</span>
                </div>
              </div>
              {/* Signature status row */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                {sig.player && (
                  <span className={`font-bold ${sig.player.cls}`}>{sig.player.label}</span>
                )}
                {sig.guardian && (
                  <span className={`font-bold ${sig.guardian.cls}`}>{sig.guardian.label}</span>
                )}
                {c.ifa_form_reference && (
                  <span className="text-white/30" title={c.ifa_form_reference}>· מבוסס טופס התאחדות</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {signing && (
        <ContractSignModal
          contract={signing}
          onClose={() => setSigning(null)}
          onSaved={() => {/* queries invalidated inside */}}
        />
      )}
    </div>
  );
}