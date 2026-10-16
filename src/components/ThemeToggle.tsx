import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
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

  const getIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'dark':
        return <Moon className="h-4 w-4 text-indigo-400" />;
      case 'system':
      default:
        return <Monitor className="h-4 w-4 text-slate-500 dark:text-zinc-400" />;
    }
  };

  // Immediate toggle between dark and light for instant visual feedback
  const handleToggle = () => {
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains('dark');
    const next: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
    onSelectTheme(next);
  };

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      {/* Primary Toggle Button */}
      <div className="flex items-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 shadow-xs backdrop-blur-md overflow-hidden">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Toggle appearance. Currently ${theme}. Click to switch between Light and Dark.`}
          title={`Appearance: ${theme.toUpperCase()} (Click to toggle Light/Dark)`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors active:scale-95"
        >
          {getIcon(theme)}
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
          className="px-1.5 py-2 border-l border-slate-200/80 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popover Menu for explicit Light / Dark / System selection */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white/95 dark:bg-zinc-900/95 p-1.5 shadow-xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in text-xs backdrop-blur-xl">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Appearance
          </div>
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                onSelectTheme(mode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left capitalize transition-colors ${
                theme === mode
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {getIcon(mode)}
              <span>{mode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
