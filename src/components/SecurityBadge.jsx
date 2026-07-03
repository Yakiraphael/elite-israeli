import { ShieldCheck } from 'lucide-react';

export default function SecurityBadge({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[#D4AF37]/5 border-[#D4AF37]/20 ${className}`}>
      <ShieldCheck size={13} className="text-[#D4AF37] flex-shrink-0" />
      <span className="text-white/50 text-[10px] font-semibold">
        מאובטח בתקנים בינלאומיים · מופעל על גבי Base44 Enterprise
      </span>
    </div>
  );
}