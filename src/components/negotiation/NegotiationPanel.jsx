import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Handshake, CheckCircle2, XCircle, MessageSquare,
} from 'lucide-react';

// פאנל ניהול משא ומתן עבור המנהל המקצועי — מציג בקשות מנהל אישי/שחקן ומאפשר אישור/דחייה.
// אישור מיישם אוטומטית את השינוי על השדה המתאים ב-TransferProposal ושולח התראה חזרה.

// מיפוי סעיף -> שדה ב-TransferProposal שיש לעדכן אוטומטית בעת אישור
const CLAUSE_TO_FIELD = {
  contract_value: { field: 'contract_value', numeric: true, alsoUpdate: { iefa_commission_fee: (v) => Math.round(v * 0.05 * 100) / 100 } },
  loan_start_date: { field: 'loan_start_date' },
  loan_end_date: { field: 'loan_end_date' },
  iefa_commission_fee: { field: 'iefa_commission_fee', numeric: true },
};

const STATUS_META = {
  pending: { label: 'ממתין', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  accepted: { label: 'אושר', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  rejected: { label: 'נדחה', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

export default function NegotiationPanel({ proposal }) {
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['negotiation-requests', proposal.id],
    queryFn: () => base44.entities.NegotiationRequest.filter({ transfer_id: proposal.id }, '-created_date', 50),
  });

  const acceptRequest = useMutation({
    mutationFn: async (req) => {
      const update = { status: 'accepted', responded_at: new Date().toISOString(), director_notes: req.director_notes || '' };
      const fieldMap = CLAUSE_TO_FIELD[req.clause_key];

      // עדכון אוטומטי של שדה ההצעה (כאשר הסעיף ממופה)
      if (fieldMap) {
        const proposalPatch = {};
        if (fieldMap.numeric) {
          const num = Number(req.proposed_value);
          if (!isNaN(num)) proposalPatch[fieldMap.field] = num;
          if (fieldMap.alsoUpdate) {
            Object.entries(fieldMap.alsoUpdate).forEach(([k, fn]) => {
              proposalPatch[k] = fn(num);
            });
          }
        } else {
          proposalPatch[fieldMap.field] = req.proposed_value;
        }
        if (Object.keys(proposalPatch).length) {
          await base44.entities.TransferProposal.update(proposal.id, proposalPatch);
        }
      }

      await base44.entities.NegotiationRequest.update(req.id, update);

      // התראה חזרה למנהל האישי/השחקן
      await base44.entities.Notification.create({
        audience: req.sender_role === 'manager' ? 'parent' : 'player',
        type: 'transfer_status',
        title: 'בקשת משא ומתן התקבלה',
        body: `המועדון אישר את הצעתך לסעיף "${req.clause_label}": ${req.proposed_value || '—'}.`,
        player_id: req.player_id,
        player_name: req.player_name,
        transfer_id: proposal.id,
        transfer_category: req.transfer_category,
        link_tab: 'offers',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiation-requests', proposal.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['negotiation-panel', proposal.id] });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: async (req) => {
      await base44.entities.NegotiationRequest.update(req.id, {
        status: 'rejected',
        responded_at: new Date().toISOString(),
        director_notes: rejectNotes.trim(),
      });
      await base44.entities.Notification.create({
        audience: req.sender_role === 'manager' ? 'parent' : 'player',
        type: 'transfer_status',
        title: 'בקשת משא ומתן נדחתה',
        body: `המועדון דחה את הצעתך לסעיף "${req.clause_label}".${rejectNotes.trim() ? ' תגובה: ' + rejectNotes.trim() : ''}`,
        player_id: req.player_id,
        player_name: req.player_name,
        transfer_id: proposal.id,
        transfer_category: req.transfer_category,
        link_tab: 'offers',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiation-requests', proposal.id] });
      setRejectId(null);
      setRejectNotes('');
    },
  });

  const pending = requests.filter(r => r.status === 'pending');

  if (isLoading) {
    return <div className="flex justify-center py-3"><Loader2 size={14} className="animate-spin text-white/30" /></div>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 text-center">
        <Handshake size={18} className="text-white/20 mx-auto mb-1" />
        <p className="text-white/30 text-[11px]">אין בקשות משא ומתן פתוחות</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-3 uppercase tracking-widest">
        <Handshake size={12} /> משא ומתן — בקשות שחקן/מנהל אישי ({pending.length} ממתינות)
      </div>

      <div className="space-y-2">
        {requests.map(r => {
          const m = STATUS_META[r.status] || STATUS_META.pending;
          const autoApply = !!CLAUSE_TO_FIELD[r.clause_key];
          return (
            <div key={r.id} className={`bg-[#1B263B] border ${m.border} rounded-lg p-3`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="text-white font-bold text-xs">{r.clause_label}</div>
                  <div className="text-white/40 text-[10px] mt-0.5">
                    {r.sender_role === 'manager' ? 'מנהל אישי' : 'שחקן'}: {r.sender_name || '—'}
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>{m.label}</span>
              </div>

              <div className="text-white/60 text-[11px] mb-1.5">
                ערך נוכחי: <span className="text-white/40">{r.current_value || '—'}</span>
                <span className="mx-1.5 text-white/20">←</span>
                <span className="text-[#D4AF37] font-bold">{r.proposed_value || '—'}</span>
              </div>

              {r.reasoning && (
                <p className="text-white/50 text-[11px] leading-relaxed mb-2 whitespace-pre-wrap">"{r.reasoning}"</p>
              )}

              {r.director_notes && r.status !== 'pending' && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-white/40 text-[9px] font-bold uppercase tracking-wide">תגובת המועדון</div>
                  <p className="text-white/70 text-[11px] mt-0.5 whitespace-pre-wrap">{r.director_notes}</p>
                </div>
              )}

              {r.status === 'pending' && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => acceptRequest.mutate(r)}
                    disabled={acceptRequest.isPending}
                    className="flex items-center gap-1 text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-1.5 rounded-sm hover:bg-green-500/25 transition-colors disabled:opacity-40"
                  >
                    <CheckCircle2 size={11} /> אשר שינוי
                    {autoApply && <span className="text-[8px] text-green-300/70">(ייושם אוטומטית)</span>}
                  </button>
                  <button
                    onClick={() => setRejectId(rejectId === r.id ? null : r.id)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-sm hover:bg-red-500/25 transition-colors"
                  >
                    <XCircle size={11} /> דחה
                  </button>

                  {rejectId === r.id && (
                    <div className="w-full mt-2 space-y-2">
                      <textarea
                        value={rejectNotes}
                        onChange={e => setRejectNotes(e.target.value)}
                        placeholder="סיבת דחייה / תגובה למנהל"
                        rows={2}
                        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2 py-2 text-white text-[11px] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none"
                        dir="rtl"
                      />
                      <button
                        onClick={() => rejectRequest.mutate(r)}
                        disabled={rejectRequest.isPending}
                        className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 py-1.5 rounded-sm hover:bg-red-500/30 transition-colors disabled:opacity-40"
                      >
                        {rejectRequest.isPending ? <Loader2 size={11} className="animate-spin" /> : <MessageSquare size={11} />}
                        שלח דחייה
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}