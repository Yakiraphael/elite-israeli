import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ResponsiveModal — מעטפת חלון נפתח אחידה לכל המערכת.
// 1) Viewport Scaling: מלא במובייל, ממורכז עם max-h-[92vh] בדסקטופ, רוחב יחסי.
// 2) Zero Double Scrollbars: נעילת overflow ב-<html> כל עוד החלון פתוח → גלילת דפדפן מבוטלת; התוכן הפנימי הוא מכל הגלילה היחיד.
// 3) Single Scroll Container: header/footer דביקים, גוף flex-1 overflow-y-auto בלבד.
// שימוש: <ResponsiveModal title=... icon=... onClose={...} size="lg" footer={...}>...</ResponsiveModal>

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
  full: 'sm:max-w-6xl',
};

export default function ResponsiveModal({ open = true, onClose, size = 'lg', title, icon: Icon, headerActions, children, footer }) {
  // נעילת גלילת הגוף ברקע — מונע גלילה כפולה כל עוד המודאל פתוח.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`relative w-full ${SIZES[size] || SIZES.lg} bg-[#0D1B2A] border border-white/15 flex flex-col max-h-screen sm:max-h-[92vh] rounded-none sm:rounded-xl overflow-hidden`}
          >
            {(title || onClose) && (
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-[#0D1B2A] flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {Icon && <Icon size={18} className="text-[#D4AF37] flex-shrink-0" />}
                  <h2 className="text-white font-black text-sm truncate">{title}</h2>
                  {headerActions}
                </div>
                {onClose && (
                  <button onClick={onClose} className="text-white/40 hover:text-white flex-shrink-0" aria-label="סגור">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 min-h-0">
              {children}
            </div>
            {footer && (
              <div className="px-5 py-3 border-t border-white/10 bg-[#0D1B2A] flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}