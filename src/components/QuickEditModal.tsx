import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Scissors, Flame, SlidersHorizontal, ArrowRight, Zap } from 'lucide-react';
import { VideoProject, Tone, QuickEditRequest } from '../types';
import { TONE_LABELS } from '../services/templates';

interface QuickEditModalProps {
  project: VideoProject;
  onClose: () => void;
  onApplyEdit: (req: QuickEditRequest) => Promise<void>;
  isProcessing: boolean;
  isAiLive: boolean;
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({
  project,
  onClose,
  onApplyEdit,
  isProcessing,
  isAiLive,
}) => {
  const [selectedAction, setSelectedAction] = useState<QuickEditRequest['action']>('punch-hook');
  const [targetTone, setTargetTone] = useState<Tone>('controversial-take');
  const [customInstruction, setCustomInstruction] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    await onApplyEdit({
      projectId: project.id,
      action: selectedAction,
      currentProject: project,
      targetTone: selectedAction === 'change-tone' ? targetTone : undefined,
      customInstruction: selectedAction === 'custom' ? customInstruction : undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-edits-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl glass-surface p-6 sm:p-7 shadow-2xl relative border border-slate-200/80 dark:border-white/10 overflow-hidden">
        {/* Subtle Liquid Glow Accent in corner */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="quick-edits-title" className="text-base font-bold text-slate-900 dark:text-white">
                Quick Script Edits
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Modify focused sections without regenerating your entire project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quick edits modal"
            className="rounded-xl p-2 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Select Preset Action
            </label>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('punch-hook')}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  selectedAction === 'punch-hook'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20'
                    : 'glass-card border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Punch Up All Hooks</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Maximize virality scores with high-curiosity stopping patterns
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('shorten-script')}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  selectedAction === 'shorten-script'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20'
                    : 'glass-card border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Scissors className="h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Compress to 15s Rapid Blitz</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Trim fluff, speed up pacing, reduce scene count to 3
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('change-tone')}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  selectedAction === 'change-tone'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20'
                    : 'glass-card border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <SlidersHorizontal className="h-4 w-4 text-sky-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Shift Tone & Perspective</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Rewrite script into a different creator personality
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('custom')}
                className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  selectedAction === 'custom'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20'
                    : 'glass-card border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Custom Targeted Edit</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Give specific prompt instructions for this script
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Input for Tone Change */}
          {selectedAction === 'change-tone' && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                Choose New Tone:
              </label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value as Tone)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
                  <option key={t} value={t}>
                    {TONE_LABELS[t].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Input for Custom Prompt */}
          {selectedAction === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                Custom Instruction:
              </label>
              <textarea
                rows={2}
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Add a funny disclaimer in scene 2, make the voiceover snappier, and write a stronger CTA to visit a link in bio."
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
              <Zap className="h-3 w-3 text-indigo-500" />
              <span>{isAiLive ? 'Processed via Gemini 3.8 Flash' : 'Processed via Template Engine'}</span>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Applying...</span>
                ) : (
                  <>
                    <span>Apply Quick Edit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default QuickEditModal;
