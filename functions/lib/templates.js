"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_LANGUAGES = exports.TONE_LABELS = exports.PLATFORM_INFO = void 0;
exports.generateMockProject = generateMockProject;
exports.PLATFORM_INFO = {
    tiktok: {
        label: 'TikTok',
        iconName: 'Music2',
        maxChars: 2200,
        optimalDuration: '15-30s',
        vibe: 'High energy, authentic, immediate hook, bold on-screen subtitles',
    },
    reels: {
        label: 'Instagram Reels',
        iconName: 'Instagram',
        maxChars: 2200,
        optimalDuration: '30-45s',
        vibe: 'Aesthetic visuals, crisp audio, relatable storytelling, save-worthy',
    },
    shorts: {
        label: 'YouTube Shorts',
        iconName: 'Youtube',
        maxChars: 500,
        optimalDuration: '45-60s',
        vibe: 'Curiosity gap, retention loops, informative fast-cuts, seamless replay',
    },
    linkedin: {
        label: 'LinkedIn Video',
        iconName: 'Linkedin',
        maxChars: 3000,
        optimalDuration: '60-90s',
        vibe: 'Executive insight, actionable business framework, professional framing',
    },
};
exports.TONE_LABELS = {
    'viral-hype': {
        label: 'Viral & Hyped',
        description: 'Fast-paced, bold claims, curiosity gap, impossible-to-scroll-past pacing',
    },
    'casual-relatable': {
        label: 'Casual & Relatable',
        description: 'Conversational, "friend-to-friend" honesty, vulnerable, zero-fluff',
    },
    'educational-authority': {
        label: 'Authoritative & Teaching',
        description: 'Step-by-step masterclass, data-backed, distilled expertise',
    },
    'storyteller': {
        label: 'Narrative & Story',
        description: 'Hook with the climax first, tension arc, emotional payoff',
    },
    'controversial-take': {
        label: 'Controversial Hot Take',
        description: 'Challenging mainstream dogmas, provocative question, debate starter',
    },
    'high-energy': {
        label: 'Ultra High Energy',
        description: 'Rapid-fire delivery, motivational punch, punchy sound design',
    },
};
exports.AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English (US/UK)', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
    { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
    { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
    { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
    { code: 'pt', name: 'Portuguese (Português)', flag: '🇧🇷' },
];
function generateMockProject(idea, platform, tone, duration, language = 'en', customInstructions) {
    const cleanIdea = idea.trim() || 'How to create 10x content in 1 hour a week';
    const id = 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const now = new Date().toISOString();
    const hooks = [
        {
            id: 'h_1',
            angle: 'curiosity',
            label: 'The Hidden Trap',
            text: `99% of creators fail at "${cleanIdea}" because they do this in reverse.`,
            viralityScore: 96,
            retentionTip: 'Show hand gesture stopping camera or freeze frame on first syllable.',
        },
        {
            id: 'h_2',
            angle: 'hot-take',
            label: 'Contrarian Take',
            text: `Unpopular opinion: Everything you've been taught about "${cleanIdea}" is completely outdated.`,
            viralityScore: 92,
            retentionTip: 'Deliver with intense, deadpan eye contact directly to the lens.',
        },
        {
            id: 'h_3',
            angle: 'statistic',
            label: 'The Proof Point',
            text: `I spent 30 days analyzing "${cleanIdea}" — and this one tweak changed everything.`,
            viralityScore: 89,
            retentionTip: 'Quickly flash proof screenshot or stopwatch on screen for 0.4s.',
        },
        {
            id: 'h_4',
            angle: 'relatable-story',
            label: 'Relatable Story',
            text: `If you feel overwhelmed by "${cleanIdea}", stop what you're doing and watch this for 30 seconds.`,
            viralityScore: 88,
            retentionTip: 'Start mid-motion (walking, setting down a coffee mug).',
        },
        {
            id: 'h_5',
            angle: 'viral-shock',
            label: 'The Cheat Code',
            text: `Here is the exact 3-step cheat code for "${cleanIdea}" that nobody is sharing publicly.`,
            viralityScore: 94,
            retentionTip: 'Display 3 fingers counting down in synced audio rhythm.',
        },
    ];
    // Divide target duration into scenes
    const sceneCount = duration === 15 ? 3 : duration === 30 ? 4 : duration === 60 ? 6 : 8;
    const avgSceneDuration = Math.round(duration / sceneCount);
    const scenes = [
        {
            id: 'sc_1',
            sceneNumber: 1,
            durationSeconds: Math.min(3, avgSceneDuration),
            visualCue: 'Punch in zoom to medium close-up. Eyes level with upper third grid line. High contrast lighting.',
            audioVoiceover: hooks[0].text,
            onScreenText: 'WAIT, STOP SCROLLING ⚠️',
            bRollPrompt: 'Close up eye blink or phone notification ping effect.',
        },
        {
            id: 'sc_2',
            sceneNumber: 2,
            durationSeconds: avgSceneDuration,
            visualCue: 'Step back to wide view, point to the side where text overlay animates in.',
            audioVoiceover: `Most people think "${cleanIdea}" requires hours of grinding or expensive gear. That is completely false.`,
            onScreenText: 'THE #1 COMMON MISTAKE ❌',
            bRollPrompt: 'Rapid montage of stressful workspace versus streamlined workflow.',
        },
        {
            id: 'sc_3',
            sceneNumber: 3,
            durationSeconds: avgSceneDuration,
            visualCue: 'Cut to over-the-shoulder POV or screen screencast demonstrating the core principle.',
            audioVoiceover: `Rule number one: eliminate friction before you optimize. When you structure "${cleanIdea}" systematically, momentum carries you.`,
            onScreenText: 'STEP 1: THE CORE SYSTEM ⚡️',
            bRollPrompt: 'Clean minimalist app interface with slick cursor click interaction.',
        },
        {
            id: 'sc_4',
            sceneNumber: 4,
            durationSeconds: avgSceneDuration,
            visualCue: 'Dynamic camera tracking shot or fast zoom-in emphasis on the key takeaway.',
            audioVoiceover: `Step two is repetition without burnout. Lock in your workflow once, then execute without second guessing yourself.`,
            onScreenText: 'STEP 2: LOCK IN THE REPS 🔁',
            bRollPrompt: 'Calendar schedule filling up with completed green checkmarks.',
        },
    ];
    if (sceneCount >= 6) {
        scenes.push({
            id: 'sc_5',
            sceneNumber: 5,
            durationSeconds: avgSceneDuration,
            visualCue: 'Angle shift: 45-degree profile shot talking candidly.',
            audioVoiceover: `The secret separator is consistency. Don't reinvent the wheel every single morning.`,
            onScreenText: 'THE REAL SECRET 💎',
            bRollPrompt: 'Smooth slow-motion b-roll of creator putting on headphones.',
        }, {
            id: 'sc_6',
            sceneNumber: 6,
            durationSeconds: avgSceneDuration,
            visualCue: 'Face camera head-on with confident nod. Text pops on bottom half.',
            audioVoiceover: `Save this framework right now before you lose it on your feed. Drop a comment if you want the checklist.`,
            onScreenText: 'SAVE THIS FOR LATER 📌',
            bRollPrompt: 'Finger pressing the bookmark / save button animation.',
        });
    }
    if (sceneCount >= 8) {
        scenes.push({
            id: 'sc_7',
            sceneNumber: 7,
            durationSeconds: avgSceneDuration,
            visualCue: 'Step back to whiteboard or screen layout summarizing the 3 pillars.',
            audioVoiceover: `To recap: simplify your premise, automate your friction points, and ship consistently.`,
            onScreenText: 'THE 3 PILLARS SUMMARY 📊',
            bRollPrompt: 'Diagram lines connecting concepts on screen.',
        }, {
            id: 'sc_8',
            sceneNumber: 8,
            durationSeconds: avgSceneDuration,
            visualCue: 'Direct eye contact, earnest smile, hand point toward follow button.',
            audioVoiceover: `If this shifted how you think about "${cleanIdea}", tap follow and share it with a friend who is building something today.`,
            onScreenText: 'JOIN THE COMMUNITY 🚀',
            bRollPrompt: 'Creator community avatars or social profile interaction.',
        });
    }
    // Ensure scenes array exactly matches target sceneCount
    const finalScenes = scenes.slice(0, sceneCount).map((s, idx) => ({
        ...s,
        sceneNumber: idx + 1,
    }));
    const captions = [
        {
            id: 'cap_1',
            style: 'short-punchy',
            title: 'High Velocity',
            text: `Everything you need to master "${cleanIdea}" in under 60 seconds. Bookmark this so you don't lose it.`,
        },
        {
            id: 'cap_2',
            style: 'storytelling',
            title: 'Context & Value',
            text: `I spent weeks failing at "${cleanIdea}" until I realized one fundamental truth: simple beats complicated every single time. Here is the breakdown you actually need.`,
        },
        {
            id: 'cap_3',
            style: 'seo-keyword-rich',
            title: 'Algorithm & SEO Optimized',
            text: `How to optimize "${cleanIdea}" step-by-step for ${exports.PLATFORM_INFO[platform].label}. Full breakdown in the video. Share with someone who needs this today!`,
        },
    ];
    const hashtags = [
        `#${platform}tips`,
        '#contentcreator',
        '#growthhacks',
        '#creatorstudio',
        '#videotips',
        '#shortformvideo',
        '#frameai',
    ];
    const ctas = [
        {
            id: 'cta_1',
            type: 'save-share',
            title: 'Algorithm Save Loop',
            text: 'Save this post right now so you can reference it when creating your next video.',
        },
        {
            id: 'cta_2',
            type: 'comment',
            title: 'Comment Engagement Bait',
            text: 'Which part of this is the hardest for you right now? Drop your thoughts below.',
        },
        {
            id: 'cta_3',
            type: 'follow',
            title: 'Value Follow Trigger',
            text: 'Hit follow for daily short-form strategies that actually move the needle.',
        },
    ];
    return {
        id,
        title: cleanIdea.slice(0, 48),
        idea: cleanIdea,
        platform,
        tone,
        targetDuration: duration,
        language,
        selectedHookId: hooks[0].id,
        hooks,
        scenes: finalScenes,
        captions,
        hashtags,
        ctas,
        createdAt: now,
        updatedAt: now,
        isAiGenerated: false,
        modelUsed: customInstructions
            ? 'Demo Blueprint (Custom Creative Instructions Applied)'
            : 'Demo Blueprint (Deterministic Framework)',
        customInstructions,
    };
}
//# sourceMappingURL=templates.js.map