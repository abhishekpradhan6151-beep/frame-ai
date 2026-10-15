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
  Bookmark,
  Share2,
  Eye,
  Camera,
  Type,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight
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
  const [activeTab, setActiveTab] = useState<'hooks' | 'scenes' | 'captions' | 'ctas'>('scenes');
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
    output += `Platform: ${PLATFORM_INFO[project.platform].label} | Target Duration: ${project.targetDuration}s\n\n`;
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Studio Header Bar */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Project Title and Metadata */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-zinc-300 uppercase">
                {PLATFORM_INFO[project.platform]?.label || project.platform}
              </span>
              <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-400">
                {TONE_LABELS[project.tone]?.label || project.tone}
              </span>
              <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-400">
                Target: {project.targetDuration}s
              </span>

              {/* Status Badge distinguishing Live AI vs Demo Engine */}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium border flex items-center gap-1 ${
                  project.isAiGenerated && !preferDemoMode
                    ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400'
                    : 'border-amber-500/20 bg-amber-950/20 text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    project.isAiGenerated && !preferDemoMode ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>{project.modelUsed || (isAiLive ? 'Gemini 3.8 Flash' : 'Demo Engine')}</span>
              </span>
            </div>

            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
              className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white focus:outline-none focus:border-b focus:border-zinc-500 pb-0.5"
            />
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Edits Button */}
            <button
              onClick={() => setShowQuickEdit(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Wand2 className="h-3.5 w-3.5 text-zinc-300" />
              <span>Quick Edits</span>
            </button>

            {/* Launch Teleprompter */}
            <button
              onClick={() => setShowTeleprompter(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
              <span>Teleprompter</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                saveSuccess
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm active:scale-95'
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
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                {copiedKey === 'full-script' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
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
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Script Runtime Meter */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Estimated Runtime:</span>
            <span className="font-mono font-bold text-white">{totalScriptSeconds}s</span>
            <span className="text-zinc-500">/</span>
            <span className="font-mono text-zinc-400">{project.targetDuration}s target</span>
          </div>

          <div className="flex items-center space-x-2">
            {durationDiff === 0 ? (
              <span className="text-emerald-400 text-[11px] font-medium">
                ✓ Pacing exactly matches your target duration
              </span>
            ) : durationDiff > 0 ? (
              <span className="text-amber-400 text-[11px] font-medium">
                ⚠ {durationDiff}s longer than target (consider tightening scene copy)
              </span>
            ) : (
              <span className="text-sky-400 text-[11px] font-medium">
                ℹ {Math.abs(durationDiff)}s shorter than target (room for extra value or pause)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="mb-6 flex border-b border-zinc-800 space-x-4">
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
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                {tab.count}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: SCRIPT SCENES */}
      {activeTab === 'scenes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Each scene provides visual camera directions, speaker lines, and on-screen subtitle cues.
            </p>
            <button
              onClick={handleAddScene}
              className="flex items-center space-x-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Scene</span>
            </button>
          </div>

          <div className="space-y-3">
            {project.scenes.map((scene, idx) => (
              <div
                key={scene.id || idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-zinc-700"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-white">
                      {scene.sceneNumber}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Scene {scene.sceneNumber}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={scene.durationSeconds}
                        onChange={(e) =>
                          handleUpdateScene(idx, { durationSeconds: parseInt(e.target.value) || 1 })
                        }
                        className="w-8 bg-transparent text-center font-mono text-white focus:outline-none"
                      />
                      <span>sec</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveScene(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Scene Up"
                      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveScene(idx, 'down')}
                      disabled={idx === project.scenes.length - 1}
                      title="Move Scene Down"
                      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteScene(idx)}
                      disabled={project.scenes.length <= 1}
                      title="Delete Scene"
                      className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-900 hover:text-red-400 disabled:opacity-30"
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
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                        <Camera className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Visual / Camera Cue</span>
                      </label>
                      <textarea
                        rows={2}
                        value={scene.visualCue}
                        onChange={(e) => handleUpdateScene(idx, { visualCue: e.target.value })}
                        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                        placeholder="Camera movement, facial expression, staging..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                        <Video className="h-3.5 w-3.5 text-zinc-500" />
                        <span>B-Roll Visual Prompt (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={scene.bRollPrompt || ''}
                        onChange={(e) => handleUpdateScene(idx, { bRollPrompt: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                        placeholder="Stock footage or overlay clip description..."
                      />
                    </div>
                  </div>

                  {/* Right Column: Voiceover & On-Screen Text */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Voiceover / Spoken Line</span>
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {scene.audioVoiceover.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={scene.audioVoiceover}
                        onChange={(e) => handleUpdateScene(idx, { audioVoiceover: e.target.value })}
                        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                        placeholder="Exact words spoken aloud..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5 mb-1.5">
                        <Type className="h-3.5 w-3.5 text-zinc-500" />
                        <span>On-Screen Subtitle / Graphic Overlay</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={scene.onScreenText}
                          onChange={(e) => handleUpdateScene(idx, { onScreenText: e.target.value })}
                          className="w-full rounded-xl border border-yellow-500/30 bg-yellow-950/10 px-3 py-1.5 text-xs font-bold text-yellow-300 placeholder-yellow-600/50 focus:border-yellow-400 focus:outline-none"
                          placeholder="e.g. STOP SCROLLING 🚨"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HOOKS */}
      {activeTab === 'hooks' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            The first 2 seconds decide 80% of your video’s performance. Select your primary hook or edit the angles below.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {project.hooks.map((hook, idx) => {
              const isSelected = project.selectedHookId === hook.id;
              return (
                <div
                  key={hook.id || idx}
                  className={`rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? 'border-white bg-zinc-900/90 shadow-md ring-1 ring-white/10'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                        {hook.label}
                      </span>
                      <span className="text-xs text-zinc-400 capitalize">Angle: {hook.angle}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Virality score badge */}
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="text-zinc-500">Virality Index:</span>
                        <span
                          className={`font-mono font-bold ${
                            hook.viralityScore >= 90
                              ? 'text-emerald-400'
                              : hook.viralityScore >= 80
                              ? 'text-sky-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {hook.viralityScore}%
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectHook(hook.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Active Hook' : 'Set as Active'}
                      </button>

                      <button
                        onClick={() => handleCopy(hook.text, `hook-${idx}`)}
                        className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        title="Copy hook text"
                      >
                        {copiedKey === `hook-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
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
                    className="w-full resize-none rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-3 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  />

                  {hook.retentionTip && (
                    <div className="mt-2 text-[11px] text-zinc-400 italic flex items-center space-x-1.5">
                      <span>💡 Delivery tip:</span>
                      <span className="text-zinc-300">{hook.retentionTip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CAPTIONS & HASHTAGS */}
      {activeTab === 'captions' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Caption Variations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.captions.map((cap, idx) => (
                <div
                  key={cap.id || idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{cap.title}</span>
                      <button
                        onClick={() => handleCopy(cap.text, `cap-${idx}`)}
                        className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        title="Copy caption"
                      >
                        {copiedKey === `cap-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {cap.text}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                    Style: <span className="text-zinc-400 capitalize">{cap.style}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags Section */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Targeted Viral Hashtags ({project.hashtags.length})
                </h3>
              </div>
              <button
                onClick={() => handleCopy(project.hashtags.join(' '), 'hashtags')}
                className="flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
              >
                {copiedKey === 'hashtags' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
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
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-mono text-zinc-300 hover:border-zinc-600 hover:text-white transition-all flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  {copiedKey === `tag-${idx}` && (
                    <Check className="h-3 w-3 text-emerald-400 ml-1" />
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
          <p className="text-xs text-zinc-400">
            A high-converting call to action transforms passive viewers into active community engagement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {project.ctas.map((cta, idx) => (
              <div
                key={cta.id || idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase">
                      {cta.type}
                    </span>
                    <button
                      onClick={() => handleCopy(cta.text, `cta-${idx}`)}
                      className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      title="Copy CTA"
                    >
                      {copiedKey === `cta-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1.5">{cta.title}</div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
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
