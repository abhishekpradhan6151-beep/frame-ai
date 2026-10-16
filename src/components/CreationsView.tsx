import React, { useState } from 'react';
import {
  FolderHeart,
  Search,
  Film,
  Trash2,
  Copy,
  Clock,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { VideoProject } from '../types';
import { PLATFORM_INFO } from '../services/templates';

interface CreationsViewProps {
  projects: VideoProject[];
  onOpenProject: (project: VideoProject) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: VideoProject) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onNewProject: () => void;
}

export const CreationsView: React.FC<CreationsViewProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  onNewProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.idea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const startRename = (p: VideoProject) => {
    setEditingId(p.id);
    setEditingTitle(p.title);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameProject(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <FolderHeart className="h-5 w-5" />
            </div>
            <span>My Creations</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Locally saved scripts, blueprints, and short-form video projects
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Create New Script</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creations by title or idea keywords..."
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md shadow-sm"
          />
        </div>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl glass-surface border border-slate-200/80 dark:border-white/10">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              platformFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Platforms
          </button>
          {['tiktok', 'reels', 'shorts', 'linkedin'].map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all capitalize ${
                platformFilter === plat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty state */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 p-12 text-center backdrop-blur-md">
          <Film className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">No creations found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {projects.length === 0
              ? 'You have not saved any scripts yet. Start by generating a new video blueprint from the home screen.'
              : 'No projects match your current search criteria.'}
          </p>
          <div className="mt-6">
            <button
              onClick={onNewProject}
              className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate First Script</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const isEditing = editingId === p.id;
            const formattedDate = new Date(p.updatedAt || p.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={p.id}
                className="group rounded-3xl glass-card p-5 flex flex-col justify-between shadow-sm border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 ease-liquid-spring relative overflow-hidden"
              >
                {/* Top specular reflection line */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/20 to-transparent rounded-t-3xl"
                  aria-hidden="true"
                />

                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-lg border border-[var(--border-subtle)] bg-slate-100/90 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-800 dark:text-zinc-200">
                      {PLATFORM_INFO[p.platform]?.label || p.platform}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  {/* Title or inline edit */}
                  {isEditing ? (
                    <div className="flex items-center space-x-1.5 mb-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 px-2.5 py-1 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(p.id)}
                        className="rounded-lg p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 line-clamp-1 tracking-tight">
                        {p.title}
                      </h3>
                      <button
                        onClick={() => startRename(p)}
                        title="Rename title"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Prompt Idea snippet */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {p.idea}
                  </p>

                  {/* Scene Count & Duration */}
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-200/60 dark:border-white/10 pt-3">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{p.targetDuration}s</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{p.scenes.length} scenes</span>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDuplicateProject(p)}
                      title="Duplicate script"
                      className="rounded-xl p-1.5 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(p.id)}
                      title="Delete creation"
                      className="rounded-xl p-1.5 text-slate-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProject(p)}
                    className="flex items-center space-x-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white transition-all active:scale-95"
                  >
                    <span>Open in Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
