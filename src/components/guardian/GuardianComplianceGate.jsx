import { useState } from 'react';
import { ShieldCheck, FileText, HeartPulse, UserCheck, KeyRound, Send, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// שער תקינות רגולטורי לחתימת אפוטרופוס על העברת קטין.
// כל השערים (חוץ מ-OTP) חייבים להיות ירוק/צהוב כדי לאפשר חתימה. שער אדום חוסם ומפנה ישירות למסמך/פעולה החסרה.
// OTP נשלח במייל לאפוטרופוס המחובר (משתמש רשום) ונדרש לאישור חתימה סופי.
export default function GuardianComplianceGate({ offer, player, guardianUser, onApproved }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpExpected, setOtpExpected] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [signName, setSignName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- שערים רגולטוריים ---
  const isMedExpired = player.medical_expiry_date && new Date(player.medical_expiry_date) < new Date();
  const isMedSoon = !isMedExpired && player.medical_expiry_date && (new Date(player.medical_expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;
  const medStatus = !player.medical_certificate_url ? 'red' : isMedExpired ? 'red' : isMedSoon ? 'yellow' : 'green';

  const guardianProofOk = !!(player.guardian_name && player.guardian_id);
  const idSuffixOk = !!player.id_suffix_url;

  const gates = [
    {
      key: 'id_doc',
      icon: FileText,
      label: 'תעודת זהות השחקן',
      status: player.id_document_url ? 'green' : 'red',
      detail: player.id_document_url ? 'הועלתה' : 'חסרה — פנה למנהל המועדון להעלאת תעודת הזהות',
      href: player.id_document_url || null,
    },
    {
      key: 'id_suffix',
      icon: UserCheck,
      label: 'ספח תעודת זהות (הוכחת שייכות הורה-קטין)',
      status: idSuffixOk ? 'green' : 'red',
      detail: idSuffixOk ? 'הועלה' : 'חסר — נדרש ספח תעודת הזהות של ההורה',
      href: player.id_suffix_url || null,
    },
    {
      key: 'guardian_proof',
      icon: UserCheck,
      label: 'פרטי אפוטרופוס',
      status: guardianProofOk ? 'green' : 'red',
      detail: guardianProofOk ? `${player.guardian_name} · ${player.guardian_id}` : 'חסרים שם/ת"ז אפוטרופוס בטופס הרישום',
      href: null,
    },
    {
      key: 'medical',
      icon: HeartPulse,
      label: 'אישור רפואי בתוקף',
      status: medStatus,
      detail: medStatus === 'green' ? 'תקין' : medStatus === 'yellow' ? `בתוקף עד ${player.medical_expiry_date}` : medStatus === 'red' && player.medical_certificate_url ? 'פג תוקף — נדרש חידוש' : 'חסר אישור רפואי',
      href: player.medical_certificate_url || null,
    },
    {
      key: 'otp',
      icon: KeyRound,
      label: 'אימות OTP (מייל לאפוטרופוס)',
      status: otpVerified ? 'green' : otpSent ? 'yellow' : 'red',
      detail: otpVerified ? 'מאומת' : otpSent ? 'הוזן קוד — ממתין לאימות' : 'נדרש אימות חד-פעני במייל',
      href: null,
    },
  ];

  const blockingGates = gates.filter(g => g.key !== 'otp' && g.status === 'red');
  const docsReady = blockingGates.length === 0;
  const canSign = docsReady && otpVerified && signName.trim().length >= 2;

  const sendOtp = async () => {
    setSendingOtp(true);
    setOtpError('');
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtpExpected(code);
      await base44.integrations.Core.SendEmail({
        to: guardianUser.email,
        subject: 'קוד אימות (OTP) — חתימת אפוטרופוס על העברת שחקן',
        body: `שלום ${guardianUser.full_name || ''},\n\nקוד האימות החד-פעני לחתימה על העברת ${player.full_name} למועדון ${offer.club_name}:\n\n${code}\n\nהקוד תקף להשלמת החתימה בלבד.\nבברכה,\nפלטפורמת עילית ישראלית`,
      });
      setOtpSent(true);
    } catch (e) {
      setOtpError('שליחת קוד האימות נכשלה — נסה שוב');
    }
    setSendingOtp(false);
  };

  const verifyOtp = () => {
    if (otpCode.trim() === otpExpected) {
      setOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('קוד שגוי — נא הזן שוב');
      setOtpVerified(false);
    }
  };

  const handleSign = async () => {
    if (!canSign) return;
    setSubmitting(true);
    try { await onApproved(offer); } finally { setSubmitting(false); }
  };

  const STATUS_STYLE = {
    green: { dot: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)' },
    yellow: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)' },
    red: { dot: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  };

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-[#0D1B2A]/60 p-3">
      <div className="text-white/70 text-[11px] font-bold mb-2 flex items-center gap-1.5">
        <ShieldCheck size={12} className="text-[#D4AF37]" /> שער תקינות לפני חתימה (רמזור)
      </div>
      <div className="space-y-1.5">
        {gates.map(g => {
          const s = STATUS_STYLE[g.status];
          return (
            <div key={g.key} className="flex items-center gap-2 rounded px-2 py-1.5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
              <g.icon size={13} style={{ color: s.dot }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-[11px] font-bold">{g.label}</div>
                <div className="text-white/45 text-[10px] truncate">{g.detail}</div>
              </div>
              {g.href && (
                <a href={g.href} target="_blank" rel="noopener noreferrer" title="פתח מסמך" className="text-[#D4AF37] hover:text-amber-300 flex-shrink-0">
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* OTP widget */}
      <div className="mt-3 border-t border-white/10 pt-3">
        {!otpVerified ? (
          <div className="space-y-2">
            {!otpSent ? (
              <button onClick={sendOtp} disabled={sendingOtp}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold py-2.5 rounded hover:bg-[#D4AF37]/25 disabled:opacity-40">
                {sendingOtp ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                שלח קוד אימות למייל האפוטרופוס
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input value={otpCode} onChange={e => setOtpCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="הזן 6 ספרות"
                  className="flex-1 bg-[#1B263B] border border-white/15 rounded px-3 py-2 text-white text-sm tracking-widest text-center focus:outline-none focus:border-[#D4AF37]/60" />
                <button onClick={verifyOtp} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-3 py-2 rounded hover:bg-amber-400">אמת</button>
                <button onClick={sendOtp} disabled={sendingOtp} title="שלח שוב" className="text-white/40 hover:text-white px-2">
                  {sendingOtp ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
              </div>
            )}
            {otpError && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertTriangle size={11} /> {otpError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
            <CheckCircle2 size={13} /> אפוטרופוס מאומת — ניתן לחתום
          </div>
        )}
      </div>

      {/* חתימה סופית — מאופשרת רק כשכל השערים עברו */}
      {docsReady && otpVerified && (
        <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
          <input value={signName} onChange={e => setSignName(e.target.value)} placeholder="הקלד את שמך המלא כאישור לחתימה דיגיטלית"
            className="w-full bg-[#1B263B] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          <button onClick={handleSign} disabled={!canSign || submitting}
            className="w-full bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-green-500/25 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            אני מאשר/ת את ההעברה בחתימה דיגיטלית
          </button>
        </div>
      )}
      {!docsReady && (
        <div className="mt-3 flex items-start gap-1.5 text-red-400 text-[11px] font-bold">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>חתימה חסומה — נדרש להשלים {blockingGates.length} שער(ים) אדומ(ים) לפני אישור ההעברה (תקנון ההתאחדות לכדורגל).</span>
        </div>
      )}
    </div>
  );
}