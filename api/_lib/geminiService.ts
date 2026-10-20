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

export type GeminiErrorCategory =
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'AUTH_ERROR'
  | 'INVALID_REQUEST'
  | 'INTERNAL_ERROR';

export class GeminiServiceError extends Error {
  public statusCode: number;
  public category: GeminiErrorCategory;
  public retryAfterSeconds?: number | null;

  constructor(
    message: string,
    statusCode: number,
    category: GeminiErrorCategory,
    retryAfterSeconds?: number | null
  ) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
    this.category = category;
    this.retryAfterSeconds = retryAfterSeconds;
    Object.setPrototypeOf(this, GeminiServiceError.prototype);
  }
}

export function extractRetryDelay(error: any): number | null {
  if (!error) return null;

  // 1. HTTP header Retry-After
  const retryAfterHeader =
    error.response?.headers?.get?.('retry-after') || error.headers?.['retry-after'];
  if (retryAfterHeader) {
    const parsed = parseFloat(retryAfterHeader);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed * 1000;
    }
  }

  // 2. Structured Google RPC RetryInfo in details
  const details = error.error?.details || error.details;
  if (Array.isArray(details)) {
    for (const d of details) {
      if (d && (d['@type']?.includes('RetryInfo') || d.retryDelay)) {
        if (typeof d.retryDelay === 'string') {
          const match = d.retryDelay.match(/([0-9.]+)\s*s?/i);
          if (match) {
            const sec = parseFloat(match[1]);
            if (!isNaN(sec) && sec > 0) return sec * 1000;
          }
        } else if (typeof d.retryDelay?.seconds === 'number') {
          return d.retryDelay.seconds * 1000;
        }
      }
    }
  }

  // 3. Message text parsing for retry delay
  const msg = typeof error.message === 'string' ? error.message : '';
  const match = msg.match(/retry after\s+([0-9.]+)\s*s/i) || msg.match(/reset in\s+([0-9.]+)\s*s/i);
  if (match) {
    const sec = parseFloat(match[1]);
    if (!isNaN(sec) && sec > 0) {
      return sec * 1000;
    }
  }

  return null;
}

export function categorizeGeminiError(error: any): {
  statusCode: number;
  message: string;
  category: GeminiErrorCategory;
  retryAfterSeconds?: number | null;
} {
  if (!error) {
    return {
      statusCode: 500,
      message: 'An unexpected internal error occurred during generation.',
      category: 'INTERNAL_ERROR',
    };
  }

  const rawStatus =
    error.statusCode ||
    error.status ||
    error.code ||
    error.error?.code ||
    error.error?.status;

  const rawMessage =
    typeof error.message === 'string'
      ? error.message
      : typeof error === 'string'
      ? error
      : JSON.stringify(error);

  const cleanMessage = sanitizeError(rawMessage);

  // 1. Auth & Configuration Errors (401, 403, PERMISSION_DENIED, UNAUTHENTICATED)
  if (
    rawStatus === 401 ||
    rawStatus === 403 ||
    rawStatus === 'PERMISSION_DENIED' ||
    rawStatus === 'UNAUTHENTICATED' ||
    /invalid api key|api key not valid|permission denied|unauthenticated/i.test(cleanMessage)
  ) {
    return {
      statusCode: 401,
      message: 'Gemini API key is invalid or not properly configured on the server.',
      category: 'AUTH_ERROR',
    };
  }

  // 2. Client / Validation / Invalid Request Errors (400, INVALID_ARGUMENT)
  if (rawStatus === 400 || rawStatus === 'INVALID_ARGUMENT') {
    return {
      statusCode: 400,
      message: `Invalid generation request: ${cleanMessage.slice(0, 150)}`,
      category: 'INVALID_REQUEST',
    };
  }

  // 3. Timeout Errors (504, DEADLINE_EXCEEDED, Gateway Timeout)
  if (
    rawStatus === 504 ||
    rawStatus === 'DEADLINE_EXCEEDED' ||
    /deadline exceeded|timed out|gateway timeout/i.test(cleanMessage)
  ) {
    return {
      statusCode: 504,
      message: 'The AI service timed out while generating your video framework. Please try again.',
      category: 'TIMEOUT',
    };
  }

  // 4. Rate Limit / Resource Exhausted (429, RESOURCE_EXHAUSTED)
  if (
    rawStatus === 429 ||
    rawStatus === 'RESOURCE_EXHAUSTED' ||
    /rate limit|too many requests|resource_exhausted/i.test(cleanMessage)
  ) {
    const rawDelayMs = extractRetryDelay(error);
    const retrySec =
      rawDelayMs && Number.isFinite(rawDelayMs) && rawDelayMs > 0
        ? Math.min(Math.ceil(rawDelayMs / 1000), 60)
        : null;
    let message = 'AI request rate limit reached. Please wait a moment before trying again.';

    if (/input tokens|tokens per minute|tpm/i.test(cleanMessage)) {
      message = 'AI token rate limit reached. Please shorten your idea or creative instructions and try again.';
    } else if (/requests per day|daily/i.test(cleanMessage)) {
      message = 'Daily AI generation quota reached for the configured API key. Please check your quota limits.';
    } else if (rawDelayMs && rawDelayMs > 60000) {
      message = 'AI generation quota limit exceeded. Please check your quota limits or try again later.';
    } else if (retrySec && retrySec > 0) {
      message = `AI request rate limit reached. Please wait ${retrySec} seconds before trying again.`;
    }

    return {
      statusCode: 429,
      message,
      category: 'RATE_LIMIT',
      retryAfterSeconds: retrySec,
    };
  }

  // 5. High Demand / Service Unavailable (503, UNAVAILABLE)
  if (
    rawStatus === 503 ||
    rawStatus === 'UNAVAILABLE' ||
    /high demand|spikes in demand|temporarily unavailable|unavailable|overloaded|please try again later/i.test(cleanMessage)
  ) {
    return {
      statusCode: 503,
      message: 'AI service is temporarily experiencing high demand. Please try again in a few moments.',
      category: 'SERVICE_UNAVAILABLE',
    };
  }

  // Fallback / Internal server error
  const numericStatus =
    typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus <= 599
      ? rawStatus
      : 500;

  return {
    statusCode: numericStatus,
    message: cleanMessage || 'An unexpected error occurred during video package generation.',
    category: 'INTERNAL_ERROR',
  };
}

export function isTransientError(error: any): boolean {
  if (!error) return false;

  const status =
    error.status ||
    error.code ||
    error.statusCode ||
    error.error?.code ||
    error.error?.status;

  const message =
    typeof error.message === 'string'
      ? error.message
      : typeof error === 'string'
      ? error
      : JSON.stringify(error);

  // Non-transient errors: never retry
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 'INVALID_ARGUMENT' ||
    status === 'PERMISSION_DENIED' ||
    status === 'UNAUTHENTICATED' ||
    status === 'NOT_FOUND' ||
    /invalid api key|api key not valid|permission denied|unauthenticated/i.test(message)
  ) {
    return false;
  }

  // 503 Service Unavailable / 504 Gateway Timeout: retryable
  if (
    status === 503 ||
    status === 504 ||
    status === 'UNAVAILABLE' ||
    status === 'DEADLINE_EXCEEDED' ||
    /high demand|spikes in demand|temporarily unavailable|unavailable|overloaded/i.test(message)
  ) {
    return true;
  }

  // 429 Rate Limit: only retry if server provides a short retry delay (<= 5s).
  // Do NOT retry 429 blindly or rapidly without server guidance.
  if (
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    /rate limit|too many requests|resource_exhausted/i.test(message)
  ) {
    const delay = extractRetryDelay(error);
    return delay !== null && delay > 0 && delay <= 5000;
  }

  return false;
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const initialDelayMs = options.initialDelayMs ?? 800;
  const maxDelayMs = options.maxDelayMs ?? 5000;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (!isTransientError(error) || attempt === maxRetries) {
        break;
      }

      const serverDelay = extractRetryDelay(error);
      const isRateLimit =
        error?.status === 429 ||
        error?.code === 429 ||
        error?.error?.code === 429 ||
        error?.statusCode === 429;

      // For 429 with explicit short retry delay, respect exact server delay without artificial exponential backoff
      const delay =
        isRateLimit && serverDelay
          ? Math.min(serverDelay, maxDelayMs)
          : Math.min(
              initialDelayMs * Math.pow(2, attempt) + Math.random() * (initialDelayMs * 0.25),
              maxDelayMs
            );

      const errorInfo = categorizeGeminiError(error);
      console.warn(
        `[Gemini Attempt ${attempt + 1}/${maxRetries + 1}] Upstream retryable error (${errorInfo.statusCode} ${errorInfo.category}). Retrying in ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const { statusCode, message, category, retryAfterSeconds } = categorizeGeminiError(lastError);
  throw new GeminiServiceError(message, statusCode, category, retryAfterSeconds);
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
    const response = await executeWithRetry(() =>
      aiClient.models.generateContent({
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
      })
    );

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
    if (error instanceof GeminiServiceError) {
      console.error(`Gemini Generation Error [${error.statusCode} ${error.category}]:`, error.message);
      throw error;
    }
    const { statusCode, message, category } = categorizeGeminiError(error);
    console.error(`Gemini Generation Error [${statusCode} ${category}]:`, message);
    throw new GeminiServiceError(message, statusCode, category);
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
    const response = await executeWithRetry(() =>
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: editPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

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
    if (error instanceof GeminiServiceError) {
      console.error(`Gemini Quick Edit Error [${error.statusCode} ${error.category}]:`, error.message);
      throw error;
    }
    const { statusCode, message, category } = categorizeGeminiError(error);
    console.error(`Gemini Quick Edit Error [${statusCode} ${category}]:`, message);
    throw new GeminiServiceError(message, statusCode, category);
  }
}
