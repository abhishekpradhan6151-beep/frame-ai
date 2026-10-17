export type Platform = 'tiktok' | 'reels' | 'shorts' | 'linkedin';

export type Tone = 
  | 'viral-hype'
  | 'casual-relatable'
  | 'educational-authority'
  | 'storyteller'
  | 'controversial-take'
  | 'high-energy';

export type DurationOption = 15 | 30 | 60 | 90;

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export interface Hook {
  id: string;
  angle: 'curiosity' | 'viral-shock' | 'relatable-story' | 'hot-take' | 'statistic' | 'question';
  label: string;
  text: string;
  viralityScore: number;
  retentionTip: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  durationSeconds: number;
  visualCue: string;
  audioVoiceover: string;
  onScreenText: string;
  bRollPrompt?: string;
}

export interface CaptionVariation {
  id: string;
  style: 'short-punchy' | 'storytelling' | 'seo-keyword-rich';
  title: string;
  text: string;
}

export interface CtaVariation {
  id: string;
  type: 'comment' | 'save-share' | 'follow' | 'link';
  title: string;
  text: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface VideoProject {
  id: string;
  title: string;
  idea: string;
  platform: Platform;
  tone: Tone;
  targetDuration: DurationOption;
  language: string;
  selectedHookId: string;
  hooks: Hook[];
  scenes: ScriptScene[];
  captions: CaptionVariation[];
  hashtags: string[];
  ctas: CtaVariation[];
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  modelUsed?: string;
  customInstructions?: string;
}

export interface UserSettings {
  defaultPlatform: Platform;
  defaultTone: Tone;
  defaultDuration: DurationOption;
  defaultLanguage: string;
  preferDemoMode: boolean;
  autoSave: boolean;
  teleprompterSpeed: number;
  teleprompterFontSize: number;
  themeMode?: ThemeMode;
}

export interface GenerateRequest {
  idea: string;
  platform: Platform;
  tone: Tone;
  duration: DurationOption;
  language: string;
  preferDemo?: boolean;
  customInstructions?: string;
}

export interface QuickEditRequest {
  projectId?: string;
  action: 'punch-hook' | 'change-tone' | 'shorten-script' | 'expand-script' | 'add-visuals' | 'custom';
  currentProject: VideoProject;
  targetTone?: Tone;
  customInstruction?: string;
  targetSection?: 'hooks' | 'scenes' | 'captions' | 'ctas';
  preferDemo?: boolean;
}
