import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, FileText, ExternalLink } from 'lucide-react';

const STATUSES = [
  'ממתין לאישור הנהלה',
  'מאושר - ממתין לאפוטרופוס',
  'אושרה סופית',
  'נדחתה',
  'נסגרה',
];

const STATUS_COLORS = {
  'ממתין לאישור הנהלה': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'מאושר - ממתין לאפוטרופוס': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'אושרה סופית': 'text-green-400 bg-green-400/10 border-green-400/30',
  'נדחתה': 'text-red-400 bg-red-400/10 border-red-400/30',
  'נסגרה': 'text-white/40 bg-white/5 border-white/20',
};

export default function TransfersManager() {
  const [expanded, setExpanded] = useState(null);
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: () => base44.entities.TransferProposal.list('-created_date', 100),
  });

  const queryClient = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TransferProposal.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transfers'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl">הצעות העברה</h2>
        <span className="text-white/40 text-xs">{proposals.length} הצעות</span>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16">
          <Send size={28} className="text-white/20 mx-auto mb-3" />
          <div className="text-white/30 text-sm">אין הצעות העברה עדיין</div>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{p.club_name}</span>
                    {p.status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || STATUS_COLORS['ממתין לאישור הנהלה']}`}>
                        {p.status}
                      </span>
                    )}
                  </div>
                  <div className="text-white/50 text-xs mt-1">{p.contact_name}</div>
                  <div className="text-[#D4AF37] text-xs mt-1">
                    שחקן: {p.player_name || '—'} · {p.player_elite_id}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {new Date(p.created_date).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.document_url && (
                    <a href={p.document_url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <FileText size={13} className="text-white/50" />
                    </a>
                  )}
                  <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="text-white/40 text-xs hover:text-white transition-colors">
                    {expanded === p.id ? 'סגור' : 'פרטים'}
                  </button>
                </div>
              </div>

              {expanded === p.id && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  {p.proposal_details && (
                    <div>
                      <div className="text-[#D4AF37] text-xs font-bold mb-1">פירוט ההצעה</div>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap">{p.proposal_details}</p>
                    </div>
                  )}
                  {(p.contact_email || p.contact_phone) && (
                    <div className="flex flex-wrap gap-4 text-xs text-white/40">
                      {p.contact_email && <span>{p.contact_email}</span>}
                      {p.contact_phone && <span dir="ltr">{p.contact_phone}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs">סטטוס:</span>
                    <select
                      value={p.status || STATUSES[0]}
                      onChange={e => updateStatus.mutate({ id: p.id, status: e.target.value })}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/15 bg-[#0D1B2A] text-white focus:outline-none cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}