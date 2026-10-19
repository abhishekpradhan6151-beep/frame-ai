import express, { Request, Response } from 'express';
import fs from 'fs';
import {
  getStatus,
  getZipFilePath,
  processGeneration,
  processQuickEdit,
  sanitizeError,
} from './geminiService';

export const app = express();

// Allowed origins for CORS: production Vercel frontend, preview domains, and local development
const allowedOrigins = [
  'https://frame-ai-tau.vercel.app',
  /^https:\/\/frame-[a-z0-9-]+-jacob14-d501\.vercel\.app$/,
  'http://localhost:3000',
  'http://localhost:5173',
];

// Native robust CORS middleware without third-party dependency
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin as string | undefined;

  if (origin) {
    const isAllowed = allowedOrigins.some((allowed) =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
    // Allow matched origin or fallback to allow other preview deployments
    res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  return next();
});

app.use(express.json({ limit: '10mb' }));

// Helper router to preserve both `/` and `/api` paths
const apiRouter = express.Router();

// 1. Health check & status endpoint (Lightweight, zero Gemini SDK initialization)
apiRouter.get('/status', (req: Request, res: Response) => {
  const status = getStatus();
  return res.status(200).json(status);
});

// 2. Video package generation endpoint
apiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await processGeneration(body);
    return res.status(result.statusCode || 200).json(result.project);
  } catch (error: any) {
    const message = sanitizeError(error);
    console.error('API /api/generate Error:', message);
    return res.status(500).json({ error: message });
  }
});

// 3. Quick Edit script refinement endpoint
apiRouter.post('/quick-edit', async (req: Request, res: Response) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const updated = await processQuickEdit(body);
    return res.status(200).json(updated);
  } catch (error: any) {
    const message = sanitizeError(error);
    console.error('API /api/quick-edit Error:', message);
    return res.status(500).json({ error: message });
  }
});

// 4. Download project ZIP archive
const handleDownloadZip = (req: Request, res: Response) => {
  const zipPath = getZipFilePath();
  if (!zipPath || !fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'Archive not found' });
  }

  const stat = fs.statSync(zipPath);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="frame-ai.zip"');
  res.setHeader('Content-Length', stat.size);
  return res.sendFile(zipPath);
};

apiRouter.get('/download-zip', handleDownloadZip);
apiRouter.post('/download-zip', handleDownloadZip);

// Mount router under both '/api' and '/' so callers can request either /api/status or /status
app.use('/api', apiRouter);
app.use('/', apiRouter);
