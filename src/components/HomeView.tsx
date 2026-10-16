import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Flame,
  Globe,
  Clock,
} from 'lucide-react';
import { Platform, Tone, DurationOption, UserSettings } from '../types';
import { AVAILABLE_LANGUAGES } from '../services/templates';
import { StandaloneApertureBadge } from './Logo';

interface HomeViewProps {
  onGenerate: (data: {
    idea: string;
    platform: Platform;
    tone: Tone;
    duration: DurationOption;
    language: string;
    customInstructions?: string;
  }) => void;
  isGenerating: boolean;
  settings: UserSettings;
  isAiLive: boolean;
  onNavigateToCreations?: () => void;
}

const PLATFORM_DISPLAY_LABELS: Record<Platform, string> = {
  reels: 'Instagram Reel',
  tiktok: 'TikTok',
  shorts: 'YouTube Shorts',
  linkedin: 'LinkedIn Video',
};

const TONE_DISPLAY_LABELS: Record<Tone, { label: string; desc: string }> = {
  'casual-relatable': { label: 'Conversational', desc: 'Direct, honest, friend-to-friend speaking cadence' },
  'viral-hype': { label: 'Viral & Hyped', desc: 'Punchy claims, high curiosity, scroll-stopping energy' },
  'educational-authority': { label: 'Authoritative', desc: 'Clear step-by-step insight with distilled expertise' },
  'storyteller': { label: 'Storyteller', desc: 'Climax first, narrative tension, satisfying resolution' },
  'controversial-take': { label: 'Controversial', desc: 'Challenging conventional beliefs, spark discussion' },
  'high-energy': { label: 'High Energy', desc: 'Rapid delivery, intense pacing, sound-effect friendly' },
};

export const HomeView: React.FC<HomeViewProps> = ({
  onGenerate,
  isGenerating,
  settings,
  onNavigateToCreations,
}) => {
  const [idea, setIdea] = useState('');
  // Prefer Instagram Reel / Conversational default if available to match the requested presentation
  const [platform, setPlatform] = useState<Platform>(settings.defaultPlatform || 'reels');
  const [tone, setTone] = useState<Tone>(settings.defaultTone || 'casual-relatable');
  const [duration, setDuration] = useState<DurationOption>(settings.defaultDuration || 30);
  const [language, setLanguage] = useState<string>(settings.defaultLanguage || 'en');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temporary state for the modal until user hits "Done"
  const [tempPlatform, setTempPlatform] = useState<Platform>(platform);
  const [tempTone, setTempTone] = useState<Tone>(tone);
  const [tempDuration, setTempDuration] = useState<DurationOption>(duration);
  const [tempLanguage, setTempLanguage] = useState<string>(language);
  const [tempCustom, setTempCustom] = useState<string>(customInstructions);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 100), 280)}px`;
    }
  }, [idea]);

  // Sync temp state whenever settings modal opens
  const handleOpenSettings = () => {
    setTempPlatform(platform);
    setTempTone(tone);
    setTempDuration(duration);
    setTempLanguage(language);
    setTempCustom(customInstructions);
    setIsSettingsOpen(true);
  };

  const handleApplySettings = () => {
    setPlatform(tempPlatform);
    setTone(tempTone);
    setDuration(tempDuration);
    setLanguage(tempLanguage);
    setCustomInstructions(tempCustom);
    setIsSettingsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('What do you want to create a video about? Enter your idea above.');
      if (textareaRef.current) textareaRef.current.focus();
      return;
    }
    if (idea.trim().length < 4) {
      setError('Please provide at least a few words describing your video concept.');
      return;
    }
    if (isGenerating) return;

    setError(null);
    onGenerate({
      idea: idea.trim(),
      platform,
      tone,
      duration,
      language,
      customInstructions: customInstructions.trim() || undefined,
    });
  };

  // Keyboard shortcut for Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Human-readable summary string for the bottom-left settings row
  // e.g. "Instagram Reel · English · Conversational · 30s"
  const langMatch = AVAILABLE_LANGUAGES.find((l) => l.code === language);
  const languageName = langMatch ? langMatch.name.split(' ')[0] : 'English';
  const platformName = PLATFORM_DISPLAY_LABELS[platform] || 'Instagram Reel';
  const toneName = TONE_DISPLAY_LABELS[tone]?.label || 'Conversational';
  const settingsSummary = `${platformName} · ${languageName} · ${toneName} · ${duration}s`;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center px-4 py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 overflow-hidden select-none transition-colors duration-200">
      {/* Subtle tonal gradient and restrained lighting behind central content */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] max-w-[90vw] h-[400px] bg-gradient-to-b from-indigo-500/[0.04] via-slate-400/[0.02] to-transparent dark:from-indigo-500/[0.08] dark:via-zinc-500/[0.03] rounded-full blur-3xl transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Main Centered Content */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* 1. Standalone Aperture Badge */}
        <div className="mb-6 transition-transform duration-300 hover:scale-[1.03]">
          <StandaloneApertureBadge />
        </div>

        {/* 2. Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-[54px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-xl transition-colors duration-200">
          Your next video starts here.
        </h1>

        {/* 3. Subtitle */}
        <p className="mt-3.5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-400 font-normal tracking-normal max-w-md transition-colors duration-200">
          Turn an idea into content worth watching.
        </p>

        {/* 4. Main Generation Composer */}
        <div className="w-full mt-10">
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-3xl bg-white/85 dark:bg-zinc-900/50 border border-slate-200/90 dark:border-white/[0.09] shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60 backdrop-blur-2xl p-5 sm:p-7 relative transition-all duration-300 focus-within:border-indigo-500/40 dark:focus-within:border-white/20 focus-within:shadow-indigo-500/5 text-left"
          >
            {/* Subtle light reflection on top border */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 dark:via-white/25 to-transparent rounded-t-3xl"
              aria-hidden="true"
            />

            {/* Multiline Idea Input */}
            <div className="w-full">
              <textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to create a video about?"
                rows={3}
                maxLength={800}
                className="w-full resize-none bg-transparent text-sm sm:text-base text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none min-h-[100px] leading-relaxed select-text transition-colors duration-200"
              />
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400 font-medium mb-3 animate-fade-in">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Row: Settings Pill (Left) + Generate Button (Right) */}
            <div className="pt-4 mt-2 border-t border-slate-200/80 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-colors duration-200">
              {/* Bottom-left settings trigger */}
              <button
                type="button"
                onClick={handleOpenSettings}
                aria-label={`Current settings: ${settingsSummary}. Click to adjust platform, language, tone, or duration.`}
                className="group flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.05] transition-all py-1.5 px-2.5 -ml-2 rounded-xl active:scale-[0.98] self-start sm:self-auto"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
                <span className="font-normal tracking-wide truncate max-w-[280px] sm:max-w-xs">
                  {settingsSummary}
                </span>
              </button>

              {/* Bottom-right Generate button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold px-5 py-2.5 text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate content</span>
                    <span className="font-bold ml-0.5">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 5. Recent Creations Footer Link */}
      <div className="mt-12 mb-2 z-10 text-center">
        {onNavigateToCreations ? (
          <button
            type="button"
            onClick={onNavigateToCreations}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1 font-medium tracking-wide focus:outline-none focus:underline"
          >
            <span>Recent creations</span>
            <span>↗</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 dark:text-zinc-500 inline-flex items-center gap-1 font-medium tracking-wide">
            <span>Recent creations</span>
            <span>↗</span>
          </span>
        )}
      </div>

      {/* 6. Settings Popover / Modal */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white/95 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-white/[0.12] shadow-2xl p-6 sm:p-7 backdrop-blur-2xl text-left relative overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 id="settings-dialog-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                    Generation Settings
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Customize platform, language, tone, and pacing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* 1. Platform Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Platform</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['reels', 'tiktok', 'shorts', 'linkedin'] as Platform[]).map((pKey) => {
                    const isSelected = tempPlatform === pKey;
                    return (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => setTempPlatform(pKey)}
                        className={`rounded-2xl p-3 text-left border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white/10 dark:text-white'
                            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs font-medium">{PLATFORM_DISPLAY_LABELS[pKey]}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Language Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Language</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = tempLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setTempLanguage(lang.code)}
                        className={`rounded-xl px-3 py-2 text-left border transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-semibold dark:border-white dark:bg-white/10 dark:text-white'
                            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="truncate">{lang.name.split(' ')[0]}</span>
                        <span className="text-xs ml-1">{lang.flag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Tone Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Tone of Voice</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(TONE_DISPLAY_LABELS) as Tone[]).map((tKey) => {
                    const isSelected = tempTone === tKey;
                    const item = TONE_DISPLAY_LABELS[tKey];
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setTempTone(tKey)}
                        className={`rounded-2xl p-3 text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white/10 dark:text-white'
                            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-500 line-clamp-1">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Duration Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Duration</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([15, 30, 60, 90] as DurationOption[]).map((d) => {
                    const isSelected = tempDuration === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTempDuration(d)}
                        className={`rounded-xl py-2 text-center text-xs font-bold border transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white/15 dark:text-white'
                            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-white/10'
                        }`}
                      >
                        {d}s
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Instructions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.06]">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Creative Directives (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={tempCustom}
                  onChange={(e) => setTempCustom(e.target.value)}
                  placeholder="e.g. moody rim lighting, macro close-ups, Gen Z founder audience..."
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-zinc-950/60 p-2.5 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 dark:focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-3 py-2 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplySettings}
                className="rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-5 py-2 text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
