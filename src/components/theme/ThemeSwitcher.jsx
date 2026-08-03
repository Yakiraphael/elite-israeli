import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/useTheme';

// בורר ערכות נושא: כהה (ברירת מחדל) / בהיר בלבד. אייקון ה"מסך" (auto) הוסר.
// העיצוב עצמו מותאם לנושא דרך .theme-switcher ב-index.css.
const OPTIONS = [
  { id: 'dark', label: 'מצב לילה', Icon: Moon },
  { id: 'light', label: 'מצב יום', Icon: Sun },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // אם מצב "auto" ישן שמור ב-localStorage — נתייחס אליו ככהה לצורך הדגשת הכפתור הפעיל.
  const isActive = (id) => theme === id || (theme === 'auto' && id === 'dark');
  return (
    <div className="theme-switcher flex items-center gap-0.5 rounded-lg p-0.5" role="group" aria-label="בורר ערכת נושא" dir="rtl">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button key={id} type="button" onClick={() => setTheme(id)} aria-label={label} aria-pressed={isActive(id)} title={label}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${isActive(id) ? 'is-active' : ''}`}>
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}