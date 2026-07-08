import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PenLine, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DigitalSignDocModal({ doc, transferId, category, onClose, onSaved }) {
  const [content, setContent] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSign = async () => {
    if (!signatureName.trim()) return;
    setSaving(true);
    let ip = 'לא זמין';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      ip = json.ip || ip;
    } catch {
      // network/IP lookup unavailable — proceed without blocking the signature
    }
    await base44.entities.TransferDocument.create({
      transfer_id: transferId,
      transfer_category: category,
      doc_type: doc.doc_type,
      doc_label: doc.label,
      method: 'digital',
      digital_content: content,
      signature_name: signatureName,
      signed_at: new Date().toISOString(),
      signed_ip: ip,
      status: 'נחתם דיגיטלית',
      required: !doc.optional,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-base">מילוי דיגיטלי וחתימה</h3>
            <p className="text-white/40 text-xs mt-1">{doc.label}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">תוכן / פרטי המסמך</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="מלא כאן את תוכן ההצהרה/הטופס..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          </div>
          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">חתימה דיגיטלית — הקלד שם מלא *</label>
            <input value={signatureName} onChange={e => setSignatureName(e.target.value)} placeholder="שם מלא"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
          <p className="text-white/30 text-[10px]">בעת החתימה יתועדו אוטומטית תאריך, שעה וכתובת IP לצורך תוקף משפטי.</p>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2 rounded-sm hover:bg-white/5">ביטול</button>
          <button onClick={handleSign} disabled={saving || !signatureName.trim()} className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-2 rounded-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />} חתום ושלח
          </button>
        </div>
      </motion.div>
    </div>
  );
}