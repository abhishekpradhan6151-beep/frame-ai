import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
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

  // Sliding pill for desktop navigation
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [desktopPill, setDesktopPill] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  // Sliding pill for mobile bottom navigation
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [mobilePill, setMobilePill] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateDesktopPill = () => {
    const activeBtn = tabButtonRefs.current[currentTab];
    const nav = desktopNavRef.current;
    if (activeBtn && nav) {
      const activeRect = activeBtn.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setDesktopPill({
        left: activeRect.left - navRect.left,
        width: activeRect.width,
        ready: true,
      });
    }
  };

  const updateMobilePill = () => {
    const activeBtn = mobileButtonRefs.current[currentTab];
    const nav = mobileNavRef.current;
    if (activeBtn && nav) {
      const activeRect = activeBtn.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setMobilePill({
        left: activeRect.left - navRect.left,
        width: activeRect.width,
        ready: true,
      });
    }
  };

  useLayoutEffect(() => {
    updateDesktopPill();
    updateMobilePill();
  }, [currentTab, hasActiveProject, savedCount]);

  useEffect(() => {
    const handleResize = () => {
      updateDesktopPill();
      updateMobilePill();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTab, hasActiveProject]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-white/75 dark:bg-[#09090b]/80 backdrop-blur-2xl transition-colors duration-200">
      {/* Top subtle highlight refraction line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 dark:via-white/20 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo Zone */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            onClick={() => onSelectTab('home')}
            aria-label="FRAME AI Home"
            className="group flex items-center text-left focus:outline-none cursor-pointer transition-transform active:scale-95 duration-150"
          >
            <Logo size={28} showWordmark={true} />
          </button>

          {/* Desktop Sliding Navigation Bar */}
          <nav
            ref={desktopNavRef}
            className="relative hidden md:flex items-center p-1 rounded-full bg-slate-100/80 dark:bg-zinc-900/60 border border-[var(--border-subtle)] backdrop-blur-xl shadow-xs"
            aria-label="Main Navigation"
          >
            {/* Sliding Pill Indicator */}
            {desktopPill.ready && (
              <div
                className="absolute top-1 bottom-1 rounded-full bg-slate-900 dark:bg-white/[0.14] border border-slate-900/10 dark:border-white/25 shadow-sm pointer-events-none transition-all duration-240 ease-liquid-spring"
                style={{
                  transform: `translateX(${desktopPill.left}px)`,
                  width: `${desktopPill.width}px`,
                }}
              />
            )}

            {/* Home Tab */}
            <button
              ref={(el) => {
                tabButtonRefs.current['home'] = el;
              }}
              onClick={() => onSelectTab('home')}
              className={`relative z-10 flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                currentTab === 'home'
                  ? 'text-white dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles
                className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  currentTab === 'home' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
              <span>Home</span>
            </button>

            {/* Studio Tab (visible if active project) */}
            {hasActiveProject && (
              <button
                ref={(el) => {
                  tabButtonRefs.current['studio'] = el;
                }}
                onClick={() => onSelectTab('studio')}
                className={`relative z-10 flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                  currentTab === 'studio'
                    ? 'text-white dark:text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Film
                  className={`h-3.5 w-3.5 transition-colors duration-200 ${
                    currentTab === 'studio' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                />
                <span>Studio</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-xs" />
              </button>
            )}

            {/* My Creations Tab */}
            <button
              ref={(el) => {
                tabButtonRefs.current['creations'] = el;
              }}
              onClick={() => onSelectTab('creations')}
              className={`relative z-10 flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                currentTab === 'creations'
                  ? 'text-white dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <FolderHeart
                className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  currentTab === 'creations' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
              <span>My Creations</span>
              {savedCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono transition-colors ${
                    currentTab === 'creations'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>

            {/* Settings Tab */}
            <button
              ref={(el) => {
                tabButtonRefs.current['settings'] = el;
              }}
              onClick={() => onSelectTab('settings')}
              className={`relative z-10 flex items-center space-x-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                currentTab === 'settings'
                  ? 'text-white dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sliders
                className={`h-3.5 w-3.5 transition-colors duration-200 ${
                  currentTab === 'settings' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Theme Switch + Status Badge + New Button */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Theme Toggle with smooth animations */}
          <ThemeToggle theme={theme} onSelectTheme={onSelectTheme} />

          {/* AI Status Badge */}
          <div
            title={
              isLive
                ? 'Server is connected to Google Gemini 3.8 Flash SDK'
                : 'Demo Mode: Deterministic sample creator blueprints active'
            }
            className={`hidden sm:flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition-all ${
              isLive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="flex items-center gap-1 font-medium">
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

          {/* New Creation Action Button with Apple-like tactile spring press */}
          <button
            onClick={onNewProject}
            className="flex items-center space-x-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4 py-1.5 text-xs font-semibold shadow-sm transition-all duration-150 active:scale-[0.96] border border-[var(--border-subtle)] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Script</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Mobile Sliding Navigation Bar */}
      <div
        ref={mobileNavRef}
        className="relative flex md:hidden border-t border-[var(--border-subtle)] bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl px-2 py-1 justify-around text-xs select-none"
      >
        {/* Mobile Sliding Indicator Pill */}
        {mobilePill.ready && (
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-slate-200/90 dark:bg-white/10 border border-[var(--border-subtle)] pointer-events-none transition-all duration-240 ease-liquid-spring"
            style={{
              transform: `translateX(${mobilePill.left}px)`,
              width: `${mobilePill.width}px`,
            }}
          />
        )}

        <button
          ref={(el) => {
            mobileButtonRefs.current['home'] = el;
          }}
          onClick={() => onSelectTab('home')}
          className={`relative z-10 flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors duration-200 ${
            currentTab === 'home'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          ref={(el) => {
            mobileButtonRefs.current['studio'] = el;
          }}
          onClick={() => onSelectTab('studio')}
          disabled={!hasActiveProject}
          className={`relative z-10 flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors duration-200 ${
            !hasActiveProject
              ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600'
              : currentTab === 'studio'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          <Film className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Studio</span>
        </button>

        <button
          ref={(el) => {
            mobileButtonRefs.current['creations'] = el;
          }}
          onClick={() => onSelectTab('creations')}
          className={`relative z-10 flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors duration-200 ${
            currentTab === 'creations'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          <FolderHeart className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">
            Creations{savedCount > 0 ? ` (${savedCount})` : ''}
          </span>
        </button>

        <button
          ref={(el) => {
            mobileButtonRefs.current['settings'] = el;
          }}
          onClick={() => onSelectTab('settings')}
          className={`relative z-10 flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors duration-200 ${
            currentTab === 'settings'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400'
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
