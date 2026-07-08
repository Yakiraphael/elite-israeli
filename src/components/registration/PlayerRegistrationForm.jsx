import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, Loader2, Baby, Star, ShieldCheck, AlertCircle, PenLine
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import LegalTerms from './LegalTerms';
import HealthDeclarationForm from './HealthDeclarationForm';
import EquipmentSizeForm from './EquipmentSizeForm';
import SecurityBadge from '../SecurityBadge';

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

// 4 onboarding stations, per the club-onboarding funnel spec
const STATIONS = ['מידע אישי וקשר', 'תיק רפואי ובטיחות', 'מסמכים משפטיים וחתימות', 'רקע מקצועי'];

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
    verification_link: '', verification_source: '', selfie_url: '',
    legal_terms_accepted: {}, digital_signature: '',
    health_declaration: {}, insurance_ack: false,
    equipment_size: {},
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
    onSuccess: async (player) => {
      queryClient.invalidateQueries({ queryKey: ['player-registrations'] });
      // Scouting context: auto-generate a transfer request if the player is coming from another club
      if (form.previous_clubs?.trim()) {
        await base44.entities.TransferTracker.create({
          player_id: player.id,
          player_name: player.full_name,
          club_from: form.previous_clubs.trim(),
          club_to: form.team_name || '',
          status: 'ITC Required',
          notes: 'נוצר אוטומטית ממידע קודמות שהוזן בטופס הרישום',
        });
      }
      onSuccess(player);
    },
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDocChange = (field, url) => setForm(prev => ({ ...prev, [field]: url }));
  const handleLegalToggle = (key, val) => setForm(prev => ({ ...prev, legal_terms_accepted: { ...prev.legal_terms_accepted, [key]: val } }));

  const legalTerms = isAdult
    ? ['digital_representation', 'payment_pre_auth', 'media_consent', 'club_bylaws']
    : ['platform_terms', 'digital_power_of_attorney', 'medical_waiver', 'media_consent', 'club_bylaws'];
  const allLegalAccepted = legalTerms.every(k => form.legal_terms_accepted[k]);

  const healthDeclarationFilled = !!(form.health_declaration.allergies?.trim() && form.health_declaration.chronic_conditions?.trim() && form.health_declaration.past_injuries?.trim());

  const handleSubmit = () => {
    const data = {
      ...form,
      is_adult: isAdult,
      height_cm: Number(form.height_cm) || undefined,
      weight_kg: Number(form.weight_kg) || undefined,
      experience_years: Number(form.experience_years) || undefined,
      health_declaration_completed: healthDeclarationFilled,
      ifa_ready: isAdult
        ? !!(form.id_document_url && form.medical_certificate_url && allLegalAccepted && form.digital_signature.trim())
        : !!(form.id_document_url && form.id_suffix_url && form.medical_certificate_url && form.guardian_name && form.guardian_id && form.parent_phone && form.parent_email && allLegalAccepted && form.digital_signature.trim()),
      status: 'IFA Ready',
      account_status: 'ממתין לאישור',
    };
    register.mutate(data);
  };

  const canProceed = () => {
    if (step === 0) return form.full_name && form.id_number && form.birth_date && form.phone && form.position && form.verification_link && form.verification_source
      && (isAdult || (form.guardian_name && form.guardian_id && form.parent_phone && form.parent_email));
    if (step === 1) return form.medical_certificate_url && healthDeclarationFilled && form.insurance_ack;
    if (step === 2) return form.id_document_url && form.selfie_url && (isAdult || form.id_suffix_url) && allLegalAccepted && form.digital_signature.trim();
    if (step === 3) return true;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Title + Age indicator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <span className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase">רישום שחקן · IEFA Onboarding</span>
        <h1 className="text-white text-3xl md:text-4xl font-black mt-3 mb-2">הצטרף לעילית ישראלית</h1>
        <p className="text-white/50 text-sm">Zero Friction — המערכת מכינה את כל המסמכים מראש</p>
        <div className="flex justify-center mt-4">
          <SecurityBadge />
        </div>
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

      {/* Stations progress */}
      <div className="flex items-center justify-between mb-8 px-2 overflow-x-auto">
        {STATIONS.map((s, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i < step ? 'bg-[#D4AF37] text-[#0D1B2A]' : i === step ? 'bg-[#D4AF37] text-[#0D1B2A] ring-4 ring-[#D4AF37]/30' : 'bg-white/10 text-white/40'}`}>
                {i < step ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span className={`text-[9px] font-semibold hidden md:block ${i === step ? 'text-[#D4AF37]' : 'text-white/30'}`}>{s}</span>
            </div>
            {i < STATIONS.length - 1 && <div className={`h-px w-4 md:w-8 mx-0.5 ${i < step ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Form steps */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-[#1B263B] border border-white/10 rounded-lg p-6 md:p-8">

          {/* STATION A — Personal & Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-white font-black text-lg mb-4">מידע אישי וקשר</h2>
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
              <SelectField label="עמדה במגרש *" name="position" value={form.position} onChange={handleChange} options={POSITIONS} />

              {age === null && (
                <div className="flex items-center gap-2 text-blue-400 text-xs bg-blue-400/5 rounded p-3 border border-blue-400/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  הזן תאריך לידה כדי לקבוע את מסלול הרישום (נוער/בוגר)
                </div>
              )}

              {!isAdult && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <h3 className="text-white font-black text-sm">פרטי אפוטרופוס (הורה)</h3>
                  <p className="text-white/40 text-[11px]">שדות חובה קשיחים — הגנה משפטית מלאה על קטינים</p>
                  <Field label="שם מלא של ההורה *" name="guardian_name" value={form.guardian_name} onChange={handleChange} placeholder="יוסי ישראלי" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="תעודת זהות הורה *" name="guardian_id" value={form.guardian_id} onChange={handleChange} placeholder="000000000" />
                    <Field label="טלפון נייד הורה *" name="parent_phone" value={form.parent_phone} onChange={handleChange} placeholder="05X-XXXXXXX" dir="ltr" />
                  </div>
                  <Field label="מייל הורה * (משמש כ-Login)" name="parent_email" value={form.parent_email} onChange={handleChange} placeholder="parent@email.com" dir="ltr" />
                </div>
              )}

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-sm">אימות זהות חברתי</span>
                </div>
                <p className="text-white/40 text-[11px] mb-3">
                  צוות המערכת יאשר את הפרופיל שלך ידנית תוך 24 שעות מול קישור חברתי/מקצועי קיים.
                </p>
                <SelectField label="מקור אימות *" name="verification_source" value={form.verification_source} onChange={handleChange} options={['Instagram', 'LinkedIn', 'אתר רשמי']} />
                <div className="mt-3">
                  <Field label="קישור לפרופיל *" name="verification_link" value={form.verification_link} onChange={handleChange} placeholder="https://instagram.com/username" dir="ltr" />
                </div>
              </div>
            </div>
          )}

          {/* STATION B — Health Compliance */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-white font-black text-lg mb-1">תיק רפואי ובטיחות</h2>
              <p className="text-white/40 text-xs mb-2">Health Compliance — נדרש לפני שיבוץ בטופס משחק</p>

              <DocumentUpload
                label="אישור בדיקה רפואית בתוקף"
                name="medical_certificate_url"
                value={form.medical_certificate_url}
                onChange={(url) => handleDocChange('medical_certificate_url', url)}
                required
                hint="PDF/תמונה מתחנת רפואת ספורט מאושרת"
                accept="image/*,.pdf"
              />
              {form.medical_certificate_url && (
                <Field label="תאריך פקיעת תוקף רפואי" name="medical_expiry_date" value={form.medical_expiry_date} onChange={handleChange} type="date" hint="המערכת תתריע 30 יום לפני פקיעה" />
              )}

              <div className="pt-3 border-t border-white/10">
                <HealthDeclarationForm
                  value={form.health_declaration}
                  onChange={(v) => setForm(prev => ({ ...prev, health_declaration: v }))}
                  insuranceAck={form.insurance_ack}
                  onInsuranceToggle={(v) => setForm(prev => ({ ...prev, insurance_ack: v }))}
                />
              </div>
            </div>
          )}

          {/* STATION C — Legal Compliance */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white font-black text-lg mb-1">מסמכים משפטיים וחתימות</h2>
              <p className="text-white/40 text-xs mb-2">Legal Compliance — הכנה להתאחדות</p>

              <DocumentUpload label="צילום תעודת זהות" name="id_document_url" value={form.id_document_url} onChange={(url) => handleDocChange('id_document_url', url)} required />
              {!isAdult && (
                <DocumentUpload label="ספח תעודת זהות פתוח" name="id_suffix_url" value={form.id_suffix_url} onChange={(url) => handleDocChange('id_suffix_url', url)} required hint="חובה רגולטורית — הוכחת שיוך הורה-קטין" />
              )}
              <DocumentUpload label="תמונת פנים (סלפי)" name="selfie_url" value={form.selfie_url} onChange={(url) => handleDocChange('selfie_url', url)} required hint="לצורך הצלבה מול הפרופיל החברתי" accept="image/*" />

              <LegalTerms isAdult={isAdult} accepted={form.legal_terms_accepted} onToggle={handleLegalToggle} />

              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <PenLine size={14} className="text-[#D4AF37]" />
                  <span className="text-white font-bold text-sm">חתימה דיגיטלית על ההסכם העונתי</span>
                </div>
                <Field label={`הקלד ${isAdult ? 'את שמך המלא' : 'את שם ההורה'} כחתימה *`} name="digital_signature" value={form.digital_signature} onChange={handleChange} placeholder="שם מלא" />
              </div>

              {allLegalAccepted && form.digital_signature.trim() && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <p className="text-white/50 text-xs">כל המסמכים המשפטיים נחתמו — ניתן להמשיך לתחנה הבאה.</p>
                </motion.div>
              )}
            </div>
          )}

          {/* STATION D — Scouting Context */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-white font-black text-lg mb-1">רקע מקצועי</h2>
              <p className="text-white/40 text-xs mb-2">Scouting Context — נתוני קריירה ולוגיסטיקה</p>

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="עמדה משנית" name="secondary_position" value={form.secondary_position} onChange={handleChange} options={POSITIONS} />
                <SelectField label="רגל דומיננטית" name="dominant_foot" value={form.dominant_foot} onChange={handleChange} options={['ימין', 'שמאל', 'שתיים']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="גובה (ס״מ)" name="height_cm" value={form.height_cm} onChange={handleChange} type="number" placeholder="175" />
                <Field label="משקל (ק״ג)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" placeholder="70" />
              </div>
              <Field label="שם קבוצה נוכחית" name="team_name" value={form.team_name} onChange={handleChange} placeholder="מכבי תל אביב נוער" />
              <Field
                label="מועדון קודם (אם קיים)"
                name="previous_clubs"
                value={form.previous_clubs}
                onChange={handleChange}
                placeholder="הפועל ירושלים, בית״ר..."
                hint="אם ממולא — המערכת תיצור אוטומטית בקשת העברה (ITC) לבדיקת המנהל המקצועי"
              />
              <Field label="הישגים" name="achievements" value={form.achievements} onChange={handleChange} placeholder="אלוף הליגה 2023..." textarea />

              <div className="pt-3 border-t border-white/10">
                <h3 className="text-white font-black text-sm mb-3">מידות ציוד — לניהול לוגיסטי</h3>
                <EquipmentSizeForm value={form.equipment_size} onChange={(v) => setForm(prev => ({ ...prev, equipment_size: v }))} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-white/50 hover:text-white text-sm font-semibold transition-colors">
                ← חזרה
              </button>
            ) : <div />}
            {step < STATIONS.length - 1 ? (
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
                disabled={register.isPending}
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