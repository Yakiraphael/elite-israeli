import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Send, Upload, X, Info, Baby, User, Calendar, Repeat } from 'lucide-react';
import { TRANSFER_CATEGORIES } from '@/lib/transferDocumentRequirements';

const CURRENCY_SYMBOLS = { ILS: '₪', EUR: '€', USD: '$', GBP: '£' };

export default function DetailedOfferModal({ player, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    club_name: '', contact_name: '', contact_email: '', contact_phone: '',
    role_offered: player.position || '', contract_years: '', salary: '', currency: 'ILS',
    signing_bonus: '', trial_period: false, message: '',
    transfer_category: player.is_adult ? 'בוגרים - תוך ארצי' : 'העברת נוער',
    loan_start_date: '', loan_end_date: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const isLoan = (form.transfer_category || '').startsWith('השאל');
  const isAdult = player.is_adult;

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFile(file_url);
    setUploading(false);
  };

  const handleSend = async () => {
    setSending(true);
    const sym = CURRENCY_SYMBOLS[form.currency];
    const annualValue = Number(form.salary) * 12 * Number(form.contract_years || 1);

    const parts = [
      `סוג פעולה: ${form.transfer_category}`,
      `עמדה מוצעת: ${form.role_offered}`,
      form.contract_years && `אורך חוזה: ${form.contract_years} שנים`,
      form.salary && `שכר: ${sym}${form.salary}/חודש`,
      form.signing_bonus && `בונוס חתימה: ${sym}${form.signing_bonus}`,
      isLoan && form.loan_start_date && `תקופת השאלה: ${form.loan_start_date} → ${form.loan_end_date || '—'}`,
      form.trial_period && 'כולל תקופת מבחן ראשונית',
      form.message && `הודעה אישית: ${form.message}`,
    ].filter(Boolean).join(' · ');

    // החלטת סטטוס התחלתי לפי סוג השחקן
    const initialStatus = !isAdult
      ? 'ממתין לאישור הנהלה'  // נוער — יעבור שרשרת אישורים כולל אפוטרופוס
      : 'מאושר — ממתין לשחקן (בוגר)';  // בוגר — ישירות לאישור השחקן

    await base44.entities.TransferProposal.create({
      club_name: form.club_name || 'מועדון לא צוין',
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      player_elite_id: player.elite_id || player.id,
      player_name: player.full_name,
      proposal_details: parts,
      transfer_category: form.transfer_category,
      contract_value: isAdult ? (annualValue || undefined) : undefined,
      iefa_commission_fee: isAdult && annualValue ? Math.round(annualValue * 0.05 * 100) / 100 : undefined,
      loan_start_date: isLoan ? form.loan_start_date || undefined : undefined,
      loan_end_date: isLoan ? form.loan_end_date || undefined : undefined,
      document_url: file || undefined,
      is_adult: isAdult,
      status: initialStatus,
      payment_status: isAdult ? 'PENDING' : 'N/A',
      ifa_validation_status: isAdult ? 'Awaiting Submission' : 'N/A',
      coach_approval_status: 'לא נדרש',
    });

    queryClient.invalidateQueries({ queryKey: ['admin-transfers'] });
    setSending(false);
    setSent(true);
  };

  if (sent) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#1B263B] border border-green-500/30 rounded-lg p-8 text-center max-w-sm" onClick={e => e.stopPropagation()} dir="rtl">
        <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
        <h3 className="text-white font-black text-base mb-2">ההצעה נשלחה בהצלחה!</h3>
        <p className="text-white/60 text-sm">
          {isAdult
            ? `ל${player.full_name} — בוגר. ההצעה תופיע לאישור השחקן ואימות תשלום.`
            : `ל${player.full_name} — נוער. ההצעה תעבור אישור הנהלה, אפוטרופוס ואימות התאחדות.`}
        </p>
        <button onClick={onClose} className="mt-4 w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm">סגור</button>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#1B263B] z-10">
          <div>
            <h3 className="text-white font-black text-base">📝 הגשת הצעה — מערך חדש</h3>
            <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
              {isAdult ? <User size={11} className="text-white/40" /> : <Baby size={11} className="text-amber-400" />}
              {player.full_name} · {player.position} · {isAdult ? 'בוגר' : 'נוער — נדרש אפוטרופוס'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* סיכום נמען — שחקן */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
              {isAdult ? <User size={20} className="text-[#D4AF37]" /> : <Baby size={20} className="text-[#D4AF37]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-sm">{player.full_name}</div>
              <div className="text-white/50 text-xs truncate">
                {player.position}{player.team_name ? ` · ${player.team_name}` : ''}{player.is_free_agent ? ' · Free Agent' : ''}
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${isAdult ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
              {isAdult ? 'בוגר' : 'נוער — אפוטרופוס'}
            </span>
          </div>

          {/* 1 — סוג פעולה */}
          <div>
            <label className="text-[#D4AF37] text-xs font-bold mb-2 block flex items-center gap-1.5">
              <Repeat size={12} /> סוג פעולה · קובע שרשרת אישורים + דרישות מסמכים
            </label>
            <select
              value={form.transfer_category}
              onChange={set('transfer_category')}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60"
            >
              {TRANSFER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {!isAdult && (form.transfer_category.includes('בוגרים')) && (
              <p className="text-amber-400 text-[10px] mt-1.5 flex items-center gap-1">
                <Info size={10} /> שחקן קטין — מומלץ לבחור קטגוריית נוער
              </p>
            )}
          </div>

          {/* 2 — תנאי החוזה · ליבת ההצעה */}
          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">תנאי החוזה {isAdult ? '' : '(נוער — השאלה/העברה ללא שכר)'}</p>
            <div className="space-y-2.5">
              <input value={form.role_offered} onChange={set('role_offered')} placeholder="עמדה מוצעת בסגל" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              {isAdult && (
                <div className="grid grid-cols-3 gap-2.5">
                  <input type="number" value={form.salary} onChange={set('salary')} placeholder="שכר חודשי" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
                  <select value={form.currency} onChange={set('currency')} className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none">
                    <option value="ILS">₪ ILS</option>
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                  </select>
                  <input type="number" value={form.contract_years} onChange={set('contract_years')} placeholder="שנות חוזה" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
                </div>
              )}
              {isAdult && (
                <input type="number" value={form.signing_bonus} onChange={set('signing_bonus')} placeholder="בונוס חתימה (אופציונלי)" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              )}
              {isLoan && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-sm p-3">
                  <div className="text-amber-400 text-[11px] font-bold mb-2 flex items-center gap-1">
                    <Calendar size={11} /> תקופת השאלה
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-white/40 text-[10px]">תחילה</label>
                      <input type="date" value={form.loan_start_date} onChange={set('loan_start_date')} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px]">סיום</label>
                      <input type="date" value={form.loan_end_date} onChange={set('loan_end_date')} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.trial_period} onChange={set('trial_period')} className="accent-[#D4AF37]" />
                <span className="text-white/70 text-sm">כולל תקופת מבחן ראשונית</span>
              </label>
            </div>
          </div>

          {/* 3 — פרטי המועדון הפונה · מנהלתי */}
          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">פרטי המועדון הפונה</p>
            <div className="space-y-2.5">
              <input value={form.club_name} onChange={set('club_name')} placeholder="שם המועדון הפונה" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              <div className="grid grid-cols-2 gap-2.5">
                <input value={form.contact_name} onChange={set('contact_name')} placeholder="איש קשר ותפקיד" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
                <input value={form.contact_phone} onChange={set('contact_phone')} placeholder="טלפון ליצירת קשר" className="bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
              <input value={form.contact_email} onChange={set('contact_email')} placeholder="מייל רשמי להעברת מסמכים" className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
          </div>

          {/* 4 — הודעה אישית */}
          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">הודעה אישית</p>
            <textarea value={form.message} onChange={set('message')} rows={3} placeholder="ספר על החזון, התפקיד הצפוי בסגל..." className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          </div>

          {/* 5 — מסמך נלווה */}
          <div>
            <p className="text-[#D4AF37] text-xs font-bold mb-2">מסמך נלווה (PDF, אופציונלי)</p>
            <label className="flex items-center justify-center gap-2 border border-dashed border-white/25 rounded-sm py-3 text-white/60 text-xs cursor-pointer hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {file ? 'קובץ הועלה ✓' : 'העלה קובץ'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* 6 — מפת דרכים · שרשרת אישורים */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-sm p-3">
            <div className="text-white/40 text-[10px] font-bold mb-2">מפת דרכים · שרשרת אישורים צפויה:</div>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              {!isAdult ? (
                <>
                  <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">1. הנהלה</span>
                  <span className="text-white/20">→</span>
                  <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">2. אפוטרופוס</span>
                  <span className="text-white/20">→</span>
                  <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">3. התאחדות</span>
                </>
              ) : (
                <>
                  <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">1. אישור שחקן</span>
                  <span className="text-white/20">→</span>
                  <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">2. אימות תשלום</span>
                  <span className="text-white/20">→</span>
                  <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">3. אימות התאחדות (IFA)</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10 sticky bottom-0 bg-[#1B263B]">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/70 text-sm py-3 rounded-sm hover:bg-white/5">ביטול</button>
          <button
            onClick={handleSend}
            disabled={!form.club_name || (isAdult && (!form.salary || !form.contract_years)) || sending}
            className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-3 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} שלח הצעה
          </button>
        </div>
      </motion.div>
    </div>
  );
}