import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  Copy,
  Check,
  Download,
  Save,
  Play,
  Wand2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Hash,
  MessageSquare,
  Camera,
  Type,
  Video,
  Layers,
  Activity,
  Flame,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { VideoProject, ScriptScene, Hook, QuickEditRequest } from '../types';
import { PLATFORM_INFO, TONE_LABELS } from '../services/templates';
import { QuickEditModal } from './QuickEditModal';
import { TeleprompterModal } from './TeleprompterModal';

export type RetentionPosition = 'hook' | 'opening' | 'middle' | 'closing';

export interface RetentionSentence {
  id: string;
  sourceType: 'hook' | 'scene';
  sourceIndex: number;
  originalText: string;
  score: number;
  level: 'high' | 'medium' | 'low';
  diagnosis: string;
  suggestions: string[];
  position: RetentionPosition;
  weight: number;
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  const rawSentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return rawSentences.length > 0 ? rawSentences : [text.trim()];
}

export function analyzeRetentionSentence(
  rawText: string,
  position: RetentionPosition = 'middle'
): {
  score: number;
  level: 'high' | 'medium' | 'low';
  diagnosis: string;
  suggestions: string[];
} {
  const text = rawText.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Base score according to position sensitivity:
  // Hooks & openings are scrutinized more strictly (baseline 68-70), while middle/closing are slightly more forgiving (73-75)
  let score = position === 'hook' ? 68 : position === 'opening' ? 70 : position === 'closing' ? 75 : 73;
  const diagnoses: string[] = [];

  // 1. Weak low-urgency filler starters (Severe drop-off signal in short-form)
  const weakStarters = /^(so|basically|i think|in my opinion|well|you know|like|just|um|honestly|alright|okay|today i want to|in this video)\b/i;
  const matchedWeak = text.match(weakStarters);
  if (matchedWeak) {
    const penalty = position === 'hook' ? 24 : 18;
    score -= penalty;
    diagnoses.push(`Starts with a low-urgency filler word ("${matchedWeak[0]}") that invites viewers to swipe`);
  }

  // 2. Overly long sentence penalty (Audience loses thread without breathing pauses)
  if (wordCount > 22) {
    score -= 18;
    diagnoses.push(`Too long (${wordCount} words) without a curiosity spike or pattern interrupt`);
  } else if (wordCount > 18) {
    score -= 10;
    diagnoses.push(`Wordy phrasing (${wordCount} words) slows down script momentum`);
  } else if (wordCount >= 4 && wordCount <= 13) {
    // Punchy short-form cadence bonus
    score += 8;
  } else if (wordCount < 4) {
    score -= 4;
  }

  // 3. Passive or vague phrasing (weakens tension)
  const passivePhrases = /\b(kind of|sort of|maybe|pretty much|in order to|as you know|i guess|somewhat|more or less|try to)\b/i;
  const matchedPassive = text.match(passivePhrases);
  if (matchedPassive) {
    score -= 14;
    diagnoses.push(`Passive phrasing ("${matchedPassive[0]}") softens viewer tension`);
  }

  // 4. Strong Hook & Pattern Interrupt signals (High positive signal)
  const isQuestion = /[?]$/.test(text) || /^(\w+\s+){0,3}(why|how|what|did you know|have you ever|is it possible|who else|could this)\b/i.test(text);
  const isPatternInterrupt = /^(stop|don't|never|watch this|listen up|look at|check this out|wait)\b/i.test(text);
  const isCuriosityOpener = /^(nobody talks about|here's the truth|the real reason|the secret to|what they don't tell you|the biggest mistake|here's why|this is how)\b/i.test(text);

  if (isQuestion) {
    score += position === 'hook' ? 16 : 10;
  }
  if (isPatternInterrupt) {
    score += position === 'hook' ? 15 : 10;
  }
  if (isCuriosityOpener) {
    score += position === 'hook' ? 16 : 12;
  }

  // 5. Curiosity Gap & Open Loops
  const hasCuriosityGap = /\b(the crazy part|what happens next|before you|until you see|wait until|secret|the real reason|what nobody tells you|the truth about|loophole|glitch)\b/i.test(text);
  if (hasCuriosityGap) {
    score += 10;
  }

  // 6. Contrast & Tension Words
  const hasContrast = /\b(but|instead|actually|until|however|yet|except|opposite|reveals|in reality|even if)\b/i.test(text);
  if (hasContrast) {
    score += 8;
  }

  // 7. Specific Numbers or Concrete Metrics
  const hasNumbers = /\b(\d+([.,]\d+)?(%|k|m|x|\$)?|\b(one|two|three|3-step|zero|10x|99%|first|second))\b/i.test(text);
  if (hasNumbers) {
    score += 8;
  }

  // 8. Emotional or High-Urgency Language
  const hasUrgency = /\b(shocking|insane|deadly|game-changer|immediately|ruining|warning|stealing|blew my mind|critical|massive|exposed|danger|essential|mistake|waste|ruin)\b/i.test(text);
  if (hasUrgency) {
    score += 8;
  }

  // 9. Pure explanation check (No hooks, no contrast, no tension in longer lines)
  if (!isQuestion && !isPatternInterrupt && !isCuriosityOpener && !hasCuriosityGap && !hasContrast && !hasNumbers && !hasUrgency && wordCount > 13) {
    score -= 12;
    if (diagnoses.length === 0) {
      diagnoses.push('Pure explanation without tension, contrast, or a curiosity spike');
    }
  }

  // 10. Position-specific checks:
  // Hook must have an immediate hook mechanism; otherwise it is penalized
  if (position === 'hook') {
    if (!isQuestion && !isPatternInterrupt && !isCuriosityOpener && !hasNumbers && !hasCuriosityGap) {
      score -= 14;
      diagnoses.unshift('Opening hook lacks an immediate curiosity gap, question, or bold premise');
    }
  }

  // Clamp score cleanly between 25 and 98
  const finalScore = Math.min(Math.max(Math.round(score), 25), 98);
  const level: 'high' | 'medium' | 'low' =
    finalScore >= 78 ? 'high' : finalScore >= 60 ? 'medium' : 'low';

  const diagnosis =
    diagnoses[0] ||
    (level === 'low'
      ? 'High drop-off risk: line lacks urgency, contrast, or emotional hook'
      : level === 'medium'
      ? 'Solid statement, but needs a sharper curiosity spike or punchier phrasing'
      : 'High retention: punchy cadence with strong curiosity and audience pull');

  // Generate 4 targeted, surgical rewrites
  const strippedText = text.replace(weakStarters, '').replace(/^[,\s]+/, '');
  const capitalizedClean = strippedText ? strippedText.charAt(0).toUpperCase() + strippedText.slice(1) : text;
  const noPunctuation = capitalizedClean.replace(/[.?!]+$/, '');

  const suggestions: string[] = [
    // 1. Punchy & Direct (Strip filler, cut passive fluff)
    capitalizedClean
      .replace(/\b(in order to)\b/gi, 'to')
      .replace(/\b(kind of|sort of|pretty much)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim(),

    // 2. Curiosity Spike (Open loop)
    `Here's what nobody talks about: ${capitalizedClean.toLowerCase().replace(/^(here's|what|the)\s+/i, '').replace(/[.?!]$/, '')}.`,

    // 3. Pattern Interrupt (Stop the scroll)
    `Stop scrolling. ${noPunctuation}.`,

    // 4. Contrast & Concrete Outcome
    `Instead of wasting time, ${capitalizedClean.toLowerCase().replace(/^(you|we)\s+/i, '').replace(/[.?!]$/, '')}.`,
  ];

  return {
    score: finalScore,
    level,
    diagnosis,
    suggestions: Array.from(new Set(suggestions)).slice(0, 4),
  };
}

interface StudioViewProps {
  project: VideoProject;
  onUpdateProject: (updated: VideoProject) => void;
  onSaveProject: (project: VideoProject) => void;
  onApplyQuickEdit: (req: QuickEditRequest) => Promise<void>;
  isQuickEditing: boolean;
  isAiLive: boolean;
  preferDemoMode: boolean;
}

export const StudioView: React.FC<StudioViewProps> = ({
  project,
  onUpdateProject,
  onSaveProject,
  onApplyQuickEdit,
  isQuickEditing,
  isAiLive,
  preferDemoMode,
}) => {
  const [activeTab, setActiveTab] = useState<'scenes' | 'hooks' | 'captions' | 'ctas'>('scenes');
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Retention DNA state
  const [selectedDnaSentence, setSelectedDnaSentence] = useState<RetentionSentence | null>(null);
  const [recentlyUpdatedSentenceId, setRecentlyUpdatedSentenceId] = useState<string | null>(null);
  const [dnaSuccessNotice, setDnaSuccessNotice] = useState<{
    message: string;
    diff: number | null;
  } | null>(null);
  const [isDnaExpanded, setIsDnaExpanded] = useState(true);

  // Active Hook Index
  const activeHookIndex = Math.max(
    project.hooks.findIndex((h) => h.id === project.selectedHookId),
    0
  );
  const activeHook = project.hooks[activeHookIndex] || project.hooks[0];

  // Retention DNA Analysis: live continuous flow of sentences across hook + scenes
  const retentionSentences = React.useMemo(() => {
    const list: RetentionSentence[] = [];

    // 1. Hook sentence(s) (First 3 seconds: highest drop-off sensitivity)
    if (activeHook && activeHook.text) {
      const hookSentences = splitIntoSentences(activeHook.text);
      hookSentences.forEach((s, sIdx) => {
        const pos: RetentionPosition = sIdx === 0 ? 'hook' : 'opening';
        const weight = sIdx === 0 ? 3.0 : 2.0;
        const analysis = analyzeRetentionSentence(s, pos);
        list.push({
          id: `hook_${activeHook.id || 'main'}_${sIdx}`,
          sourceType: 'hook',
          sourceIndex: activeHookIndex,
          originalText: s,
          score: analysis.score,
          level: analysis.level,
          diagnosis: analysis.diagnosis,
          suggestions: analysis.suggestions,
          position: pos,
          weight,
        });
      });
    }

    // 2. Scene sentences
    const totalScenes = project.scenes.length;
    project.scenes.forEach((scene, scIdx) => {
      const sceneSentences = splitIntoSentences(scene.audioVoiceover || '');
      sceneSentences.forEach((s, sIdx) => {
        const isOpening = scIdx === 0;
        const isClosing = scIdx === totalScenes - 1;
        const pos: RetentionPosition = isOpening ? 'opening' : isClosing ? 'closing' : 'middle';
        const weight = isOpening ? 2.0 : isClosing ? 1.0 : 1.2;
        const analysis = analyzeRetentionSentence(s, pos);
        list.push({
          id: `scene_${scene.id}_${sIdx}`,
          sourceType: 'scene',
          sourceIndex: scIdx,
          originalText: s,
          score: analysis.score,
          level: analysis.level,
          diagnosis: analysis.diagnosis,
          suggestions: analysis.suggestions,
          position: pos,
          weight,
        });
      });
    });

    return list;
  }, [project.scenes, activeHook, activeHookIndex]);

  // Overall retention score (position-weighted realistic average out of 100)
  const overallRetentionScore = React.useMemo(() => {
    if (retentionSentences.length === 0) return 80;
    const totalWeightedScore = retentionSentences.reduce((acc, curr) => acc + curr.score * curr.weight, 0);
    const totalWeight = retentionSentences.reduce((acc, curr) => acc + curr.weight, 0);
    return Math.round(totalWeightedScore / (totalWeight || 1));
  }, [retentionSentences]);

  // Animated Retention Score (smooth count-up interpolation)
  const [animatedScore, setAnimatedScore] = useState(overallRetentionScore);

  useEffect(() => {
    if (animatedScore === overallRetentionScore) return;

    const start = animatedScore;
    const end = overallRetentionScore;
    const duration = 450;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);

      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(end);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [overallRetentionScore]);

  const highCount = retentionSentences.filter((s) => s.level === 'high').length;
  const mediumCount = retentionSentences.filter((s) => s.level === 'medium').length;
  const lowCount = retentionSentences.filter((s) => s.level === 'low').length;

  const handleApplyDnaFix = (sentence: RetentionSentence, replacementText: string) => {
    const targetSentenceId = sentence.id;

    // 1. Instant clean sentence replacement
    if (sentence.sourceType === 'hook') {
      const currentHookText = project.hooks[sentence.sourceIndex]?.text || '';
      const updatedText = currentHookText.includes(sentence.originalText)
        ? currentHookText.replace(sentence.originalText, replacementText)
        : replacementText;
      handleUpdateHook(sentence.sourceIndex, updatedText);
    } else {
      const currentScene = project.scenes[sentence.sourceIndex];
      const currentVoiceover = currentScene?.audioVoiceover || '';
      const updatedVoiceover = currentVoiceover.includes(sentence.originalText)
        ? currentVoiceover.replace(sentence.originalText, replacementText)
        : replacementText;
      handleUpdateScene(sentence.sourceIndex, { audioVoiceover: updatedVoiceover });
    }

    // 2. Automatically close the rewrite popover
    setSelectedDnaSentence(null);

    // 3. Highlight the newly updated sentence with emerald pulse for ~1.5s
    setRecentlyUpdatedSentenceId(targetSentenceId);
    setTimeout(() => {
      setRecentlyUpdatedSentenceId((current) => (current === targetSentenceId ? null : current));
    }, 1500);

    // 4. Calculate actual sentence improvement and overall score gain
    const newAnalysis = analyzeRetentionSentence(replacementText, sentence.position);
    const sentenceScoreDiff = Math.max(newAnalysis.score - sentence.score, 0);
    const approxOverallGain = Math.max(Math.round(sentenceScoreDiff * (sentence.weight / 6)), 1);

    const message = approxOverallGain > 0
      ? `Retention improved +${approxOverallGain} pts · Line strengthened`
      : 'Line strengthened · Drop-off risk reduced';

    setDnaSuccessNotice({
      message,
      diff: approxOverallGain > 0 ? approxOverallGain : null,
    });

    setTimeout(() => {
      setDnaSuccessNotice(null);
    }, 2400);
  };

  // Calculate total script seconds
  const totalScriptSeconds = project.scenes.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const durationDiff = totalScriptSeconds - project.targetDuration;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    onSaveProject(project);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Full Script Export
  const getFullScriptText = () => {
    const activeHook = project.hooks.find((h) => h.id === project.selectedHookId) || project.hooks[0];
    let output = `# ${project.title}\n`;
    output += `Platform: ${PLATFORM_INFO[project.platform]?.label || project.platform} | Target Duration: ${project.targetDuration}s\n\n`;
    output += `## 🪝 HOOK\n${activeHook?.text || ''}\n\n`;
    output += `## 🎬 SCENES\n`;
    project.scenes.forEach((s) => {
      output += `### Scene ${s.sceneNumber} (${s.durationSeconds}s)\n`;
      output += `🎥 Visual Cue: ${s.visualCue}\n`;
      output += `🗣 Voiceover: "${s.audioVoiceover}"\n`;
      output += `🔤 On-Screen Text: [ ${s.onScreenText} ]\n`;
      if (s.bRollPrompt) output += `🎞 B-Roll: ${s.bRollPrompt}\n`;
      output += `\n`;
    });
    output += `## 💬 CALL TO ACTION\n${project.ctas?.[0]?.text || ''}\n\n`;
    output += `## 📝 CAPTION\n${project.captions?.[0]?.text || ''}\n\n`;
    output += `## #HASHTAGS\n${project.hashtags.join(' ')}\n`;
    return output;
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Scene editing helpers
  const handleUpdateScene = (index: number, updatedProps: Partial<ScriptScene>) => {
    const updatedScenes = [...project.scenes];
    updatedScenes[index] = { ...updatedScenes[index], ...updatedProps };
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleAddScene = () => {
    const newScene: ScriptScene = {
      id: 'sc_' + Date.now().toString(36),
      sceneNumber: project.scenes.length + 1,
      durationSeconds: 5,
      visualCue: 'Medium shot facing camera with subtle head nod.',
      audioVoiceover: 'Here is the next key point that ties the whole framework together.',
      onScreenText: 'KEY TAKEAWAY 💡',
      bRollPrompt: 'Close up screen or product demo footage.',
    };
    onUpdateProject({
      ...project,
      scenes: [...project.scenes, newScene],
    });
  };

  const handleDeleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    const filtered = project.scenes.filter((_, idx) => idx !== index);
    const renumbered = filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: renumbered });
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= project.scenes.length) return;
    const cloned = [...project.scenes];
    const temp = cloned[index];
    cloned[index] = cloned[newIdx];
    cloned[newIdx] = temp;
    const renumbered = cloned.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: renumbered });
  };

  // Hook helpers
  const handleSelectHook = (hookId: string) => {
    onUpdateProject({ ...project, selectedHookId: hookId });
  };

  const handleUpdateHook = (index: number, text: string) => {
    const updatedHooks = [...project.hooks];
    updatedHooks[index] = { ...updatedHooks[index], text };
    onUpdateProject({ ...project, hooks: updatedHooks });
  };

  const handleAddHook = () => {
    const newHook: Hook = {
      id: 'h_' + Date.now().toString(36),
      angle: 'curiosity',
      label: 'Custom Hook',
      text: `Did you know this one secret about "${project.idea}"?`,
      viralityScore: 90,
      retentionTip: 'Keep eyes directly on the lens, pause for half a second before speaking.',
    };
    onUpdateProject({ ...project, hooks: [...project.hooks, newHook] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Blueprint Status Notice Banner */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl glass-surface p-3.5 text-xs text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/10 gap-2 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <span
            className={`flex h-2 w-2 rounded-full ${
              project.isAiGenerated && !preferDemoMode ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          />
          <span className="font-semibold text-slate-900 dark:text-zinc-100">
            {project.isAiGenerated && !preferDemoMode ? 'Gemini 3.8 AI Blueprint:' : 'Production Blueprint:'}
          </span>
          <span className="text-slate-600 dark:text-zinc-400">
            {project.isAiGenerated && !preferDemoMode
              ? 'Synthesized with Google Gemini 3.8 Flash. Edit, tweak, or rehearse with teleprompter.'
              : 'Synthesized with creator templates. Full editing, copy controls, and teleprompter are active.'}
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[10px] text-slate-600 dark:text-zinc-400 font-mono">
            {project.modelUsed || (isAiLive ? 'Gemini 3.8 Flash' : 'Demo Engine')}
          </span>
        </div>
      </div>

      {/* Studio Header Bar */}
      <div className="mb-6 rounded-3xl glass-surface p-6 shadow-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Project Title and Metadata */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                {PLATFORM_INFO[project.platform]?.label || project.platform}
              </span>
              <span className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                {TONE_LABELS[project.tone]?.label || project.tone}
              </span>
              <span className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                Target: {project.targetDuration}s
              </span>

              {/* Status Badge distinguishing Live AI vs Demo Engine */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border flex items-center gap-1.5 ${
                  project.isAiGenerated && !preferDemoMode
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    project.isAiGenerated && !preferDemoMode ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span>{project.modelUsed || (isAiLive ? 'Gemini 3.8 Flash' : 'Demo Engine')}</span>
              </span>
            </div>

            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
              className="w-full bg-transparent text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-b-2 focus:border-indigo-500 pb-0.5 tracking-tight transition-colors"
            />
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Edits Button */}
            <button
              onClick={() => setShowQuickEdit(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 backdrop-blur-md"
            >
              <Wand2 className="h-3.5 w-3.5 text-indigo-500" />
              <span>Quick Edits</span>
            </button>

            {/* Launch Teleprompter */}
            <button
              onClick={() => setShowTeleprompter(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 backdrop-blur-md"
            >
              <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
              <span>Teleprompter</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Project</span>
                </>
              )}
            </button>

            {/* Export Menu */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleCopy(getFullScriptText(), 'full-script')}
                title="Copy formatted production script"
                className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                {copiedKey === 'full-script' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() =>
                  downloadFile(
                    getFullScriptText(),
                    `${project.title.replace(/\s+/g, '-').toLowerCase()}-script.md`,
                    'text/markdown'
                  )
                }
                title="Download Markdown"
                className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Script Runtime Meter */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Estimated Runtime:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{totalScriptSeconds}s</span>
            <span className="text-slate-400 dark:text-zinc-500">/</span>
            <span className="font-mono text-slate-600 dark:text-zinc-400">{project.targetDuration}s target</span>
          </div>

          <div className="flex items-center space-x-2">
            {durationDiff === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                ✓ Pacing exactly matches your target duration
              </span>
            ) : durationDiff > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                ⚠ {durationDiff}s longer than target (consider tightening scene copy)
              </span>
            ) : (
              <span className="text-sky-600 dark:text-sky-400 text-[11px] font-medium">
                ℹ {Math.abs(durationDiff)}s shorter than target (room for extra value or pause)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 RETENTION DNA PANEL: Core Unique Feature of FRAME */}
      <div className="mb-6 rounded-3xl glass-surface p-5 sm:p-6 shadow-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl relative overflow-hidden transition-all duration-200">
        {/* Subtle specular reflection */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-white/30 to-transparent"
          aria-hidden="true"
        />

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 shadow-sm shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Retention DNA™</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    Live Attention Heat-Map
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Every line is analyzed for viewer drop-off risk. Click any sentence to surgically rewrite it.
              </p>
            </div>
          </div>

          {/* Retention Score Ring & Breakdown */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Score Pill */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-3.5 py-1.5 transition-all duration-300">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 block leading-none">
                  Retention Score
                </span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white leading-tight transition-transform duration-300">
                    {animatedScore}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal">/100</span>
                  {dnaSuccessNotice?.diff && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse ml-0.5 font-mono">
                      +{dnaSuccessNotice.diff}
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`h-3 w-3 rounded-full shrink-0 transition-colors duration-300 ${
                  animatedScore >= 78
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : animatedScore >= 60
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                }`}
                title={`Overall Retention: ${animatedScore}/100`}
              />
            </div>

            {/* Expand / Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsDnaExpanded((prev) => !prev)}
              aria-label={isDnaExpanded ? 'Collapse Retention DNA' : 'Expand Retention DNA'}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors shadow-sm cursor-pointer"
            >
              {isDnaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Success feedback toast if sentence updated */}
        {dnaSuccessNotice && (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-sm animate-fade-in backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-xs">
                <Check className="h-3 w-3" />
              </span>
              <span className="truncate">{dnaSuccessNotice.message}</span>
            </div>
            {dnaSuccessNotice.diff && (
              <span className="rounded-lg bg-emerald-500/25 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 font-mono shrink-0">
                +{dnaSuccessNotice.diff} PTS
              </span>
            )}
          </div>
        )}

        {/* Expanded Continuous Script Flow */}
        {isDnaExpanded && (
          <div className="mt-4 space-y-4">
            {/* Heat-map Sentence Canvas */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/5 leading-relaxed text-sm">
              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                {retentionSentences.map((sentence) => {
                  const isLow = sentence.level === 'low';
                  const isMed = sentence.level === 'medium';
                  const isHigh = sentence.level === 'high';
                  const isJustUpdated = recentlyUpdatedSentenceId === sentence.id;

                  return (
                    <button
                      key={sentence.id}
                      type="button"
                      onClick={() => setSelectedDnaSentence(sentence)}
                      className={`group relative text-left rounded-xl px-2.5 py-1 text-xs sm:text-[13px] font-medium transition-all duration-300 border cursor-pointer active:scale-[0.98] ${
                        isJustUpdated
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/25 text-emerald-950 dark:text-emerald-100 border-emerald-500/50 shadow-[0_0_18px_rgba(16,185,129,0.45)] scale-[1.03] z-10'
                          : isHigh
                          ? 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 shadow-sm'
                          : isMed
                          ? 'bg-amber-500/10 text-amber-950 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 shadow-sm'
                          : 'bg-rose-500/10 text-rose-950 dark:text-rose-200 border-rose-500/35 hover:bg-rose-500/20 hover:border-rose-500/60 shadow-sm'
                      }`}
                      title={`${sentence.score}/100 · ${sentence.diagnosis} (Click to rewrite)`}
                    >
                      <span className="mr-1.5 inline-block text-[10px] font-bold uppercase opacity-60">
                        {sentence.sourceType === 'hook' ? '🪝 Hook' : `S${sentence.sourceIndex + 1}`}
                      </span>
                      <span>{sentence.originalText}</span>
                      {!isHigh && !isJustUpdated && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] opacity-75 font-mono">
                          {sentence.score}
                        </span>
                      )}
                      {isJustUpdated && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-300 font-mono">
                          ✓ Updated
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Retention Legend & Quick Statistics */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 gap-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Strong ({highCount})</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Medium Risk ({mediumCount})</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Drop-Off Risk ({lowCount})</span>
                </span>
              </div>

              <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                Tip: Click any yellow or red sentence to open 3–4 instant surgical rewrites.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Navigation Tabs: Apple Liquid Glass Segmented Bar */}
      <div className="relative mb-6 flex flex-wrap gap-1.5 p-1 rounded-2xl glass-surface border border-[var(--border-default)] w-fit overflow-hidden">
        {/* Top specular reflection line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/20 to-transparent"
          aria-hidden="true"
        />

        {[
          { key: 'scenes', label: 'Script Scenes', count: project.scenes.length },
          { key: 'hooks', label: 'Hook Variations', count: project.hooks.length },
          { key: 'captions', label: 'Captions & Hashtags', count: project.captions.length },
          { key: 'ctas', label: 'Calls to Action', count: project.ctas.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ease-liquid-spring flex items-center gap-2 cursor-pointer active:scale-[0.97] ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/15 text-inherit'
                    : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: SCRIPT SCENES */}
      {activeTab === 'scenes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Each scene provides visual camera directions, speaker lines, and on-screen subtitle cues.
            </p>
            <button
              onClick={handleAddScene}
              className="flex items-center space-x-1.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Scene</span>
            </button>
          </div>

          {project.scenes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border-default)] bg-white/40 dark:bg-zinc-950/40 p-12 text-center backdrop-blur-sm">
              <Film className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-600 mb-2" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">No scenes in this script yet.</p>
              <button
                onClick={handleAddScene}
                className="mt-3 inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Scene</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {project.scenes.map((scene, idx) => (
                <div
                  key={scene.id || idx}
                  className="rounded-2xl glass-card p-5 shadow-sm border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 ease-liquid-spring relative overflow-hidden"
                >
                  {/* Top specular reflection line */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 dark:via-white/15 to-transparent rounded-t-2xl"
                    aria-hidden="true"
                  />

                  {/* Scene Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-white/10 text-xs font-bold text-indigo-600 dark:text-white border border-indigo-500/20 dark:border-white/10">
                        {scene.sceneNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                        Scene {scene.sceneNumber}
                      </span>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-white/10">
                        <Clock className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={scene.durationSeconds}
                          onChange={(e) =>
                            handleUpdateScene(idx, { durationSeconds: parseInt(e.target.value) || 1 })
                          }
                          className="w-8 bg-transparent text-center font-mono font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                        <span>sec</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveScene(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Scene Up"
                        className="rounded-lg p-1 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveScene(idx, 'down')}
                        disabled={idx === project.scenes.length - 1}
                        title="Move Scene Down"
                        className="rounded-lg p-1 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScene(idx)}
                        disabled={project.scenes.length <= 1}
                        title="Delete Scene"
                        className="rounded-lg p-1 text-slate-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scene Grid Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Visual Cue & Camera Framing */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                          <Camera className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                          <span>Visual / Camera Cue</span>
                        </label>
                        <textarea
                          rows={2}
                          value={scene.visualCue}
                          onChange={(e) => handleUpdateScene(idx, { visualCue: e.target.value })}
                          className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2.5 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                          placeholder="Camera movement, facial expression, staging..."
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                          <Video className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                          <span>B-Roll Visual Prompt (Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={scene.bRollPrompt || ''}
                          onChange={(e) => handleUpdateScene(idx, { bRollPrompt: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                          placeholder="Stock footage or overlay clip description..."
                        />
                      </div>
                    </div>

                    {/* Right Column: Voiceover & On-Screen Text */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                            <span>Voiceover / Spoken Line</span>
                          </label>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                            {scene.audioVoiceover.split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={scene.audioVoiceover}
                          onChange={(e) => handleUpdateScene(idx, { audioVoiceover: e.target.value })}
                          className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                          placeholder="Exact words spoken aloud..."
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                          <Type className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                          <span>On-Screen Subtitle / Graphic Overlay</span>
                        </label>
                        <input
                          type="text"
                          value={scene.onScreenText}
                          onChange={(e) => handleUpdateScene(idx, { onScreenText: e.target.value })}
                          className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 placeholder-amber-500/40 focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. STOP SCROLLING 🚨"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: HOOKS */}
      {activeTab === 'hooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              The first 2 seconds decide 80% of your video’s performance. Select your primary hook or edit the angles below.
            </p>
            <button
              onClick={handleAddHook}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 ml-3 shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Hook</span>
            </button>
          </div>

          {project.hooks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 p-12 text-center backdrop-blur-sm">
              <Sparkles className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-600 mb-2" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">No hooks generated for this script yet.</p>
              <button
                onClick={handleAddHook}
                className="mt-3 inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Hook</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {project.hooks.map((hook, idx) => {
                const isSelected = project.selectedHookId === hook.id;
                return (
                  <div
                    key={hook.id || idx}
                    className={`rounded-2xl border p-5 transition-all shadow-sm ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'glass-card border-slate-200/80 dark:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-300">
                          {hook.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">Angle: {hook.angle}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Virality score badge */}
                        <div className="flex items-center space-x-1 text-xs">
                          <span className="text-slate-400 dark:text-zinc-500">Virality Index:</span>
                          <span
                            className={`font-mono font-bold ${
                              hook.viralityScore >= 90
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : hook.viralityScore >= 80
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {hook.viralityScore}%
                          </span>
                        </div>

                        <button
                          onClick={() => handleSelectHook(hook.id)}
                          className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? '✓ Active Hook' : 'Set as Active'}
                        </button>

                        <button
                          onClick={() => handleCopy(hook.text, `hook-${idx}`)}
                          className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-1.5 text-slate-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 transition-colors"
                          title="Copy hook text"
                        >
                          {copiedKey === `hook-${idx}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={hook.text}
                      onChange={(e) => handleUpdateHook(idx, e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                    />

                    {hook.retentionTip && (
                      <div className="mt-2.5 text-[11px] text-slate-500 dark:text-zinc-400 italic flex items-center space-x-1.5">
                        <span>💡 Delivery tip:</span>
                        <span className="text-slate-700 dark:text-zinc-300">{hook.retentionTip}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CAPTIONS & HASHTAGS */}
      {activeTab === 'captions' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Caption Variations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.captions.map((cap, idx) => (
                <div
                  key={cap.id || idx}
                  className="rounded-2xl glass-card p-5 flex flex-col justify-between shadow-sm border border-slate-200/80 dark:border-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{cap.title}</span>
                      <button
                        onClick={() => handleCopy(cap.text, `cap-${idx}`)}
                        className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-1.5 text-slate-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10"
                        title="Copy caption"
                      >
                        {copiedKey === `cap-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {cap.text}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 text-[10px] text-slate-400 dark:text-zinc-500">
                    Style: <span className="text-slate-600 dark:text-zinc-400 capitalize">{cap.style}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags Section */}
          <div className="rounded-2xl glass-surface p-5 shadow-sm border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Targeted Viral Hashtags ({project.hashtags.length})
                </h3>
              </div>
              <button
                onClick={() => handleCopy(project.hashtags.join(' '), 'hashtags')}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95"
              >
                {copiedKey === 'hashtags' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.hashtags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopy(tag, `tag-${idx}`)}
                  className="rounded-full border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-white transition-all flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  {copiedKey === `tag-${idx}` && (
                    <Check className="h-3 w-3 text-emerald-500 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CTAS */}
      {activeTab === 'ctas' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            A high-converting call to action transforms passive viewers into active community engagement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {project.ctas.map((cta, idx) => (
              <div
                key={cta.id || idx}
                className="rounded-2xl glass-card p-5 flex flex-col justify-between shadow-sm border border-slate-200/80 dark:border-white/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase">
                      {cta.type}
                    </span>
                    <button
                      onClick={() => handleCopy(cta.text, `cta-${idx}`)}
                      className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-1.5 text-slate-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10"
                      title="Copy CTA"
                    >
                      {copiedKey === `cta-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{cta.title}</div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                    &quot;{cta.text}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTeleprompter && (
        <TeleprompterModal
          project={project}
          onClose={() => setShowTeleprompter(false)}
        />
      )}

      {showQuickEdit && (
        <QuickEditModal
          project={project}
          onClose={() => setShowQuickEdit(false)}
          onApplyEdit={onApplyQuickEdit}
          isProcessing={isQuickEditing}
          isAiLive={isAiLive}
        />
      )}

      {/* Retention DNA Surgical Rewrite Popover / Modal */}
      {selectedDnaSentence && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dna-rewrite-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedDnaSentence(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#121217]/95 border border-[var(--border-default)] shadow-2xl p-6 sm:p-7 backdrop-blur-2xl text-left relative overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 animate-modal-enter"
          >
            {/* Top specular reflection line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-white/35 to-transparent rounded-t-3xl"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold font-mono border ${
                    selectedDnaSentence.level === 'high'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      : selectedDnaSentence.level === 'medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                  }`}
                >
                  {selectedDnaSentence.score}
                </div>
                <div>
                  <h3 id="dna-rewrite-dialog-title" className="text-sm font-bold text-slate-900 dark:text-white">
                    Surgical Retention Rewrite
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedDnaSentence.sourceType === 'hook' ? 'Hook Opening' : `Scene ${selectedDnaSentence.sourceIndex + 1} Voiceover`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDnaSentence(null)}
                aria-label="Close rewrite dialog"
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Current Sentence Box */}
              <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                  Current Line
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-medium italic">
                  "{selectedDnaSentence.originalText}"
                </p>
              </div>

              {/* Diagnosis Box */}
              <div
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                  selectedDnaSentence.level === 'low'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                    : selectedDnaSentence.level === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Retention Diagnosis:</span>
                  <span>{selectedDnaSentence.diagnosis}</span>
                </div>
              </div>

              {/* 3-4 Surgical Rewrite Suggestions */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Select a Surgical Rewrite:
                </span>
                {selectedDnaSentence.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="group rounded-2xl p-3.5 border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-400/60 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block mb-0.5">
                        {idx === 0
                          ? '⚡ Punchy & Direct'
                          : idx === 1
                          ? '🪝 Curiosity Spike'
                          : idx === 2
                          ? '🛑 Pattern Interrupt'
                          : '🎯 Action & Outcome'}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-medium">
                        "{suggestion}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyDnaFix(selectedDnaSentence, suggestion)}
                      className="rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 self-end sm:self-auto flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply this fix</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                Fixes update the live scene text instantly
              </span>
              <button
                type="button"
                onClick={() => setSelectedDnaSentence(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Keep original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
