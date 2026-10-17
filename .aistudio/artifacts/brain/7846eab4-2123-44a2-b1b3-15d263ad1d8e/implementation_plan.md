# FRAME Backend — Vercel Serverless Architecture & Deployment Plan

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan resolves the Vercel backend deployment gap identified in the diagnostic audit. It extracts core backend AI handlers into shared server-only modules so that both the standalone Express server (`server.ts`) and Vercel serverless functions (`api/*.ts`) execute identical logic with zero code duplication.

- **Vercel Routing Strategy**: Implement native Vercel serverless endpoints in the standard `/api` directory (`api/generate.ts`, `api/quick-edit.ts`, `api/status.ts`, `api/download-zip.ts`). This works out-of-the-box on Vercel without third-party wrapper packages or complex rewrites.
- **Local Development Preservation**: Keep `server.ts` as the primary entry point for `npm run dev` (`tsx server.ts`). Both environments will import from a single shared server module (`src/server/geminiService.ts`).
- **Error Transparency**: Fix the silent fallback behavior so that when a user requests live AI generation (`preferDemoMode: false`), backend failures (HTTP 404, 500, rate limits) surface a clear warning to the user rather than silently masquerading mock templates as Gemini AI output.
- **Gemini Model**: Retain `gemini-3.8-flash` consistently across all endpoints.

---

## 1. Overview & Core Concept

FRAME currently runs as an Express monolithic server (`server.ts`) that hosts both backend API routes (`/api/*`) and Vite frontend middlewares. When deployed to Vercel, Vercel only executes `vite build` and serves static assets from `dist/`, leaving API endpoints unrouted (returning 404 or HTML fallback).

This plan introduces native Vercel serverless functions that share a single, server-only AI logic layer with `server.ts`, ensuring parity across development, Cloud Run, and Vercel hosting.

---

## 2. System Architecture & Request Lifecycle

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19 SPA)                         │
│   src/services/api.ts  ───►  fetch('/api/generate', '/api/status', ...) │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
         Local / Cloud Run                      Vercel Serverless
        (npm run dev / start)                 (Production Deployment)
                   ▼                                 ▼
         ┌───────────────────┐             ┌───────────────────┐
         │     server.ts     │             │      api/*.ts     │
         │  (Express Server) │             │(Vercel Functions) │
         └─────────┬─────────┘             └─────────┬─────────┘
                   │                                 │
                   └────────────────┬────────────────┘
                                    │
                                    ▼
         ┌─────────────────────────────────────────────────────┐
         │             src/server/geminiService.ts             │
         │   • Shared Google GenAI client initialization       │
         │   • Unified JSON Schemas & prompt engineering       │
         │   • GEMINI_API_KEY confinement (server-only)        │
         │   • gemini-3.8-flash model integration              │
         └──────────────────────────┬──────────────────────────┘
                                    │
                                    ▼
                         Google Gemini 3.8 Flash
```

---

## 3. Route Contracts & Endpoints

### 1. `POST /api/generate`
* **Request Contract**:
  ```typescript
  {
    idea: string;
    platform?: 'tiktok' | 'reels' | 'shorts' | 'linkedin';
    tone?: 'viral-hype' | 'casual-relatable' | 'educational-authority' | 'storyteller' | 'controversial-take' | 'high-energy';
    duration?: 15 | 30 | 60 | 90;
    language?: string;
    preferDemo?: boolean;
    customInstructions?: string;
  }
  ```
* **Validation**:
  - `idea`: String, required, trimmed, min 3 chars.
  - `customInstructions`: Trimmed and sliced to 2,000 characters.
* **Response**:
  - `VideoProject` matching current schema: `id`, `title`, `platform`, `tone`, `targetDuration`, `hooks` (5 items), `scenes` (with camera cues, voiceover, text overlays), `captions` (3 variations), `hashtags`, `ctas`, `isAiGenerated: true`, `modelUsed: 'gemini-3.8-flash'`.
  - HTTP 200 on success.
  - HTTP 500/503 with explicit error JSON if Gemini fails and `preferDemo` was false.

### 2. `POST /api/quick-edit`
* **Request Contract**:
  ```typescript
  {
    action: 'punch-hook' | 'shorten-script' | 'change-tone' | 'custom-tweak';
    currentProject: VideoProject;
    targetTone?: Tone;
    customInstruction?: string;
  }
  ```
* **Response**: Updated `VideoProject` with applied modifications.

### 3. `GET /api/status`
* **Request Contract**: None.
* **Response**:
  ```json
  {
    "liveAiAvailable": true,
    "model": "gemini-3.8-flash",
    "environment": "production"
  }
  ```
* **Security**: Exposes only boolean availability flag; never exposes the key or token string.

### 4. `GET` & `POST` `/api/download-zip`
* **Request Contract**: None.
* **Response**: Serves `frame-ai.zip` as `application/zip` with `Content-Disposition: attachment; filename="frame-ai.zip"`.
* **Path Resolution**: Looks in root `frame-ai.zip` or `public/frame-ai.zip`. Supports both `GET` and `POST` methods for compatibility.

---

## 4. Preventing Silent Mock Fallbacks in Production

Currently, `src/services/api.ts` has blanket `catch` blocks that silently swallow network errors and HTTP 404/500 responses, quietly substituting client-side mock templates.

### Proposed Improvement:
1. **Explicit Intent Check in `src/services/api.ts`**:
   - If `req.preferDemo === true`: Returning deterministic blueprints is user-selected behavior.
   - If `req.preferDemo === false`: If the network or backend returns an error (404, 500, 503), do **not** silently return mock data. Instead, pass the error back or provide a structured status object so `App.tsx` can display an error toast (e.g., *"AI Generation Service Unavailable — Check API Configuration"*), with an option for the user to retry or switch to Demo Mode.
2. **Explicit HTTP Error Codes in Server Routes**:
   - When Gemini throws an error (quota, network, bad key), return HTTP 502/503 with `{ error: string }` instead of HTTP 200 mock data.

---

## 5. Security & Secret Confinement

- `GEMINI_API_KEY` will strictly reside in server-side execution environments (`process.env.GEMINI_API_KEY`).
- Neither Vite client builds nor public bundles will import from `src/server/*`.
- Vercel users can safely add `GEMINI_API_KEY` to the Vercel Project Settings (Environment Variables), where Vercel serverless functions in `/api` will access it via standard `process.env`.
- Added `vercel.json` will specify clean routing and security headers.

---

## 6. Implementation Scope (Proposed Files)

1. **`src/server/geminiService.ts`** *(New)*:
   - Encapsulates Gemini client initialization, structured prompt formatting, JSON schemas, quick-edit prompts, and fallback logic.
2. **`api/status.ts`** *(New)*:
   - Vercel serverless function handling `GET /api/status`.
3. **`api/generate.ts`** *(New)*:
   - Vercel serverless function handling `POST /api/generate`.
4. **`api/quick-edit.ts`** *(New)*:
   - Vercel serverless function handling `POST /api/quick-edit`.
5. **`api/download-zip.ts`** *(New)*:
   - Vercel serverless function handling `GET / POST /api/download-zip`.
6. **`server.ts`** *(Modified)*:
   - Refactored to delegate route handling to the shared `geminiService`, ensuring zero code drift between local Express and Vercel serverless.
7. **`vercel.json`** *(New)*:
   - Configures clean rewrite rules and serverless function memory/timeout defaults.
8. **`src/services/api.ts`** *(Modified)*:
   - Updates error handling so live AI failures are surfaced rather than silently converted into mock projects.
9. **`test/server_routes.test.ts`** *(New)*:
   - Unit and integration tests validating status checks, generator contracts, error responses, and mock logic.

---

## 7. Risks & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Vercel Serverless Cold Starts** | Latency on first generation request | `@google/genai` is lightweight; client instance is initialized in module scope and reused across invocations. |
| **Local Express vs Vercel Drift** | Bugs appearing only in one environment | Both environments call the identical `src/server/geminiService.ts` core functions. |
| **Missing Zip File in Serverless Bundle** | Download zip endpoint fails on Vercel | Verify `frame-ai.zip` path resolution checks root and `public/`, or include in `includeFiles` in `vercel.json`. |
| **Vite Static Asset Collisions** | SPA router catching `/api/*` requests | Explicit `/api/(.*)` rule in `vercel.json` ensures API routes take priority before SPA catch-all rewrites. |

---

## 8. Verification Steps

1. **Local Express Verification**:
   - Run `npm test` to ensure 100% of existing unit tests pass.
   - Run `compile_applet` and `lint_applet` to confirm no TypeScript or Vite bundle issues.
   - Test `curl -s http://localhost:3000/api/status` and `curl -X POST http://localhost:3000/api/generate` with both `preferDemo: true` and `preferDemo: false`.
2. **Vercel Function Parity Test**:
   - Add automated test executing the Vercel handler functions directly using mocked request/response objects.
   - Verify request payload validation, error status codes, and schema adherence.
3. **Failure Transparency Verification**:
   - Simulate a network or backend failure; verify the UI informs the user rather than silently serving mock data.
