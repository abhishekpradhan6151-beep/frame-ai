import express from 'express';
import {
  getStatus,
  getZipFilePath,
  processGeneration,
  processQuickEdit,
} from './api/_lib/geminiService.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// 1. Status endpoint
app.get('/api/status', (req, res) => {
  res.json(getStatus());
});

// Download ZIP endpoint (supports GET and POST)
const handleDownloadZip = (req: express.Request, res: express.Response) => {
  const zipPath = getZipFilePath();
  if (zipPath) {
    res.download(zipPath, 'frame-ai.zip');
  } else {
    res.status(404).json({ error: 'Archive not found' });
  }
};
app.get('/api/download-zip', handleDownloadZip);
app.post('/api/download-zip', handleDownloadZip);

// 2. Full project generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const result = await processGeneration(req.body);
    res.status(result.statusCode || 200).json(result.project);
  } catch (error: any) {
    const statusCode = error?.statusCode || (typeof error?.status === 'number' ? error.status : 500);
    console.error(`Error generating project [HTTP ${statusCode}]:`, error);
    res.status(statusCode).json({ error: error?.message || 'Failed to generate project', category: error?.category || 'ERROR' });
  }
});

// 3. Quick edits endpoint
app.post('/api/quick-edit', async (req, res) => {
  try {
    const updated = await processQuickEdit(req.body);
    res.json(updated);
  } catch (error: any) {
    const statusCode = error?.statusCode || (typeof error?.status === 'number' ? error.status : 500);
    console.error(`Quick edit error [HTTP ${statusCode}]:`, error);
    res.status(statusCode).json({ error: error?.message || 'Failed to process quick edit', category: error?.category || 'ERROR' });
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
