import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Loader2, Upload, Trash2, Check } from 'lucide-react';
import NotificationPrefsFields from '../NotificationPrefsFields';

const ALL_NOTIFICATION_OPTIONS = [
  { key: 'new_request', label: 'בקשה חדשה משחקן' },
  { key: 'document_expiring', label: 'מסמך/אישור רפואי עומד לפוג' },
  { key: 'contract_expiring', label: 'חוזה עומד לפוג' },
  { key: 'transfer_approval_needed', label: 'נדרש אישור להעברת שחקן' },
];

// Each role only sees the notification topics relevant to their job — keeps inboxes focused.
const ROLE_NOTIFICATION_KEYS = {
  'מנהל מקצועי': ['new_request', 'contract_expiring', 'transfer_approval_needed'],
  'מאמן': ['new_request', 'document_expiring'],
  'סקאוטר': ['new_request', 'transfer_approval_needed'],
  'אנליסט': ['document_expiring', 'contract_expiring'],
  'מזכירות': ['new_request', 'document_expiring', 'contract_expiring'],
};

function getNotificationOptionsForRole(roleTitle) {
  const keys = ROLE_NOTIFICATION_KEYS[roleTitle];
  if (!keys) return ALL_NOTIFICATION_OPTIONS;
  return ALL_NOTIFICATION_OPTIONS.filter(o => keys.includes(o.key));
}

export default function StaffProfileSettingsModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [certTitle, setCertTitle] = useState('');

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const matches = await base44.entities.ClubUser.filter({ email: user.email });
      const rec = matches[0] || null;
      setRecord(rec);
      setForm({ full_name: rec?.full_name || user.full_name || '', phone: rec?.phone || '', bio: rec?.bio || '' });
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    await base44.entities.ClubUser.update(record.id, { full_name: form.full_name, phone: form.phone, bio: form.bio });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUploadCert = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !record || !certTitle.trim()) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updated = [...(record.certificates || []), { title: certTitle.trim(), file_url }];
    await base44.entities.ClubUser.update(record.id, { certificates: updated });
    setRecord(r => ({ ...r, certificates: updated }));
    setCertTitle('');
    setUploading(false);
  };

  const removeCert = async (idx) => {
    const updated = (record.certificates || []).filter((_, i) => i !== idx);
    await base44.entities.ClubUser.update(record.id, { certificates: updated });
    setRecord(r => ({ ...r, certificates: updated }));
  };

  const updateNotificationPref = async (key, checked) => {
    const updated = { ...(record.notification_preferences || {}), [key]: checked };
    await base44.entities.ClubUser.update(record.id, { notification_preferences: updated });
    setRecord(r => ({ ...r, notification_preferences: updated }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-base">הגדרות פרופיל</h3>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#D4AF37]" /></div>
        ) : !record ? (
          <p className="text-white/40 text-sm text-center py-6">לא נמצא רשומת צוות המשויכת למייל שלך.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-[#D4AF37] text-xs font-bold">{record.role_title}{record.club_name ? ` · ${record.club_name}` : ''}</div>

            <div>
              <label className="text-white/40 text-xs font-bold mb-1 block">שם מלא</label>
              <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold mb-1 block">טלפון</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-bold mb-1 block">תיאור מקצועי / הכשרה</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                placeholder="לדוגמה: מאמן מוסמך UEFA B, ניסיון של 8 שנים בליגת הנוער"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs py-2.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-40">
              {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
              {saving ? 'שומר...' : saved ? 'נשמר' : 'שמור שינויים'}
            </button>

            <div className="pt-3 border-t border-white/10">
              <div className="text-white/40 text-xs font-bold mb-2">תעודות הכשרה לאימות</div>
              <div className="space-y-2 mb-3">
                {(record.certificates || []).map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0D1B2A] border border-white/10 rounded-sm px-3 py-2">
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:text-[#D4AF37] truncate">{c.title}</a>
                    <button onClick={() => removeCert(i)}><Trash2 size={13} className="text-red-400 hover:text-red-300 flex-shrink-0" /></button>
                  </div>
                ))}
                {(!record.certificates || record.certificates.length === 0) && (
                  <p className="text-white/25 text-xs">טרם הועלו תעודות</p>
                )}
              </div>
              <div className="flex gap-2">
                <input value={certTitle} onChange={e => setCertTitle(e.target.value)} placeholder="שם התעודה (למשל: מאמן UEFA B)"
                  className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                <label className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-sm cursor-pointer flex-shrink-0 ${!certTitle.trim() ? 'opacity-40 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} העלה
                  <input type="file" className="hidden" onChange={handleUploadCert} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="text-white/40 text-xs font-bold mb-2">התראות במייל</div>
              <p className="text-white/25 text-[10px] mb-2">מותאם לתפקידך — {record.role_title}</p>
              <NotificationPrefsFields options={getNotificationOptionsForRole(record.role_title)} value={record.notification_preferences} onChange={updateNotificationPref} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}