import { VideoProject, GenerateRequest, QuickEditRequest } from '../types';
import { generateMockProject } from './templates';

export interface ApiStatus {
  liveAiAvailable: boolean;
  model: string;
}

export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch {
    return { liveAiAvailable: false, model: 'demo-fallback' };
  }
}

export async function generateProject(req: GenerateRequest): Promise<VideoProject> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: VideoProject = await res.json();
    return data;
  } catch (err) {
    return generateMockProject(
      req.idea,
      req.platform,
      req.tone,
      req.duration,
      req.language,
      req.customInstructions
    );
  }
}

export async function quickEditProject(req: QuickEditRequest): Promise<VideoProject> {
  try {
    const res = await fetch('/api/quick-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Quick edit returned ${res.status}`);
    }

    const data: VideoProject = await res.json();
    return data;
  } catch (err) {
    console.warn('Quick edit request failed, applying local fallback:', err);
    const updated = { ...req.currentProject, updatedAt: new Date().toISOString() };
    if (req.action === 'punch-hook') {
      updated.hooks = updated.hooks.map((h) => ({
        ...h,
        text: `⚠️ DO NOT SCROLL PAST THIS: ${h.text}`,
        viralityScore: Math.min(99, h.viralityScore + 3),
      }));
    } else if (req.action === 'shorten-script') {
      updated.targetDuration = 15;
      updated.scenes = updated.scenes.slice(0, 3).map((s, idx) => ({
        ...s,
        sceneNumber: idx + 1,
        durationSeconds: 5,
      }));
    } else if (req.action === 'change-tone' && req.targetTone) {
      updated.tone = req.targetTone;
    }
    return updated;
  }
}
