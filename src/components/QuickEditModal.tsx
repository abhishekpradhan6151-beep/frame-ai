import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Quick Edits</h2>
              <p className="text-[11px] text-zinc-400">
                Modify focused sections without regenerating your entire project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Preset Action
            </label>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('punch-hook')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  selectedAction === 'punch-hook'
                    ? 'border-white bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-medium">Punch Up All Hooks</div>
                    <div className="text-[11px] text-zinc-400">
                      Maximize virality scores with high-curiosity stopping patterns
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('shorten-script')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  selectedAction === 'shorten-script'
                    ? 'border-white bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Scissors className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-medium">Compress to 15s Rapid Blitz</div>
                    <div className="text-[11px] text-zinc-400">
                      Trim fluff, speed up pacing, reduce scene count to 3
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('change-tone')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  selectedAction === 'change-tone'
                    ? 'border-white bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-medium">Shift Tone & Perspective</div>
                    <div className="text-[11px] text-zinc-400">
                      Rewrite script into a different creator personality
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('custom')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  selectedAction === 'custom'
                    ? 'border-white bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-medium">Custom Targeted Edit</div>
                    <div className="text-[11px] text-zinc-400">
                      Give specific prompt instructions for this script
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Input for Tone Change */}
          {selectedAction === 'change-tone' && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400">Choose New Tone:</label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value as Tone)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none"
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
              <label className="text-[11px] font-semibold text-zinc-400">
                Custom Instruction:
              </label>
              <textarea
                rows={2}
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Add a funny disclaimer in scene 2, make the voiceover snappier, and write a stronger CTA to visit a link in bio."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400">
              <Zap className="h-3 w-3 text-zinc-500" />
              <span>{isAiLive ? 'Processed via Gemini 3.8' : 'Processed via Template Engine'}</span>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center space-x-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all disabled:opacity-50"
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
