"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const geminiService_1 = require("./geminiService");
// Define the server-side secret using Firebase Secret Manager
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
const app = (0, express_1.default)();
// Allowed origins for CORS: production Vercel frontend, preview domains, and local development
const allowedOrigins = [
    'https://frame-ai-tau.vercel.app',
    /^https:\/\/frame-[a-z0-9-]+-jacob14-d501\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5173',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.some((allowed) => allowed instanceof RegExp ? allowed.test(origin) : allowed === origin);
        if (isAllowed) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive fallback to support all Vercel preview deployments
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Helper router to preserve both `/` and `/api` paths
const apiRouter = express_1.default.Router();
// 1. Health check & status endpoint (Lightweight, zero Gemini SDK initialization)
apiRouter.get('/status', (req, res) => {
    const status = (0, geminiService_1.getStatus)();
    return res.status(200).json(status);
});
// 2. Video package generation endpoint
apiRouter.post('/generate', async (req, res) => {
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const result = await (0, geminiService_1.processGeneration)(body);
        return res.status(result.statusCode || 200).json(result.project);
    }
    catch (error) {
        const message = (0, geminiService_1.sanitizeError)(error);
        console.error('API /api/generate Error:', message);
        return res.status(500).json({ error: message });
    }
});
// 3. Quick Edit script refinement endpoint
apiRouter.post('/quick-edit', async (req, res) => {
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
        const updated = await (0, geminiService_1.processQuickEdit)(body);
        return res.status(200).json(updated);
    }
    catch (error) {
        const message = (0, geminiService_1.sanitizeError)(error);
        console.error('API /api/quick-edit Error:', message);
        return res.status(500).json({ error: message });
    }
});
// 4. Download project ZIP archive
const handleDownloadZip = (req, res) => {
    const zipPath = (0, geminiService_1.getZipFilePath)();
    if (!zipPath || !fs_1.default.existsSync(zipPath)) {
        return res.status(404).json({ error: 'Archive not found' });
    }
    const stat = fs_1.default.statSync(zipPath);
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
// Export the 2nd Gen HTTPS Cloud Function
exports.api = (0, https_1.onRequest)({
    region: 'us-central1',
    cors: false, // Handled by express cors middleware with preflight handling
    secrets: [geminiApiKey],
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
}, app);
//# sourceMappingURL=index.js.map