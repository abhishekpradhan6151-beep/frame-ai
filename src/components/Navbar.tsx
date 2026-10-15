import React from 'react';
import { Film, Sparkles, FolderHeart, Sliders, Plus, Zap } from 'lucide-react';
import { ApiStatus } from '../services/api';

interface NavbarProps {
  currentTab: 'home' | 'studio' | 'creations' | 'settings';
  onSelectTab: (tab: 'home' | 'studio' | 'creations' | 'settings') => void;
  apiStatus: ApiStatus | null;
  preferDemoMode: boolean;
  hasActiveProject: boolean;
  onNewProject: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  apiStatus,
  preferDemoMode,
  hasActiveProject,
  onNewProject,
  savedCount,
}) => {
  const isLive = apiStatus?.liveAiAvailable && !preferDemoMode;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 text-black shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Film className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-semibold tracking-wider text-white">FRAME</span>
                <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono tracking-wide text-zinc-400">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">Short-Form Studio</p>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 pl-4">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'home'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate</span>
            </button>

            <button
              onClick={() => onSelectTab('studio')}
              disabled={!hasActiveProject}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                !hasActiveProject
                  ? 'text-zinc-600 cursor-not-allowed'
                  : currentTab === 'studio'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>Studio</span>
              {hasActiveProject && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('creations')}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'creations'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <FolderHeart className="h-3.5 w-3.5" />
              <span>My Creations</span>
              {savedCount > 0 && (
                <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Right side: AI Status badge & Action */}
        <div className="flex items-center space-x-3">
          {/* Status Badge clearly distinguishing live AI from demo */}
          <div
            title={
              isLive
                ? 'Connected to Gemini 3.8 Flash live server endpoint'
                : 'Demo mode active: deterministic sample generator'
            }
            className={`hidden sm:flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition-colors ${
              isLive
                ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400'
                : 'border-amber-500/20 bg-amber-950/20 text-amber-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="flex items-center gap-1">
              {isLive ? (
                <>
                  <Zap className="h-3 w-3" />
                  <span>Gemini 3.8 Live</span>
                </>
              ) : (
                <span>Demo Mode</span>
              )}
            </span>
          </div>

          <button
            onClick={onNewProject}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Script</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-zinc-800/60 bg-zinc-950 px-2 py-1 justify-around text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'home' ? 'text-white' : 'text-zinc-500'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Generate</span>
        </button>
        <button
          onClick={() => onSelectTab('studio')}
          disabled={!hasActiveProject}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            !hasActiveProject
              ? 'text-zinc-700'
              : currentTab === 'studio'
              ? 'text-white'
              : 'text-zinc-500'
          }`}
        >
          <Film className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Studio</span>
        </button>
        <button
          onClick={() => onSelectTab('creations')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'creations' ? 'text-white' : 'text-zinc-500'
          }`}
        >
          <FolderHeart className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Creations ({savedCount})</span>
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg ${
            currentTab === 'settings' ? 'text-white' : 'text-zinc-500'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </header>
  );
};
