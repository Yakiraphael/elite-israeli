import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ReportCenter from './ReportCenter';
import InsightEngine from './InsightEngine';

export default function AnalyticsTab({ players }) {
  const [subTab, setSubTab] = useState('reports');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['finance-payments'],
    queryFn: () => base44.entities.Payment.list('-due_date', 500),
  });

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#1B263B] border border-white/10 rounded-lg p-1 w-fit">
        {[{ id: 'reports', label: 'מרכז הדוחות' }, { id: 'insights', label: 'מנוע תובנות' }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded min-h-[36px] transition-colors ${subTab === t.id ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div> : (
        <>
          {subTab === 'reports' && <ReportCenter players={players} />}
          {subTab === 'insights' && <InsightEngine players={players} payments={payments} />}
        </>
      )}
    </div>
  );
}