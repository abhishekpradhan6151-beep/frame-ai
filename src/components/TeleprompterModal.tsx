import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Type, Gauge, FlipHorizontal } from 'lucide-react';
import { VideoProject } from '../types';

interface TeleprompterModalProps {
  project: VideoProject;
  onClose: () => void;
  initialSpeed?: number;
  initialFontSize?: number;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  project,
  onClose,
  initialSpeed = 1.0,
  initialFontSize = 32,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Compile full speaker script
  const activeHook = project.hooks.find((h) => h.id === project.selectedHookId) || project.hooks[0];
  const fullTextLines: {
    type: string;
    label: string;
    text: string;
    cue?: string;
    overlay?: string;
  }[] = [
    { type: 'hook', label: 'HOOK', text: activeHook ? activeHook.text : '' },
    ...project.scenes.map((s) => ({
      type: 'scene',
      label: `SCENE ${s.sceneNumber} (${s.durationSeconds}s)`,
      cue: s.visualCue,
      text: s.audioVoiceover,
      overlay: s.onScreenText,
    })),
    {
      type: 'cta',
      label: 'CALL TO ACTION',
      text: project.ctas?.[0]?.text || 'Follow for more!',
    },
  ];

  // Auto-scrolling loop
  useEffect(() => {
    let lastTime = performance.now();

    const scrollLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && scrollContainerRef.current) {
        // Base scroll speed pixels per second multiplied by user speed factor
        const pixelsPerSecond = 45 * speed;
        scrollContainerRef.current.scrollTop += pixelsPerSecond * delta;
      }

      animationFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animationFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Keyboard shortcuts (Space = Play/Pause, Esc = Close, Up/Down = Speed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none">
      {/* Top Floating Controls Bar */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-6 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Teleprompter Mode
          </span>
          <span className="text-xs text-zinc-600">|</span>
          <span className="text-xs font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </span>
        </div>

        {/* Center Control Panel */}
        <div className="flex items-center space-x-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause (Space)</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Scroll (Space)</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset to Top"
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Speed Control */}
          <div className="hidden sm:flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs">
            <Gauge className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-400">Speed:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-20 accent-white cursor-pointer"
            />
            <span className="font-mono text-zinc-200 w-8">{speed.toFixed(1)}x</span>
          </div>

          {/* Font Size */}
          <div className="hidden md:flex items-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs">
            <Type className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="range"
              min="20"
              max="60"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-20 accent-white cursor-pointer"
            />
            <span className="font-mono text-zinc-200 w-8">{fontSize}px</span>
          </div>

          {/* Mirror Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            title="Mirror Display (for prompter glass/beam splitters)"
            className={`rounded-xl border p-2 transition-colors ${
              isMirrored
                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <FlipHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Target Focus Eye Line Indicator */}
      <div className="pointer-events-none fixed top-1/3 left-0 right-0 z-10 flex items-center justify-between px-6 opacity-30">
        <div className="h-0.5 w-16 bg-red-500" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-red-500">
          Optimal Eye Level Line
        </span>
        <div className="h-0.5 w-16 bg-red-500" />
      </div>

      {/* Scrolling Container */}
      <div
        ref={scrollContainerRef}
        style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
        className="flex-1 overflow-y-auto px-6 py-32 text-center transition-transform"
      >
        <div className="mx-auto max-w-3xl space-y-16">
          {fullTextLines.map((line, idx) => (
            <div key={idx} className="space-y-4">
              <div className="inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-zinc-400">
                {line.label}
              </div>

              {line.cue && (
                <div className="text-xs font-sans italic text-zinc-500">
                  🎥 Cue: {line.cue}
                </div>
              )}

              <p
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }}
                className="font-medium text-zinc-100 tracking-wide"
              >
                {line.text}
              </p>

              {line.overlay && (
                <div className="inline-block rounded-md bg-yellow-400/20 px-2 py-0.5 text-xs font-bold text-yellow-300">
                  Text on screen: &quot;{line.overlay}&quot;
                </div>
              )}
            </div>
          ))}

          <div className="pt-40 pb-20 text-xs text-zinc-600 font-mono">
            — END OF SCRIPT —
          </div>
        </div>
      </div>
    </div>
  );
};
