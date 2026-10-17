import fs from 'fs';
import { getZipFilePath } from '../src/server/geminiService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const zipPath = getZipFilePath();
  if (!zipPath || !fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'Archive not found' });
  }

  const fileBuffer = fs.readFileSync(zipPath);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="frame-ai.zip"');
  res.setHeader('Content-Length', fileBuffer.length);
  return res.status(200).send(fileBuffer);
}
