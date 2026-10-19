import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { app } from './app';

// Define the server-side secret using Firebase Secret Manager
const geminiApiKey = defineSecret('GEMINI_API_KEY');

export { app };

// Export the 2nd Gen HTTPS Cloud Function
export const api = onRequest(
  {
    region: 'us-central1',
    cors: false, // Handled by express cors middleware in app.ts with preflight handling
    secrets: [geminiApiKey],
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  app
);
