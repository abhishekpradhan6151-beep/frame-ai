import React from 'react';
import { Film, Sparkles, FolderHeart, Sliders, Plus, Zap } from 'lucide-react';
import { ApiStatus } from '../services/api';
import { ThemeMode } from '../types';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentTab: 'home' | 'studio' | 'creations' | 'settings';
  onSelectTab: (tab: 'home' | 'studio' | 'creations' | 'settings') => void;
  apiStatus: ApiStatus | null;
  preferDemoMode: boolean;
  hasActiveProject: boolean;
  onNewProject: () => void;
  savedCount: number;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  apiStatus,
  preferDemoMode,
  hasActiveProject,
  onNewProject,
  savedCount,
  theme,
  onSelectTheme,
}) => {
  const isLive = apiStatus?.liveAiAvailable && !preferDemoMode;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#09090b]/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo Zone */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            onClick={() => onSelectTab('home')}
            aria-label="FRAME AI Home"
            className="group flex items-center text-left focus:outline-none"
          >
            <Logo size={30} showWordmark={true} />
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-white/10 dark:text-white dark:border dark:border-white/10 dark:backdrop-blur-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Home</span>
            </button>

            {hasActiveProject && (
              <button
                onClick={() => onSelectTab('studio')}
                className={`flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'studio'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-white/10 dark:text-white dark:border dark:border-white/10 dark:backdrop-blur-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <Film className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                <span>Studio</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </button>
            )}

            <button
              onClick={() => onSelectTab('creations')}
              className={`flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'creations'
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-white/10 dark:text-white dark:border dark:border-white/10 dark:backdrop-blur-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              <FolderHeart className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span>My Creations</span>
              {savedCount > 0 && (
                <span className="rounded-full bg-slate-200/80 dark:bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-zinc-300 font-mono">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-white/10 dark:text-white dark:border dark:border-white/10 dark:backdrop-blur-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Theme Switch + Status Badge + New Button */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle theme={theme} onSelectTheme={onSelectTheme} />

          {/* AI Status Badge */}
          <div
            title={
              isLive
                ? 'Server is connected to Google Gemini 3.8 Flash SDK'
                : 'Demo Mode: Deterministic sample creator blueprints active'
            }
            className={`hidden sm:flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition-colors ${
              isLive
                ? 'border-emerald-500/25 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                : 'border-amber-500/25 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="flex items-center gap-1">
              {isLive ? (
                <>
                  <Zap className="h-3 w-3" />
                  <span>Gemini Live</span>
                </>
              ) : (
                <span>Demo Blueprint</span>
              )}
            </span>
          </div>

          {/* New Creation Action */}
          <button
            onClick={onNewProject}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Script</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl px-2 py-1 justify-around text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-zinc-500'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        <button
          onClick={() => onSelectTab('studio')}
          disabled={!hasActiveProject}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            !hasActiveProject
              ? 'text-slate-300 dark:text-zinc-700'
              : currentTab === 'studio'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-zinc-500'
          }`}
        >
          <Film className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Studio</span>
        </button>
        <button
          onClick={() => onSelectTab('creations')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'creations'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-zinc-500'
          }`}
        >
          <FolderHeart className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Creations ({savedCount})</span>
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-zinc-500'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;
