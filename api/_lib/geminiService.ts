import type { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { generateMockProject } from './templates.js';
import type { VideoProject, Platform, Tone, DurationOption, QuickEditRequest } from '../../src/types';

// Lazily initialize the GoogleGenAI client from environment variable
let cachedAiClient: GoogleGenAI | null = null;

export async function getAiClient(): Promise<GoogleGenAI | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedAiClient) {
    const { GoogleGenAI } = await import('@google/genai');
    cachedAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAiClient;
}

export function sanitizeError(error: any): string {
  if (!error) return 'An error occurred during Gemini request';
  let message = typeof error.message === 'string' ? error.message : String(error);
  if (process.env.GEMINI_API_KEY) {
    message = message.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED]');
  }
  message = message.replace(/key=[A-Za-z0-9_-]+/gi, 'key=[REDACTED]');
  message = message.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]');
  return message;
}

export function isLiveAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getStatus() {
  return {
    liveAiAvailable: isLiveAiConfigured(),
    model: 'gemini-3.8-flash',
    environment: process.env.NODE_ENV || 'development',
  };
}

export function getZipFilePath(): string | null {
  const candidatePaths = [
    path.resolve(process.cwd(), 'frame-ai.zip'),
    path.resolve(process.cwd(), 'public', 'frame-ai.zip'),
    path.resolve(process.cwd(), 'dist', 'frame-ai.zip'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export interface GenerateInput {
  idea: string;
  platform?: Platform;
  tone?: Tone;
  duration?: DurationOption;
  language?: string;
  preferDemo?: boolean;
  customInstructions?: string;
}

export async function processGeneration(input: GenerateInput): Promise<{
  project: VideoProject;
  statusCode: number;
  error?: string;
}> {
  const {
    idea,
    platform = 'tiktok',
    tone = 'viral-hype',
    duration = 30,
    language = 'en',
    preferDemo = false,
    customInstructions,
  } = input;

  if (!idea || typeof idea !== 'string' || idea.trim().length < 3) {
    throw new Error('idea is required and must be at least 3 characters');
  }

  const sanitizedCustom =
    typeof customInstructions === 'string' && customInstructions.trim()
      ? customInstructions.trim().slice(0, 2000)
      : undefined;

  // If client explicitly requested demo mode
  if (preferDemo) {
    const mockProject = generateMockProject(
      idea.trim(),
      platform as Platform,
      tone as Tone,
      Number(duration) as DurationOption,
      language,
      sanitizedCustom
    );
    return { project: mockProject, statusCode: 200 };
  }

  const aiClient = await getAiClient();

  // Live AI request requires configured GEMINI_API_KEY
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY environment variable is missing or not configured on the server');
  }

  // Live AI generation with Gemini 3.8 Flash
  const prompt = `You are a world-class viral short-form video creator and scriptwriter for ${platform.toUpperCase()}.
Create a complete, production-ready short-form video package based on this creator's idea:
Idea: "${idea.trim()}"
Platform: ${platform}
Tone: ${tone}
Target Duration: ${duration} seconds
Language: ${language}
${sanitizedCustom ? `\nCreative Direction & Custom Creative Instructions:\n"${sanitizedCustom}"\nCRITICAL: You must strictly adhere to these customized instructions when creating the hooks, visual scene cues, camera angles, voiceover rhythm, pacing, and calls to action.\n` : ''}

Provide:
1. Exactly 5 distinctive hook angles (curiosity, viral-shock, relatable-story, hot-take, statistic).
2. A scene-by-scene script breakdown totaling approximately ${duration} seconds (usually 3-6 scenes). For each scene give:
   - Visual cue (camera framing, action, lighting)
   - Audio/Voiceover (exact words spoken)
   - On-Screen text overlay (bold, snappy caps)
   - B-roll visual prompt
   - Estimated duration in seconds
3. 3 Caption variations (short-punchy, storytelling, seo-keyword-rich)
4. 7-10 high-ranking viral hashtags
5. 3 Call-To-Action (CTA) variations (save/share loop, comment bait, follow trigger)`;

  try {
    const { Type } = await import('@google/genai');
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short catchy project title under 40 chars' },
            hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  angle: {
                    type: Type.STRING,
                    enum: ['curiosity', 'viral-shock', 'relatable-story', 'hot-take', 'statistic', 'question'],
                  },
                  label: { type: Type.STRING },
                  text: { type: Type.STRING },
                  viralityScore: { type: Type.NUMBER },
                  retentionTip: { type: Type.STRING },
                },
                required: ['id', 'angle', 'label', 'text', 'viralityScore', 'retentionTip'],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  sceneNumber: { type: Type.NUMBER },
                  durationSeconds: { type: Type.NUMBER },
                  visualCue: { type: Type.STRING },
                  audioVoiceover: { type: Type.STRING },
                  onScreenText: { type: Type.STRING },
                  bRollPrompt: { type: Type.STRING },
                },
                required: ['id', 'sceneNumber', 'durationSeconds', 'visualCue', 'audioVoiceover', 'onScreenText'],
              },
            },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  style: { type: Type.STRING, enum: ['short-punchy', 'storytelling', 'seo-keyword-rich'] },
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['id', 'style', 'title', 'text'],
              },
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ctas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['comment', 'save-share', 'follow', 'link'] },
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['id', 'type', 'title', 'text'],
              },
            },
          },
          required: ['title', 'hooks', 'scenes', 'captions', 'hashtags', 'ctas'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const now = new Date().toISOString();

    const project: VideoProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      title: parsed.title || idea.slice(0, 40),
      idea,
      platform,
      tone,
      targetDuration: Number(duration) as DurationOption,
      language,
      selectedHookId: parsed.hooks?.[0]?.id || 'h1',
      hooks: parsed.hooks || [],
      scenes: parsed.scenes || [],
      captions: parsed.captions || [],
      hashtags: parsed.hashtags || [],
      ctas: parsed.ctas || [],
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true,
      modelUsed: 'gemini-3.8-flash',
      customInstructions: sanitizedCustom,
    };

    return { project, statusCode: 200 };
  } catch (error: any) {
    const safeMsg = sanitizeError(error);
    console.error('Gemini Generation Error:', safeMsg);
    throw new Error(safeMsg);
  }
}

export async function processQuickEdit(
  req: QuickEditRequest & { preferDemo?: boolean }
): Promise<VideoProject> {
  const { action, currentProject, targetTone, customInstruction, preferDemo } = req;
  if (!currentProject) {
    throw new Error('currentProject is required');
  }

  // If client explicitly requested demo mode or current project is a static demo blueprint
  if (preferDemo || !currentProject.isAiGenerated) {
    // In-memory smart quick edits
    const updated = { ...currentProject, updatedAt: new Date().toISOString() };
    if (action === 'punch-hook') {
      updated.hooks = updated.hooks.map((h) => ({
        ...h,
        text: `🚨 STOP WHAT YOU'RE DOING: ${h.text.replace(/^.*?:/g, '').trim()}`,
        viralityScore: Math.min(99, h.viralityScore + 4),
      }));
    } else if (action === 'shorten-script') {
      updated.targetDuration = 15;
      updated.scenes = updated.scenes.slice(0, 3).map((s, idx) => ({
        ...s,
        sceneNumber: idx + 1,
        durationSeconds: 5,
      }));
    } else if (action === 'change-tone' && targetTone) {
      updated.tone = targetTone;
    }
    return updated;
  }

  const aiClient = await getAiClient();

  // Live AI quick edit requires configured GEMINI_API_KEY
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY environment variable is missing or not configured on the server');
  }

  const editPrompt = `You are a video script editor. Apply this quick edit action to the existing video project.
Action: ${action}
${targetTone ? `Target Tone: ${targetTone}` : ''}
${customInstruction ? `Instruction: ${customInstruction}` : ''}

Original Project Data:
${JSON.stringify({
  idea: currentProject.idea,
  platform: currentProject.platform,
  tone: currentProject.tone,
  targetDuration: currentProject.targetDuration,
  hooks: currentProject.hooks,
  scenes: currentProject.scenes,
  captions: currentProject.captions,
  ctas: currentProject.ctas,
})}

Return the updated project JSON with all fields preserved or updated appropriately according to the instruction.`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: editPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const merged: VideoProject = {
      ...currentProject,
      ...parsed,
      updatedAt: new Date().toISOString(),
      isAiGenerated: true,
      modelUsed: 'gemini-3.8-flash (Quick Edit)',
    };

    return merged;
  } catch (error: any) {
    const safeMsg = sanitizeError(error);
    console.error('Gemini Quick Edit Error:', safeMsg);
    throw new Error(safeMsg);
  }
}
