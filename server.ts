import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { generateMockProject } from './src/services/templates';
import type { VideoProject, Platform, Tone, DurationOption, QuickEditRequest } from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import fs from 'fs';
import path from 'path';

// 1. Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    liveAiAvailable: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Download ZIP endpoint
app.get('/api/download-zip', (req, res) => {
  const zipPath = path.resolve(process.cwd(), 'frame-ai.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'frame-ai.zip');
  } else {
    res.status(404).json({ error: 'Archive not found' });
  }
});

// 2. Full project generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      idea,
      platform = 'tiktok',
      tone = 'viral-hype',
      duration = 30,
      language = 'en',
      preferDemo = false,
      customInstructions,
    } = req.body;

    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: 'idea is required' });
    }

    const sanitizedCustom =
      typeof customInstructions === 'string' && customInstructions.trim()
        ? customInstructions.trim().slice(0, 2000)
        : undefined;

    // If client requested demo mode or no Gemini API key is configured
    if (preferDemo || !aiClient) {
      const mockProject = generateMockProject(
        idea,
        platform as Platform,
        tone as Tone,
        Number(duration) as DurationOption,
        language,
        sanitizedCustom
      );
      return res.json(mockProject);
    }

    // Live AI generation with Gemini 3.8 Flash
    const prompt = `You are a world-class viral short-form video creator and scriptwriter for ${platform.toUpperCase()}.
Create a complete, production-ready short-form video package based on this creator's idea:
Idea: "${idea}"
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

    res.json(project);
  } catch (error) {
    console.error('Error generating project:', error);
    // Graceful fallback to mock templates if Gemini rate-limited or transient error
    const fallback = generateMockProject(
      req.body.idea || 'Content Idea',
      (req.body.platform as Platform) || 'tiktok',
      (req.body.tone as Tone) || 'viral-hype',
      (Number(req.body.duration) as DurationOption) || 30,
      req.body.language || 'en',
      typeof req.body.customInstructions === 'string' ? req.body.customInstructions : undefined
    );
    fallback.modelUsed = 'Demo Engine (Fallback on Gemini Error)';
    res.json(fallback);
  }
});

// 3. Quick edits endpoint
app.post('/api/quick-edit', async (req, res) => {
  try {
    const { action, currentProject, targetTone, customInstruction } = req.body as QuickEditRequest;

    if (!currentProject) {
      return res.status(400).json({ error: 'currentProject is required' });
    }

    if (!aiClient) {
      // In-memory smart quick edits
      const updated = { ...currentProject, updatedAt: new Date().toISOString() };
      if (action === 'punch-hook') {
        updated.hooks = updated.hooks.map((h, i) => ({
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
      return res.json(updated);
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

    res.json(merged);
  } catch (error) {
    console.error('Quick edit error:', error);
    res.status(500).json({ error: 'Failed to process quick edit' });
  }
});

// Dev server or static files setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const http = await import('http');
  const server = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`FRAME server is live on http://${HOST}:${PORT}`);
  });
}

startServer();
