import { useRef, useEffect, useCallback } from 'react';

// Remembers scroll position per dashboard tab and restores it when switching back.
// Usage: const handleTabChange = useTabScrollMemory(tab, setTab);
// Pass handleTabChange to tab buttons and MobileBottomNav onTabChange.
export function useTabScrollMemory(activeTab, setTab) {
  const scrollPositions = useRef({});

  const handleTabChange = useCallback((newTab) => {
    scrollPositions.current[activeTab] = window.scrollY;
    setTab(newTab);
  }, [activeTab, setTab]);

  useEffect(() => {
    const saved = scrollPositions.current[activeTab];
    requestAnimationFrame(() => {
      window.scrollTo(0, saved || 0);
    });
  }, [activeTab]);

  return handleTabChange;
}