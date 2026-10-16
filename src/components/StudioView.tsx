import React, { useState } from 'react';
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
} from 'lucide-react';
import { VideoProject, ScriptScene, Hook, QuickEditRequest } from '../types';
import { PLATFORM_INFO, TONE_LABELS } from '../services/templates';
import { QuickEditModal } from './QuickEditModal';
import { TeleprompterModal } from './TeleprompterModal';

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
    </div>
  );
};
