import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';

const THEME_STORAGE_KEY = 'frame_ai_theme';
let themeTransitionTimer: number | null = null;

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
}

export function applyTheme(mode: ThemeMode, animateTransition = false) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (animateTransition) {
    root.classList.add('theme-transitioning');
    if (themeTransitionTimer) {
      clearTimeout(themeTransitionTimer);
    }
    themeTransitionTimer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      themeTransitionTimer = null;
    }, 420) as unknown as number;
  }

  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // system
    isDark = typeof window !== 'undefined' && Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  // Dispatch custom event for UI components that want to trigger subtle micro-effects
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('frame-theme-changed', { detail: { mode, isDark } }));
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
    // Explicit user action: trigger coordinated smooth 380-420ms transition
    applyTheme(newTheme, true);
  };

  useEffect(() => {
    // Initial mount without unnecessary full-page transition animation
    applyTheme(theme, false);

    // If in system mode, listen to OS color scheme changes
    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        applyTheme('system', true);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return { theme, setTheme };
}
