import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, Save, X } from 'lucide-react';
import { currentClauseValue, formatClauseValue } from '@/lib/contractClauses';

// טופס בלתי-לוק (inline) מותאם-תפקיד:
//   • שחקן/אפוטרופוס/מנהל אישי → יכולים רק להגיש הצעת שינוי (Draft Suggestion) — לא נוגעים בהצעה.
//   • מועדון (מנהל מקצועי) → רשאי לערוך בפועל: מעדכן שדה mapsToField ב-TransferProposal ומודיע על שינוי ישיר.
// מוסיפה רשומת AuditLog על כל פעולה לשקיפות משפטית מלאה.
export default function ClauseProposeInline({ def, proposal, player, role, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const isClub = role === 'club';
  const [value, setValue] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const currentVal = currentClauseValue(def.key, proposal);
  const inputType = def.type === 'date' ? 'date' : def.type === 'number' || def.type === 'percent' ? 'number' : 'text';

  const submitProposal = async () => {
    if (!value.trim() && !reasoning.trim()) return;
    setSubmitting(true); setErr(null);
    try {
      await base44.entities.NegotiationRequest.create({
        transfer_id: proposal.id,
        player_id: player?.id || proposal.player_elite_id,
        player_name: player?.full_name || proposal.player_name,
        club_name: proposal.club_name,
        transfer_category: proposal.transfer_category,
        sender_role: role === 'guardian' ? 'manager' : role, // NegotiationRequest enum: player|manager
        sender_name: currentUser?.full_name || currentUser?.email || '',
        clause_key: def.key,
        clause_label: def.label,
        current_value: currentVal,
        proposed_value: value.trim(),
        reasoning: reasoning.trim(),
        status: 'pending',
      });
      await base44.entities.Notification.create({
        audience: 'director',
        type: 'transfer_status',
        title: 'הצעת שינוי סעיף חוזה',
        body: `${currentUser?.full_name || role} הציע שינוי לסעיף "${def.label}" עבור ${player?.full_name || proposal.player_name}.`,
        player_id: player?.id || proposal.player_elite_id,
        player_name: player?.full_name || proposal.player_name,
        transfer_id: proposal.id,
        transfer_category: proposal.transfer_category,
        link_tab: 'transfers',
      });
      invalidateAll(queryClient, proposal.id);
      onClose();
    } catch (e) { setErr(e.message || 'שגיאה בשליחה'); }
    finally { setSubmitting(false); }
  };

  // עריכה ישירה של המועדון — מעדכן שדה ב-TransferProposal (מקור האמת לחוזה המחייב).
  const applyDirectEdit = async () => {
    if (!def.mapsToField) { onClose(); return; }
    setSubmitting(true); setErr(null);
    try {
      const patch = {};
      let num = def.type === 'number' || def.type === 'percent' ? Number(value) : value;
      if ((def.type === 'number' || def.type === 'percent') && isNaN(num)) num = 0;
      patch[def.mapsToField] = num;
      if (def.alsoCompute && (def.type === 'number' || def.type === 'percent')) {
        Object.entries(def.alsoCompute).forEach(([k, fn]) => { patch[k] = fn(num); });
      }
      await base44.entities.TransferProposal.update(proposal.id, patch);
      await base44.entities.AuditLog.create({
        actor_id: currentUser?.id || '',
        actor_name: currentUser?.full_name || currentUser?.email || 'מועדון',
        actor_role: role,
        action: 'status_change',
        player_id: player?.id || proposal.player_elite_id,
        details: `ערך ישירות סעיף "${def.label}" → ${formatClauseValue(def.key, value)} (ערך קודם: ${currentVal || '—'})`,
      });
      invalidateAll(queryClient, proposal.id);
      onClose();
    } catch (e) { setErr(e.message || 'שגיאה בעדכון'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mt-2 border-t border-white/10 pt-3 space-y-2" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/70">
          {isClub ? '✎ עריכה ישירה — מנהל מקצועי' : '✎ הצעת שינוי (Draft)'}
        </span>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X size={13} /></button>
      </div>
      <div className="text-white/40 text-[10px]">
        ערך נוכחי: <span className="text-white/70 font-bold">{formatClauseValue(def.key, currentVal) || '—'}</span>
      </div>
      <input
        type={inputType}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={def.type === 'percent' ? '%' : def.type === 'date' ? 'בחר תאריך' : 'הזן ערך מוצע'}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60"
        dir={def.type === 'date' ? 'ltr' : 'rtl'}
      />
      <textarea
        value={reasoning}
        onChange={e => setReasoning(e.target.value)}
        rows={2}
        placeholder={isClub ? 'הערה פנימית (אופציונלי)' : 'נימוק להצעה — הסבר למועדון'}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-2 text-white text-xs placeholder-white/25 resize-none focus:outline-none focus:border-[#D4AF37]/60"
      />
      {err && <div className="text-red-400 text-[10px]">{err}</div>}
      {isClub ? (
        <button onClick={applyDirectEdit} disabled={submitting || !value.trim()}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold bg-[#D4AF37] text-[#0D1B2A] py-2 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40">
          {submitting ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} שמור כערך רשמי
        </button>
      ) : (
        <button onClick={submitProposal} disabled={submitting || (!value.trim() && !reasoning.trim())}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 py-2 rounded-sm hover:bg-blue-500/25 transition-colors disabled:opacity-40">
          {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} שלח הצעת שינוי למועדון
        </button>
      )}
      <p className="text-white/30 text-[9px] leading-relaxed">
        {isClub
          ? 'השינוי ייכתב לחוזה המחייב ויירשם ב-Audit Log עם שמך (.Logged By)'
          : 'הצעתך תועבר למועדון לאישור — אינך רשאי לשנות את החוזה ישירות, רק להציע.'}
      </p>
    </div>
  );
}

function invalidateAll(qc, proposalId) {
  qc.invalidateQueries({ queryKey: ['negotiation-requests', proposalId] });
  qc.invalidateQueries({ queryKey: ['admin-transfers'] });
}