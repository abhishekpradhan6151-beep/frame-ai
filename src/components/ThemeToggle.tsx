import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onSelectTheme,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingRipple, setIsAnimatingRipple] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerVisualFeedback = () => {
    setIsAnimatingRipple(true);
    setTimeout(() => setIsAnimatingRipple(false), 500);
  };

  const getIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return (
          <Sun className="h-3.5 w-3.5 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
        );
      case 'dark':
        return (
          <Moon className="h-3.5 w-3.5 text-indigo-400 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        );
      case 'system':
      default:
        return (
          <Monitor className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400 transition-transform duration-300" />
        );
    }
  };

  // Immediate toggle between dark and light with coordinated fluid feedback
  const handleToggle = () => {
    triggerVisualFeedback();
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains('dark');
    const next: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
    onSelectTheme(next);
  };

  const handleSelectMode = (mode: ThemeMode) => {
    triggerVisualFeedback();
    onSelectTheme(mode);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      {/* Primary Toggle Glass Container */}
      <div className="relative flex items-center rounded-full border border-[var(--border-default)] bg-white/80 dark:bg-zinc-900/70 shadow-xs backdrop-blur-xl overflow-hidden transition-all duration-200">
        {/* Subtle glass ripple highlight on toggle */}
        {isAnimatingRipple && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-white/20 animate-ping opacity-60"
            aria-hidden="true"
          />
        )}

        {/* Top edge glass reflection line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Toggle appearance. Currently ${theme}. Click to switch between Light and Dark.`}
          title={`Appearance: ${theme.toUpperCase()} (Click to toggle Light/Dark)`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors duration-150 active:scale-[0.96] cursor-pointer"
        >
          <span className="shrink-0">{getIcon(theme)}</span>
          <span className="capitalize hidden sm:inline text-[11px] font-semibold tracking-wide">
            {theme}
          </span>
        </button>

        {/* Dropdown Chevron Trigger for explicit selection */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open appearance menu"
          title="Choose Light, Dark, or System mode"
          className="px-2 py-1.5 border-l border-[var(--border-subtle)] text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors duration-150 cursor-pointer"
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ease-liquid-spring ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Popover Menu for explicit Light / Dark / System selection with spring reveal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-2xl bg-white/95 dark:bg-zinc-900/95 p-1.5 shadow-2xl border border-[var(--border-default)] z-50 animate-modal-enter text-xs backdrop-blur-2xl">
          {/* Top highlight line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-2xl"
            aria-hidden="true"
          />

          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Appearance
          </div>

          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
            const isSelected = theme === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleSelectMode(mode)}
                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left capitalize transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{getIcon(mode)}</span>
                  <span>{mode}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-current shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
