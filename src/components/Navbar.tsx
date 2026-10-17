import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
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
  const isDesktopPillInitialized = useRef(false);
  const [desktopPill, setDesktopPill] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  // Sliding pill for mobile bottom navigation
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isMobilePillInitialized = useRef(false);
  const [mobilePill, setMobilePill] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateDesktopPill = useCallback(() => {
    const activeBtn = tabButtonRefs.current[currentTab];
    const nav = desktopNavRef.current;
    if (!activeBtn || !nav) return;

    const offsetLeft = activeBtn.offsetLeft;
    const offsetWidth = activeBtn.offsetWidth;
    const scrollLeft = nav.scrollLeft || 0;

    if (offsetWidth > 0) {
      const targetLeft = offsetLeft - scrollLeft;
      setDesktopPill((prev) => {
        if (prev.left === targetLeft && prev.width === offsetWidth && prev.ready) {
          return prev;
        }
        return {
          left: targetLeft,
          width: offsetWidth,
          ready: true,
        };
      });

      if (!isDesktopPillInitialized.current) {
        requestAnimationFrame(() => {
          isDesktopPillInitialized.current = true;
        });
      }
    }
  }, [currentTab]);

  const updateMobilePill = useCallback(() => {
    const activeBtn = mobileButtonRefs.current[currentTab];
    const nav = mobileNavRef.current;
    if (!activeBtn || !nav) return;

    // Use deterministic offsetLeft relative to mobileNavRef (which has position: relative)
    const offsetLeft = activeBtn.offsetLeft;
    const offsetWidth = activeBtn.offsetWidth;
    const scrollLeft = nav.scrollLeft || 0;

    if (offsetWidth > 0) {
      const targetLeft = offsetLeft - scrollLeft;
      setMobilePill((prev) => {
        if (prev.left === targetLeft && prev.width === offsetWidth && prev.ready) {
          return prev;
        }
        return {
          left: targetLeft,
          width: offsetWidth,
          ready: true,
        };
      });

      if (!isMobilePillInitialized.current) {
        requestAnimationFrame(() => {
          isMobilePillInitialized.current = true;
        });
      }
    }
  }, [currentTab]);

  // Synchronously compute initial and updated positions
  useLayoutEffect(() => {
    updateDesktopPill();
    updateMobilePill();
  }, [updateDesktopPill, updateMobilePill, hasActiveProject, savedCount]);

  // Listen for viewport resize, orientation changes, layout reflows, and font readiness
  useEffect(() => {
    const handleRecalculate = () => {
      requestAnimationFrame(() => {
        updateDesktopPill();
        updateMobilePill();
      });
    };

    // 1. Standard window & orientation events
    window.addEventListener('resize', handleRecalculate, { passive: true });
    window.addEventListener('orientationchange', handleRecalculate, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleRecalculate);
    }

    // 2. ResizeObserver for precise container size tracking
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        handleRecalculate();
      });
      if (desktopNavRef.current) ro.observe(desktopNavRef.current);
      if (mobileNavRef.current) ro.observe(mobileNavRef.current);
    }

    // 3. Horizontal scroll on mobile nav
    const mobileNavEl = mobileNavRef.current;
    if (mobileNavEl) {
      mobileNavEl.addEventListener('scroll', handleRecalculate, { passive: true });
    }

    // 4. Web font load completion check
    if (document.fonts?.ready) {
      document.fonts.ready.then(handleRecalculate).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', handleRecalculate);
      window.removeEventListener('orientationchange', handleRecalculate);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleRecalculate);
      }
      if (mobileNavEl) {
        mobileNavEl.removeEventListener('scroll', handleRecalculate);
      }
      if (ro) ro.disconnect();
    };
  }, [updateDesktopPill, updateMobilePill]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-white/80 dark:bg-[#09090b]/85 backdrop-blur-2xl transition-colors duration-200">
      {/* Top subtle highlight refraction line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 dark:via-white/20 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex h-[72px] sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo Zone */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            onClick={() => onSelectTab('home')}
            aria-label="FRAME AI Home"
            className="group flex items-center text-left focus:outline-none cursor-pointer transition-transform active:scale-95 duration-150"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Logo size={40} showWordmark={true} className="scale-[0.88] sm:scale-100 origin-left" />
          </button>

          {/* Desktop Sliding Navigation Bar */}
          <nav
            ref={desktopNavRef}
            className="relative hidden md:flex items-center p-1.5 rounded-full bg-slate-100/80 dark:bg-zinc-900/60 border border-[var(--border-subtle)] backdrop-blur-xl shadow-xs"
            aria-label="Main Navigation"
          >
            {/* Sliding Pill Indicator */}
            {desktopPill.ready && (
              <div
                data-nav-pill="desktop"
                className="absolute left-0 top-1.5 bottom-1.5 rounded-full bg-slate-900 dark:bg-white/[0.14] border border-slate-900/10 dark:border-white/25 shadow-sm pointer-events-none"
                style={{
                  transform: `translate3d(${desktopPill.left}px, 0, 0)`,
                  width: `${desktopPill.width}px`,
                  transition: isDesktopPillInitialized.current
                    ? 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), width 240ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'none',
                  willChange: 'transform, width',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
            )}

            {/* Home Tab */}
            <button
              ref={(el) => {
                tabButtonRefs.current['home'] = el;
              }}
              onClick={() => onSelectTab('home')}
              className={`relative z-10 flex items-center space-x-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-[15px] font-semibold transition-colors duration-200 cursor-pointer min-h-[42px] ${
                currentTab === 'home'
                  ? 'text-white dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-colors duration-200 ${
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
                className={`relative z-10 flex items-center space-x-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-[15px] font-semibold transition-colors duration-200 cursor-pointer min-h-[42px] ${
                  currentTab === 'studio'
                    ? 'text-white dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Film
                  className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-colors duration-200 ${
                    currentTab === 'studio' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                />
                <span>Studio</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-xs ml-0.5" />
              </button>
            )}

            {/* My Creations Tab */}
            <button
              ref={(el) => {
                tabButtonRefs.current['creations'] = el;
              }}
              onClick={() => onSelectTab('creations')}
              className={`relative z-10 flex items-center space-x-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-[15px] font-semibold transition-colors duration-200 cursor-pointer min-h-[42px] ${
                currentTab === 'creations'
                  ? 'text-white dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <FolderHeart
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-colors duration-200 ${
                  currentTab === 'creations' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
              <span>My Creations</span>
              {savedCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-mono font-bold transition-colors ml-1 ${
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
              className={`relative z-10 flex items-center space-x-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-[15px] font-semibold transition-colors duration-200 cursor-pointer min-h-[42px] ${
                currentTab === 'settings'
                  ? 'text-white dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Sliders
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-colors duration-200 ${
                  currentTab === 'settings' ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                }`}
              />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Theme Switch + Status Badge + New Button */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Theme Toggle with smooth animations */}
          <ThemeToggle theme={theme} onSelectTheme={onSelectTheme} />

          {/* AI Status Badge */}
          <div
            title={
              isLive
                ? 'Server is connected to Google Gemini 3.8 Flash SDK'
                : 'Demo Mode: Deterministic sample creator blueprints active'
            }
            className={`hidden lg:flex items-center space-x-2 rounded-full border px-3.5 py-2 min-h-[42px] sm:min-h-[44px] text-xs font-semibold backdrop-blur-md transition-all ${
              isLive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="flex items-center gap-1.5 font-semibold">
              {isLive ? (
                <>
                  <Zap className="h-3.5 w-3.5" />
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
            className="flex items-center space-x-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4 sm:px-5 py-2 sm:py-2.5 min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 active:scale-[0.96] border border-[var(--border-subtle)] cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Plus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            <span className="hidden sm:inline font-semibold">New Script</span>
            <span className="sm:hidden font-semibold">New</span>
          </button>
        </div>
      </div>

      {/* Mobile Sliding Navigation Bar */}
      <div
        ref={mobileNavRef}
        className="relative flex md:hidden border-t border-[var(--border-subtle)] bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl px-2 py-1 justify-around text-xs select-none overflow-hidden"
      >
        {/* Mobile Sliding Indicator Pill: hardware accelerated with 3D transform */}
        {mobilePill.ready && (
          <div
            data-nav-pill="mobile"
            className="absolute left-0 top-1 bottom-1 rounded-xl bg-slate-900/[0.08] dark:bg-white/[0.14] border border-slate-900/10 dark:border-white/20 shadow-xs pointer-events-none"
            style={{
              transform: `translate3d(${mobilePill.left}px, 0, 0)`,
              width: `${mobilePill.width}px`,
              transition: isMobilePillInitialized.current
                ? 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), width 260ms cubic-bezier(0.16, 1, 0.3, 1)'
                : 'none',
              willChange: 'transform, width',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />
        )}

        {/* 1. Home Tab Button */}
        <button
          ref={(el) => {
            mobileButtonRefs.current['home'] = el;
          }}
          onClick={() => onSelectTab('home')}
          className={`relative z-10 flex flex-col items-center py-2 px-3.5 rounded-xl transition-colors duration-200 cursor-pointer min-h-[48px] justify-center ${
            currentTab === 'home'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <Sparkles className="h-[18px] w-[18px]" />
          <span className="text-xs mt-0.5">Home</span>
        </button>

        {/* 2. Studio Tab Button */}
        <button
          ref={(el) => {
            mobileButtonRefs.current['studio'] = el;
          }}
          onClick={() => onSelectTab('studio')}
          disabled={!hasActiveProject}
          className={`relative z-10 flex flex-col items-center py-2 px-3.5 rounded-xl transition-colors duration-200 min-h-[48px] justify-center ${
            !hasActiveProject
              ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600'
              : currentTab === 'studio'
              ? 'text-slate-900 dark:text-white font-semibold cursor-pointer'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <Film className="h-[18px] w-[18px]" />
          <span className="text-xs mt-0.5">Studio</span>
        </button>

        {/* 3. My Creations Tab Button */}
        <button
          ref={(el) => {
            mobileButtonRefs.current['creations'] = el;
          }}
          onClick={() => onSelectTab('creations')}
          className={`relative z-10 flex flex-col items-center py-2 px-3.5 rounded-xl transition-colors duration-200 cursor-pointer min-h-[48px] justify-center ${
            currentTab === 'creations'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <FolderHeart className="h-[18px] w-[18px]" />
          <span className="text-xs mt-0.5">
            Creations{savedCount > 0 ? ` (${savedCount})` : ''}
          </span>
        </button>

        {/* 4. Settings Tab Button */}
        <button
          ref={(el) => {
            mobileButtonRefs.current['settings'] = el;
          }}
          onClick={() => onSelectTab('settings')}
          className={`relative z-10 flex flex-col items-center py-2 px-3.5 rounded-xl transition-colors duration-200 cursor-pointer min-h-[48px] justify-center ${
            currentTab === 'settings'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <Sliders className="h-[18px] w-[18px]" />
          <span className="text-xs mt-0.5">Settings</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
