import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, AlertTriangle, Lock, Unlock, Loader2, CheckCircle2, UserCheck,
} from 'lucide-react';

// שער אישור חתימה (Pre-Signature Gatekeeper) — מערכת בקרת תאימות אוטומטית
// שמונעת חתימה/קידום/שיתוף של שחקן טרם הושלמו תנאים קריטיים.
// 4 קטגוריות: תיק אישי, רפואי, משפטי+הורה, רישום IFA.
// ברגע שכל התנאים ירוקים — נפתח כפתור "אשר חתימה / קידום שחקן" שרושם חותמת מאובטחת ונועל לעונה.

export default function PreSignatureAudit({ player }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (alive) setUser(me);
      } catch { if (alive) setUser(null); }
    })();
    return () => { alive = false; };
  }, []);

  const isAdult = !!player.is_adult;
  const medicalOk = !!player.medical_certificate_url
    && !!player.medical_expiry_date
    && new Date(player.medical_expiry_date) > new Date();

  const legal = player.legal_terms_accepted || {};
  const legalAdult = !!(legal.platform_terms && legal.digital_power_of_attorney && legal.medical_waiver && legal.media_consent && legal.club_bylaws);
  const guardianOk = isAdult
    ? true
    : !!(player.guardian_name && player.guardian_id && player.id_suffix_url && legal.digital_power_of_attorney);
  const legalOk = legalAdult && guardianOk;

  const ifaOk = player.ifa_registration_status === 'Under Contract' || player.ifa_registration_status === 'Free Agent';

  const checks = [
    {
      id: 'personal',
      label: 'תיק אישי מלא',
      desc: 'אימות פרטי זיהוי + Elite ID',
      done: !!(player.full_name && player.id_number && player.ifa_id && player.elite_id),
      missing: !player.id_number ? 'חסר מספר ת.ז.'
        : !player.ifa_id ? 'חסר מספר כרטיס IFA'
        : !player.elite_id ? 'חסר Elite ID'
        : '',
    },
    {
      id: 'medical',
      label: 'אישור רפואי בתוקף',
      desc: 'רמזור ירוק — לא פג תוקף בעונה הנוכחית',
      done: medicalOk,
      missing: !player.medical_certificate_url ? 'חסר קובץ אישור רפואי'
        : !player.medical_expiry_date ? 'חסר תאריך פקיעת תוקף רפואי'
        : !medicalOk ? 'פג תוקף אישור רפואי — יש לחדש'
        : '',
    },
    {
      id: 'legal',
      label: 'מסמכים משפטיים ואישורי הורה',
      desc: isAdult
        ? 'תקנון + ייפוי כוח + ויתור סודיות + אישור מדיה'
        : 'תקנון + ייפוי כוח + ויתור סודיות + אישור מדיה + חתימת אפוטרופוס',
      done: legalOk,
      missing: !legal.platform_terms ? 'חסר אישור תקנון הפלטפורמה'
        : !legal.digital_power_of_attorney ? 'חסר ייפוי כוח בירוקרטי דיגיטלי'
        : !legal.medical_waiver ? 'חסר ויתור סודיות רפואית'
        : !legal.media_consent ? 'חסר אישור שימוש במדיה'
        : !legal.club_bylaws ? 'חסר אישור תקנון מועדון'
        : !isAdult && !player.guardian_name ? 'חסר שם אפוטרופוס'
        : !isAdult && !player.guardian_id ? 'חסר תעודת זהות הורה/אפוטרופוס'
        : !isAdult && !player.id_suffix_url ? 'חסר ספח תעודת זהות (הוכחת שיוך הורה-קטין)'
        : '',
    },
    {
      id: 'ifa',
      label: 'סטטוס רישום בהתאחדות (IFA)',
      desc: 'מעבר על Player Passport — לוודא שאין מניעה משפטית',
      done: ifaOk,
      missing: `יש לאמת את מצב הרישום בהתאחדות (כעת: ${player.ifa_registration_status || 'Unverified'})`,
    },
  ];

  const total = checks.length;
  const completed = checks.filter(c => c.done).length;
  const allGreen = completed === total;
  const missing = checks.filter(c => !c.done);

  const isApprovedStaff = !!user && !!(user.role === 'admin' || user.role === 'director');
  const hasSignOff = !!player.audit_signed_at;

  const signOff = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();
      await base44.entities.PlayerRegistration.update(player.id, {
        audit_signed_at: new Date().toISOString(),
        audit_signed_by: me?.full_name || me?.email || 'מנהל מקצועי',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['player', player.id] }),
  });

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase flex items-center gap-2">
          <ShieldCheck size={14} /> שער אישור חתימה · Pre-Signature Audit
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-black border ${allGreen ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-amber-500/15 text-amber-400 border-amber-500/40'}`}>
          הושלמו {completed}/{total} תנאים מקדימים
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map(c => (
          <div key={c.id} className={`rounded-lg p-3 border ${c.done ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              {c.done
                ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                : <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
              <span className="text-white text-sm font-bold">{c.label}</span>
            </div>
            <div className="text-white/40 text-[11px] mb-1">{c.desc}</div>
            {!c.done && c.missing && (
              <div className="text-red-400 text-[11px] font-bold flex items-start gap-1 mt-1">
                <span>⚠️</span><span>{c.missing}</span>
              </div>
            )}
            {c.done && (
              <div className="text-green-400 text-[11px] font-bold mt-1">✓ תקין</div>
            )}
          </div>
        ))}
      </div>

      {!allGreen && missing.length > 0 && (
        <div className="mt-3 text-white/40 text-[11px] leading-relaxed">
          לא ניתן לאשר חתימה / קידום שחקן טרם השלמת: <span className="text-red-400 font-bold">{missing.map(m => m.label).join(' · ')}</span>
        </div>
      )}

      {/* אזור אישור סופי / חותמת */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs">
          {hasSignOff ? (
            <div className="text-green-400 flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} /> נחתם ונעול לעונה ע"י {player.audit_signed_by}
              <span className="text-white/40 font-normal">· {new Date(player.audit_signed_at).toLocaleString('he-IL')}</span>
            </div>
          ) : allGreen ? (
            <div className="text-green-400 flex items-center gap-1.5 font-bold">
              <Unlock size={14} /> כל התנאים ירוקים — מוכן לחתימה סופית
            </div>
          ) : (
            <div className="text-amber-400 flex items-center gap-1.5 font-bold">
              <Lock size={14} /> כפתור החתימה נעול אוטומטית — חסרים {total - completed} תנאים מקדימים
            </div>
          )}
        </div>

        {isApprovedStaff && (
          <button
            onClick={() => signOff.mutate()}
            disabled={!allGreen || hasSignOff || signOff.isPending}
            className={`px-4 py-2 rounded-sm text-xs font-black transition-colors flex items-center gap-1.5 ${
              hasSignOff ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default' :
              allGreen ? 'bg-[#D4AF37] text-[#0D1B2A] hover:bg-amber-400' :
              'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            }`}
          >
            {signOff.isPending
              ? <Loader2 size={12} className="animate-spin" />
              : hasSignOff ? <CheckCircle2 size={12} />
              : allGreen ? <Unlock size={12} />
              : <Lock size={12} />}
            {hasSignOff ? 'נחתם' : allGreen ? 'אשר חתימה / קידום שחקן' : 'נעול'}
          </button>
        )}
      </div>
    </div>
  );
}