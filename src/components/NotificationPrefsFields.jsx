// Reusable list of email-notification toggle checkboxes.
// `options` = [{ key, label }], `value` = current prefs object, `onChange(key, checked)`.
export default function NotificationPrefsFields({ options, value = {}, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt.key} className="flex items-center justify-between gap-3 bg-[#0D1B2A] border border-white/10 rounded-sm px-3 py-2 cursor-pointer">
          <span className="text-white/70 text-xs">{opt.label}</span>
          <input
            type="checkbox"
            checked={value[opt.key] !== false}
            onChange={e => onChange(opt.key, e.target.checked)}
            className="accent-[#D4AF37] w-4 h-4 cursor-pointer flex-shrink-0"
          />
        </label>
      ))}
    </div>
  );
}