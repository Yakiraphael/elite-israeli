import { useState, useCallback, useRef } from 'react';
import { useTranslation } from './LanguagesContext';

/**
 * useSmartTranslate — Smart Dynamic Translation Hook
 *
 * Caches translations in a session-scoped in-memory Map + sessionStorage.
 * Translates user-entered text (team names, stadium names, notes) on-demand
 * via InvokeLLM, falling back gracefully to the original text on error.
 *
 * Usage:
 *   const { smartT, batchTranslate, translating, lang } = useSmartTranslate();
 *   const translated = await smartT('קבוצת נוער א׳');
 *   const [t1, t2] = await batchTranslate(['נוער א׳', 'מגרש עירוני']);
 *
 * For render-time use (displaying already-translated content):
 *   const { smartT } = useSmartTranslate();
 *   const [label, setLabel] = useState(original);
 *   useEffect(() => { smartT(original).then(setLabel); }, [original, lang]);
 */
export function useSmartTranslate() {
  const { lang, translateText } = useTranslation();
  const cache = useRef(new Map());
  const [translating, setTranslating] = useState(false);

  const smartT = useCallback(async (text, sourceLang = 'he') => {
    if (!text || lang === sourceLang || typeof text !== 'string') return text;
    const key = `${sourceLang}:${lang}:${text}`;

    // 1. Memory cache
    if (cache.current.has(key)) return cache.current.get(key);

    // 2. sessionStorage cache
    try {
      const stored = sessionStorage.getItem(`i18n:${key}`);
      if (stored) { cache.current.set(key, stored); return stored; }
    } catch { /* */ }

    // 3. Translate via InvokeLLM
    setTranslating(true);
    try {
      const result = await translateText(text, sourceLang);
      cache.current.set(key, result);
      try {
        sessionStorage.setItem(`i18n:${key}`, result);
        // Evict old entries if cache grows
        if (sessionStorage.length > 500) {
          const keys = Object.keys(sessionStorage).filter(k => k.startsWith('i18n:'));
          keys.slice(0, 100).forEach(k => sessionStorage.removeItem(k));
        }
      } catch { /* */ }
      return result;
    } catch {
      return text; // graceful fallback
    } finally {
      setTranslating(false);
    }
  }, [lang, translateText]);

  const batchTranslate = useCallback(async (texts, sourceLang = 'he') => {
    return Promise.all((texts || []).map(t => smartT(t, sourceLang)));
  }, [smartT]);

  return { smartT, batchTranslate, translating, lang };
}