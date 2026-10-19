import { processQuickEdit, sanitizeError } from './_lib/geminiService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const updated = await processQuickEdit(body);
    return res.status(200).json(updated);
  } catch (error: any) {
    const message = sanitizeError(error);
    console.error('API /api/quick-edit Error:', message);
    return res.status(500).json({ error: message });
  }
}
