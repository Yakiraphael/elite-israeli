import { useTranslation } from '@/lib/i18n/LanguagesContext';

const LANGS = [
  { code: 'he', short: 'עב', name: 'עברית' },
  { code: 'ar', short: 'ع', name: 'العربية' },
  { code: 'en', short: 'EN', name: 'English' },
];

// רכיב מתג שפות — פיל קומפקטי בהיר המאפשר מעבר מיידי בין עברית/ערבית/אנגלית.
// משתלב ב-RoleToolbar לצד ThemeSwitcher.
export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex items-center gap-0.5 bg-panel-alt border border-hairline rounded-full p-0.5" title="בחר שפה / Choose language / اختر اللغة">
      {LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold transition-colors min-w-[26px] text-center ${
            lang === l.code ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:text-ink hover:bg-panel'
          }`}>
          {l.short}
        </button>
      ))}
    </div>
  );
}