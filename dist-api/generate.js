// src/server/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";

// src/services/templates.ts
var PLATFORM_INFO = {
  tiktok: {
    label: "TikTok",
    iconName: "Music2",
    maxChars: 2200,
    optimalDuration: "15-30s",
    vibe: "High energy, authentic, immediate hook, bold on-screen subtitles"
  },
  reels: {
    label: "Instagram Reels",
    iconName: "Instagram",
    maxChars: 2200,
    optimalDuration: "30-45s",
    vibe: "Aesthetic visuals, crisp audio, relatable storytelling, save-worthy"
  },
  shorts: {
    label: "YouTube Shorts",
    iconName: "Youtube",
    maxChars: 500,
    optimalDuration: "45-60s",
    vibe: "Curiosity gap, retention loops, informative fast-cuts, seamless replay"
  },
  linkedin: {
    label: "LinkedIn Video",
    iconName: "Linkedin",
    maxChars: 3e3,
    optimalDuration: "60-90s",
    vibe: "Executive insight, actionable business framework, professional framing"
  }
};
function generateMockProject(idea, platform, tone, duration, language = "en", customInstructions) {
  const cleanIdea = idea.trim() || "How to create 10x content in 1 hour a week";
  const id = "proj_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const hooks = [
    {
      id: "h_1",
      angle: "curiosity",
      label: "The Hidden Trap",
      text: `99% of creators fail at "${cleanIdea}" because they do this in reverse.`,
      viralityScore: 96,
      retentionTip: "Show hand gesture stopping camera or freeze frame on first syllable."
    },
    {
      id: "h_2",
      angle: "hot-take",
      label: "Contrarian Take",
      text: `Unpopular opinion: Everything you've been taught about "${cleanIdea}" is completely outdated.`,
      viralityScore: 92,
      retentionTip: "Deliver with intense, deadpan eye contact directly to the lens."
    },
    {
      id: "h_3",
      angle: "statistic",
      label: "The Proof Point",
      text: `I spent 30 days analyzing "${cleanIdea}" \u2014 and this one tweak changed everything.`,
      viralityScore: 89,
      retentionTip: "Quickly flash proof screenshot or stopwatch on screen for 0.4s."
    },
    {
      id: "h_4",
      angle: "relatable-story",
      label: "Relatable Story",
      text: `If you feel overwhelmed by "${cleanIdea}", stop what you're doing and watch this for 30 seconds.`,
      viralityScore: 88,
      retentionTip: "Start mid-motion (walking, setting down a coffee mug)."
    },
    {
      id: "h_5",
      angle: "viral-shock",
      label: "The Cheat Code",
      text: `Here is the exact 3-step cheat code for "${cleanIdea}" that nobody is sharing publicly.`,
      viralityScore: 94,
      retentionTip: "Display 3 fingers counting down in synced audio rhythm."
    }
  ];
  const sceneCount = duration === 15 ? 3 : duration === 30 ? 4 : duration === 60 ? 6 : 8;
  const avgSceneDuration = Math.round(duration / sceneCount);
  const scenes = [
    {
      id: "sc_1",
      sceneNumber: 1,
      durationSeconds: Math.min(3, avgSceneDuration),
      visualCue: "Punch in zoom to medium close-up. Eyes level with upper third grid line. High contrast lighting.",
      audioVoiceover: hooks[0].text,
      onScreenText: "WAIT, STOP SCROLLING \u26A0\uFE0F",
      bRollPrompt: "Close up eye blink or phone notification ping effect."
    },
    {
      id: "sc_2",
      sceneNumber: 2,
      durationSeconds: avgSceneDuration,
      visualCue: "Step back to wide view, point to the side where text overlay animates in.",
      audioVoiceover: `Most people think "${cleanIdea}" requires hours of grinding or expensive gear. That is completely false.`,
      onScreenText: "THE #1 COMMON MISTAKE \u274C",
      bRollPrompt: "Rapid montage of stressful workspace versus streamlined workflow."
    },
    {
      id: "sc_3",
      sceneNumber: 3,
      durationSeconds: avgSceneDuration,
      visualCue: "Cut to over-the-shoulder POV or screen screencast demonstrating the core principle.",
      audioVoiceover: `Rule number one: eliminate friction before you optimize. When you structure "${cleanIdea}" systematically, momentum carries you.`,
      onScreenText: "STEP 1: THE CORE SYSTEM \u26A1\uFE0F",
      bRollPrompt: "Clean minimalist app interface with slick cursor click interaction."
    },
    {
      id: "sc_4",
      sceneNumber: 4,
      durationSeconds: avgSceneDuration,
      visualCue: "Dynamic camera tracking shot or fast zoom-in emphasis on the key takeaway.",
      audioVoiceover: `Step two is repetition without burnout. Lock in your workflow once, then execute without second guessing yourself.`,
      onScreenText: "STEP 2: LOCK IN THE REPS \u{1F501}",
      bRollPrompt: "Calendar schedule filling up with completed green checkmarks."
    }
  ];
  if (sceneCount >= 6) {
    scenes.push(
      {
        id: "sc_5",
        sceneNumber: 5,
        durationSeconds: avgSceneDuration,
        visualCue: "Angle shift: 45-degree profile shot talking candidly.",
        audioVoiceover: `The secret separator is consistency. Don't reinvent the wheel every single morning.`,
        onScreenText: "THE REAL SECRET \u{1F48E}",
        bRollPrompt: "Smooth slow-motion b-roll of creator putting on headphones."
      },
      {
        id: "sc_6",
        sceneNumber: 6,
        durationSeconds: avgSceneDuration,
        visualCue: "Face camera head-on with confident nod. Text pops on bottom half.",
        audioVoiceover: `Save this framework right now before you lose it on your feed. Drop a comment if you want the checklist.`,
        onScreenText: "SAVE THIS FOR LATER \u{1F4CC}",
        bRollPrompt: "Finger pressing the bookmark / save button animation."
      }
    );
  }
  if (sceneCount >= 8) {
    scenes.push(
      {
        id: "sc_7",
        sceneNumber: 7,
        durationSeconds: avgSceneDuration,
        visualCue: "Step back to whiteboard or screen layout summarizing the 3 pillars.",
        audioVoiceover: `To recap: simplify your premise, automate your friction points, and ship consistently.`,
        onScreenText: "THE 3 PILLARS SUMMARY \u{1F4CA}",
        bRollPrompt: "Diagram lines connecting concepts on screen."
      },
      {
        id: "sc_8",
        sceneNumber: 8,
        durationSeconds: avgSceneDuration,
        visualCue: "Direct eye contact, earnest smile, hand point toward follow button.",
        audioVoiceover: `If this shifted how you think about "${cleanIdea}", tap follow and share it with a friend who is building something today.`,
        onScreenText: "JOIN THE COMMUNITY \u{1F680}",
        bRollPrompt: "Creator community avatars or social profile interaction."
      }
    );
  }
  const finalScenes = scenes.slice(0, sceneCount).map((s, idx) => ({
    ...s,
    sceneNumber: idx + 1
  }));
  const captions = [
    {
      id: "cap_1",
      style: "short-punchy",
      title: "High Velocity",
      text: `Everything you need to master "${cleanIdea}" in under 60 seconds. Bookmark this so you don't lose it.`
    },
    {
      id: "cap_2",
      style: "storytelling",
      title: "Context & Value",
      text: `I spent weeks failing at "${cleanIdea}" until I realized one fundamental truth: simple beats complicated every single time. Here is the breakdown you actually need.`
    },
    {
      id: "cap_3",
      style: "seo-keyword-rich",
      title: "Algorithm & SEO Optimized",
      text: `How to optimize "${cleanIdea}" step-by-step for ${PLATFORM_INFO[platform].label}. Full breakdown in the video. Share with someone who needs this today!`
    }
  ];
  const hashtags = [
    `#${platform}tips`,
    "#contentcreator",
    "#growthhacks",
    "#creatorstudio",
    "#videotips",
    "#shortformvideo",
    "#frameai"
  ];
  const ctas = [
    {
      id: "cta_1",
      type: "save-share",
      title: "Algorithm Save Loop",
      text: "Save this post right now so you can reference it when creating your next video."
    },
    {
      id: "cta_2",
      type: "comment",
      title: "Comment Engagement Bait",
      text: "Which part of this is the hardest for you right now? Drop your thoughts below."
    },
    {
      id: "cta_3",
      type: "follow",
      title: "Value Follow Trigger",
      text: "Hit follow for daily short-form strategies that actually move the needle."
    }
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
    modelUsed: customInstructions ? "Demo Blueprint (Custom Creative Instructions Applied)" : "Demo Blueprint (Deterministic Framework)",
    customInstructions
  };
}

// src/server/geminiService.ts
var cachedAiClient = null;
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedAiClient) {
    cachedAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return cachedAiClient;
}
async function processGeneration(input) {
  const {
    idea,
    platform = "tiktok",
    tone = "viral-hype",
    duration = 30,
    language = "en",
    preferDemo = false,
    customInstructions
  } = input;
  if (!idea || typeof idea !== "string" || idea.trim().length < 3) {
    throw new Error("idea is required and must be at least 3 characters");
  }
  const sanitizedCustom = typeof customInstructions === "string" && customInstructions.trim() ? customInstructions.trim().slice(0, 2e3) : void 0;
  const aiClient = getAiClient();
  if (preferDemo || !aiClient) {
    const mockProject = generateMockProject(
      idea.trim(),
      platform,
      tone,
      Number(duration),
      language,
      sanitizedCustom
    );
    return { project: mockProject, statusCode: 200 };
  }
  const prompt = `You are a world-class viral short-form video creator and scriptwriter for ${platform.toUpperCase()}.
Create a complete, production-ready short-form video package based on this creator's idea:
Idea: "${idea.trim()}"
Platform: ${platform}
Tone: ${tone}
Target Duration: ${duration} seconds
Language: ${language}
${sanitizedCustom ? `
Creative Direction & Custom Creative Instructions:
"${sanitizedCustom}"
CRITICAL: You must strictly adhere to these customized instructions when creating the hooks, visual scene cues, camera angles, voiceover rhythm, pacing, and calls to action.
` : ""}

Provide:
1. Exactly 5 distinctive hook angles (curiosity, viral-shock, relatable-story, hot-take, statistic).
2. A scene-by-scene script breakdown totaling approximately ${duration} seconds (usually 3-6 scenes). For each scene give:
   - Visual cue (camera framing, action, lighting)
   - Audio/Voiceover (exact words spoken)
   - On-Screen text overlay (bold, snappy caps)
   - B-roll visual prompt
   - Estimated duration in seconds
3. 3 Caption variations (short-punchy, storytelling, seo-keyword-rich)
4. 7-10 high-ranking viral hashtags
5. 3 Call-To-Action (CTA) variations (save/share loop, comment bait, follow trigger)`;
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Short catchy project title under 40 chars" },
            hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  angle: {
                    type: Type.STRING,
                    enum: ["curiosity", "viral-shock", "relatable-story", "hot-take", "statistic", "question"]
                  },
                  label: { type: Type.STRING },
                  text: { type: Type.STRING },
                  viralityScore: { type: Type.NUMBER },
                  retentionTip: { type: Type.STRING }
                },
                required: ["id", "angle", "label", "text", "viralityScore", "retentionTip"]
              }
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  sceneNumber: { type: Type.NUMBER },
                  durationSeconds: { type: Type.NUMBER },
                  visualCue: { type: Type.STRING },
                  audioVoiceover: { type: Type.STRING },
                  onScreenText: { type: Type.STRING },
                  bRollPrompt: { type: Type.STRING }
                },
                required: ["id", "sceneNumber", "durationSeconds", "visualCue", "audioVoiceover", "onScreenText"]
              }
            },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  style: { type: Type.STRING, enum: ["short-punchy", "storytelling", "seo-keyword-rich"] },
                  title: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["id", "style", "title", "text"]
              }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ctas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["comment", "save-share", "follow", "link"] },
                  title: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["id", "type", "title", "text"]
              }
            }
          },
          required: ["title", "hooks", "scenes", "captions", "hashtags", "ctas"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const project = {
      id: "proj_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      title: parsed.title || idea.slice(0, 40),
      idea,
      platform,
      tone,
      targetDuration: Number(duration),
      language,
      selectedHookId: parsed.hooks?.[0]?.id || "h1",
      hooks: parsed.hooks || [],
      scenes: parsed.scenes || [],
      captions: parsed.captions || [],
      hashtags: parsed.hashtags || [],
      ctas: parsed.ctas || [],
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true,
      modelUsed: "gemini-3.8-flash",
      customInstructions: sanitizedCustom
    };
    return { project, statusCode: 200 };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

// api/generate.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const result = await processGeneration(body);
    return res.status(result.statusCode || 200).json(result.project);
  } catch (error) {
    console.error("API /api/generate Error:", error);
    const message = error?.message || "Generation failed";
    return res.status(500).json({ error: message });
  }
}
export {
  handler as default
};
