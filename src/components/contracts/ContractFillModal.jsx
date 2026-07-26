/**
 * ContractFillModal — ממשק מילוי חכם לחוזה / טופס לפני שליחה לחתימה
 * המנהל המקצועי ממלא את כל השדות, רואה תצוגה מקדימה של ה-PDF, ומאשר.
 */
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, ExternalLink, CheckCircle2, Loader2, AlertTriangle, FileText, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { getOfficialForm } from '@/lib/ifaOfficialForms';

const FIELD_LABELS = {
  number: 'מספר',
  text: 'טקסט',
  date: 'תאריך',
  textarea: 'פסקה',
  select: 'בחירה',
};

export default function ContractFillModal({ contract, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const form = getOfficialForm(contract.ifa_template_key || 'player_agreement_he');
  const [values, setValues] = useState({});
  const [showPdf, setShowPdf] = useState(false);
  const [showNegotiable, setShowNegotiable] = useState(true);
  const [showDirector, setShowDirector] = useState(true);

  // טעינת ערכים שמורים מהחוזה
  useEffect(() => {
    if (contract.filled_fields) {
      try { setValues(JSON.parse(contract.filled_fields)); } catch {}
    }
  }, [contract.id]);

  const allFields = [
    ...(form?.negotiable_fields || []).map(f => ({ ...f, section: 'negotiable' })),
    ...(form?.director_fillable_fields || []).map(f => ({ ...f, section: 'director' })),
  ];

  const requiredFields = allFields.filter(f => f.required !== false);
  const missingRequired = requiredFields.filter(f => !values[f.key]);

  const set = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const save = useMutation({
    mutationFn: async () => {
      await base44.entities.Contract.update(contract.id, {
        filled_fields: JSON.stringify(values),
        // עדכן גם שדות ראשיים אם יש
        salary_monthly: values.monthly_salary ? Number(values.monthly_salary) : contract.salary_monthly,
        start_date: values.season_start || contract.start_date,
        end_date: values.season_end || contract.end_date,
        notes: values.supplementary_provisions || contract.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onSaved?.();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="bg-[#1B263B] border border-white/10 rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-black text-base">מילוי חוזה — {contract.player_name}</h2>
            <p className="text-white/40 text-xs mt-0.5">{form?.label || contract.contract_type}</p>
          </div>
          <div className="flex items-center gap-2">
            {form?.pdf_url && (
              <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-sm hover:bg-[#D4AF37]/10 transition-colors">
                <ExternalLink size={11} /> PDF מקורי
              </a>
            )}
            <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* תצוגת PDF מוטמע */}
          {form?.pdf_url && (
            <div>
              <button
                onClick={() => setShowPdf(p => !p)}
                className="flex items-center gap-2 text-white/50 text-xs hover:text-white transition-colors mb-2"
              >
                {showPdf ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPdf ? 'הסתר תצוגת PDF' : 'הצג טופס מקורי (PDF)'}
              </button>
              {showPdf && (
                <iframe
                  src={`${form.pdf_url}#toolbar=0`}
                  className="w-full rounded-lg border border-white/10"
                  style={{ height: 320 }}
                  title="טופס מקורי"
                />
              )}
            </div>
          )}

          {/* שדות ניתנים למשא ומתן */}
          {form?.negotiable_fields?.length > 0 && (
            <div>
              <button
                onClick={() => setShowNegotiable(v => !v)}
                className="flex items-center gap-2 w-full text-right mb-3"
              >
                <span className="text-[#D4AF37] font-black text-xs flex-1">📋 סעיפי חוזה — ניתנים למשא ומתן</span>
                {showNegotiable ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
              </button>
              {showNegotiable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.negotiable_fields.map(field => (
                    <FieldInput key={field.key} field={field} value={values[field.key] || ''} onChange={v => set(field.key, v)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* שדות למילוי מנהל מקצועי */}
          {form?.director_fillable_fields?.length > 0 && (
            <div>
              <button
                onClick={() => setShowDirector(v => !v)}
                className="flex items-center gap-2 w-full text-right mb-3"
              >
                <span className="text-white/80 font-black text-xs flex-1">🏛️ שדות פרוטוקול / מנהלה — מנהל מקצועי</span>
                {showDirector ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
              </button>
              {showDirector && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.director_fillable_fields.map(field => (
                    <FieldInput key={field.key} field={field} value={values[field.key] || ''} onChange={v => set(field.key, v)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* אם אין שדות כלל */}
          {allFields.length === 0 && (
            <div className="flex items-center gap-2 text-white/40 text-sm p-4 bg-white/5 rounded-lg">
              <FileText size={16} />
              <span>טופס זה אינו דורש מילוי שדות — ניתן להוריד ולמלא ידנית.</span>
            </div>
          )}

          {/* שדות חסרים */}
          {missingRequired.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5">
                <AlertTriangle size={13} /> שדות חובה שטרם מולאו ({missingRequired.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingRequired.map(f => (
                  <span key={f.key} className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full">{f.label}</span>
                ))}
              </div>
            </div>
          )}

          {/* תצוגת ערכים מעודכנים */}
          {Object.keys(values).filter(k => values[k]).length > 0 && (
            <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
              <div className="text-white/40 text-xs font-bold mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-400" /> סיכום ערכים שהוזנו
              </div>
              <div className="space-y-1.5">
                {allFields.filter(f => values[f.key]).map(field => (
                  <div key={field.key} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-white/40 flex-shrink-0 min-w-[120px]">{field.label}:</span>
                    <span className="text-white font-bold text-right break-words">{values[field.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-white/50 text-sm border border-white/15 rounded-sm hover:text-white transition-colors">
            ביטול
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex-2 min-w-[180px] py-2.5 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            שמור ועדכן חוזה
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const inputCls = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 mt-1";

  return (
    <div>
      <label className="text-white/50 text-[10px] flex items-center gap-1">
        {field.label}
        {field.required !== false && <span className="text-red-400">*</span>}
        {field.clause && <span className="text-white/20 text-[9px]">(סעיף {field.clause})</span>}
      </label>
      {field.type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
          <option value="">— בחר —</option>
          {(field.options || []).map(opt => (
            <option key={opt} value={opt} className="bg-[#1B263B]">{opt}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder={`הזן ${field.label}...`}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`הזן ${field.label}...`}
          className={inputCls}
        />
      )}
    </div>
  );
}