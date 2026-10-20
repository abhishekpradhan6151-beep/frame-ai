import { processGeneration, sanitizeError } from './_lib/geminiService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const result = await processGeneration(body);
    return res.status(result.statusCode || 200).json(result.project);
  } catch (error: any) {
    const statusCode = error?.statusCode || (typeof error?.status === 'number' ? error.status : 500);
    const message = sanitizeError(error);
    if (error?.retryAfterSeconds) {
      res.setHeader('Retry-After', String(error.retryAfterSeconds));
    }
    console.error(`API /api/generate Error [HTTP ${statusCode}]:`, message);
    return res.status(statusCode).json({
      error: message,
      category: error?.category || 'ERROR',
      retryAfterSeconds: error?.retryAfterSeconds || null,
    });
  }
}
