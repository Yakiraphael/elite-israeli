import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Trash2, Edit2, CheckCircle2, X, Loader2, ShieldCheck, Mail, Phone, MapPin, Award, FileText, Upload, ExternalLink } from 'lucide-react';

const TIERS = [
  'Tier 1 — עלית (ליגת העל / בינלאומי)',
  'Tier 2 — מקצועי לאומית',
  'Tier 3 — חובבן רשום A (ליגה א/ב, מגרש בבעלות)',
  'Tier 4 — חובבן רשום B (ליגות מחוזיות/אזוריות)',
  'Tier 5 — עמותה / איגוד נוער וילדים (לא על דשא)',
];

const ORG_TYPES = [
  'מועדון רשום (חברה / עמותה)',
  'עמותה / איגוד המפעיל ליגות',
];

const PLANS = ['FREE', 'PRO', 'ENTERPRISE', 'TRIAL'];

const VERIFICATION_COLORS = {
  'ממתין לאימות': 'text-amber-400 bg-amber-400/10',
  'מאומת': 'text-green-400 bg-green-400/10',
  'נדחה': 'text-red-400 bg-red-400/10',
};

const emptyClub = () => ({
  club_name: '', club_tier: TIERS[4], organization_type: ORG_TYPES[0],
  subscription_plan: 'FREE',
  contact_name: '', contact_email: '', contact_phone: '',
  city: '', league_name: '', business_id: '', is_verified: false,
  verification_status: 'ממתין לאימות',
  incorporation_certificate_url: '',
  ifa_membership_certificate_url: '',
});

export default function ClubsManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyClub());
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingIfa, setUploadingIfa] = useState(false);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['admin-clubs'],
    queryFn: () => base44.entities.Club.list('-created_date', 100),
  });

  const save = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Club.update(editing.id, data)
      : base44.entities.Club.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-clubs'] }); closeForm(); },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Club.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-clubs'] }),
  });

  const toggleVerified = useMutation({
    mutationFn: ({ id, is_verified, verification_status }) =>
      base44.entities.Club.update(id, { is_verified, verification_status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-clubs'] }),
  });

  function openEdit(club) { setEditing(club); setForm({ ...club }); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyClub()); }
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCert(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, incorporation_certificate_url: res.file_url }));
    } catch (err) {
      console.error('cert upload failed', err);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleIfaCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIfa(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, ifa_membership_certificate_url: res.file_url }));
    } catch (err) {
      console.error('ifa cert upload failed', err);
    } finally {
      setUploadingIfa(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-black text-xl">מועדונים</h2>
        <button onClick={() => setShowForm(true)} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-5 py-2.5 rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-2">
          <Plus size={14} /> מועדון חדש
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatKpi label="סה״כ מועדונים" value={clubs.length} icon={Building2} />
        <StatKpi label="מאומתים" value={clubs.filter(c => c.is_verified).length} icon={ShieldCheck} color="#10B981" />
        <StatKpi label="ממתינים לאימות" value={clubs.filter(c => c.verification_status === 'ממתין לאימות').length} icon={ShieldCheck} color="#F59E0B" />
        <StatKpi label="עמותות / איגודים" value={clubs.filter(c => c.organization_type === ORG_TYPES[1]).length} icon={Award} color="#D4AF37" />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-black">{editing ? 'עריכת מועדון' : 'מועדון חדש'}</h3>
              <button onClick={closeForm}><X size={16} className="text-white/40 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="שם המועדון *" name="club_name" value={form.club_name} onChange={handleChange} />
              <Select label="סוג גוף משפטי" name="organization_type" value={form.organization_type} onChange={handleChange} options={ORG_TYPES} />
              <Select label="דרג / טייר" name="club_tier" value={form.club_tier} onChange={handleChange} options={TIERS} />
              <Select label="חבילת מנוי" name="subscription_plan" value={form.subscription_plan} onChange={handleChange} options={PLANS} />
              <Select label="סטטוס אימות" name="verification_status" value={form.verification_status} onChange={handleChange}
                options={['ממתין לאימות', 'מאומת', 'נדחה']} />
              <Field label="איש קשר ראשי" name="contact_name" value={form.contact_name} onChange={handleChange} />
              <Field label="עיר" name="city" value={form.city} onChange={handleChange} />
              <Field label="מייל רשמי" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" />
              <Field label="טלפון איש קשר" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
              <Field label="ליגה / איגוד רשם" name="league_name" value={form.league_name} onChange={handleChange} />
              <Field label="מספר ח״פ / עמותה" name="business_id" value={form.business_id} onChange={handleChange} />
            </div>

            {/* תעודת רישום — חובה לאימות מול ההתאחדות */}
            <div className="mt-5 bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold mb-2">
                <FileText size={12} /> תעודת רישום מרשם החברות / רשם העמותות
              </div>
              <div className="text-white/40 text-[10px] mb-3">
                נייר הקמה / אישור עמותה פעילה — חובה לאימות המועדון מול ההתאחדות לכדורגל.
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg py-5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleCertUpload} disabled={uploadingCert} />
                {uploadingCert
                  ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                  : <>
                    <Upload size={14} className="text-white/40" />
                    <span className="text-white/50 text-xs font-bold">{form.incorporation_certificate_url ? 'החלף קובץ' : 'העלה תעודת רישום'}</span>
                  </>}
              </label>
              {form.incorporation_certificate_url && (
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <CheckCircle2 size={11} className="text-green-400" />
                  <a href={form.incorporation_certificate_url} target="_blank" rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 flex items-center gap-1 truncate">
                    תעודה מצורפת <ExternalLink size={9} />
                  </a>
                  <button onClick={() => setForm(p => ({ ...p, incorporation_certificate_url: '' }))}
                    className="text-red-400 hover:text-red-300 mr-auto">הסר</button>
                </div>
              )}
            </div>

            {/* תעודת חברות בהתאחדות לכדורגל */}
            <div className="mt-3 bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold mb-2">
                <ShieldCheck size={12} /> תעודת חברות בהתאחדות לכדורגל בישראל
              </div>
              <div className="text-white/40 text-[10px] mb-3">
                אישור חברות עדכני — נדרש לאימות השתתפות המועדון בליגות רשמיות.
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg py-5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleIfaCertUpload} disabled={uploadingIfa} />
                {uploadingIfa
                  ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                  : <>
                    <Upload size={14} className="text-white/40" />
                    <span className="text-white/50 text-xs font-bold">{form.ifa_membership_certificate_url ? 'החלף קובץ' : 'העלה תעודת חברות'}</span>
                  </>}
              </label>
              {form.ifa_membership_certificate_url && (
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <CheckCircle2 size={11} className="text-green-400" />
                  <a href={form.ifa_membership_certificate_url} target="_blank" rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 flex items-center gap-1 truncate">
                    תעודת חברות מצורפת <ExternalLink size={9} />
                  </a>
                  <button onClick={() => setForm(p => ({ ...p, ifa_membership_certificate_url: '' }))}
                    className="text-red-400 hover:text-red-300 mr-auto">הסר</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => save.mutate(form)} disabled={!form.club_name || save.isPending}
                className="bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-6 py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {editing ? 'שמור שינויים' : 'צור מועדון'}
              </button>
              <button onClick={closeForm} className="text-white/40 text-sm hover:text-white transition-colors">ביטול</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">אין מועדונים עדיין — צור את הראשון!</div>
      ) : (
        <div className="space-y-3">
          {clubs.map(club => (
            <div key={club.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Building2 size={14} className="text-[#D4AF37]" />
                    <span className="text-white font-bold text-sm">{club.club_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${VERIFICATION_COLORS[club.verification_status] || 'text-white/40 bg-white/5'}`}>
                      {club.verification_status || 'ממתין לאימות'}
                    </span>
                    {club.organization_type === ORG_TYPES[1] && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        עמותה / איגוד
                      </span>
                    )}
                  </div>
                  <div className="text-white/50 text-xs flex flex-wrap gap-x-4 gap-y-1">
                    {club.league_name && <span>⚽ {club.league_name}</span>}
                    {club.city && <span className="flex items-center gap-1"><MapPin size={10} /> {club.city}</span>}
                    {club.contact_email && <span className="flex items-center gap-1"><Mail size={10} /> {club.contact_email}</span>}
                    {club.contact_phone && <span className="flex items-center gap-1"><Phone size={10} /> {club.contact_phone}</span>}
                    {club.business_id && <span>ח״פ: {club.business_id}</span>}
                  </div>
                  <div className="text-white/30 text-[10px] mt-1 flex items-center gap-2 flex-wrap">
                    <span>{club.subscription_plan || 'FREE'} · {club.club_tier?.split(' — ')[0] || 'Tier 5'} · {club.contact_name || 'אין איש קשר'}</span>
                    {club.incorporation_certificate_url ? (
                      <a href={club.incorporation_certificate_url} target="_blank" rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 flex items-center gap-0.5">
                        <FileText size={9} /> תעודת רישום
                      </a>
                    ) : (
                      <span className="text-red-400/70 flex items-center gap-0.5"><FileText size={9} /> חסרה תעודת רישום</span>
                    )}
                    {club.ifa_membership_certificate_url ? (
                      <a href={club.ifa_membership_certificate_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#D4AF37] hover:text-amber-300 flex items-center gap-0.5">
                        <ShieldCheck size={9} /> חברות בהתאחדות
                      </a>
                    ) : (
                      <span className="text-amber-400/60 flex items-center gap-0.5"><ShieldCheck size={9} /> חסרה תעודת חברות</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  <button
                    onClick={() => toggleVerified.mutate({
                      id: club.id,
                      is_verified: !club.is_verified,
                      verification_status: club.is_verified ? 'ממתין לאימות' : 'מאומת',
                    })}
                    title={club.is_verified ? 'בטל אימות' : 'אמת מועדון'}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${club.is_verified ? 'bg-green-500/20' : 'bg-white/5 hover:bg-green-500/20'}`}>
                    <ShieldCheck size={13} className={club.is_verified ? 'text-green-400' : 'text-white/50'} />
                  </button>
                  <button onClick={() => openEdit(club)} className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Edit2 size={13} className="text-white/50" />
                  </button>
                  <button onClick={() => remove.mutate(club.id)} className="w-8 h-8 rounded bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <Trash2 size={13} className="text-white/50 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatKpi({ label, value, icon: Icon, color = '#3B82F6' }) {
  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
      <Icon size={16} style={{ color }} className="mb-2" />
      <div className="text-white font-black text-2xl">{value}</div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">{label}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors" />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">{label}</label>
      <select name={name} value={value || ''} onChange={onChange}
        className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}