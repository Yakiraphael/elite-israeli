import { createContext, useEffect, useState, useCallback, useRef } from 'react';

// ספק ערכת נושא גלובלית: dark (ברירת מחדל) / light / auto (לפי מערכת ההפעלה).
// מסונכרן עם כיתת `html.light`, מתעד ב-localStorage, ומאזין לשינוי prefers-color-scheme במצב auto.
// מנגנון no-flicker יושב ב-index.html ומחיל את המצב לפני הצבע הראשון.

export const ThemeContext = createContext({ theme: 'dark', resolved: 'dark', setTheme: () => {} });

export const THEME_STORAGE_KEY = 'elite-theme';

function resolveTheme(t) {
  if (t === 'light') return 'light';
  if (t === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

function applyResolved(resolved, animate) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-anim');
    window.clearTimeout(applyResolved._t);
    applyResolved._t = window.setTimeout(() => root.classList.remove('theme-anim'), 500);
  }
  root.classList.toggle('light', resolved === 'light');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'dark'; } catch { return 'dark'; }
  });
  const [resolved, setResolved] = useState(() => resolveTheme(
    (typeof localStorage !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY)) || 'dark'
  ));
  const firstRun = useRef(true);

  useEffect(() => {
    applyResolved(resolved, !firstRun.current);
    firstRun.current = false;
  }, [resolved]);

  useEffect(() => {
    setResolved(resolveTheme(theme));
    if (theme !== 'auto' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => setResolved(resolveTheme('auto'));
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_STORAGE_KEY, t); } catch { /* ignore */ }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}