import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { StudioView } from './components/StudioView';
import { CreationsView } from './components/CreationsView';
import { SettingsView } from './components/SettingsView';
import { VideoProject, UserSettings, Platform, Tone, DurationOption, QuickEditRequest, ThemeMode } from './types';
import {
  loadSavedProjects,
  saveProject,
  deleteProject,
  loadSettings,
  saveSettings,
} from './services/storage';
import { checkApiStatus, generateProject, quickEditProject, ApiStatus } from './services/api';
import { useTheme } from './services/theme';
import { BrandLockup } from './components/Logo';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'studio' | 'creations' | 'settings'>('home');
  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<VideoProject[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const { theme, setTheme } = useTheme();

  // Load initial projects & check API status
  useEffect(() => {
    const loaded = loadSavedProjects();
    setSavedProjects(loaded);
    if (loaded.length > 0 && !activeProject) {
      setActiveProject(loaded[0]);
    }

    checkApiStatus().then(setApiStatus);
  }, []);

  const [generationError, setGenerationError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const handleGenerate = async (params: {
    idea: string;
    platform: Platform;
    tone: Tone;
    duration: DurationOption;
    language: string;
    customInstructions?: string;
  }) => {
    // Synchronously guard against accidental double-clicks or duplicate dispatches
    if (isGeneratingRef.current) {
      console.warn('Generation already in progress. Ignoring duplicate call.');
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const newProj = await generateProject({
        ...params,
        preferDemo: settings.preferDemoMode,
      });

      // Save and set active
      saveProject(newProj);
      setActiveProject(newProj);
      setSavedProjects(loadSavedProjects());
      setCurrentTab('studio');
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerationError(
        err?.message || 'AI Generation request failed. Please check your backend connection or switch to Demo Mode in Settings.'
      );
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleQuickEdit = async (req: QuickEditRequest) => {
    setIsQuickEditing(true);
    try {
      const updated = await quickEditProject(req);
      saveProject(updated);
      setActiveProject(updated);
      setSavedProjects(loadSavedProjects());
    } catch (err) {
      console.error('Quick edit failed:', err);
    } finally {
      setIsQuickEditing(false);
    }
  };

  const handleSaveActiveProject = (proj: VideoProject) => {
    saveProject(proj);
    setActiveProject(proj);
    setSavedProjects(loadSavedProjects());
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    const updated = loadSavedProjects();
    setSavedProjects(updated);
    if (activeProject?.id === id) {
      setActiveProject(updated.length > 0 ? updated[0] : null);
      if (updated.length === 0) {
        setCurrentTab('home');
      }
    }
  };

  const handleDuplicateProject = (proj: VideoProject) => {
    const duplicated: VideoProject = {
      ...proj,
      id: 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      title: `${proj.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProject(duplicated);
    setSavedProjects(loadSavedProjects());
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    const target = savedProjects.find((p) => p.id === id);
    if (target) {
      const updated = { ...target, title: newTitle, updatedAt: new Date().toISOString() };
      saveProject(updated);
      setSavedProjects(loadSavedProjects());
      if (activeProject?.id === id) {
        setActiveProject(updated);
      }
    }
  };

  const handleOpenFromCreations = (proj: VideoProject) => {
    setActiveProject(proj);
    setCurrentTab('studio');
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleDataReset = () => {
    setSavedProjects([]);
    setActiveProject(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        apiStatus={apiStatus}
        preferDemoMode={settings.preferDemoMode}
        hasActiveProject={Boolean(activeProject)}
        onNewProject={() => setCurrentTab('home')}
        savedCount={savedProjects.length}
        theme={theme}
        onSelectTheme={setTheme}
      />

      <main key={currentTab} className="flex-1 pb-16 animate-page-enter">
        {currentTab === 'home' && (
          <HomeView
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            settings={settings}
            isAiLive={Boolean(apiStatus?.liveAiAvailable && !settings.preferDemoMode)}
            onNavigateToCreations={() => setCurrentTab('creations')}
            generationError={generationError}
            onClearGenerationError={() => setGenerationError(null)}
          />
        )}

        {currentTab === 'studio' && activeProject && (
          <StudioView
            project={activeProject}
            onUpdateProject={setActiveProject}
            onSaveProject={handleSaveActiveProject}
            onApplyQuickEdit={handleQuickEdit}
            isQuickEditing={isQuickEditing}
            isAiLive={Boolean(apiStatus?.liveAiAvailable)}
            preferDemoMode={settings.preferDemoMode}
          />
        )}

        {currentTab === 'creations' && (
          <CreationsView
            projects={savedProjects}
            onOpenProject={handleOpenFromCreations}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
            onNewProject={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            savedProjectCount={savedProjects.length}
            onDataReset={handleDataReset}
            isAiLive={Boolean(apiStatus?.liveAiAvailable)}
            theme={theme}
            onSelectTheme={setTheme}
          />
        )}
      </main>

      {/* Minimalist Liquid Glass Footer for non-home pages */}
      {currentTab !== 'home' && (
        <footer className="border-t border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md py-5 sm:py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-zinc-400 transition-colors duration-200">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <BrandLockup iconSize={28} />
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              TikTok, Reels & Shorts • Powered by Google Gemini 3.8
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
export default App;
