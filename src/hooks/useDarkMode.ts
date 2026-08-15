import { useEffect, useState } from 'react';

export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'hydration-reminder-color-scheme';

function getInitial(): ColorScheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface DarkModeState {
  scheme: ColorScheme;
  toggle: () => void;
  set: (scheme: ColorScheme) => void;
}

/**
 * Manual color-scheme toggle. Applies `data-theme` on <html> so CSS can
 * override the system preference; persists to localStorage.
 */
export function useDarkMode(): DarkModeState {
  const [scheme, setScheme] = useState<ColorScheme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', scheme);
    try {
      localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      // ignore
    }
  }, [scheme]);

  return {
    scheme,
    toggle: () => setScheme((s) => (s === 'dark' ? 'light' : 'dark')),
    set: setScheme,
  };
}
