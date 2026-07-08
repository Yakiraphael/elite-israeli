import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Truck, FileText, AlertCircle, ArrowRight,
  Building2, Calendar, DollarSign, Globe, ShieldCheck, Loader2, PlusCircle
} from 'lucide-react';
import { TRANSFER_CATEGORIES, WORKFLOW_STAGES } from '@/lib/transferDocumentRequirements';
import TransferDocumentsChecklist from '../transfer/TransferDocumentsChecklist';
import TransferWorkflowBadge from '../transfer/TransferWorkflowBadge';

const STATUS_CONFIG = {
  'Trialist': { label: 'מבחן', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'Contract Pending': { label: 'חוזה בהמתנה', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  'Signed': { label: '✓ נחתם', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  'Rejected': { label: 'נדחה', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  'Cancelled': { label: 'בוטל', color: 'text-white/30', bg: 'bg-white/5', border: 'border-white/10' },
  'ITC Required': { label: 'ITC פיפ״א נדרש', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
};

const CURRENCY_SYMBOLS = { ILS: '₪', EUR: '€', USD: '$', GBP: '£' };

export default function TransferTrackerPanel({ playerId, playerName, isClubView = false, clubName = '' }) {
  const [showNew, setShowNew] = useState(false);

  // For player view: their transfers. For club view: transfers where club_to or club_from matches.
  const { data: transfers = [], isLoading, refetch } = useQuery({
    queryKey: ['transfer-tracker', playerId, clubName],
    queryFn: () => {
      if (playerId) return base44.entities.TransferTracker.filter({ player_id: playerId }, '-created_date', 20);
      if (clubName) return base44.entities.TransferTracker.filter({ club_to: clubName }, '-created_date', 20);
      return [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black text-base">מעקב העברות</h3>
          <p className="text-white/40 text-xs">{transfers.length} פעולות מתועדות</p>
        </div>
        {isClubView && (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:text-amber-300 transition-colors"
          >
            <PlusCircle size={14} /> הוסף מעקב
          </button>
        )}
      </div>

      {transfers.length === 0 ? (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-8 text-center">
          <Truck size={24} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">אין העברות מתועדות עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map(t => (
            <TransferCard key={t.id} transfer={t} isClubView={isClubView} />
          ))}
        </div>
      )}

      {showNew && (
        <NewTransferModal
          playerId={playerId}
          playerName={playerName}
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); refetch(); }}
        />
      )}
    </div>
  );
}

function TransferCard({ transfer, isClubView }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[transfer.status] || STATUS_CONFIG['Trialist'];
  const sym = CURRENCY_SYMBOLS[transfer.currency] || '₪';

  return (
    <motion.div
      layout
      className={`bg-[#0D1B2A] border rounded-lg overflow-hidden ${sc.border}`}
    >
      <button onClick={() => setExpanded(e => !e)} className="w-full p-4 text-right">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
            {transfer.status === 'Signed' ? <CheckCircle2 size={16} className={sc.color} /> :
             transfer.status === 'Trialist' ? <Clock size={16} className={sc.color} /> :
             transfer.status === 'Contract Pending' ? <FileText size={16} className={sc.color} /> :
             <AlertCircle size={16} className={sc.color} />}
          </div>
          <div className="flex-1 text-right">
            <div className="text-white font-bold text-sm">{transfer.club_from || '?'} → {transfer.club_to || '?'}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
              {transfer.is_international && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400">בינלאומי</span>
              )}
            </div>
          </div>
          {transfer.offer_amount && (
            <div className="text-right flex-shrink-0">
              <div className="text-[#D4AF37] font-black text-sm">{sym}{transfer.offer_amount?.toLocaleString()}</div>
              {transfer.contract_years && <div className="text-white/30 text-[10px]">{transfer.contract_years} שנים</div>}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3"
          >
            {transfer.trial_date && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Calendar size={12} className="text-[#D4AF37]" />
                <span>תאריך מבחן: <span className="text-white">{transfer.trial_date}</span></span>
              </div>
            )}
            {transfer.iefa_fee_amount && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <DollarSign size={12} className="text-[#D4AF37]" />
                <span>עמלת IEFA (2%): <span className="text-[#D4AF37] font-bold">{sym}{transfer.iefa_fee_amount?.toLocaleString()}</span></span>
              </div>
            )}
            {transfer.itc_required && (
              <div className="flex items-center gap-2 text-xs bg-purple-400/10 border border-purple-400/20 rounded-lg p-2">
                <Globe size={12} className="text-purple-400 flex-shrink-0" />
                <span className="text-purple-300">נדרש ITC — הגשה דרך מערכת ה-TMS של פיפ״א</span>
              </div>
            )}
            {transfer.solidarity_contribution && (
              <div className="flex items-center gap-2 text-xs bg-blue-400/10 border border-blue-400/20 rounded-lg p-2">
                <ShieldCheck size={12} className="text-blue-400 flex-shrink-0" />
                <span className="text-blue-300">דמי השבחה (FIFA Solidarity): {sym}{transfer.solidarity_contribution?.toLocaleString()}</span>
              </div>
            )}
            {transfer.contract_url && (
              <a href={transfer.contract_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#D4AF37] hover:text-amber-300 transition-colors">
                <FileText size={12} /> צפה בטיוטת חוזה (PDF)
              </a>
            )}
            {transfer.notes && <p className="text-white/40 text-xs">{transfer.notes}</p>}

            <TransferWorkflowBadge transfer={transfer} canAdvance={isClubView} />
            <TransferDocumentsChecklist transferId={transfer.id} category={transfer.transfer_category || 'העברת נוער'} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NewTransferModal({ playerId, playerName, onClose, onSaved }) {
  const [form, setForm] = useState({
    player_id: playerId || '',
    player_name: playerName || '',
    club_to: '',
    club_from: '',
    status: 'Trialist',
    offer_amount: '',
    currency: 'ILS',
    contract_years: '',
    trial_date: '',
    is_international: false,
    notes: '',
    transfer_category: 'העברת נוער',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const isIntl = form.is_international;
    const offerNum = Number(form.offer_amount) || 0;
    await base44.entities.TransferTracker.create({
      ...form,
      offer_amount: offerNum || undefined,
      contract_years: Number(form.contract_years) || undefined,
      iefa_fee_amount: offerNum ? Math.round(offerNum * 0.02) : undefined,
      solidarity_contribution: isIntl && offerNum ? Math.round(offerNum * 0.05) : undefined,
      itc_required: isIntl,
      approval_stage: (WORKFLOW_STAGES[form.transfer_category] || WORKFLOW_STAGES['העברת נוער'])[0],
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <h3 className="text-white font-black text-base mb-4">רישום מעקב העברה חדשה</h3>
        <div className="space-y-3">
          <select value={form.transfer_category} onChange={e => setForm(p => ({ ...p, transfer_category: e.target.value, is_international: e.target.value === 'בוגרים - בינלאומי' }))}
            className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none">
            {TRANSFER_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1B263B]">{c}</option>)}
          </select>
          <input value={form.club_from} onChange={e => setForm(p => ({ ...p, club_from: e.target.value }))} placeholder="מועדון מוצא" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          <input value={form.club_to} onChange={e => setForm(p => ({ ...p, club_to: e.target.value }))} placeholder="מועדון קולט" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.offer_amount} onChange={e => setForm(p => ({ ...p, offer_amount: e.target.value }))} placeholder="שווי הצעה" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none">
              <option value="ILS">₪ ILS</option>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
          <input type="date" value={form.trial_date} onChange={e => setForm(p => ({ ...p, trial_date: e.target.value }))} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_international} onChange={e => setForm(p => ({ ...p, is_international: e.target.checked }))} className="accent-[#D4AF37]" />
            <span className="text-white/70 text-sm">העברה בינלאומית (ITC נדרש)</span>
          </label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="הערות" rows={2} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2 rounded-sm hover:bg-white/5">ביטול</button>
          <button onClick={handleSave} disabled={saving || !form.club_to} className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-2 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} שמור
          </button>
        </div>
      </motion.div>
    </div>
  );
}