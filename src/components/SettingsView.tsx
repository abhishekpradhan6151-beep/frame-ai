import React, { useRef, useState } from 'react';
import {
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Zap,
  Globe,
  Clock,
  Flame,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';
import { UserSettings, Platform, Tone, DurationOption, ThemeMode } from '../types';
import { PLATFORM_INFO, TONE_LABELS, AVAILABLE_LANGUAGES } from '../services/templates';
import { exportBackupData, importBackupData, clearAllLocalData } from '../services/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  savedProjectCount: number;
  onDataReset: () => void;
  isAiLive: boolean;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  savedProjectCount,
  onDataReset,
  isAiLive,
  theme,
  onSelectTheme,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frame-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const ok = importBackupData(text);
      if (ok) {
        setImportStatus('Backup restored successfully!');
        onDataReset();
      } else {
        setImportStatus('Failed to parse backup JSON file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllLocalData();
    setShowClearConfirm(false);
    onDataReset();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Sliders className="h-6 w-6 text-indigo-500" />
            <span>Studio Preferences & Data</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Configure generation defaults, liquid glass appearance, and manage local storage
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full animate-fade-in shadow-xs">
            <Check className="h-3.5 w-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Section 0: Appearance / Theme Selector */}
        <div className="rounded-3xl glass-surface p-6 sm:p-7 shadow-xl">
          {/* Top edge glass reflection line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/20 to-transparent rounded-t-3xl"
            aria-hidden="true"
          />

          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4 text-indigo-500" />
            <span>Appearance & Theme</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            Select your preferred visual theme across all studio editors, dialogs, and teleprompter mode.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun, desc: 'Crisp luminous frosted glass' },
              { id: 'dark', label: 'Dark', icon: Moon, desc: 'Deep obsidian smoky glass' },
              { id: 'system', label: 'System', icon: Monitor, desc: 'Matches device preference' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTheme(item.id as ThemeMode)}
                  className={`relative rounded-2xl p-4 text-left border transition-all duration-200 ease-liquid-spring cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.98] ${
                    isSelected
                      ? 'border-[var(--border-strong)] bg-slate-900/[0.04] dark:bg-white/[0.08] shadow-md scale-[1.02] ring-1 ring-slate-900/10 dark:ring-white/20'
                      : 'border-[var(--border-default)] bg-white/60 dark:bg-white/[0.02] text-slate-700 dark:text-zinc-300 hover:border-[var(--border-strong)] hover:bg-white/80 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Subtle specular highlight on selected card */}
                  {isSelected && (
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 dark:via-white/40 to-transparent"
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <Icon
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                          : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    />
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Default Generation Preferences */}
        <div className="rounded-3xl glass-surface p-6 sm:p-7 shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <span>Default Creation Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Default Platform */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Default Target Platform
              </label>
              <select
                value={settings.defaultPlatform}
                onChange={(e) => handleFieldChange('defaultPlatform', e.target.value as Platform)}
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur"
              >
                {(Object.keys(PLATFORM_INFO) as Platform[]).map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_INFO[p].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Tone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Default Script Tone
              </label>
              <select
                value={settings.defaultTone}
                onChange={(e) => handleFieldChange('defaultTone', e.target.value as Tone)}
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur"
              >
                {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
                  <option key={t} value={t}>
                    {TONE_LABELS[t].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Default Target Duration
              </label>
              <select
                value={settings.defaultDuration}
                onChange={(e) =>
                  handleFieldChange('defaultDuration', parseInt(e.target.value) as DurationOption)
                }
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur"
              >
                <option value={15}>15 Seconds (Blitz)</option>
                <option value={30}>30 Seconds (Standard)</option>
                <option value={60}>60 Seconds (Deep Dive)</option>
                <option value={90}>90 Seconds (Narrative)</option>
              </select>
            </div>

            {/* Default Language */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Default Script Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleFieldChange('defaultLanguage', e.target.value)}
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur"
              >
                {AVAILABLE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AI Engine & Compliance */}
        <div className="rounded-3xl glass-surface p-6 sm:p-7 shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-500" />
            <span>AI Model & Generation Mode</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            Under project guidelines, demo blueprints are clearly distinguished from live Gemini AI output.
          </p>

          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 flex items-center justify-between ${
                isAiLive && !settings.preferDemoMode
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAiLive && !settings.preferDemoMode ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {isAiLive && !settings.preferDemoMode
                      ? 'Live Mode: Gemini 3.8 Flash'
                      : 'Demo Blueprint Mode: Deterministic Engine'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {isAiLive && !settings.preferDemoMode
                    ? 'Server communicates directly with Google GenAI SDK. API keys remain safe on the backend.'
                    : 'Provides instant deterministic short-form blueprints without consuming AI API quotas.'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  aria-label="Toggle Demo Mode"
                  onClick={() => handleFieldChange('preferDemoMode', !settings.preferDemoMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.preferDemoMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.preferDemoMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                Zero API keys are exposed to the client browser. All generation is proxied via secure server endpoints.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Teleprompter Defaults */}
        <div className="rounded-3xl glass-surface p-6 sm:p-7 shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Teleprompter Presets</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300 mb-1.5 font-medium">
                <span>Default Scroll Speed</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{settings.teleprompterSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.teleprompterSpeed}
                onChange={(e) =>
                  handleFieldChange('teleprompterSpeed', parseFloat(e.target.value))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-zinc-300 mb-1.5 font-medium">
                <span>Default Font Size</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{settings.teleprompterFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="2"
                value={settings.teleprompterFontSize}
                onChange={(e) =>
                  handleFieldChange('teleprompterFontSize', parseInt(e.target.value))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data Storage & Backups */}
        <div className="rounded-3xl glass-surface p-6 sm:p-7 shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-500" />
            <span>Local Storage & Backup Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            Currently storing <strong className="text-slate-900 dark:text-white">{savedProjectCount} creations</strong> safely in browser storage.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <a
              href="/api/download-zip"
              download="frame-ai.zip"
              className="flex items-center space-x-2 rounded-2xl border border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-all shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download Project ZIP (branch: fix/ci-package-lock)</span>
            </a>

            <button
              onClick={handleExportBackup}
              className="flex items-center space-x-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-xs"
            >
              <Upload className="h-4 w-4" />
              <span>Restore Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-2 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all shadow-xs"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Local Data</span>
            </button>
          </div>

          {importStatus && (
            <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
              {importStatus}
            </div>
          )}

          {/* Confirmation modal for clearing data */}
          {showClearConfirm && (
            <div className="mt-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 p-4 space-y-3">
              <div className="flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to delete all locally saved creations? This action cannot be undone. Consider exporting a backup first.
                </span>
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-xl border border-slate-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm"
                >
                  Yes, Delete All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsView;
