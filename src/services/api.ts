import { VideoProject, GenerateRequest, QuickEditRequest } from '../types';
import { generateMockProject } from './templates';

export interface ApiStatus {
  liveAiAvailable: boolean;
  model: string;
}

// Configurable base URL for Firebase Cloud Functions backend or fallback relative /api
export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/status`);
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch {
    return { liveAiAvailable: false, model: 'demo-fallback' };
  }
}

export async function generateProject(req: GenerateRequest): Promise<VideoProject> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `Server returned status ${res.status}`);
    }

    const data: VideoProject = await res.json();
    return data;
  } catch (err: any) {
    // If the user explicitly chose Demo Blueprint mode, local deterministic generation is expected
    if (req.preferDemo) {
      return generateMockProject(
        req.idea,
        req.platform,
        req.tone,
        req.duration,
        req.language,
        req.customInstructions
      );
    }
    // If user requested Live AI, do NOT silently swallow the error with canned templates
    console.error('Live AI generation failed:', err);
    throw err;
  }
}

export async function quickEditProject(req: QuickEditRequest): Promise<VideoProject> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quick-edit`, {
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
