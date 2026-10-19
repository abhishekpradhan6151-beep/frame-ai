"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.app = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("./app");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return app_1.app; } });
// Define the server-side secret using Firebase Secret Manager
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
// Export the 2nd Gen HTTPS Cloud Function
exports.api = (0, https_1.onRequest)({
    region: 'us-central1',
    cors: false, // Handled by express cors middleware in app.ts with preflight handling
    secrets: [geminiApiKey],
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
}, app_1.app);
//# sourceMappingURL=index.js.map