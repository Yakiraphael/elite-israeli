import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { consentSnapshot } from '@/lib/regulationVersion';

// מודל סגירת כרטיס שחקן — אפוטרופוס מגיש בקשה רשמית לסגירת כרטיס השחקן.
// הבקשה נשלחת לתור הפעולות של המנהל המקצועי (PlayerRequest) ונרשמת ב-AuditLog.
// אפוטרופוס אינו יכול למחוק ישירות (RLS) — הסגירה מחייבת אישור מנהל מקצועי.
export default function GuardianCloseCardModal({ player, guardianUser, onClose }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [signName, setSignName] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const submit = useMutation({
    mutationFn: async () => {
      if (reason.trim().length < 5) throw new Error('נא לפרט סיבה (לפחות 5 תווים)');
      if (signName.trim().length < 2) throw new Error('נא להזין שם מלא לחתימה דיגיטלית');
      await base44.entities.PlayerRequest.create({
        player_id: player.id,
        player_name: player.full_name,
        category: 'אחר',
        subject: 'בקשת סגירת כרטיס שחקן',
        details: `בקשת אפוטרופוס לסגירת כרטיס השחקן של ${player.full_name}.\n\nסיבה: ${reason.trim()}\n\nמבוקש ע"י: ${guardianUser.full_name || guardianUser.email} (אפוטרופוס חוקי)`,
        priority: 'דחוף',
        status: 'נשלח',
      });
      await base44.entities.AuditLog.create({
        actor_id: guardianUser.id,
        actor_name: guardianUser.full_name,
        actor_role: 'parent',
        action: 'status_change',
        player_id: player.id,
        details: `אפוטרופוס ${signName.trim()} הגיש בקשת סגירת כרטיס שחקן עבור ${player.full_name}. סיבה: ${reason.trim()}`,
        ...consentSnapshot(),
      });
    },
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ['dir-requests'] });
      queryClient.invalidateQueries({ queryKey: ['guardian-children'] });
    },
    onError: (e) => setErr(e.message || 'שגיאה בשליחת הבקשה'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" dir="rtl">
      <div className="relative w-full max-w-md bg-[#1B263B] border border-white/15 rounded-xl shadow-2xl">
        <button onClick={onClose} className="absolute top-3 left-3 text-white/40 hover:text-white">
          <X size={18} />
        </button>
        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-green-400" />
              </div>
              <h3 className="text-white font-black text-base mb-1">הבקשה נשלחה</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                בקשת סגירת כרטיס השחקן של {player.full_name} הועברה למנהל המקצועי של המועדון לאישור. תקבל/י עדכון במייל עם טיפול בבקשה.
              </p>
              <button onClick={onClose} className="mt-5 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-5 py-2 rounded-sm hover:bg-amber-400">
                סגור
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <ShieldAlert size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-black text-base">סגירת כרטיס שחקן</h3>
                  <p className="text-white/40 text-[11px]">{player.full_name}</p>
                </div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
                <p className="text-amber-300/90 text-[11px] leading-relaxed">
                  בקשה זו תועבר למנהל המקצועי של המועדון לאישור. לאחר אישור, כרטיס השחקן ייסגר והשחקן יוסר מהסגל הפעיל. פעולה זו הפיכה — נדרש רישום מחדש להחזרת השחקן.
                </p>
              </div>
              <label className="text-white/60 text-[11px] font-bold block mb-1">סיבת הסגירה *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="פירוט הסיבה לסגירת הכרטיס…"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 mb-3 resize-none" />
              <label className="text-white/60 text-[11px] font-bold block mb-1">חתימה דיגיטלית (שם מלא) *</label>
              <input value={signName} onChange={e => setSignName(e.target.value)} placeholder="הקלד שם מלא"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 mb-3" />
              {err && <p className="text-red-400 text-[11px] mb-2">{err}</p>}
              <div className="flex gap-2">
                <button onClick={() => submit.mutate()} disabled={submit.isPending}
                  className="flex-1 bg-amber-500 text-[#0D1B2A] font-black text-xs py-2.5 rounded-sm hover:bg-amber-400 disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {submit.isPending ? <Loader2 size={13} className="animate-spin" /> : <ShieldAlert size={13} />} שלח בקשת סגירה
                </button>
                <button onClick={onClose} className="text-white/50 hover:text-white text-xs px-4">ביטול</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}