import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, MessageSquare, Plus, X, Send, CheckCircle2, XCircle, Clock, Handshake,
} from 'lucide-react';

// מרכז משא ומתן למנהל אישי של שחקן בוגר: מאפשר להציע שינוי סעיפי חוזה עם נימוק חופשי,
// ולצפות בתגובות המועדון. השחקן הבוגר בלבד חותם על החוזה — המנהל אינו רשאי לחתום.

const CLAUSE_PRESETS = [
  { key: 'contract_value', label: 'שווי חוזה שנתי (₪)', numeric: true },
  { key: 'loan_start_date', label: 'תאריך תחילת השאלה', date: true },
  { key: 'loan_end_date', label: 'תאריך סיום השאלה', date: true },
  { key: 'iefa_commission_fee', label: 'עמלת תיווך IEFA (₪)', numeric: true },
  { key: 'release_clause', label: 'סעיף שחרור (Release Clause)', text: true },
  { key: 'bonuses', label: 'מענקים / בונוסים', text: true },
  { key: 'contract_duration', label: 'אורך חוזה (שנים)', numeric: true },
  { key: 'custom', label: 'סעיף אחר — טקסט חופשי', custom: true },
];

const STATUS_META = {
  pending: { label: 'ממתין לתגובת המועדון', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: Clock },
  accepted: { label: 'התקבל על ידי המועדון', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', icon: CheckCircle2 },
  rejected: { label: 'נדחה על ידי המועדון', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', icon: XCircle },
};

function isLoanOffer(offer) {
  return (offer.transfer_category || '').startsWith('השאל');
}

function currentFieldValue(offer, clauseKey) {
  if (clauseKey === 'contract_value') return offer.contract_value ? String(offer.contract_value) : '';
  if (clauseKey === 'iefa_commission_fee') return offer.iefa_commission_fee ? String(offer.iefa_commission_fee) : '';
  if (clauseKey === 'loan_start_date') return offer.loan_start_date || '';
  if (clauseKey === 'loan_end_date') return offer.loan_end_date || '';
  if (clauseKey === 'contract_duration') return '';
  return '';
}

export default function NegotiationHub({ offer, player, currentUser }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [clauseKey, setClauseKey] = useState('contract_value');
  const [customLabel, setCustomLabel] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [reasoning, setReasoning] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['negotiation-requests', offer.id],
    queryFn: () => base44.entities.NegotiationRequest.filter({ transfer_id: offer.id }, '-created_date', 50),
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      const preset = CLAUSE_PRESETS.find(c => c.key === clauseKey) || CLAUSE_PRESETS[CLAUSE_PRESETS.length - 1];
      const label = preset.custom ? customLabel.trim() : preset.label;
      const req = await base44.entities.NegotiationRequest.create({
        transfer_id: offer.id,
        player_id: player.id || player.elite_id,
        player_name: player.full_name,
        club_name: offer.club_name,
        transfer_category: offer.transfer_category,
        sender_role: 'manager',
        sender_name: currentUser?.full_name || '',
        clause_key: clauseKey,
        clause_label: label,
        current_value: currentFieldValue(offer, clauseKey),
        proposed_value: proposedValue.trim(),
        reasoning: reasoning.trim(),
        status: 'pending',
      });
      // התראה למנהל מקצועי על בקשת משא ומתן חדשה
      await base44.entities.Notification.create({
        audience: 'director',
        type: 'transfer_status',
        title: 'בקשת משא ומתן חדשה על סעיף חוזה',
        body: `${currentUser?.full_name || 'מנהל אישי'} הציע שינוי לסעיף "${label}" עבור ${player.full_name} (מועדון ${offer.club_name}).`,
        player_id: player.id || player.elite_id,
        player_name: player.full_name,
        transfer_id: offer.id,
        transfer_category: offer.transfer_category,
        link_tab: 'transfers',
      });
      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiation-requests', offer.id] });
      setShowForm(false);
      setProposedValue('');
      setReasoning('');
      setCustomLabel('');
      setClauseKey('contract_value');
    },
  });

  const preset = CLAUSE_PRESETS.find(c => c.key === clauseKey) || CLAUSE_PRESETS[0];
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-[#0D1B2A] border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-black">
          <Handshake size={14} /> מרכז משא ומתן — סעיפי חוזה
        </div>
        {pendingCount > 0 && (
          <span className="text-amber-400 text-[10px] font-bold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
            {pendingCount} ממתינות
          </span>
        )}
      </div>

      <p className="text-white/40 text-[11px] leading-relaxed mb-3">
        כמנהל אישי של שחקן בוגר, באפשרותך להציע שינויים בסעיפי החוזה ולנהל משא ומתן מול המועדון. <span className="text-white/60 font-bold">השחקן עצמו חותם על החוזה</span> — אינך רשאי לחתום במקומו.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 py-2 rounded-sm hover:bg-blue-500/25 transition-colors"
        >
          <Plus size={12} /> הצע שינוי סעיף חוזה
        </button>
      ) : (
        <div className="space-y-3 bg-[#1B263B] border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-[11px] font-bold">בקשת שינוי חדשה</span>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div>
            <div className="text-white/60 text-[10px] font-bold mb-1">סעיף לשינוי</div>
            <select
              value={clauseKey}
              onChange={e => { setClauseKey(e.target.value); setProposedValue(''); }}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2 py-2 text-white text-[11px] focus:outline-none focus:border-[#D4AF37]/60"
            >
              {CLAUSE_PRESETS.map(c => {
                if (c.date && !isLoanOffer(offer)) return null;
                return <option key={c.key} value={c.key} className="bg-[#1B263B]">{c.label}</option>;
              })}
            </select>
          </div>

          {preset.custom && (
            <div>
              <div className="text-white/60 text-[10px] font-bold mb-1">שם הסעיף</div>
              <input
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="לדוגמה: סעיף שחרור לחו״ל, תשלום דמי השבחה"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2 py-2 text-white text-[11px] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                dir="rtl"
              />
            </div>
          )}

          <div>
            <div className="text-white/60 text-[10px] font-bold mb-1">הערך המוצע</div>
            <input
              type={preset.date ? 'date' : preset.numeric ? 'number' : 'text'}
              value={proposedValue}
              onChange={e => setProposedValue(e.target.value)}
              placeholder={preset.date ? 'בחר תאריך' : 'הזן ערך'}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2 py-2 text-white text-[11px] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
              dir={preset.date ? 'ltr' : 'rtl'}
            />
          </div>

          <div>
            <div className="text-white/60 text-[10px] font-bold mb-1">נימוק / טקסט חופשי</div>
            <textarea
              value={reasoning}
              onChange={e => setReasoning(e.target.value)}
              placeholder="הסבר את עמדתך — למה נכון לשנות את הסעיף?"
              rows={3}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2 py-2 text-white text-[11px] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none"
              dir="rtl"
            />
          </div>

          <button
            onClick={() => submitRequest.mutate()}
            disabled={(!proposedValue.trim() && !reasoning.trim()) || (preset.custom && !customLabel.trim()) || submitRequest.isPending}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-[#D4AF37] text-[#0D1B2A] py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitRequest.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            שלח בקשה למועדון
          </button>
          {submitRequest.isError && <p className="text-red-400 text-[10px]">שגיאה: {submitRequest.error?.message}</p>}
        </div>
      )}

      {/* רשימת בקשות קודמות + תגובות המועדון */}
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-3"><Loader2 size={14} className="animate-spin text-white/30" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4">
            <MessageSquare size={18} className="text-white/20 mx-auto mb-1" />
            <p className="text-white/30 text-[11px]">אין בקשות משא ומתן עדיין</p>
          </div>
        ) : (
          requests.map(r => {
            const m = STATUS_META[r.status] || STATUS_META.pending;
            const Icon = m.icon;
            return (
              <div key={r.id} className={`bg-[#1B263B] border ${m.border} rounded-lg p-3`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-white font-bold text-xs">{r.clause_label}</div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.color} flex items-center gap-1`}>
                    <Icon size={9} /> {m.label}
                  </span>
                </div>
                <div className="text-white/60 text-[11px] mb-1">
                  ערך נוכחי: <span className="text-white/40">{r.current_value || '—'}</span>
                  <span className="mx-1.5 text-white/20">←</span>
                  <span className="text-[#D4AF37] font-bold">{r.proposed_value || '—'}</span>
                </div>
                {r.reasoning && (
                  <p className="text-white/50 text-[11px] leading-relaxed mt-1.5 whitespace-pre-wrap">"{r.reasoning}"</p>
                )}
                {r.director_notes && (
                  <div className={`mt-2 pt-2 border-t border-white/10`}>
                    <div className="text-white/40 text-[9px] font-bold uppercase tracking-wide">תגובת המועדון</div>
                    <p className="text-white/70 text-[11px] mt-0.5 whitespace-pre-wrap">{r.director_notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}