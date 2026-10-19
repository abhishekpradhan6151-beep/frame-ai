import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import fs from 'fs';
import path from 'path';

describe('Firebase Cloud Functions 2nd Gen Backend Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(async () => {
    // Dynamically load the compiled Express app from functions/lib/app.js
    // @ts-ignore
    const appModule = await import('../functions/lib/app.js');
    const expressApp = appModule.app || appModule.default || appModule;
    expect(expressApp).toBeDefined();

    await new Promise<void>((resolve) => {
      server = http.createServer(expressApp);
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    process.env.GEMINI_API_KEY = originalApiKey;
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('GET /api/status returns 200 with health and model info', async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('liveAiAvailable');
    expect(data).toHaveProperty('model', 'gemini-3.8-flash');
  });

  it('GET /status (without /api prefix) also returns 200', async () => {
    const res = await fetch(`${baseUrl}/status`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('model', 'gemini-3.8-flash');
  });

  it('POST /api/generate with preferDemo=true returns deterministic video project', async () => {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: 'Cloud Functions Architecture for Short Form Video Creators',
        platform: 'tiktok',
        tone: 'viral-hype',
        duration: 30,
        language: 'en',
        preferDemo: true,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBeDefined();
    expect(data.hooks.length).toBe(5);
    expect(data.scenes.length).toBe(4);
    expect(data.captions.length).toBe(3);
    expect(data.ctas.length).toBe(3);
    expect(data.isAiGenerated).toBe(false);
  });

  it('POST /api/generate with live AI and no GEMINI_API_KEY fails with explicit error (no silent mock)', async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: 'Live AI request requiring server key',
        platform: 'reels',
        tone: 'educational-authority',
        duration: 30,
        language: 'en',
        preferDemo: false,
      }),
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('GEMINI_API_KEY');
  });

  it('POST /api/generate returns 500 when input validation fails', async () => {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: '  ',
      }),
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('idea is required');
  });

  it('POST /api/quick-edit applies action correctly', async () => {
    const initialProject = {
      id: 'proj_test',
      title: 'Original Title',
      idea: 'Original Idea',
      platform: 'tiktok' as const,
      tone: 'casual-relatable' as const,
      targetDuration: 30 as const,
      language: 'en',
      selectedHookId: 'h_1',
      hooks: [{ id: 'h_1', angle: 'curiosity' as const, label: 'Curiosity', text: 'Original Hook', viralityScore: 90, retentionTip: 'Tip' }],
      scenes: [{ id: 's_1', sceneNumber: 1, durationSeconds: 5, visualCue: 'Cue', audioVoiceover: 'Voice', onScreenText: 'Text' }],
      captions: [],
      hashtags: [],
      ctas: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiGenerated: false,
    };

    const res = await fetch(`${baseUrl}/api/quick-edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'punch-hook',
        currentProject: initialProject,
        preferDemo: true,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hooks[0].text).toContain('STOP');
  });

  it('GET /api/download-zip returns valid application/zip headers', async () => {
    const res = await fetch(`${baseUrl}/api/download-zip`);
    // If frame-ai.zip is present in workspace root or public/, it returns 200 with zip headers
    if (res.status === 200) {
      expect(res.headers.get('content-type')).toContain('application/zip');
      expect(res.headers.get('content-disposition')).toContain('attachment; filename="frame-ai.zip"');
    } else {
      expect(res.status).toBe(404);
    }
  });

  it('CORS preflight (OPTIONS) handles production and preview origins', async () => {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://frame-ai-tau.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    expect([200, 204]).toContain(res.status);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://frame-ai-tau.vercel.app');
  });

  it('Firebase Secret Manager configuration binds GEMINI_API_KEY without exposing value', async () => {
    const indexSource = fs.readFileSync(path.resolve(process.cwd(), 'functions/src/index.ts'), 'utf-8');
    expect(indexSource).toContain("defineSecret('GEMINI_API_KEY')");
    expect(indexSource).toContain('secrets: [geminiApiKey]');
    expect(indexSource).not.toMatch(/AIza[0-9A-Za-z\-_]{35}/);
  });
});
