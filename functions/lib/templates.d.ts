import type { VideoProject, Platform, Tone, DurationOption } from './types';
export declare const PLATFORM_INFO: Record<Platform, {
    label: string;
    iconName: string;
    maxChars: number;
    optimalDuration: string;
    vibe: string;
}>;
export declare const TONE_LABELS: Record<Tone, {
    label: string;
    description: string;
}>;
export declare const AVAILABLE_LANGUAGES: {
    code: string;
    name: string;
    flag: string;
}[];
export declare function generateMockProject(idea: string, platform: Platform, tone: Tone, duration: DurationOption, language?: string, customInstructions?: string): VideoProject;
