import React, { useState, useEffect } from 'react';
import { X, Sparkles, Sliders, Check, RotateCcw, Lightbulb } from 'lucide-react';

interface AdvancedPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: string;
  onApply: (newInstructions: string) => void;
}

const PRESET_CREATIVE_TAGS = [
  { label: 'Cinematic B-Roll', text: 'Visual style: high-contrast cinematic B-roll with macro camera close-ups and moody rim lighting.' },
  { label: 'High-Retention Fast Cuts', text: 'Pacing: ultra-fast jump cuts every 1.5 seconds with text punch-ins to maximize viewer retention.' },
  { label: 'Conversational Friend', text: 'Voiceover: intimate, honest, friend-to-friend speaking cadence with natural pauses, zero corporate fluff.' },
  { label: 'Problem-Agitate-Solve', text: 'Structure: open with a painful common mistake, intensify the urgency in scene 2, deliver the cheat code in scene 3.' },
  { label: 'Gen Z / Social First', text: 'Audience: Gen Z digital creators and entrepreneurs who scroll fast and demand immediate takeaway value.' },
  { label: 'Sound Design Cues', text: 'Audio: include explicit sound effect cues (e.g. whoosh, camera snap, vinyl scratch) in the scene visual cues.' },
];

export const AdvancedPromptModal: React.FC<AdvancedPromptModalProps> = ({
  isOpen,
  onClose,
  instructions,
  onApply,
}) => {
  const [draft, setDraft] = useState(instructions);

  useEffect(() => {
    setDraft(instructions);
  }, [instructions, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(draft.trim());
    onClose();
  };

  const handleClear = () => {
    setDraft('');
  };

  const handleAddTag = (tagText: string) => {
    setDraft((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return tagText;
      return `${cleanPrev}\n${tagText}`;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div
        className="w-full max-w-2xl rounded-3xl glass-surface p-6 sm:p-8 shadow-2xl relative border border-[var(--border-default)] overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter"
      >
        {/* Top specular reflection line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-white/35 to-transparent rounded-t-3xl"
          aria-hidden="true"
        />
        {/* Subtle Liquid Glow Accent in corner */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 id="advanced-prompt-title" className="text-base font-semibold text-slate-900 dark:text-white">
                Advanced Creative Prompt
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Direct the AI with bespoke visual style, pacing, and audience instructions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close advanced prompt editor"
            className="rounded-xl p-2 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          {/* Quick-add Creative Tags */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Creative Directives (click to append):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CREATIVE_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddTag(tag.text)}
                  className="rounded-lg text-[11px] font-medium px-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-white/5 transition-all"
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="custom-instructions-area" className="font-semibold text-slate-800 dark:text-zinc-200">
                Custom Instructions
              </label>
              <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">
                {draft.length} / 2000 chars
              </span>
            </div>

            <textarea
              id="custom-instructions-area"
              rows={6}
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Specify visual mood (e.g. moody neon lighting), camera framing (e.g. over-the-shoulder macro shots), target audience (e.g. indie SaaS founders), or voiceover tone (e.g. confident, fast-talking, sarcastic opener)..."
              className="w-full resize-y rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-4 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur"
            />
          </div>

          <div className="rounded-xl p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <span>
              These instructions will be directly injected into the AI generation prompt on the server, tailoring camera cues, B-roll recommendations, and speaker delivery to your vision.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClear}
            disabled={!draft}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Instructions</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply to Blueprint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdvancedPromptModal;
