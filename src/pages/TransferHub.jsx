import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, FileText, CheckCircle2, Loader2, X, ShieldCheck } from 'lucide-react';

export default function TransferHub() {
  const [form, setForm] = useState({
    club_name: '', contact_name: '', contact_email: '', contact_phone: '',
    player_elite_id: '', player_name: '', proposal_details: '',
  });
  const [pdfName, setPdfName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPdfName(file.name);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, document_url: file_url }));
    setUploading(false);
  };

  const submit = useMutation({
    mutationFn: (data) => base44.entities.TransferProposal.create(data),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submit.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png" alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">Transfer Hub</span>
          <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-3">הגשת הצעת הצטרפות</h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">ההצעה תועבר להנהלת עילית ישראלית לבדיקה ואישור מוקדם, לפני כל מגע עם הנוער.</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={30} className="text-green-400" />
            </div>
            <h2 className="text-white font-black text-xl mb-2">ההצעה הוגשה בהצלחה</h2>
            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
              ההצעה הועברה להנהלת "עילית ישראלית" לבדיקה ואישור מוקדם. זמן תגובה ממוצע: 48–72 שעות עסקיות.
              לאחר אישור, האפוטרופוס החוקי יקבל הודעה מקבילה.
            </p>
            <button onClick={() => { setSubmitted(false); setForm({ club_name: '', contact_name: '', contact_email: '', contact_phone: '', player_elite_id: '', player_name: '', proposal_details: '' }); setPdfName(''); }}
              className="mt-6 text-[#D4AF37] text-sm font-bold hover:text-amber-300 transition-colors">
              הגש הצעה נוספת
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#1B263B] border border-white/10 rounded-lg p-8 space-y-5">
            <Field label="שם המועדון / הארגון הפונה *" name="club_name" value={form.club_name} onChange={handleChange} required placeholder="מכבי תל אביב, מחלקת נוער" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="שם ותפקיד הפונה *" name="contact_name" value={form.contact_name} onChange={handleChange} required placeholder="דני לוי, סקאוטר ראשי" />
              <Field label="טלפון" name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="050-XXXXXXX" dir="ltr" />
            </div>
            <Field label="אימייל לקשר" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" placeholder="club@example.com" dir="ltr" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Elite ID של השחקן *" name="player_elite_id" value={form.player_elite_id} onChange={handleChange} required placeholder="ELITE-2026-0042" dir="ltr" />
              <Field label="שם השחקן" name="player_name" value={form.player_name} onChange={handleChange} placeholder="ישראל ישראלי" />
            </div>

            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">פירוט ההצעה (בקצרה) *</label>
              <textarea name="proposal_details" value={form.proposal_details} onChange={handleChange} required rows={5}
                placeholder="תארו את מהות ההצעה, התפקיד המוצע, התחייבויות ולוח זמנים..."
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors resize-none" />
            </div>

            {/* PDF upload */}
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">העלאת מסמך רשמי (PDF)</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 hover:border-[#D4AF37]/50 rounded-lg py-8 cursor-pointer transition-colors">
                {pdfName ? (
                  <div className="flex items-center gap-2 text-white/70">
                    <FileText size={18} className="text-[#D4AF37]" />
                    <span className="text-sm">{pdfName}</span>
                    {uploading && <Loader2 size={14} className="animate-spin" />}
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="text-white/30" />
                    <span className="text-white/40 text-xs">גרור קובץ PDF לכאן או לחץ לבחירה</span>
                  </>
                )}
                <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
              </label>
            </div>

            <button type="submit" disabled={submit.isPending || uploading}
              className="w-full bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-4 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submit.isPending ? <><Loader2 size={15} className="animate-spin" />שולח...</> : <>שלח הצעה לאישור הנהלת עילית</>}
            </button>

            <div className="flex items-start gap-2 pt-2">
              <ShieldCheck size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <p className="text-white/30 text-[11px] leading-relaxed">
                הגנה על הנוער: ההצעה אינה מגיעה ישירות לנער. כל פנייה עוברת בדיקת רקע ואימות זהות של המועדון הפונה.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, dir, required }) {
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} dir={dir} required={required}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
    </div>
  );
}