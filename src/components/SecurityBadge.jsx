import { ShieldCheck } from 'lucide-react';

export default function SecurityBadge({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[#D4AF37]/5 border-[#D4AF37]/20 hidden ${className}`}>
      <ShieldCheck size={13} className="text-[#D4AF37] flex-shrink-0 hidden" />
      <span className="text-white/50 text-[10px] font-semibold hidden">
        מאובטח בתקנים בינלאומיים
      </span>
    </div>);

}