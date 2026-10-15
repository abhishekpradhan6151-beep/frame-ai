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
import { VideoProject, Platform } from '../types';
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
            <FolderHeart className="h-6 w-6 text-zinc-300" />
            <span>My Creations</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Locally saved scripts, blueprints, and short-form video projects
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center space-x-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:bg-zinc-200 transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Create New Script</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creations by title or idea keywords..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        {/* Platform filter tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-zinc-800 bg-zinc-950/80">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              platformFilter === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Platforms
          </button>
          {['tiktok', 'reels', 'shorts', 'linkedin'].map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all capitalize ${
                platformFilter === plat
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty state */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <Film className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No creations found</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            {projects.length === 0
              ? 'You have not saved any scripts yet. Start by generating a new video blueprint from the home screen.'
              : 'No projects match your current search criteria.'}
          </p>
          <div className="mt-6">
            <button
              onClick={onNewProject}
              className="inline-flex items-center space-x-2 rounded-xl bg-zinc-100 hover:bg-white text-black px-4 py-2 text-xs font-semibold transition-all"
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
                className="group rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 flex flex-col justify-between shadow-lg backdrop-blur-sm transition-all hover:border-zinc-700"
              >
                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300">
                      {PLATFORM_INFO[p.platform]?.label || p.platform}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center space-x-1">
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
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(p.id)}
                        className="rounded-lg p-1 text-emerald-400 hover:bg-zinc-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between group-hover:text-white mb-2">
                      <h3 className="text-base font-semibold text-zinc-100 line-clamp-1">
                        {p.title}
                      </h3>
                      <button
                        onClick={() => startRename(p)}
                        title="Rename title"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Prompt Idea snippet */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {p.idea}
                  </p>

                  {/* Scene Count & Duration */}
                  <div className="flex items-center space-x-4 text-xs text-zinc-500 border-t border-zinc-800/60 pt-3">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{p.targetDuration}s</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Layers className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{p.scenes.length} scenes</span>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDuplicateProject(p)}
                      title="Duplicate script"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(p.id)}
                      title="Delete creation"
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProject(p)}
                    className="flex items-center space-x-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-white transition-all"
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
