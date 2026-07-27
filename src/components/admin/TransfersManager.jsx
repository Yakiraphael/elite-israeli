import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Send, FileText, ShieldAlert, CreditCard, Gavel, CheckCircle2, XCircle,
  UserCheck, Search,
} from 'lucide-react';
import TransferPipelineStepper from './TransferPipelineStepper';
import TransferApprovalGate from './TransferApprovalGate';
import NegotiationPanel from '@/components/negotiation/NegotiationPanel';
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
const COACH_APPROVAL_COLORS = {
  'לא נדרש': 'text-white/30 bg-white/5 border-white/10',
  'ממתין לאישור מאמן': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'אושר על ידי מאמן': 'text-green-400 bg-green-400/10 border-green-400/30',
  'נדחה על ידי מאמן': 'text-red-400 bg-red-400/10 border-red-400/30',
};

const TERMINAL = ['אושרה סופית', 'נדחתה', 'נסגרה'];

const SECTIONS = [
  { id: 'details', label: 'פרטים ותשלום' },
  { id: 'compliance', label: 'אימות התאחדות ומסמכים' },
  { id: 'negotiation', label: 'משא ומתן' },
  { id: 'gate', label: 'מנגנון אישור סופי' },
];

export default function TransfersManager() {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('details');
  const [readyMap, setReadyMap] = useState({});

  const queryClient = useQueryClient();
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: () => base44.entities.TransferProposal.list('-created_date', 100),
  });

  const updateProposal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TransferProposal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-transfers'] }),
  });

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

  const handleContractValueChange = (p, value) => {
    const contract_value = Number(value) || 0;
    updateProposal.mutate({ id: p.id, data: { contract_value, iefa_commission_fee: Math.round(contract_value * 0.05 * 100) / 100 } });
  };

  const activeCount = proposals.filter(p => !TERMINAL.includes(p.status)).length;
  const pendingComplianceCount = proposals.filter(p => p.status === 'ממתין לאימות התאחדות (IFA)').length;
  const approvedCount = proposals.filter(p => p.status === 'אושרה סופית').length;

  const filtered = useMemo(() => {
    let list = proposals;
    if (filter === 'active') list = list.filter(p => !TERMINAL.includes(p.status));
    else if (filter === 'ifa') list = list.filter(p => p.status === 'ממתין לאימות התאחדות (IFA)');
    else if (filter === 'done') list = list.filter(p => p.status === 'אושרה סופית');

    if (search.trim()) {
      const s = search.trim();
      list = list.filter(p =>
        (p.club_name || '').includes(s) ||
        (p.player_name || '').includes(s) ||
        (p.contact_name || '').includes(s)
      );
    }
    return list;
  }, [proposals, filter, search]);

  const selected = proposals.find(p => p.id === selectedId);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-white font-black text-xl">מרכז ניהול העברות והשאלות</h2>
          <p className="text-white/40 text-xs mt-0.5">תהליכים מול מועדונים · אימות התאחדות · מו"מ חוזים</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatChip icon={Send} color="blue" label="פעילות" value={activeCount} />
          <StatChip icon={ShieldAlert} color="cyan" label="ממתין לאימות ההתאחדות" value={pendingComplianceCount} />
          <StatChip icon={CheckCircle2} color="green" label="אושרו סופית" value={approvedCount} />
        </div>
      </div>

      {/* Filter pills + search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-[#1B263B] border border-white/10 rounded-lg p-1 flex-wrap">
          {[
            { id: 'all', label: 'הכל' },
            { id: 'active', label: 'בתהליך' },
            { id: 'ifa', label: 'ממתין לאימות ההתאחדות הרשמית' },
            { id: 'done', label: 'אושרו סופית' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors ${filter === f.id ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/60 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מועדון, שחקן, איש קשר…"
            className="w-full bg-[#1B263B] border border-white/15 rounded-lg pr-9 pl-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
        </div>
      </div>

      {/* Body: master-detail */}
      {isLoading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Send size={28} className="text-white/20 mx-auto mb-3" />
          <div className="text-white/30 text-sm">אין הצעות העברה תואמות</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* List */}
          <div className="lg:col-span-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pl-1">
            {filtered.map(p => {
              const isSelected = selectedId === p.id;
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`w-full text-right bg-[#1B263B] border rounded-lg p-3.5 transition-all ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 hover:border-white/25'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs font-bold truncate">{p.club_name || '—'}</div>
                      <div className="text-white/40 text-[10px] mt-0.5 truncate">{p.player_name || p.player_elite_id}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${p.is_adult ? 'text-white/60 bg-white/5 border-white/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'}`}>
                      {p.is_adult ? 'בוגר' : 'נוער'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || STATUS_COLORS['ממתין לאישור הנהלה']}`}>
                      {p.status}
                    </span>
                    {p.transfer_category && <span className="text-white/30 text-[10px] truncate max-w-[140px]">{p.transfer_category}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-8">
            {!selected ? (
              <div className="bg-[#1B263B] border border-white/10 border-dashed rounded-lg p-12 text-center h-full flex flex-col items-center justify-center">
                <Send size={32} className="text-white/15 mb-3" />
                <p className="text-white/30 text-sm">בחר הצעה מהרשימה מימין כדי לנהל אותה</p>
              </div>
            ) : (
              <TransferDetail
                proposal={selected}
                section={section}
                onSection={setSection}
                updateProposal={updateProposal}
                requestCoachApproval={requestCoachApproval}
                readyMap={readyMap}
                setReadyMap={setReadyMap}
                onContractValueChange={handleContractValueChange}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ icon: Icon, color, label, value }) {
  const cls = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
  }[color];
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border ${cls}`}>
      <Icon size={12} />
      <span className="text-white/60 text-[10px] font-bold">{label}</span>
      <span className="font-black text-sm">{value}</span>
    </div>
  );
}

function TransferDetail({ proposal, section, onSection, updateProposal, requestCoachApproval, readyMap, setReadyMap, onContractValueChange, onClose }) {
  const p = proposal;

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-white font-black text-base">{p.club_name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_adult ? 'text-white/60 bg-white/5 border-white/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'}`}>
                {p.is_adult ? 'בוגר' : 'נוער — נדרש אפוטרופוס'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status]}`}>
                {p.status}
              </span>
            </div>
            <div className="text-white/50 text-xs">שחקן: <span className="text-white/80 font-bold">{p.player_name || '—'}</span> · {p.player_elite_id}</div>
            <div className="text-white/40 text-[10px] mt-1">איש קשר: {p.contact_name} · {new Date(p.created_date).toLocaleDateString('he-IL')}</div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white text-xs">סגור</button>
        </div>

        {/* Pipeline stepper */}
        <div className="mt-4 bg-[#0D1B2A]/60 border border-white/10 rounded-lg p-3">
          <div className="text-white/40 text-[10px] font-bold mb-2 uppercase tracking-wider">שלבי התהליך</div>
          <TransferPipelineStepper status={p.status} isAdult={p.is_adult} />
        </div>

        {/* Category + loan period */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <select value={p.transfer_category || 'העברת נוער'}
            onChange={e => updateProposal.mutate({ id: p.id, data: { transfer_category: e.target.value } })}
            className="text-[10px] font-bold px-2 py-1 rounded-sm border border-white/15 bg-transparent text-white/60 focus:outline-none cursor-pointer">
            {TRANSFER_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1B263B] text-white">{c}</option>)}
          </select>
          {(p.transfer_category || '').startsWith('השאל') && (
            <div className="flex items-center gap-1.5 bg-[#0D1B2A]/60 border border-amber-500/20 rounded px-2 py-1">
              <span className="text-amber-400 text-[10px] font-bold">תקופת השאלה:</span>
              <input type="date" value={p.loan_start_date || ''} onChange={e => updateProposal.mutate({ id: p.id, data: { loan_start_date: e.target.value } })} className="text-[10px] bg-transparent text-white focus:outline-none" />
              <span className="text-white/30 text-[10px]">עד</span>
              <input type="date" value={p.loan_end_date || ''} onChange={e => updateProposal.mutate({ id: p.id, data: { loan_end_date: e.target.value } })} className="text-[10px] bg-transparent text-white focus:outline-none" />
            </div>
          )}
        </div>
      </div>

      {/* Section tabs */}
      <div className="border-b border-white/10 bg-[#0D1B2A]/40 px-2 flex gap-0 overflow-x-auto">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => onSection(s.id)}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${section === s.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/50 border-transparent hover:text-white/80'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section body */}
      <div className="p-5">
        {section === 'details' && <DetailsSection p={p} onContractValueChange={onContractValueChange} />}
        {section === 'compliance' && <ComplianceSection p={p} updateProposal={updateProposal} requestCoachApproval={requestCoachApproval} />}
        {section === 'negotiation' && <NegotiationPanel proposal={p} />}
        {section === 'gate' && <GateSection p={p} updateProposal={updateProposal} readyMap={readyMap} setReadyMap={setReadyMap} />}
      </div>
    </div>
  );
}

function DetailsSection({ p, onContractValueChange }) {
  return (
    <div className="space-y-4">
      {p.proposal_details && (
        <div>
          <div className="text-[#D4AF37] text-xs font-bold mb-1">פירוט ההצעה</div>
          <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap">{p.proposal_details}</p>
        </div>
      )}
      {(p.contact_email || p.contact_phone) && (
        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {p.contact_email && <span>{p.contact_email}</span>}
          {p.contact_phone && <span dir="ltr">{p.contact_phone}</span>}
        </div>
      )}
      {p.is_adult && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><CreditCard size={11} /> שווי חוזה ועמלת IEFA (5%)</div>
          <input type="number" value={p.contract_value || ''} onChange={e => onContractValueChange(p, e.target.value)} placeholder="שווי חוזה שנתי (₪)"
            className="w-full bg-transparent border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60 mb-1.5" />
          <div className="text-white/60 text-[10px]">עמלה מחושבת: <span className="text-[#D4AF37] font-bold">₪{(p.iefa_commission_fee || 0).toLocaleString('he-IL')}</span></div>
        </div>
      )}
    </div>
  );
}

function ComplianceSection({ p, updateProposal, requestCoachApproval }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {p.is_adult && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><CreditCard size={11} /> סטטוס תשלום</div>
          <select value={p.payment_status || 'N/A'} onChange={e => updateProposal.mutate({ id: p.id, data: { payment_status: e.target.value } })}
            className={`w-full text-xs font-bold px-2 py-1.5 rounded-sm border border-white/15 bg-transparent focus:outline-none cursor-pointer ${PAYMENT_COLORS[p.payment_status || 'N/A']}`}>
            {['N/A', 'PENDING', 'PAID', 'REFUNDED'].map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{PAYMENT_LABELS[s]}</option>)}
          </select>
          {p.payment_transaction_id && <div className="text-white/30 text-[10px] mt-1.5 truncate">אסמכתא: {p.payment_transaction_id}</div>}
        </div>
      )}
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold mb-2"><Gavel size={11} /> אימות ההתאחדות הרשמית / FIFA</div>
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
      {p.document_url && (
        <div className="sm:col-span-2 flex items-center gap-2 bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
          <FileText size={13} className="text-[#D4AF37]" />
          <a href={p.document_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-xs hover:text-amber-300">צפה במסמך ההצעה המקורי</a>
        </div>
      )}
    </div>
  );
}

function GateSection({ p, updateProposal, readyMap, setReadyMap }) {
  return (
    <div className="space-y-4">
      <TransferApprovalGate proposal={p} onReadyChange={r => setReadyMap(m => ({ ...m, [p.id]: r }))} />
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <span className="text-white/40 text-xs">שלב תהליך:</span>
        <select value={p.status || STATUSES[0]} onChange={e => updateProposal.mutate({ id: p.id, data: { status: e.target.value } })}
          className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/15 bg-[#0D1B2A] text-white focus:outline-none cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s} className="bg-[#1B263B] text-white">{s}</option>)}
        </select>
        {!TERMINAL.includes(p.status) && (
          <>
            <button onClick={() => updateProposal.mutate({ id: p.id, data: { status: 'אושרה סופית' } })}
              disabled={!readyMap[p.id]}
              title={!readyMap[p.id] ? 'יש להשלים את כל דרישות מנגנון האישור למעלה' : ''}
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
  );
}