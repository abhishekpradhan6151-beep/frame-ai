import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  Layers,
  Globe,
  Dices,
  CheckCircle2,
  Video,
  Flame,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Platform, Tone, DurationOption, UserSettings } from '../types';
import { PLATFORM_INFO, TONE_LABELS, AVAILABLE_LANGUAGES } from '../services/templates';

interface HomeViewProps {
  onGenerate: (data: {
    idea: string;
    platform: Platform;
    tone: Tone;
    duration: DurationOption;
    language: string;
  }) => void;
  isGenerating: boolean;
  settings: UserSettings;
  isAiLive: boolean;
}

const SAMPLE_IDEAS = [
  '3 morning habits that secretly ruin your focus before 10 AM',
  'Why I deleted Instagram for 30 days (what actually happened)',
  '5 free AI tools that save 10+ hours a week for creators',
  'The unwritten rule of negotiating a tech salary in 2026',
  'How to plan a 1-week luxury trip to Tokyo on a budget',
  'The psychological reason you keep procrastinating hard tasks',
];

export const HomeView: React.FC<HomeViewProps> = ({
  onGenerate,
  isGenerating,
  settings,
  isAiLive,
}) => {
  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState<Platform>(settings.defaultPlatform || 'tiktok');
  const [tone, setTone] = useState<Tone>(settings.defaultTone || 'viral-hype');
  const [duration, setDuration] = useState<DurationOption>(settings.defaultDuration || 30);
  const [language, setLanguage] = useState<string>(settings.defaultLanguage || 'en');
  const [loadingStep, setLoadingStep] = useState(0);

  const handleRandomIdea = () => {
    const random = SAMPLE_IDEAS[Math.floor(Math.random() * SAMPLE_IDEAS.length)];
    setIdea(random);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating) return;

    // Simulate progressive step text during generation
    setLoadingStep(1);
    const t1 = setTimeout(() => setLoadingStep(2), 700);
    const t2 = setTimeout(() => setLoadingStep(3), 1600);

    onGenerate({
      idea: idea.trim(),
      platform,
      tone,
      duration,
      language,
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1 text-xs text-zinc-400 backdrop-blur mb-4">
          <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
          <span>Turn any concept into ready-to-shoot short-form video scripts</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Idea to Script in Seconds.
        </h1>
        <p className="mx-auto max-w-xl text-sm sm:text-base text-zinc-400">
          Engineered for TikTok, Reels, and Shorts. Generates scroll-stopping hooks, shot-by-shot visual directions, captions, and teleprompter cues.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Content Idea Input */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-7 shadow-xl backdrop-blur-sm transition-all focus-within:border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="idea" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-300">
                1
              </span>
              <span>What is your video about?</span>
            </label>
            <button
              type="button"
              onClick={handleRandomIdea}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
            >
              <Dices className="h-3.5 w-3.5 text-zinc-400" />
              <span>Surprise Me</span>
            </button>
          </div>

          <textarea
            id="idea"
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., Why 90% of creators fail on TikTok in the first 30 days and the 1 rule that changes everything..."
            className="w-full resize-none rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            required
          />

          {/* Quick inspiration chips */}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] text-zinc-500">Popular prompts:</span>
            {SAMPLE_IDEAS.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIdea(item)}
                className="rounded-full border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-0.5 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors text-left truncate max-w-[260px]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Platform Selection */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-7 shadow-xl backdrop-blur-sm">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 mb-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-300">
              2
            </span>
            <span>Target Platform</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(PLATFORM_INFO) as Platform[]).map((pKey) => {
              const info = PLATFORM_INFO[pKey];
              const isSelected = platform === pKey;
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setPlatform(pKey)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-white bg-zinc-900 shadow-md ring-1 ring-white/20'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{info.label}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {info.vibe}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Rec. length:</span>
                    <span className="font-mono text-zinc-400">{info.optimalDuration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Tone, Duration & Language */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tone */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl backdrop-blur-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 mb-3">
              <Flame className="h-3.5 w-3.5 text-zinc-400" />
              <span>Script Tone</span>
            </label>
            <div className="space-y-1.5">
              {(Object.keys(TONE_LABELS) as Tone[]).map((tKey) => {
                const item = TONE_LABELS[tKey];
                const isSelected = tone === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTone(tKey)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? 'border-zinc-600 bg-zinc-800 text-white font-medium'
                        : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-zinc-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Target Duration</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 15, label: '15s', sub: 'Blitz / Viral hook' },
                  { value: 30, label: '30s', sub: 'Punchy standard' },
                  { value: 60, label: '60s', sub: 'Deep breakdown' },
                  { value: 90, label: '90s', sub: 'Extended story' },
                ].map((d) => {
                  const isSelected = duration === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value as DurationOption)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-white bg-zinc-900 text-white ring-1 ring-white/10'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-base font-bold text-white">{d.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{d.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3 text-[11px] text-zinc-400">
              💡 <span className="text-zinc-300 font-medium">{duration} seconds</span> corresponds to roughly{' '}
              <span className="font-mono text-zinc-200">{Math.round(duration * 2.5)} words</span> spoken at natural creator pace.
            </div>
          </div>

          {/* Language & Output Config */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 mb-3">
                <Globe className="h-3.5 w-3.5 text-zinc-400" />
                <span>Output Language</span>
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              <div className="mt-5 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Engine & Compliance
                </div>
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    isAiLive
                      ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
                      : 'border-amber-500/20 bg-amber-950/10 text-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-medium">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isAiLive ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span>{isAiLive ? 'Gemini 3.8 Flash Active' : 'Demo Mode Engine'}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {isAiLive
                      ? 'Live real-time AI generation configured via server proxy.'
                      : 'Running sample demo mode with high-retention creator blueprints.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-zinc-500">
              FRAME generates 5 hook angles, camera directions, teleprompter script, and CTAs.
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!idea.trim() || isGenerating}
            className={`w-full relative flex items-center justify-center space-x-2 rounded-2xl py-4 px-6 text-sm sm:text-base font-semibold shadow-2xl transition-all ${
              !idea.trim() || isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                <span>
                  {loadingStep === 1
                    ? 'Synthesizing viral hooks...'
                    : loadingStep === 2
                    ? 'Directing visual cues & camera angles...'
                    : 'Finalizing captions & teleprompter...'}
                </span>
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-zinc-900" />
                <span>Generate Video Blueprint</span>
                <ArrowRight className="h-5 w-5 text-zinc-900" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
