import { useState } from 'react';
import CoachTransferApprovals from './CoachTransferApprovals';
import CoachRosterContractsView from './CoachRosterContractsView';
import { FileText, CheckCircle2 } from 'lucide-react';

// Unified tab combining transfer approvals and squad-contracts with sub-tabs.
// Replaces the separate "approvals" and "roster" tabs in the Coach Workspace.
export default function CoachContractsApprovalsTab({ players, onSelect }) {
  const [subTab, setSubTab] = useState('contracts');

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex gap-2 bg-[#1B263B] border border-white/10 rounded-lg p-1.5 justify-center">
        <button onClick={() => setSubTab('contracts')}
          className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subTab === 'contracts' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/50 hover:text-white'}`}>
          <FileText size={14} /> חוזים
        </button>
        <button onClick={() => setSubTab('approvals')}
          className={`flex items-center gap-2 flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${subTab === 'approvals' ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/50 hover:text-white'}`}>
          <CheckCircle2 size={14} /> אישורי העברה
        </button>
      </div>

      {subTab === 'contracts' ? (
        <CoachRosterContractsView players={players} onSelect={onSelect} />
      ) : (
        <CoachTransferApprovals />
      )}
    </div>
  );
}