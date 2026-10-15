import { VideoProject, UserSettings } from '../types';

const STORAGE_KEY_PROJECTS = 'frame_ai_projects';
const STORAGE_KEY_SETTINGS = 'frame_ai_settings';

// Memory store fallback for test/node/SSR environments
const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback to memory
  }
  return memoryStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback to memory
  }
  memoryStore.set(key, value);
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {
    // fallback to memory
  }
  memoryStore.delete(key);
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultPlatform: 'tiktok',
  defaultTone: 'viral-hype',
  defaultDuration: 30,
  defaultLanguage: 'en',
  preferDemoMode: true,
  autoSave: true,
  teleprompterSpeed: 1.0,
  teleprompterFontSize: 28,
};

export function loadSavedProjects(): VideoProject[] {
  try {
    const raw = getStorageItem(STORAGE_KEY_PROJECTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading saved projects from storage:', err);
    return [];
  }
}

export function saveProject(project: VideoProject): void {
  try {
    const projects = loadSavedProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    const updated = { ...project, updatedAt: new Date().toISOString() };

    if (existingIndex >= 0) {
      projects[existingIndex] = updated;
    } else {
      projects.unshift(updated);
    }

    setStorageItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving project to storage:', err);
  }
}

export function deleteProject(id: string): void {
  try {
    const projects = loadSavedProjects();
    const filtered = projects.filter((p) => p.id !== id);
    setStorageItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting project from storage:', err);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = getStorageItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    setStorageItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to storage:', err);
  }
}

export function exportBackupData(): string {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects: loadSavedProjects(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.projects)) {
      setStorageItem(STORAGE_KEY_PROJECTS, JSON.stringify(parsed.projects));
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      setStorageItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed.settings));
    }
    return true;
  } catch (err) {
    console.error('Failed to import backup data:', err);
    return false;
  }
}

export function clearAllLocalData(): void {
  removeStorageItem(STORAGE_KEY_PROJECTS);
  removeStorageItem(STORAGE_KEY_SETTINGS);
}
