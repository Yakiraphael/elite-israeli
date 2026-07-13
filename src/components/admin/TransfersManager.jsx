import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, FileText, ShieldAlert, CreditCard, Gavel, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import TransferPipelineStepper from './TransferPipelineStepper';
import TransferApprovalGate from './TransferApprovalGate';
import { TRANSFER_CATEGORIES } from '@/lib/transferDocumentRequirements';

const STATUSES = [
  'ממתין לאישור הנהלה',
  'מאושר — ממתין לאפוטרופוס',
  'מאושר — ממתין לשחקן (בוגר)',
  'ממתין לאימות תשלום (בוגר)',
  'ממתין לאימות התאחדות (IFA)',
  'אושרה סופית',
  'נדחתה',
  'נסגרה',
];

const STATUS_COLORS = {
  'ממתין לאישור הנהלה': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'מאושר — ממתין לאפוטרופוס': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'מאושר — ממתין לשחקן (בוגר)': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'ממתין לאימות תשלום (בוגר)': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'ממתין לאימות התאחדות (IFA)': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  'אושרה סופית': 'text-green-400 bg-green-400/10 border-green-400/30',
  'נדחתה': 'text-red-400 bg-red-400/10 border-red-400/30',
  'נסגרה': 'text-white/40 bg-white/5 border-white/20',
};

const PAYMENT_COLORS = { PENDING: 'text-yellow-400', PAID: 'text-green-400', REFUNDED: 'text-red-400', 'N/A': 'text-white/30' };
const PAYMENT_LABELS = { PENDING: 'ממתין לתשלום', PAID: 'שולם', REFUNDED: 'הוחזר', 'N/A': 'לא רלוונטי' };
const IFA_COLORS = { 'Awaiting Submission': 'text-yellow-400', 'Pending IFA Processing': 'text-cyan-400', 'Verified & Live': 'text-green-400', 'N/A': 'text-white/30' };
const IFA_LABELS = { 'Awaiting Submission': 'ממתין להגשה', 'Pending IFA Processing': 'בטיפול ההתאחדות', 'Verified & Live': 'מאומת ופעיל', 'N/A': 'לא רלוונטי' };
const COACH_APPROVAL_COLORS = { 'לא נדרש': 'text-white/30 bg-white/5 border-white/10', 'ממתין לאישור מאמן': 'text-amber-400 bg-amber-400/10 border-amber-400/30', 'אושר על ידי מאמן': 'text-green-400 bg-green-400/10 border-green-400/30', 'נדחה על ידי מאמן': 'text-red-400 bg-red-400/10 border-red-400/30' };

export default function TransfersManager() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');
  const [readyMap, setReadyMap] = useState({});
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: () => base44.entities.TransferProposal.list('-created_date', 100),
  });

  const queryClient = useQueryClient();
  const updateProposal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TransferProposal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transfers'] }),
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return proposals;
    if (filter === 'active') return proposals.filter(p => !['אושרה סופית', 'נדחתה', 'נסגרה'].includes(p.status));
    if (filter === 'ifa') return proposals.filter(p => p.status === 'ממתין לאימות התאחדות (IFA)');
    if (filter === 'done') return proposals.filter(p => p.status === 'אושרה סופית');
    return proposals;
  }, [proposals, filter]);

  const handleContractValueChange = (p, value) => {
    const contract_value = Number(value) || 0;
    updateProposal.mutate({ id: p.id, data: { contract_value, iefa_commission_fee: Math.round(contract_value * 0.05 * 100) / 100 } });
  };

  const requestCoachApproval = useMutation({
    mutationFn: async (p) => {
      await base44.entities.TransferProposal.update(p.id, { coach_approval_status: 'ממתין לאישור מאמן' });
      await base44.entities.Notification.create({
        audience: 'coach',
        type: 'request_new',
        title: 'נדרש אישור מאמן להעברת שחקן',
        body: `מבוקש אישורך להעברת השחקן ${p.player_name || p.player_elite_id} — הבדיקה מתבססת על פרופיל השחקן בלבד`,
        player_id: p.player_elite_id,
        player_name: p.player_name,
        request_id: p.id,
        link_tab: 'approvals',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transfers'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-white font-black text-xl">מרכז ניהול העברות · תאימות רגולטורית</h2>
        <span className="text-white/40 text-xs">{filtered.length} מתוך {proposals.length} הצעות</span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'all', label: 'הכל' },
          { id: 'active', label: 'בתהליך' },
          { id: 'ifa', label: 'ממתין ל-IFA' },
          { id: 'done', label: 'אושרו סופית' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${filter === f.id ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/50 border-white/15 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Send size={28} className="text-white/20 mx-auto mb-3" />
          <div className="text-white/30 text-sm">אין הצעות העברה תואמות</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{p.club_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_adult ? 'text-white/60 bg-white/5 border-white/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'}`}>
                      {p.is_adult ? 'בוגר' : 'נוער — נדרש אפוטרופוס'}
                    </span>
                  </div>
                  <div className="text-white/50 text-xs mt-1">{p.contact_name}</div>
                  <div className="text-[#D4AF37] text-xs mt-1">
                    שחקן: {p.player_name || '—'} · {p.player_elite_id}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {new Date(p.created_date).toLocaleDateString('he-IL')}
                  </div>
                  <div className="mt-3">
                    <TransferPipelineStepper status={p.status} isAdult={p.is_adult} />
                  </div>
                  <div className="mt-2">
                    <select value={p.transfer_category || 'העברת נוער'}
                      onChange={e => updateProposal.mutate({ id: p.id, data: { transfer_category: e.target.value } })}
                      className="text-[10px] font-bold px-2 py-1 rounded-sm border border-white/15 bg-transparent text-white/50 focus:outline-none cursor-pointer">
                      {TRANSFER_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1B263B] text-white">{c}</option>)}
                    </select>
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
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
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

                  {/* Regulatory & compliance grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {p.is_adult && (
                      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><CreditCard size={11} /> שווי חוזה ועמלת IEFA (5%)</div>
                        <input
                          type="number"
                          value={p.contract_value || ''}
                          onChange={e => handleContractValueChange(p, e.target.value)}
                          placeholder="שווי חוזה שנתי (₪)"
                          className="w-full bg-transparent border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60 mb-1.5"
                        />
                        <div className="text-white/60 text-[10px]">עמלה מחושבת: <span className="text-[#D4AF37] font-bold">₪{(p.iefa_commission_fee || 0).toLocaleString('he-IL')}</span></div>
                      </div>
                    )}

                    {p.is_adult && (
                      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><ShieldAlert size={11} /> סטטוס תשלום</div>
                        <select value={p.payment_status || 'N/A'} onChange={e => updateProposal.mutate({ id: p.id, data: { payment_status: e.target.value } })}
                          className={`w-full text-xs font-bold px-2 py-1.5 rounded-sm border border-white/15 bg-transparent focus:outline-none cursor-pointer ${PAYMENT_COLORS[p.payment_status || 'N/A']}`}>
                          {['N/A', 'PENDING', 'PAID', 'REFUNDED'].map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{PAYMENT_LABELS[s]}</option>)}
                        </select>
                        {p.payment_transaction_id && <div className="text-white/30 text-[10px] mt-1.5 truncate">אסמכתא: {p.payment_transaction_id}</div>}
                      </div>
                    )}

                    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><Gavel size={11} /> אימות התאחדות (IFA / FIFA)</div>
                      <select value={p.ifa_validation_status || 'N/A'} onChange={e => updateProposal.mutate({ id: p.id, data: { ifa_validation_status: e.target.value } })}
                        className={`w-full text-xs font-bold px-2 py-1.5 rounded-sm border border-white/15 bg-transparent focus:outline-none cursor-pointer ${IFA_COLORS[p.ifa_validation_status || 'N/A']}`}>
                        {['N/A', 'Awaiting Submission', 'Pending IFA Processing', 'Verified & Live'].map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{IFA_LABELS[s]}</option>)}
                      </select>
                    </div>

                    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><UserCheck size={11} /> אישור מאמן (ללא חשיפת ההצעה)</div>
                      <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full border ${COACH_APPROVAL_COLORS[p.coach_approval_status || 'לא נדרש']}`}>
                        {p.coach_approval_status || 'לא נדרש'}
                      </span>
                      {(!p.coach_approval_status || p.coach_approval_status === 'לא נדרש' || p.coach_approval_status === 'נדחה על ידי מאמן') && (
                        <button onClick={() => requestCoachApproval.mutate(p)} className="block mt-2 text-[10px] font-bold text-[#D4AF37] hover:text-amber-300 transition-colors">
                          בקש אישור מאמן →
                        </button>
                      )}
                    </div>

                    {!p.is_adult && (
                      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-white/40 text-[10px] font-bold">אימות OTP אפוטרופוס</span>
                        <span className={`text-xs font-bold ${p.guardian_otp_verified ? 'text-green-400' : 'text-red-400'}`}>{p.guardian_otp_verified ? '✓ אומת' : '✗ טרם אומת'}</span>
                      </div>
                    )}
                  </div>

                  <TransferApprovalGate proposal={p} onReadyChange={r => setReadyMap(m => ({ ...m, [p.id]: r }))} />

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-white/40 text-xs">שלב תהליך:</span>
                    <select
                      value={p.status || STATUSES[0]}
                      onChange={e => updateProposal.mutate({ id: p.id, data: { status: e.target.value } })}
                      className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/15 bg-[#0D1B2A] text-white focus:outline-none cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{s}</option>)}
                    </select>
                    {!['אושרה סופית', 'נדחתה', 'נסגרה'].includes(p.status) && (
                      <>
                        <button onClick={() => updateProposal.mutate({ id: p.id, data: { status: 'אושרה סופית' } })}
                          disabled={!readyMap[p.id]}
                          title={!readyMap[p.id] ? 'יש להשלים את כל דרישות מנגנון האימות למעלה' : ''}
                          className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300 bg-green-400/10 border border-green-400/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-green-400">
                          <CheckCircle2 size={12} /> אשר סופית
                        </button>
                        <button onClick={() => updateProposal.mutate({ id: p.id, data: { status: 'נדחתה' } })}
                          className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-400/10 border border-red-400/30 px-3 py-1.5 rounded-full transition-colors">
                          <XCircle size={12} /> דחה
                        </button>
                      </>
                    )}
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