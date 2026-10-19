"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiClient = getAiClient;
exports.sanitizeError = sanitizeError;
exports.getStatus = getStatus;
exports.getZipFilePath = getZipFilePath;
exports.processGeneration = processGeneration;
exports.processQuickEdit = processQuickEdit;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const templates_1 = require("./templates");
// Lazily initialize the GoogleGenAI client from environment variable / Secret Manager
let cachedAiClient = null;
async function getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        return null;
    if (!cachedAiClient) {
        const { GoogleGenAI } = await Promise.resolve().then(() => __importStar(require('@google/genai')));
        cachedAiClient = new GoogleGenAI({
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build-firebase',
                },
            },
        });
    }
    return cachedAiClient;
}
function sanitizeError(error) {
    if (!error)
        return 'An error occurred during Gemini request';
    let message = typeof error.message === 'string' ? error.message : String(error);
    if (process.env.GEMINI_API_KEY) {
        message = message.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED]');
    }
    // Redact potential query string API keys
    message = message.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]');
    // Redact AIza style Google API keys
    message = message.replace(/AIza[0-9A-Za-z\-_]{35}/g, '[REDACTED_API_KEY]');
    return message;
}
function getStatus() {
    const isAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    return {
        liveAiAvailable: isAvailable,
        model: 'gemini-3.8-flash',
        environment: process.env.NODE_ENV || 'production',
    };
}
function getZipFilePath() {
    const candidatePaths = [
        path_1.default.resolve(__dirname, '../../frame-ai.zip'),
        path_1.default.resolve(__dirname, '../frame-ai.zip'),
        path_1.default.resolve(process.cwd(), 'frame-ai.zip'),
        path_1.default.resolve(process.cwd(), 'public/frame-ai.zip'),
        path_1.default.resolve(__dirname, '../../public/frame-ai.zip'),
    ];
    for (const candidate of candidatePaths) {
        if (fs_1.default.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}
async function processGeneration(input) {
    const { idea, platform = 'tiktok', tone = 'viral-hype', duration = 30, language = 'en', preferDemo = false, customInstructions, } = input;
    if (!idea || typeof idea !== 'string' || idea.trim().length < 3) {
        throw new Error('idea is required and must be at least 3 characters');
    }
    const sanitizedCustom = typeof customInstructions === 'string' && customInstructions.trim()
        ? customInstructions.trim().slice(0, 2000)
        : undefined;
    // If client explicitly requested demo mode
    if (preferDemo) {
        const mockProject = (0, templates_1.generateMockProject)(idea.trim(), platform, tone, Number(duration), language, sanitizedCustom);
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
        const { Type } = await Promise.resolve().then(() => __importStar(require('@google/genai')));
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
        const project = {
            id: 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            title: parsed.title || idea.slice(0, 40),
            idea,
            platform,
            tone,
            targetDuration: Number(duration),
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
    }
    catch (error) {
        console.error('Gemini Generation Error:', error);
        throw error;
    }
}
async function processQuickEdit(body) {
    const { action, currentProject, targetTone, preferDemo = false } = body;
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
        }
        else if (action === 'shorten-script') {
            updated.targetDuration = 15;
            updated.scenes = updated.scenes.slice(0, 3).map((s, idx) => ({
                ...s,
                sceneNumber: idx + 1,
                durationSeconds: 5,
            }));
        }
        else if (action === 'change-tone' && targetTone) {
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
Current Script Breakdown:
${JSON.stringify(currentProject.scenes, null, 2)}

Current Hooks:
${JSON.stringify(currentProject.hooks, null, 2)}

Return a JSON with:
1. "scenes": updated scenes list
2. "hooks": updated hooks list`;
    const { Type } = await Promise.resolve().then(() => __importStar(require('@google/genai')));
    const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: editPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
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
                    hooks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                angle: { type: Type.STRING },
                                label: { type: Type.STRING },
                                text: { type: Type.STRING },
                                viralityScore: { type: Type.NUMBER },
                                retentionTip: { type: Type.STRING },
                            },
                            required: ['id', 'angle', 'label', 'text', 'viralityScore', 'retentionTip'],
                        },
                    },
                },
                required: ['scenes', 'hooks'],
            },
        },
    });
    const parsed = JSON.parse(response.text || '{}');
    return {
        ...currentProject,
        scenes: parsed.scenes || currentProject.scenes,
        hooks: parsed.hooks || currentProject.hooks,
        tone: targetTone || currentProject.tone,
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=geminiService.js.map