import { describe, it, expect } from 'vitest';
import {
  getStatus,
  getZipFilePath,
  processGeneration,
  processQuickEdit,
} from '../src/server/geminiService';
import statusHandler from '../api/status';
import generateHandler from '../api/generate';
import quickEditHandler from '../api/quick-edit';
import downloadZipHandler from '../api/download-zip';

// Helper to create mocked Vercel/Node request and response
function createMockReqRes(options: {
  method?: string;
  body?: any;
  query?: any;
}) {
  const req = {
    method: options.method || 'GET',
    body: options.body || {},
    query: options.query || {},
    headers: {},
  };

  let statusCode = 200;
  let jsonBody: any = null;
  let sentData: any = null;
  const headers: Record<string, string | string[] | number> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      jsonBody = data;
      return res;
    },
    send(data: any) {
      sentData = data;
      return res;
    },
    setHeader(key: string, value: string | string[] | number) {
      headers[key] = value;
      return res;
    },
    _getStatusCode: () => statusCode,
    _getJson: () => jsonBody,
    _getSentData: () => sentData,
    _getHeaders: () => headers,
  };

  return { req, res };
}

describe('FRAME Server & Shared Gemini Service', () => {
  it('getStatus returns environment, model, and availability flag', () => {
    const status = getStatus();
    expect(status).toHaveProperty('model', 'gemini-3.8-flash');
    expect(status).toHaveProperty('environment');
    expect(typeof status.liveAiAvailable).toBe('boolean');
  });

  it('getZipFilePath successfully locates frame-ai.zip in project', () => {
    const zipPath = getZipFilePath();
    expect(zipPath).not.toBeNull();
    expect(typeof zipPath).toBe('string');
    expect(zipPath).toContain('frame-ai.zip');
  });

  it('processGeneration validates required idea field', async () => {
    await expect(
      processGeneration({ idea: '  ' })
    ).rejects.toThrow('idea is required');
  });

  it('processGeneration in demo mode produces structured VideoProject matching schema', async () => {
    const result = await processGeneration({
      idea: 'How to build high-converting short-form hooks',
      platform: 'reels',
      tone: 'casual-relatable',
      duration: 30,
      language: 'en',
      preferDemo: true,
      customInstructions: 'Keep tone energetic and fast-paced',
    });

    expect(result.statusCode).toBe(200);
    const proj = result.project;
    expect(proj.title).toBeTruthy();
    expect(proj.platform).toBe('reels');
    expect(proj.tone).toBe('casual-relatable');
    expect(proj.targetDuration).toBe(30);
    expect(proj.hooks.length).toBe(5);
    expect(proj.scenes.length).toBe(4);
    expect(proj.captions.length).toBe(3);
    expect(proj.ctas.length).toBe(3);
    expect(proj.customInstructions).toBe('Keep tone energetic and fast-paced');
  });

  it('processQuickEdit performs smart in-memory script updates when live AI is absent or in demo', async () => {
    const initial = await processGeneration({
      idea: 'Test Project for quick edit',
      platform: 'tiktok',
      tone: 'viral-hype',
      duration: 30,
      language: 'en',
      preferDemo: true,
    });

    const punched = await processQuickEdit({
      action: 'punch-hook',
      currentProject: initial.project,
      preferDemo: true,
    });

    expect(punched.hooks[0].text).toContain('🚨 STOP WHAT YOU\'RE DOING');

    const shortened = await processQuickEdit({
      action: 'shorten-script',
      currentProject: punched,
      preferDemo: true,
    });

    expect(shortened.targetDuration).toBe(15);
    expect(shortened.scenes.length).toBe(3);
  });
});

describe('Vercel Serverless Function Endpoints (/api)', () => {
  it('GET /api/status responds with 200 and status contract', async () => {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await statusHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJson()).toHaveProperty('model', 'gemini-3.8-flash');
    expect(res._getJson()).toHaveProperty('liveAiAvailable');
  });

  it('POST /api/status rejects with 405 Method Not Allowed', async () => {
    const { req, res } = createMockReqRes({ method: 'POST' });
    await statusHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJson()).toHaveProperty('error', 'Method Not Allowed');
  });

  it('POST /api/generate responds with 200 for valid demo request', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        idea: 'Vercel Serverless Function test idea',
        platform: 'shorts',
        tone: 'educational-authority',
        duration: 60,
        preferDemo: true,
      },
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = res._getJson();
    expect(body.platform).toBe('shorts');
    expect(body.hooks.length).toBe(5);
    expect(body.scenes.length).toBe(6);
  });

  it('POST /api/generate returns 500 when input validation fails', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { idea: '' },
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJson().error).toContain('idea is required');
  });

  it('POST /api/quick-edit responds with 200 for valid edit action', async () => {
    const initial = await processGeneration({
      idea: 'Quick edit serverless test',
      platform: 'linkedin',
      tone: 'storyteller',
      duration: 30,
      preferDemo: true,
    });

    const { req, res } = createMockReqRes({
      method: 'POST',
      body: {
        action: 'change-tone',
        currentProject: initial.project,
        targetTone: 'controversial-take',
        preferDemo: true,
      },
    });

    await quickEditHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJson().tone).toBe('controversial-take');
  });

  it('GET /api/download-zip serves the zip archive with proper headers', async () => {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await downloadZipHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['Content-Type']).toBe('application/zip');
    expect(res._getHeaders()['Content-Disposition']).toContain('frame-ai.zip');
    expect(res._getSentData()).toBeInstanceOf(Buffer);
  });

  it('POST /api/download-zip also serves the zip archive', async () => {
    const { req, res } = createMockReqRes({ method: 'POST' });
    await downloadZipHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()['Content-Type']).toBe('application/zip');
  });
});
