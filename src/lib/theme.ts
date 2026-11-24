'use client';

import { useState, useEffect } from 'react';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'intelligentqa_theme';

/**
 * Gets the current active theme, defaulting to 'light' (Normal Theme) as requested.
 */
export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'light'; // Normal theme is default
}

/**
 * Applies the theme to the <html> document root and persists preference.
 */
export function applyTheme(theme: AppTheme): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // Ignore storage errors
  }

  window.dispatchEvent(new CustomEvent('intelligentqa_theme_changed', { detail: { theme } }));
}

/**
 * React hook for consuming and toggling theme across components.
 */
export function useAppTheme(): {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: AppTheme) => void;
} {
  const [theme, setThemeState] = useState<AppTheme>('light');

  useEffect(() => {
    // Read initial theme
    const initial = getStoredTheme();
    setThemeState(initial);
    applyTheme(initial);

    const handleThemeChange = (e: any) => {
      const next = e.detail?.theme || getStoredTheme();
      setThemeState(next);
    };

    window.addEventListener('intelligentqa_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('intelligentqa_theme_changed', handleThemeChange);
    };
  }, []);

  const setTheme = (next: AppTheme) => {
    setThemeState(next);
    applyTheme(next);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}
