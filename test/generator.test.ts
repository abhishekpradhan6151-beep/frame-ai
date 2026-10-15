import { describe, it, expect } from 'vitest';
import { generateMockProject, PLATFORM_INFO, TONE_LABELS } from '../src/services/templates';

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
    expect(project.scenes.length).toBeGreaterThanOrEqual(3);
    expect(project.captions.length).toBe(3);
    expect(project.ctas.length).toBe(3);
    expect(project.hashtags.length).toBeGreaterThanOrEqual(5);
  });

  it('calculates duration correctly for different lengths', () => {
    const blitzProject = generateMockProject('Quick tip', 'reels', 'casual-relatable', 15);
    expect(blitzProject.targetDuration).toBe(15);
    expect(blitzProject.scenes.length).toBe(3);

    const deepDive = generateMockProject('Masterclass concept', 'shorts', 'educational-authority', 60);
    expect(deepDive.targetDuration).toBe(60);
    expect(deepDive.scenes.length).toBe(6);
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
});
