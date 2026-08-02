import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme/useTheme';

// בורר ערכות נושא: כהה (ברירת מחדל) / בהיר / אוטומטי. העיצוב עצמו מותאם לנושא דרך .theme-switcher ב-index.css.
const OPTIONS = [
  { id: 'dark', label: 'כהה', Icon: Moon },
  { id: 'light', label: 'בהיר', Icon: Sun },
  { id: 'auto', label: 'אוטומטי', Icon: Monitor },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switcher flex items-center gap-0.5 rounded-lg p-0.5" role="group" aria-label="בורר ערכת נושא" dir="rtl">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button key={id} type="button" onClick={() => setTheme(id)} aria-label={label} aria-pressed={theme === id} title={label}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${theme === id ? 'is-active' : ''}`}>
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}