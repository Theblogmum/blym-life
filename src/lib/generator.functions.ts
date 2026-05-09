import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { enforceTrial, getCtx, readString, toStringList } from "@/lib/generator-helpers.server";

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; topic: string }) => d)
  .handler(async ({ data, context }) => {
    // Captions are free forever; everything else needs trial or premium.
    const isCaption = String(data.kind).toLowerCase().includes("caption");
    const quota = await enforceTrial(context.supabase, context.userId, "generator", {
      freeAllowed: isCaption,
    });
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ options?: unknown }>({
      toolName: "generate",
      toolDescription: `5 ${data.kind} options.`,
      parameters: {
        type: "object",
        properties: {
          options: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
        },
        required: ["options"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content: "Write content for mum creators. British English, sound real, no AI clichés.",
        },
        { role: "user", content: `Profile:\n${ctx}\n\n5 ${data.kind} options for: ${data.topic}` },
      ],
    });
    await quota.record();
    return { options: toStringList(result.options) };
  });

export const analyseTrend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { input: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "viral_lab");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      hook_breakdown?: unknown;
      structure?: unknown;
      why_it_works?: unknown;
      remix_for_you?: unknown;
    }>({
      toolName: "analyse_trend",
      toolDescription: "Break down a viral trend and propose remixes.",
      parameters: {
        type: "object",
        properties: {
          hook_breakdown: { type: "string" },
          structure: { type: "string" },
          why_it_works: { type: "string" },
          remix_for_you: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: ["hook_breakdown", "structure", "why_it_works", "remix_for_you"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Viral analyst for mum creators. Specific and practical." },
        { role: "user", content: `Profile:\n${ctx}\n\nAnalyse:\n${data.input}` },
      ],
    });
    await quota.record();
    return {
      hook_breakdown: readString(result.hook_breakdown),
      structure: readString(result.structure),
      why_it_works: readString(result.why_it_works),
      remix_for_you: toStringList(result.remix_for_you),
    };
  });

export const recycleClip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { description: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "recycler");
    const result = await callAITool<{ ideas?: unknown }>({
      toolName: "clip_ideas",
      toolDescription: "5 post ideas using one clip.",
      parameters: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                hook: { type: "string" },
                angle: { type: "string" },
              },
              required: ["title", "hook", "angle"],
              additionalProperties: false,
            },
            minItems: 5,
            maxItems: 5,
          },
        },
        required: ["ideas"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Reuse one clip 5 different ways for a mum creator." },
        { role: "user", content: `Clip: ${data.description}` },
      ],
    });
    const ideas = Array.isArray(result.ideas) ? result.ideas : [];
    await quota.record();
    return {
      ideas: ideas
        .map((idea) => {
          const item = idea as Record<string, unknown>;
          return {
            title: readString(item.title, "Untitled idea"),
            hook: readString(item.hook),
            angle: readString(item.angle),
          };
        })
        .filter((idea) => idea.hook || idea.angle),
    };
  });

export const generatePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { brand: string; niche: string; tone: string; platform: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "pitch");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      email_subject_lines?: unknown;
      email_pitch?: unknown;
      dm_pitch?: unknown;
      follow_up?: unknown;
    }>({
      toolName: "brand_pitch_pack",
      toolDescription: "Brand pitch pack: subject lines, email pitch, DM pitch, follow-up.",
      parameters: {
        type: "object",
        properties: {
          email_subject_lines: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
          },
          email_pitch: { type: "string" },
          dm_pitch: { type: "string" },
          follow_up: { type: "string" },
        },
        required: ["email_subject_lines", "email_pitch", "dm_pitch", "follow_up"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You write warm, professional brand pitches for UK mum creators. British English, sound human, no AI clichés. Match the requested tone exactly. Keep email pitches concise (under 180 words). DMs short (under 60 words). Follow-up polite and brief.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nBrand: ${data.brand}\nNiche: ${data.niche}\nTone: ${data.tone}\nPlatform: ${data.platform}\n\nWrite (1) four subject line options, (2) the email pitch, (3) a DM-friendly version for ${data.platform}, (4) a polite 4-day follow-up.`,
        },
      ],
    });
    await quota.record();
    return {
      email_subject_lines: toStringList(result.email_subject_lines).slice(0, 4),
      email_pitch: readString(result.email_pitch),
      dm_pitch: readString(result.dm_pitch),
      follow_up: readString(result.follow_up),
    };
  });

export const analyseFlop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { hook: string; caption: string; topic: string; watch_time_seconds: number }) => d,
  )
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "flop");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      verdict?: unknown;
      scores?: unknown;
      diagnoses?: unknown;
      rewrite_hook?: unknown;
      rewrite_caption?: unknown;
      next_post_idea?: unknown;
    }>({
      toolName: "flop_analysis",
      toolDescription:
        "Diagnose why a short-form video underperformed. Be honest, specific, and kind.",
      parameters: {
        type: "object",
        properties: {
          verdict: { type: "string" },
          scores: {
            type: "object",
            properties: {
              opening_strength: { type: "number" },
              specificity: { type: "number" },
              curiosity: { type: "number" },
              cta_strength: { type: "number" },
            },
            required: ["opening_strength", "specificity", "curiosity", "cta_strength"],
            additionalProperties: false,
          },
          diagnoses: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                issue: {
                  type: "string",
                  enum: [
                    "weak_opening",
                    "too_broad",
                    "no_curiosity",
                    "weak_cta",
                    "wrong_audience",
                    "low_payoff",
                    "pacing",
                    "caption_mismatch",
                  ],
                },
                label: { type: "string" },
                why: { type: "string" },
                fix: { type: "string" },
              },
              required: ["issue", "label", "why", "fix"],
              additionalProperties: false,
            },
          },
          rewrite_hook: { type: "string" },
          rewrite_caption: { type: "string" },
          next_post_idea: { type: "string" },
        },
        required: [
          "verdict",
          "scores",
          "diagnoses",
          "rewrite_hook",
          "rewrite_caption",
          "next_post_idea",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You are a short-form video strategist for UK mum creators. Diagnose flops with specific, kind, practical feedback. Score each axis 1-10 (10 = excellent). British English, no AI clichés. Reference the actual hook/caption text in your reasoning.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nVideo to diagnose:\nTopic: ${data.topic}\nHook (first line / on-screen text): ${data.hook}\nCaption: ${data.caption}\nAverage watch time: ${data.watch_time_seconds}s\n\nReturn an honest verdict, scores, 3-5 diagnoses (pick the most relevant), a rewritten hook, a rewritten caption, and a next-post idea that learns from this flop.`,
        },
      ],
    });
    await quota.record();
    const scoresRaw = (result.scores ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" ? Math.max(1, Math.min(10, v)) : 0);
    const diagnosesRaw = Array.isArray(result.diagnoses) ? result.diagnoses : [];
    return {
      verdict: readString(result.verdict),
      scores: {
        opening_strength: num(scoresRaw.opening_strength),
        specificity: num(scoresRaw.specificity),
        curiosity: num(scoresRaw.curiosity),
        cta_strength: num(scoresRaw.cta_strength),
      },
      diagnoses: diagnosesRaw.map((d) => {
        const item = d as Record<string, unknown>;
        return {
          issue: readString(item.issue, "weak_opening"),
          label: readString(item.label),
          why: readString(item.why),
          fix: readString(item.fix),
        };
      }),
      rewrite_hook: readString(result.rewrite_hook),
      rewrite_caption: readString(result.rewrite_caption),
      next_post_idea: readString(result.next_post_idea),
    };
  });

export const auditNiche = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bio: string; niche: string; target_audience: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "niche_audit");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      clarity_score?: unknown;
      headline_verdict?: unknown;
      whats_unclear?: unknown;
      missing_content?: unknown;
      monetisation?: unknown;
      positioning_advice?: unknown;
      rewritten_bio?: unknown;
      one_line_positioning?: unknown;
    }>({
      toolName: "niche_audit",
      toolDescription:
        "Audit a creator's niche, bio and target audience. Be honest, specific, and constructive.",
      parameters: {
        type: "object",
        properties: {
          clarity_score: { type: "number" },
          headline_verdict: { type: "string" },
          whats_unclear: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 5,
          },
          missing_content: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pillar: { type: "string" },
                why: { type: "string" },
                example_post: { type: "string" },
              },
              required: ["pillar", "why", "example_post"],
              additionalProperties: false,
            },
            minItems: 3,
            maxItems: 5,
          },
          monetisation: {
            type: "object",
            properties: {
              potential: { type: "string", enum: ["low", "medium", "high"] },
              summary: { type: "string" },
              streams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    fit: { type: "string", enum: ["weak", "okay", "strong"] },
                    notes: { type: "string" },
                  },
                  required: ["name", "fit", "notes"],
                  additionalProperties: false,
                },
                minItems: 3,
                maxItems: 6,
              },
            },
            required: ["potential", "summary", "streams"],
            additionalProperties: false,
          },
          positioning_advice: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 5,
          },
          rewritten_bio: { type: "string" },
          one_line_positioning: { type: "string" },
        },
        required: [
          "clarity_score",
          "headline_verdict",
          "whats_unclear",
          "missing_content",
          "monetisation",
          "positioning_advice",
          "rewritten_bio",
          "one_line_positioning",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You audit niches for UK mum content creators. Be specific, kind and direct. British English. Score clarity 1-10. Reference the actual bio words. Suggested example posts must be concrete (not 'share a tip').",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nBio: ${data.bio}\nNiche: ${data.niche}\nTarget audience: ${data.target_audience}\n\nReturn a clarity score, a one-line verdict, what's unclear, missing content pillars (with example posts), a monetisation read with 3-6 revenue stream fits, positioning advice, a rewritten bio (under 150 chars), and a one-line "I help X do Y" positioning statement.`,
        },
      ],
    });
    await quota.record();
    const score =
      typeof result.clarity_score === "number"
        ? Math.max(1, Math.min(10, Math.round(result.clarity_score)))
        : 0;
    const monRaw = (result.monetisation ?? {}) as Record<string, unknown>;
    const streamsRaw = Array.isArray(monRaw.streams) ? monRaw.streams : [];
    const missingRaw = Array.isArray(result.missing_content) ? result.missing_content : [];
    return {
      clarity_score: score,
      headline_verdict: readString(result.headline_verdict),
      whats_unclear: toStringList(result.whats_unclear),
      missing_content: missingRaw.map((it) => {
        const item = it as Record<string, unknown>;
        return {
          pillar: readString(item.pillar),
          why: readString(item.why),
          example_post: readString(item.example_post),
        };
      }),
      monetisation: {
        potential: readString(monRaw.potential, "medium"),
        summary: readString(monRaw.summary),
        streams: streamsRaw.map((s) => {
          const item = s as Record<string, unknown>;
          return {
            name: readString(item.name),
            fit: readString(item.fit, "okay"),
            notes: readString(item.notes),
          };
        }),
      },
      positioning_advice: toStringList(result.positioning_advice),
      rewritten_bio: readString(result.rewritten_bio),
      one_line_positioning: readString(result.one_line_positioning),
    };
  });

export const generateBroll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "broll");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      shots?: unknown;
      angles?: unknown;
      transitions?: unknown;
      aesthetic?: unknown;
      shot_list_tip?: unknown;
    }>({
      toolName: "broll_ideas",
      toolDescription:
        "Generate concrete b-roll shots, camera angles, transitions and aesthetic direction for a niche/topic.",
      parameters: {
        type: "object",
        properties: {
          shots: {
            type: "array",
            minItems: 8,
            maxItems: 12,
            items: {
              type: "object",
              properties: {
                shot: { type: "string" },
                why: { type: "string" },
                duration_seconds: { type: "number" },
              },
              required: ["shot", "why", "duration_seconds"],
              additionalProperties: false,
            },
          },
          angles: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                how_to: { type: "string" },
              },
              required: ["name", "how_to"],
              additionalProperties: false,
            },
          },
          transitions: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                how_to: { type: "string" },
              },
              required: ["name", "how_to"],
              additionalProperties: false,
            },
          },
          aesthetic: {
            type: "object",
            properties: {
              mood: { type: "string" },
              palette: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              lighting: { type: "string" },
              props: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
              music_vibe: { type: "string" },
            },
            required: ["mood", "palette", "lighting", "props", "music_vibe"],
            additionalProperties: false,
          },
          shot_list_tip: { type: "string" },
        },
        required: ["shots", "angles", "transitions", "aesthetic", "shot_list_tip"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You are a short-form video DOP for UK mum creators filming on a phone at home. Give concrete, doable b-roll: real shots a mum can film in her kitchen/lounge/garden in 10 minutes. No film-school jargon. British English. Each shot must be specific (what's in frame, what moves), not generic ('cooking shot'). Suggest realistic durations 1-4 seconds.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nNiche/topic: ${data.topic}\n\nReturn 8-12 specific b-roll shots, 4-6 camera angles, 4-6 transition ideas, and an aesthetic direction (mood, colour palette, lighting, props, music vibe), plus one filming tip.`,
        },
      ],
    });
    await quota.record();
    const shotsRaw = Array.isArray(result.shots) ? result.shots : [];
    const anglesRaw = Array.isArray(result.angles) ? result.angles : [];
    const transRaw = Array.isArray(result.transitions) ? result.transitions : [];
    const aestRaw = (result.aesthetic ?? {}) as Record<string, unknown>;
    return {
      shots: shotsRaw.map((s) => {
        const it = s as Record<string, unknown>;
        return {
          shot: readString(it.shot),
          why: readString(it.why),
          duration_seconds:
            typeof it.duration_seconds === "number"
              ? Math.max(1, Math.min(10, Math.round(it.duration_seconds)))
              : 2,
        };
      }),
      angles: anglesRaw.map((a) => {
        const it = a as Record<string, unknown>;
        return { name: readString(it.name), how_to: readString(it.how_to) };
      }),
      transitions: transRaw.map((t) => {
        const it = t as Record<string, unknown>;
        return { name: readString(it.name), how_to: readString(it.how_to) };
      }),
      aesthetic: {
        mood: readString(aestRaw.mood),
        palette: toStringList(aestRaw.palette),
        lighting: readString(aestRaw.lighting),
        props: toStringList(aestRaw.props),
        music_vibe: readString(aestRaw.music_vibe),
      },
      shot_list_tip: readString(result.shot_list_tip),
    };
  });


