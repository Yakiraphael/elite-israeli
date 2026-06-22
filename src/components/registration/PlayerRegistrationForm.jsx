import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, Loader2, Baby, Star, Calendar, Upload, ShieldCheck, FileText, AlertCircle
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import LegalTerms from './LegalTerms';

const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const STEPS = ['פרטים אישיים', 'פרטי שחקן', 'אפוטרופוס / פיננסים', 'מסמכים', 'אישור משפטי'];

export default function PlayerRegistrationForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '', id_number: '', birth_date: '', phone: '', city: '', street_address: '',
    position: '', secondary_position: '', dominant_foot: '', team_name: '',
    height_cm: '', weight_kg: '', experience_years: '', previous_clubs: '', achievements: '',
    ifa_id: '', transfermarkt_url: '',
    guardian_name: '', guardian_id: '', parent_phone: '', parent_email: '',
    id_document_url: '', id_suffix_url: '', medical_certificate_url: '', medical_expiry_date: '',
    bank_token: '', event_id: '', event_name: '',
    legal_terms_accepted: {},
  });

  const queryClient = useQueryClient();
  const age = calculateAge(form.birth_date);
  const isAdult = age !== null && age >= 18;

  const { data: events = [] } = useQuery({
    queryKey: ['team-events'],
    queryFn: () => base44.entities.TeamEvent.filter({ is_active: true }, 'date_start', 20),
  });

  const register = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.create(data),
    onSuccess: (player) => {
      queryClient.invalidateQueries({ queryKey: ['player-registrations'] });
      onSuccess(player);
    },
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDocChange = (field, url) => setForm(prev => ({ ...prev, [field]: url }));
  const handleLegalToggle = (key, val) => setForm(prev => ({ ...prev, legal_terms_accepted: { ...prev.legal_terms_accepted, [key]: val } }));

  const legalTerms = isAdult
    ? ['digital_representation', 'payment_pre_auth']
    : ['platform_terms', 'digital_power_of_attorney', 'medical_waiver'];
  const allLegalAccepted = legalTerms.every(k => form.legal_terms_accepted[k]);

  const handleSubmit = () => {
    const data = {
      ...form,
      is_adult: isAdult,
      height_cm: Number(form.height_cm) || undefined,
      weight_kg: Number(form.weight_kg) || undefined,
      experience_years: Number(form.experience_years) || undefined,
      ifa_ready: isAdult
        ? !!(form.id_document_url && form.medical_certificate_url && allLegalAccepted)
        : !!(form.id_document_url && form.id_suffix_url && form.medical_certificate_url && form.guardian_name && form.guardian_id && form.parent_phone && form.parent_email && allLegalAccepted),
      status: 'IFA Ready',
    };
    register.mutate(data);
  };

  const canProceed = () => {
    if (step === 0) return form.full_name && form.id_number && form.birth_date && form.phone;
    if (step === 1) return form.position;
    if (step === 2) return isAdult || (form.guardian_name && form.guardian_id && form.parent_phone && form.parent_email);
    if (step === 3) return form.id_document_url && form.medical_certificate_url && (!isAdult || true) && (isAdult || form.id_suffix_url);
    if (step === 4) return allLegalAccepted;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Title + Age indicator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">רישום שחקן · IEFA Onboarding</span>
        <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-2">הצטרף לעילית ישראלית</h1>
        <p className="text-white/50 text-sm">Zero Friction — המערכת מכינה את כל המסמכים מראש</p>
        {age !== null && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{
            backgroundColor: isAdult ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
            borderColor: isAdult ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)',
          }}>
            {isAdult ? <Star size={14} className="text-emerald-400" /> : <Baby size={14} className="text-blue-400" />}
            <span className="text-xs font-bold" style={{ color: isAdult ? '#10b981' : '#3b82f6' }}>
              {isAdult ? `שחקן בוגר (גיל ${age})` : `שחקן נוער (גיל ${age})`}
            </span>
          </div>
        )}
      </motion.div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-8 px-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i < step ? 'bg-[#D4AF37] text-[#0D1B2A]' : i === step ? 'bg-[#D4AF37] text-[#0D1B2A] ring-4 ring-[#D4AF37]/30' : 'bg-white/10 text-white/40'}`}>
                {i < step ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className={`text-[9px] font-semibold hidden md:block ${i === step ? 'text-[#D4AF37]' : 'text-white/30'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-4 md:w-8 mx-0.5 ${i < step ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Form steps */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8">

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-white font-black text-lg mb-4">פרטים אישיים</h2>
              <Field label="שם מלא *" name="full_name" value={form.full_name} onChange={handleChange} placeholder="ישראל ישראלי" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="תעודת זהות *" name="id_number" value={form.id_number} onChange={handleChange} placeholder="000000000" />
                <Field label="תאריך לידה *" name="birth_date" value={form.birth_date} onChange={handleChange} type="date" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="טלפון נייד *" name="phone" value={form.phone} onChange={handleChange} placeholder="05X-XXXXXXX" dir="ltr" />
                <Field label="עיר מגורים" name="city" value={form.city} onChange={handleChange} placeholder="תל אביב" />
              </div>
              <Field label="כתובת מגורים מלאה" name="street_address" value={form.street_address} onChange={handleChange} placeholder="רחוב, מספר בית, דירה" />

              {age === null && (
                <div className="flex items-center gap-2 text-blue-400 text-xs bg-blue-400/5 rounded p-3 border border-blue-400/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  הזן תאריך לידה כדי לקבוע את מסלול הרישום (נוער/בוגר)
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-black text-lg mb-4">פרטי שחקן</h2>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="עמדה ראשית *" name="position" value={form.position} onChange={handleChange} options={POSITIONS} />
                <SelectField label="עמדה משנית" name="secondary_position" value={form.secondary_position} onChange={handleChange} options={POSITIONS} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="גובה (ס״מ)" name="height_cm" value={form.height_cm} onChange={handleChange} type="number" placeholder="175" />
                <Field label="משקל (ק״ג)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" placeholder="70" />
                <SelectField label="רגל דומיננטית" name="dominant_foot" value={form.dominant_foot} onChange={handleChange} options={['ימין', 'שמאל', 'שתיים']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="מספר כרטיס IFA" name="ifa_id" value={form.ifa_id} onChange={handleChange} placeholder="אופציונלי" hint="מספר כרטיס שחקן בהתאחדות" />
                <Field label="קישור Transfermarkt" name="transfermarkt_url" value={form.transfermarkt_url} onChange={handleChange} placeholder="https://..." dir="ltr" />
              </div>
              <Field label="שם קבוצה נוכחית" name="team_name" value={form.team_name} onChange={handleChange} placeholder="מכבי תל אביב נוער" />
              <Field label="קבוצות קודמות" name="previous_clubs" value={form.previous_clubs} onChange={handleChange} placeholder="הפועל ירושלים, בית״ר..." textarea />
              <Field label="הישגים" name="achievements" value={form.achievements} onChange={handleChange} placeholder="אלוף הליגה 2023..." textarea />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {isAdult ? (
                <>
                  <h2 className="text-white font-black text-lg mb-1">פרטים פיננסיים</h2>
                  <p className="text-white/40 text-xs mb-4">השחקן הבוגר מנהל ישות עצמאית לחלוטין</p>
                  <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <p className="text-white/50 text-xs leading-relaxed">
                        פרטי חשבון הבנק / אמצעי התשלום יישמרו באופן מאובטח אצל חברת הסליקה (Token) ומשמשים להכנת התשתית המשפטית לסליקה וגביית דמי טיפול בעת העברה.
                      </p>
                    </div>
                  </div>
                  <Field label="מספר חשבון בנק (מוצפן)" name="bank_token" value={form.bank_token} onChange={handleChange} placeholder="ידרש בשלב האימות" dir="ltr" />
                </>
              ) : (
                <>
                  <h2 className="text-white font-black text-lg mb-1">פרטי אפוטרופוס (הורה)</h2>
                  <p className="text-white/40 text-xs mb-4">שדות חובה קשיחים — הגנה משפטית מלאה על קטינים</p>
                  <Field label="שם מלא של ההורה *" name="guardian_name" value={form.guardian_name} onChange={handleChange} placeholder="יוסי ישראלי" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="תעודת זהות הורה *" name="guardian_id" value={form.guardian_id} onChange={handleChange} placeholder="000000000" />
                    <Field label="טלפון נייד הורה *" name="parent_phone" value={form.parent_phone} onChange={handleChange} placeholder="05X-XXXXXXX" dir="ltr" hint="עוגן לאימות OTP" />
                  </div>
                  <Field label="מייל הורה *" name="parent_email" value={form.parent_email} onChange={handleChange} placeholder="parent@email.com" dir="ltr" hint="לשליחת עותקי חוזים" />
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-white font-black text-lg mb-1">העלאת מסמכים</h2>
              <p className="text-white/40 text-xs mb-4">הכנה להתאחדות — מחולל תיק רשמי (Document Binder)</p>

              <DocumentUpload
                label="צילום תעודת זהות"
                name="id_document_url"
                value={form.id_document_url}
                onChange={(url) => handleDocChange('id_document_url', url)}
                required
              />

              {!isAdult && (
                <DocumentUpload
                  label="ספח תעודת זהות פתוח"
                  name="id_suffix_url"
                  value={form.id_suffix_url}
                  onChange={(url) => handleDocChange('id_suffix_url', url)}
                  required
                  hint="חובה רגולטורית — הוכחת שיוך הורה-קטין"
                />
              )}

              <DocumentUpload
                label="אישור בדיקה רפואית בתוקף"
                name="medical_certificate_url"
                value={form.medical_certificate_url}
                onChange={(url) => handleDocChange('medical_certificate_url', url)}
                required
                hint="מתחנת רפואת ספורט מאושרת (PDF/תמונה)"
              />

              {form.medical_certificate_url && (
                <Field
                  label="תאריך פקיעת תוקף רפואי"
                  name="medical_expiry_date"
                  value={form.medical_expiry_date}
                  onChange={handleChange}
                  type="date"
                  hint="המערכת תתריע 30 יום לפני פקיעה"
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <LegalTerms isAdult={isAdult} accepted={form.legal_terms_accepted} onToggle={handleLegalToggle} />
              {allLegalAccepted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <div>
                    <div className="text-green-400 font-bold text-sm">IFA Ready</div>
                    <p className="text-white/50 text-xs">כל המסמכים הועלו, התיק מוכן — המערכת נקייה מהפרעות ומוכנה להעברות.</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-white/50 hover:text-white text-sm font-semibold transition-colors">
                ← חזרה
              </button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-6 py-3 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                המשך <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={register.isPending || !allLegalAccepted}
                className="bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-6 py-3 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {register.isPending ? <><Loader2 size={15} className="animate-spin" />שומר...</> : <>השלם רישום <CheckCircle2 size={15} /></>}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---- Helpers ----
function Field({ label, name, value, onChange, type = 'text', placeholder, dir, textarea, hint }) {
  const cls = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors";
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">{label}</label>
      {hint && <p className="text-white/30 text-[10px] mb-1">{hint}</p>}
      {textarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} dir={dir} className={cls} />}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors">
        <option value="">בחר...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}