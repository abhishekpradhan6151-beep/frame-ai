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
  HelpCircle
} from 'lucide-react';
import { UserSettings, Platform, Tone, DurationOption } from '../types';
import { PLATFORM_INFO, TONE_LABELS, AVAILABLE_LANGUAGES } from '../services/templates';
import { exportBackupData, importBackupData, clearAllLocalData } from '../services/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  savedProjectCount: number;
  onDataReset: () => void;
  isAiLive: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  savedProjectCount,
  onDataReset,
  isAiLive,
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
      <div className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
            <Sliders className="h-6 w-6 text-zinc-300" />
            <span>Studio Preferences & Data</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Configure generation defaults, teleprompter parameters, and manage local storage
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      <div className="space-y-8">
        {/* Section 1: Default Generation Preferences */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center space-x-2">
            <span>Default Creation Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Default Platform */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Default Target Platform
              </label>
              <select
                value={settings.defaultPlatform}
                onChange={(e) => handleFieldChange('defaultPlatform', e.target.value as Platform)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
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
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Default Script Tone
              </label>
              <select
                value={settings.defaultTone}
                onChange={(e) => handleFieldChange('defaultTone', e.target.value as Tone)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
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
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Default Target Duration
              </label>
              <select
                value={settings.defaultDuration}
                onChange={(e) =>
                  handleFieldChange('defaultDuration', parseInt(e.target.value) as DurationOption)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                <option value={15}>15 Seconds (Blitz)</option>
                <option value={30}>30 Seconds (Standard)</option>
                <option value={60}>60 Seconds (Deep Dive)</option>
                <option value={90}>90 Seconds (Narrative)</option>
              </select>
            </div>

            {/* Default Language */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Default Script Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleFieldChange('defaultLanguage', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
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

        {/* Section 2: AI Engine & Compliance (Clear distinction of demo mode) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center space-x-2">
            <Zap className="h-4 w-4 text-zinc-400" />
            <span>AI Model & Demo Compliance</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Under project guidelines, sample content is clearly segregated from live AI output.
          </p>

          <div className="space-y-4">
            <div
              className={`rounded-xl border p-4 flex items-center justify-between ${
                isAiLive && !settings.preferDemoMode
                  ? 'border-emerald-500/20 bg-emerald-950/10'
                  : 'border-amber-500/20 bg-amber-950/10'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAiLive && !settings.preferDemoMode ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-sm font-semibold text-white">
                    {isAiLive && !settings.preferDemoMode
                      ? 'Live Mode: Gemini 3.8 Flash'
                      : 'Demo Mode: Deterministic Engine'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {isAiLive && !settings.preferDemoMode
                    ? 'Server communicates directly with Google GenAI SDK. API keys stay securely on the backend.'
                    : 'Provides instant deterministic short-form blueprints without consuming AI API quotas.'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('preferDemoMode', !settings.preferDemoMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.preferDemoMode ? 'bg-amber-500' : 'bg-zinc-800'
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

            <div className="text-[11px] text-zinc-500 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                Zero API keys are exposed to the client browser. All generation is proxied via secure server endpoints.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Teleprompter Defaults */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center space-x-2">
            <span>Teleprompter Presets</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Default Scroll Speed</span>
                <span className="font-mono text-white">{settings.teleprompterSpeed.toFixed(1)}x</span>
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
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Default Font Size</span>
                <span className="font-mono text-white">{settings.teleprompterFontSize}px</span>
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
                className="w-full accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data Storage & Backups */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center space-x-2">
            <Database className="h-4 w-4 text-zinc-400" />
            <span>Local Storage & Backup Management</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Currently storing <strong className="text-white">{savedProjectCount} creations</strong> safely in browser localStorage.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-all"
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
              className="flex items-center space-x-2 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Local Data</span>
            </button>
          </div>

          {importStatus && (
            <div className="mt-3 text-xs text-emerald-400 font-medium animate-fade-in">
              {importStatus}
            </div>
          )}

          {/* Confirmation modal for clearing data */}
          {showClearConfirm && (
            <div className="mt-4 rounded-xl border border-red-800 bg-red-950/30 p-4 space-y-3">
              <div className="flex items-start space-x-2 text-red-300 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to delete all locally saved creations? This action cannot be undone. Consider exporting a backup first.
                </span>
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
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
