import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import he from './dictionaries/he';
import ar from './dictionaries/ar';
import en from './dictionaries/en';

const DICTIONARIES = { he, ar, en };
const RTL_LANGS = ['he', 'ar'];
const STORAGE_KEY = 'elite-lang';

const LanguagesContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) || 'he'
  );

  // Apply language + direction to the DOM
  useEffect(() => {
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.style.setProperty('--app-lang', `"${lang}"`);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* */ }
  }, [lang]);

  // On mount: try to sync from user profile if logged in
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const saved = user?.data?.language || user?.language;
        if (saved && saved !== lang && DICTIONARIES[saved]) {
          setLangState(saved);
        }
      } catch { /* not logged in — keep localStorage default */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback(async (newLang) => {
    if (!DICTIONARIES[newLang]) return;
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch { /* */ }
    // Persist to user profile for cross-device sync
    try { await base44.auth.updateMe({ language: newLang }); } catch { /* user may not be logged in */ }
  }, []);

  // Core t() — dot-notation lookup with Hebrew fallback, then key itself
  const t = useCallback((key, vars = {}) => {
    const resolve = (dict) => {
      const keys = key.split('.');
      let val = dict;
      for (const k of keys) { val = val?.[k]; if (val === undefined) break; }
      return val;
    };
    let result = resolve(DICTIONARIES[lang]);
    if (result === undefined) result = resolve(DICTIONARIES.he);  // fallback to source
    if (result === undefined) return key;  // key not found anywhere — return the key
    // Simple {var} interpolation
    if (vars && typeof result === 'string') {
      result = result.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }
    return result;
  }, [lang]);

  // Dynamic content translation — for user-entered text (team names, notes, stadium names)
  // Uses InvokeLLM on-demand; callers should ensure the text is meaningfully different from the target language
  const translateText = useCallback(async (text, sourceLang = 'he') => {
    if (!text || lang === sourceLang || typeof text !== 'string') return text;
    try {
      const targetName = lang === 'ar' ? 'Modern Standard Arabic' : lang === 'en' ? 'English' : 'Hebrew';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following sports-management text to ${targetName}. Return ONLY the translation, no explanation or quotes:\n\n${text}`,
      });
      return typeof response === 'string' ? response : (response?.text || text);
    } catch { return text; }
  }, [lang]);

  return (
    <LanguagesContext.Provider value={{ lang, setLang, t, translateText }}>
      {children}
    </LanguagesContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguagesContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}