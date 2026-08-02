import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ImageIcon, HeartPulse, FileText, ShieldCheck, Loader2, CheckCircle2, PenLine, X } from 'lucide-react';
import { consentSnapshot } from '@/lib/regulationVersion';

// סטודיו הסכמות אפוטרופוס — המקום היחיד בו אפוטרופוס חותם דיגיטלית על הסכמות רגולטוריות
// הנוגעות לקטין (אישור מדיה, ויתור רפואי, ייפוי כוח דיגיטלי, תקנון מועדון).
// כל חתימה נשמרת ב-legal_terms_accepted של השחקן ונרשמת ב-AuditLog עם גרסת התקנון (Versioning).
// עקרון: אישור מדיה הוא שער חובה לקטין — בלעדיו שער התקינות ב-GuardianComplianceGate חסום.

const GUARDIAN_CONSENTS = [
  {
    key: 'media_consent',
    label: 'אישור שימוש במדיה',
    icon: ImageIcon,
    text: 'אני מאשר/ת כי המועדון/העמותה רשאי לפרסם, לשדר ולהפיץ תמונות וסרטונים של בני/בתי הקטין/ה בערוצי התקשורת המוסדיים (אתר, רשתות חברתיות, דוחו"ת, חומרי שיווק) לצורך קידום הפעילות החינוכית-ספורטיבית. האישור ניתן מרצון וניתן לחזור בו בכל עת בהודעה בכתב למועדון.',
    required: true,
  },
  {
    key: 'medical_waiver',
    label: 'ויתור סודיות רפואית מוגבל',
    icon: HeartPulse,
    text: 'אני מאשר/ת חשיפת מידע רפואי רלוונטי למצב הכושר הספורטיבי של הקטין/ה בפני צוות המועדון המטפל והצוות הרפואי המוסמך בלבד, בהתאם לתקנון ההתאחדות ולחוק זכויות החולה.',
    required: true,
  },
  {
    key: 'digital_power_of_attorney',
    label: 'ייפוי כוח בירוקרטי דיגיטלי',
    icon: FileText,
    text: 'אני ממנה/ת את המועדון כבא-כוחי הדיגיטלי לשם ניהול הליכי הרישום, ההעברות וההשאלות מול ההתאחדות לכדורגל, לרבות הגשת טפסים וחתימה דיגיטלית על מסמכים רגולטוריים בשמי עבור הקטין/ה.',
    required: true,
  },
  {
    key: 'club_bylaws',
    label: 'תקנון המועדון',
    icon: ShieldCheck,
    text: 'אני מאשר/ת כי קראתי את תקנון המועדון וכי בני/בתי יפעלו בהתאם לכלליו (הופעה, משמעת, נהלי אימון ומשחק, כללי התנהגות).',
    required: false,
  },
];

export default function GuardianConsentPanel({ player, guardianUser }) {
  const queryClient = useQueryClient();
  const [signingKey, setSigningKey] = useState(null);
  const [signName, setSignName] = useState('');
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState('');

  const terms = player.legal_terms_accepted || {};

  const signConsent = useMutation({
    mutationFn: async ({ key }) => {
      if (!signName.trim() || signName.trim().length < 2) throw new Error('נא להזין שם מלא');
      if (!ack) throw new Error('נא לאשר את תוכן ההסכמה');
      const consentDef = GUARDIAN_CONSENTS.find(c => c.key === key);
      const now = new Date().toISOString();
      await base44.entities.PlayerRegistration.update(player.id, {
        legal_terms_accepted: { ...terms, [key]: true },
        audit_signed_at: now,
        audit_signed_by: `${guardianUser.full_name || guardianUser.email} — ${consentDef.label}`,
      });
      await base44.entities.AuditLog.create({
        actor_id: guardianUser.id,
        actor_name: guardianUser.full_name,
        actor_role: 'parent',
        action: 'consent_signed',
        player_id: player.id,
        details: `אפוטרופוס ${signName.trim()} אישר/ה ${consentDef.label} עבור ${player.full_name}`,
        ...consentSnapshot([key]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian-children'] });
      setSigningKey(null);
      setSignName('');
      setAck(false);
      setErr('');
    },
    onError: (e) => setErr(e.message || 'שגיאה בשמירת ההסכמה'),
  });

  const requiredCount = GUARDIAN_CONSENTS.filter(c => c.required).length;
  const requiredSigned = GUARDIAN_CONSENTS.filter(c => c.required && terms[c.key]).length;
  const signedCount = GUARDIAN_CONSENTS.filter(c => terms[c.key]).length;
  const allRequiredDone = requiredSigned === requiredCount;

  return (
    <div className="bg-[#0D1B2A]/60 border border-white/10 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold">
          <ShieldCheck size={13} /> סטודיו הסכמות אפוטרופוס
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${allRequiredDone ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
          {requiredSigned}/{requiredCount} חובה · {signedCount}/{GUARDIAN_CONSENTS.length} סה"כ
        </span>
      </div>
      <p className="text-white/45 text-[10px] mb-3 leading-relaxed">
        חתימה דיגיטלית על הסכמות הנוגעות לקטין. כל חתימה מתועדת ביומן הביקורת עם גרסת התקנון הפעיל ({'IFA-REG-2026.1'}).
        {!allRequiredDone && <span className="text-amber-400 font-bold"> יש להשלים את כל הסכמות החובה לפני חתימת העברה.</span>}
      </p>

      <div className="space-y-2">
        {GUARDIAN_CONSENTS.map(c => {
          const signed = !!terms[c.key];
          const Icon = c.icon;
          const isOpen = signingKey === c.key;
          return (
            <div key={c.key} className={`rounded-lg border ${signed ? 'border-green-500/20 bg-green-500/[0.04]' : c.required ? 'border-red-500/25 bg-red-500/[0.04]' : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Icon size={13} className={signed ? 'text-green-400' : c.required ? 'text-red-400' : 'text-white/40'} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[11px] font-bold flex items-center gap-1.5">
                    {c.label}
                    {c.required && <span className="text-[9px] text-red-400 bg-red-500/10 px-1 py-0.5 rounded">חובה</span>}
                  </div>
                </div>
                {signed ? (
                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-1"><CheckCircle2 size={11} /> נחתם</span>
                ) : (
                  <button onClick={() => { setSigningKey(c.key); setErr(''); setAck(false); setSignName(''); }}
                    className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-1 rounded-sm hover:bg-[#D4AF37]/20 transition-colors flex items-center gap-1">
                    <PenLine size={10} /> חתום עכשיו
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-white/10 px-3 py-3 space-y-2.5">
                  <div className="text-white/60 text-[11px] leading-relaxed bg-[#1B263B]/60 rounded p-2.5 max-h-32 overflow-y-auto">
                    {c.text}
                  </div>
                  <label className="flex items-start gap-2 text-white/70 text-[11px] cursor-pointer">
                    <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} className="mt-0.5 accent-[#D4AF37]" />
                    <span>קראתי ואני מאשר/ת את התוכן לעיל</span>
                  </label>
                  <input value={signName} onChange={e => setSignName(e.target.value)} placeholder="הקלד שם מלא כחתימה דיגיטלית"
                    className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                  {err && <p className="text-red-400 text-[10px]">{err}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => signConsent.mutate({ key: c.key })} disabled={signConsent.isPending}
                      className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs py-2 rounded-sm hover:bg-amber-400 disabled:opacity-40 flex items-center justify-center gap-1.5">
                      {signConsent.isPending ? <Loader2 size={12} className="animate-spin" /> : <PenLine size={12} />} חתום ושמור
                    </button>
                    <button onClick={() => { setSigningKey(null); setErr(''); }}
                      className="text-white/40 hover:text-white text-xs px-3 flex items-center"><X size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}