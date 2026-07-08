const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = Array.from({ length: 16 }, (_, i) => 34 + i);

export default function EquipmentSizeForm({ value, onChange }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  const selectCls = "w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60 transition-colors";

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">מידת חולצה</label>
        <select value={value.shirt || ''} onChange={e => set('shirt', e.target.value)} className={selectCls}>
          <option value="">בחר...</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">מידת מכנס</label>
        <select value={value.pants || ''} onChange={e => set('pants', e.target.value)} className={selectCls}>
          <option value="">בחר...</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">מידת נעל</label>
        <select value={value.shoe || ''} onChange={e => set('shoe', e.target.value)} className={selectCls}>
          <option value="">בחר...</option>
          {SHOE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}