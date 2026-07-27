/**
 * PlayerGapModal — מודאל ממוקד ל"דרישות חסרות" לשחקן ספציפי.
 * מציג את פער התיק האישי מול IFA (רפואי / רישום / הסכם שחקן) ואת שערי
 * החבילות המוסדיות הרלוונטיים למנהל המקצועי. נפתח מתוך המטריצה
 * (DirectorComplianceMatrix) בלחיצה על "שלח חבילת השלמה".
 *
 * משתמש בלוגיקה הקיימת computePlayerIfaCompliance מ-@/lib/documentPackages
 * כדי לא לשכפל חישובי תאימות.
 */
import { CheckCircle2, XCircle, X, ShieldAlert, FileWarning } from 'lucide-react';
import { computePlayerIfaCompliance, IFA_CLUB_PACKAGES } from '@/lib/documentPackages';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerGapModal({ player, contracts = [], viewerRole = 'director', onClose }) {
  if (!player) return null;
  const compliance = computePlayerIfaCompliance(player, contracts);
  const missing = compliance.checks.filter(c => !c.passed);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
      dir="rtl"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }}
          className="bg-[#1B263B] border border-white/10 rounded-xl w-full max-w-lg max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1B263B] border-b border-white/10 px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-white font-black text-base">{player.full_name}</h2>
                <p className="text-white/40 text-[11px] mt-0.5">
                  דרישות חסרות לתיק IFA · {compliance.completed}/{compliance.total} הושלמו ({compliance.pct}%)
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div className={`rounded-lg p-4 border ${missing.length === 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${missing.length === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {missing.length === 0 ? <CheckCircle2 size={14} /> : <FileWarning size={14} />}
                {missing.length === 0
                  ? 'התיק האישי הושלם — השחקן עומד בדרישות IFA'
                  : `${missing.length} דרישות חסרות — חסימה מהסגל הרשמי`}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {compliance.checks.map(c => (
                  <div key={c.key} className={`flex items-center gap-2 text-xs ${c.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {c.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span className="font-bold">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewerRole === 'director' && (
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
                <div className="text-white/70 text-xs font-bold mb-2">שערים מוסדיים נוספים (בקרה מוסדית)</div>
                <div className="space-y-2">
                  {IFA_CLUB_PACKAGES.map(pkg => (
                    <div key={pkg.key} className="text-[11px] text-white/50 leading-relaxed">
                      <span className="text-white/70 font-bold">{pkg.label}</span> — {pkg.gate_label}
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-[10px] mt-2">
                  ניהול מלא של חבילות מוסדיות בלשונית "חוזים ומסמכים › חבילות מסמכים משפטיים".
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}