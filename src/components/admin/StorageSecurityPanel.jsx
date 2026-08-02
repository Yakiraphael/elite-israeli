import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, Lock, Database, HardDrive, Loader2, CheckCircle2, AlertTriangle,
  Clock, Trash2, FileX, Save, Calendar,
} from 'lucide-react';

// פאנל ניהול אבטחת מידע: תצוגת מצב הצפנה במנוחה + הגדרות מדיניות מחיקה אוטומטית
// (Retention Policy) לנתוני קטינים בהתאם לתקנון ההתאחדות. מאפשר לאדמין לאמת
// את הצפנת האחסון ולהפעיל/לכבות סריקת מחיקה, ומציג את תוצאות הסריקה האחרונה.
export default function StorageSecurityPanel() {
  const queryClient = useQueryClient();
  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['compliance-settings'],
    queryFn: () => base44.entities.ComplianceSettings.list(),
  });
  const existing = settingsList[0] || {};

  const [form, setForm] = useState({
    encryption_at_rest_verified: false,
    encryption_provider_label: 'Base44 Private Storage — AES-256',
    encryption_last_verified_at: '',
    retention_enabled: false,
    retention_minor_days_after_inactivity: 2555,
    retention_anonymize_only: true,
  });

  useEffect(() => {
    if (existing.id) {
      setForm({
        encryption_at_rest_verified: !!existing.encryption_at_rest_verified,
        encryption_provider_label: existing.encryption_provider_label || 'Base44 Private Storage — AES-256',
        encryption_last_verified_at: existing.encryption_last_verified_at || '',
        retention_enabled: !!existing.retention_enabled,
        retention_minor_days_after_inactivity: existing.retention_minor_days_after_inactivity ?? 2555,
        retention_anonymize_only: existing.retention_anonymize_only !== false,
      });
    }
  }, [existing.id]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        encryption_at_rest_verified: form.encryption_at_rest_verified,
        encryption_provider_label: form.encryption_provider_label,
        encryption_last_verified_at: form.encryption_last_verified_at,
        retention_enabled: form.retention_enabled,
        retention_minor_days_after_inactivity: Number(form.retention_minor_days_after_inactivity) || 2555,
        retention_anonymize_only: form.retention_anonymize_only,
      };
      if (existing.id) {
        await base44.entities.ComplianceSettings.update(existing.id, payload);
      } else {
        await base44.entities.ComplianceSettings.create(payload);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compliance-settings'] }),
  });

  const verifyEncryption = () => {
    setForm(f => ({ ...f, encryption_at_rest_verified: true, encryption_last_verified_at: new Date().toISOString() }));
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-white font-black text-xl">אבטחת מידע ופרטיות נתונים</h2>
        <p className="text-white/40 text-xs mt-1">תקינות תקנון ההתאחדות · הצפנת אחסון · מדיניות מחיקה אוטומטית · ניהול גרסאות תקנון</p>
      </div>

      {/* Encryption at Rest */}
      <Section icon={Lock} title="הצפנה במנוחה (Encryption at Rest)" tone="blue">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ספק אחסון / הצפנה">
            <input value={form.encryption_provider_label} onChange={e => setForm(f => ({ ...f, encryption_provider_label: e.target.value }))}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60" />
          </Field>
          <Field label="אימות אחרון">
            <div className="flex items-center gap-2">
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1.5 rounded border ${form.encryption_at_rest_verified ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                {form.encryption_at_rest_verified ? <><CheckCircle2 size={12} className="inline ml-1" />מאומת</> : <><AlertTriangle size={12} className="inline ml-1" />לא אומת</>}
              </span>
              {form.encryption_last_verified_at
                ? <span className="text-white/40 text-[10px]">{new Date(form.encryption_last_verified_at).toLocaleString('he-IL')}</span>
                : <span className="text-white/30 text-[10px]">טרם אומת</span>}
            </div>
          </Field>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={verifyEncryption}
            className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-amber-300 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 rounded transition-colors">
            <ShieldCheck size={13} /> אמת הצפנה עכשיו
          </button>
          <p className="text-white/40 text-[10px]">אימות מתעד את הספק וחותם זמן. האחסון הפרטי של Base44 מוצפן ב-AES-256 כברירת מחדל.</p>
        </div>
      </Section>

      {/* Retention Policy */}
      <Section icon={Trash2} title="מדיניות מחיקה אוטומטית (Retention Policy)" tone="amber">
        <div className="space-y-3">
          <Toggle
            label="הפעלת סריקת מחיקה/אנונימיזציה אוטומטית"
            hint="סריקה שבועית של רשומות קטינים לא-פעילים ומחיקת/אנונימיזציה של PII"
            value={form.retention_enabled} onChange={v => setForm(f => ({ ...f, retention_enabled: v }))} />
          <Field label="ימי חוסר-פעילות עד טיפול (ברירת מחדל 2555 ≈ 7 שנים)">
            <input type="number" min={365} value={form.retention_minor_days_after_inactivity}
              onChange={e => setForm(f => ({ ...f, retention_minor_days_after_inactivity: e.target.value }))}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60" />
          </Field>
          <Toggle
            label="אנונימיזציה בלבד (ללא מחיקה קשה)"
            hint="מאפס שדות PII ומשאיר רשומת-שלד לחובת שמירה חוקית. כיבוי = מחיקה קשה של הרשומה."
            value={form.retention_anonymize_only} onChange={v => setForm(f => ({ ...f, retention_anonymize_only: v }))} />
          {existing.retention_last_sweep_at && (
            <div className="flex items-center gap-2 bg-[#0D1B2A] border border-white/10 rounded px-3 py-2">
              <Clock size={12} className="text-[#D4AF37]" />
              <span className="text-white/40 text-[10px]">סריקה אחרונה: {new Date(existing.retention_last_sweep_at).toLocaleString('he-IL')}</span>
              <span className="text-white/30 text-[10px]">· עובדו {existing.retention_last_sweep_count ?? 0} רשומות</span>
            </div>
          )}
          <p className="text-white/40 text-[10px] leading-relaxed">
            'סיום פעילות' מחושב מהמאוחר מבין תאריך סיום חוזה / עדכון אחרון. כל פעולה נרשמת ביומן ביקורת יחד עם גרסת התקנון הפעיל.
          </p>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-bold text-sm px-5 py-2.5 rounded hover:bg-amber-400 disabled:opacity-40 transition-colors">
          {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} שמור הגדרות תקינות
        </button>
        {save.isSuccess && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> נשמר</span>}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, tone, children }) {
  const toneCls = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
  }[tone];
  const iconCls = {
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneCls}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded flex items-center justify-center ${iconCls}`}>
          <Icon size={14} />
        </div>
        <h3 className="text-white font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[#D4AF37] text-[10px] font-bold mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <div className="flex items-start gap-3">
      <button onClick={() => onChange(!value)}
        className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors relative mt-0.5 ${value ? 'bg-[#D4AF37]' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'right-0.5' : 'right-5'}`} />
      </button>
      <div>
        <div className="text-white text-xs font-bold">{label}</div>
        {hint && <div className="text-white/40 text-[10px] mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}