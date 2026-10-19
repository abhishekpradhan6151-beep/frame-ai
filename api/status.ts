import { getStatus } from './_lib/geminiService.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const status = getStatus();
  return res.status(200).json(status);
}
