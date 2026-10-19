import type { GoogleGenAI } from '@google/genai';
import type { VideoProject, Platform, Tone, DurationOption, QuickEditRequest } from './types';
export declare function getAiClient(): Promise<GoogleGenAI | null>;
export declare function sanitizeError(error: any): string;
export declare function isTransientError(error: any): boolean;
export declare function extractRetryDelay(error: any): number | null;
export interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
}
export declare function executeWithRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
export declare function getStatus(): {
    liveAiAvailable: boolean;
    model: string;
    environment: string;
};
export declare function getZipFilePath(): string | null;
export interface GenerationInput {
    idea: string;
    platform?: Platform;
    tone?: Tone;
    duration?: DurationOption;
    language?: string;
    preferDemo?: boolean;
    customInstructions?: string;
}
export declare function processGeneration(input: GenerationInput): Promise<{
    project: VideoProject;
    statusCode: number;
}>;
export declare function processQuickEdit(body: QuickEditRequest): Promise<{
    scenes: any;
    hooks: any;
    tone: Tone;
    updatedAt: string;
    id: string;
    title: string;
    idea: string;
    platform: Platform;
    targetDuration: DurationOption;
    language: string;
    selectedHookId: string;
    captions: import("./types").CaptionVariation[];
    hashtags: string[];
    ctas: import("./types").CtaVariation[];
    createdAt: string;
    isAiGenerated: boolean;
    modelUsed?: string;
    customInstructions?: string;
}>;
