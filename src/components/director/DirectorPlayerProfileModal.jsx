import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import ExecutiveSummaryCard from './ExecutiveSummaryCard';
import AssetContractTab from './AssetContractTab';
import ProgressionTab from './ProgressionTab';
import RiskAssessmentTab from './RiskAssessmentTab';
import PipelineTab from './PipelineTab';

const TABS = [
  { id: 'asset', label: '💰 ערך וחוזה' },
  { id: 'progression', label: '📈 התפתחות' },
  { id: 'risk', label: '⚠️ סיכון מול סיכוי' },
  { id: 'pipeline', label: '🎯 ניהול קריירה' },
];

export default function DirectorPlayerProfileModal({ player, allPlayers, onClose }) {
  const [tab, setTab] = useState('asset');

  const { data: contracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ['dir-contracts', player.id],
    queryFn: () => base44.entities.Contract.filter({ player_id: player.id }, '-end_date', 10),
  });
  const { data: transfers = [] } = useQuery({
    queryKey: ['dir-player-transfers', player.id],
    queryFn: () => base44.entities.TransferTracker.filter({ player_id: player.id }, '-created_date', 20),
  });
  const { data: mentalHistory = [] } = useQuery({
    queryKey: ['dir-mental-history', player.id],
    queryFn: () => base44.entities.MentalAssessment.filter({ player_id: player.id }, 'assessment_date', 20),
  });

  const teammates = allPlayers.filter(p => p.position === player.position && p.team_name === player.team_name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl">

        <div className="sticky top-0 bg-[#1B263B] border-b border-white/10 p-5 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-lg">{player.full_name}</h3>
            <p className="text-white/40 text-xs">{player.position}{player.team_name ? ` · ${player.team_name}` : ''}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-4">
          <ExecutiveSummaryCard player={player} contracts={contracts} latestMental={mentalHistory[mentalHistory.length - 1]} />

          <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loadingContracts ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>
          ) : (
            <>
              {tab === 'asset' && <AssetContractTab player={player} contracts={contracts} transfers={transfers} />}
              {tab === 'progression' && <ProgressionTab player={player} mentalHistory={mentalHistory} teammates={teammates} />}
              {tab === 'risk' && <RiskAssessmentTab player={player} />}
              {tab === 'pipeline' && <PipelineTab player={player} />}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}