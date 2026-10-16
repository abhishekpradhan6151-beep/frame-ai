import { describe, it, expect, beforeEach } from 'vitest';
import { generateMockProject, PLATFORM_INFO, TONE_LABELS, AVAILABLE_LANGUAGES } from '../src/services/templates';
import {
  saveProject,
  loadSavedProjects,
  deleteProject,
  loadSettings,
  saveSettings,
  exportBackupData,
  importBackupData,
  clearAllLocalData,
  DEFAULT_SETTINGS,
} from '../src/services/storage';

describe('FRAME Short-Form Video Generator', () => {
  it('generates a complete video project structure with 5 hooks', () => {
    const project = generateMockProject(
      'Why 99% of people fail at morning routines',
      'tiktok',
      'viral-hype',
      30,
      'en'
    );

    expect(project).toBeDefined();
    expect(project.title).toContain('Why 99% of people fail');
    expect(project.platform).toBe('tiktok');
    expect(project.targetDuration).toBe(30);
    expect(project.hooks.length).toBe(5);
    expect(project.scenes.length).toBe(4);
    expect(project.captions.length).toBe(3);
    expect(project.ctas.length).toBe(3);
    expect(project.hashtags.length).toBeGreaterThanOrEqual(5);
    expect(project.isAiGenerated).toBe(false);
    expect(project.modelUsed).toContain('Demo');
  });

  it('calculates duration correctly for different lengths', () => {
    const blitzProject = generateMockProject('Quick tip', 'reels', 'casual-relatable', 15);
    expect(blitzProject.targetDuration).toBe(15);
    expect(blitzProject.scenes.length).toBe(3);

    const standardProject = generateMockProject('Standard concept', 'tiktok', 'viral-hype', 30);
    expect(standardProject.targetDuration).toBe(30);
    expect(standardProject.scenes.length).toBe(4);

    const deepDive = generateMockProject('Masterclass concept', 'shorts', 'educational-authority', 60);
    expect(deepDive.targetDuration).toBe(60);
    expect(deepDive.scenes.length).toBe(6);

    const narrative = generateMockProject('Full story breakdown', 'linkedin', 'storyteller', 90);
    expect(narrative.targetDuration).toBe(90);
    expect(narrative.scenes.length).toBe(8);
  });

  it('includes virality tips and retention cues for each hook', () => {
    const project = generateMockProject('Growth hack', 'tiktok', 'viral-hype', 30);
    for (const hook of project.hooks) {
      expect(hook.viralityScore).toBeGreaterThanOrEqual(80);
      expect(hook.retentionTip).toBeTruthy();
    }
  });

  it('verifies platform configurations are registered', () => {
    expect(PLATFORM_INFO.tiktok.label).toBe('TikTok');
    expect(PLATFORM_INFO.reels.label).toBe('Instagram Reels');
    expect(PLATFORM_INFO.shorts.label).toBe('YouTube Shorts');
    expect(PLATFORM_INFO.linkedin.label).toBe('LinkedIn Video');
  });

  it('verifies tones and languages are registered', () => {
    expect(Object.keys(TONE_LABELS).length).toBe(6);
    expect(AVAILABLE_LANGUAGES.length).toBeGreaterThanOrEqual(7);
  });

  it('incorporates custom creative instructions into generated blueprint', () => {
    const customPrompt = 'Cinematic moody lighting, high contrast B-roll, witty fast-paced delivery';
    const project = generateMockProject(
      'AI productivity stack',
      'tiktok',
      'viral-hype',
      30,
      'en',
      customPrompt
    );

    expect(project.customInstructions).toBe(customPrompt);
    expect(project.modelUsed).toContain('Custom Creative Instructions Applied');
  });
});

describe('FRAME Local Persistence & Settings', () => {
  beforeEach(() => {
    clearAllLocalData();
  });

  it('saves and loads projects from localStorage', () => {
    const testProject = generateMockProject('Storage test idea', 'reels', 'storyteller', 30);
    saveProject(testProject);

    const loaded = loadSavedProjects();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe(testProject.id);
    expect(loaded[0].title).toBe(testProject.title);
  });

  it('deletes projects correctly', () => {
    const proj1 = generateMockProject('Project One', 'tiktok', 'viral-hype', 15);
    const proj2 = generateMockProject('Project Two', 'shorts', 'educational-authority', 60);
    saveProject(proj1);
    saveProject(proj2);

    expect(loadSavedProjects().length).toBe(2);

    deleteProject(proj1.id);
    const afterDelete = loadSavedProjects();
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].id).toBe(proj2.id);
  });

  it('manages settings and backup exports', () => {
    const initial = loadSettings();
    expect(initial.preferDemoMode).toBe(true);

    saveSettings({ ...initial, defaultDuration: 60 });
    expect(loadSettings().defaultDuration).toBe(60);

    const backup = exportBackupData();
    expect(backup).toContain('version');
    expect(backup).toContain('projects');

    const imported = importBackupData(backup);
    expect(imported).toBe(true);
  });
});
