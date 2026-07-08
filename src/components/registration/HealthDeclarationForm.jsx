import { HeartPulse, ShieldCheck } from 'lucide-react';

export default function HealthDeclarationForm({ value, onChange, insuranceAck, onInsuranceToggle }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  const cls = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors resize-none";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HeartPulse size={14} className="text-[#D4AF37]" />
        <span className="text-white font-bold text-sm">הצהרת בריאות</span>
      </div>
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">אלרגיות ידועות</label>
        <textarea rows={2} value={value.allergies || ''} onChange={e => set('allergies', e.target.value)} placeholder="אם אין — כתוב 'אין'" className={cls} />
      </div>
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">מחלות כרוניות</label>
        <textarea rows={2} value={value.chronic_conditions || ''} onChange={e => set('chronic_conditions', e.target.value)} placeholder="אם אין — כתוב 'אין'" className={cls} />
      </div>
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">פציעות עבר</label>
        <textarea rows={2} value={value.past_injuries || ''} onChange={e => set('past_injuries', e.target.value)} placeholder="אם אין — כתוב 'אין'" className={cls} />
      </div>

      <div className={`border rounded-lg p-4 transition-all cursor-pointer ${insuranceAck ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 bg-[#0D1B2A] hover:border-white/20'}`}
        onClick={() => onInsuranceToggle(!insuranceAck)}>
        <div className="flex items-start gap-3">
          <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${insuranceAck ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
            {insuranceAck && <span className="text-white text-xs font-black">✓</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className={insuranceAck ? 'text-green-400' : 'text-[#D4AF37]'} />
              <span className="text-white font-bold text-sm">אישור קריאת פוליסת הביטוח של המועדון</span>
            </div>
            <p className="text-white/50 text-xs">קראתי והבנתי את תנאי פוליסת הביטוח החלה על שחקני המועדון.</p>
          </div>
        </div>
      </div>
    </div>
  );
}