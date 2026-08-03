import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Check, ChevronDown } from 'lucide-react';

// Drop-in replacement for native <select> that uses a Vaul bottom-drawer on mobile
// for a native iOS feel, and falls back to a standard <select> on desktop.
// Props: value, onChange(value), options=[{value,label}], className, placeholder.
export default function MobileSelect({ value, onChange, options, className = '', placeholder = 'Select...' }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  if (!isMobile) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button type="button" className={`flex items-center justify-between ${className}`} onClick={() => setOpen(true)}>
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown size={14} className="opacity-50 flex-shrink-0 mr-1" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-panel border-hairline max-h-[60vh]">
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        <div className="px-2 py-3 overflow-y-auto max-h-[50vh]">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-lg transition-colors
                ${o.value === value ? 'text-brand bg-brand-soft' : 'text-ink hover:bg-panel-alt'}`}
            >
              {o.label}
              {o.value === value && <Check size={16} className="text-brand" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}