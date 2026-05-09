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

export const buildSeries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "series");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      series_title?: unknown;
      premise?: unknown;
      recurring_themes?: unknown;
      pillars?: unknown;
      episodes?: unknown;
      posting_cadence?: unknown;
    }>({
      toolName: "content_series",
      toolDescription:
        "Plan a 30-part short-form content series with recurring themes and concrete episode briefs.",
      parameters: {
        type: "object",
        properties: {
          series_title: { type: "string" },
          premise: { type: "string" },
          recurring_themes: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
          pillars: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                purpose: { type: "string" },
              },
              required: ["name", "purpose"],
              additionalProperties: false,
            },
          },
          episodes: {
            type: "array",
            minItems: 30,
            maxItems: 30,
            items: {
              type: "object",
              properties: {
                number: { type: "number" },
                title: { type: "string" },
                pillar: { type: "string" },
                hook: { type: "string" },
                what_to_film: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 6,
                },
                how_to_film: { type: "string" },
                caption: { type: "string" },
                cta: { type: "string" },
              },
              required: [
                "number",
                "title",
                "pillar",
                "hook",
                "what_to_film",
                "how_to_film",
                "caption",
                "cta",
              ],
              additionalProperties: false,
            },
          },
          posting_cadence: { type: "string" },
        },
        required: [
          "series_title",
          "premise",
          "recurring_themes",
          "pillars",
          "episodes",
          "posting_cadence",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You plan binge-able short-form video series for UK mum creators. British English, no AI clichés. Each episode must be filmable on a phone at home in under 15 mins. Hooks must be specific (not 'today I'm sharing'). Rotate across the pillars so the feed stays varied. Number episodes 1-30 in order. Captions under 220 chars. CTAs simple and natural.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nNiche/topic: ${data.topic}\n\nDesign a 30-part content series. Give it a memorable name, a 1-line premise, 3-5 recurring themes, 3-5 content pillars, then 30 fully briefed episodes (hook + 3-6 shots to film + how to film it + caption + CTA), and a sensible posting cadence.`,
        },
      ],
    });
    await quota.record();
    const themesRaw = toStringList(result.recurring_themes);
    const pillarsRaw = Array.isArray(result.pillars) ? result.pillars : [];
    const episodesRaw = Array.isArray(result.episodes) ? result.episodes : [];
    return {
      series_title: readString(result.series_title),
      premise: readString(result.premise),
      recurring_themes: themesRaw,
      pillars: pillarsRaw.map((p) => {
        const it = p as Record<string, unknown>;
        return { name: readString(it.name), purpose: readString(it.purpose) };
      }),
      episodes: episodesRaw.map((e, i) => {
        const it = e as Record<string, unknown>;
        return {
          number: typeof it.number === "number" ? it.number : i + 1,
          title: readString(it.title),
          pillar: readString(it.pillar),
          hook: readString(it.hook),
          what_to_film: toStringList(it.what_to_film),
          how_to_film: readString(it.how_to_film),
          caption: readString(it.caption),
          cta: readString(it.cta),
        };
      }),
      posting_cadence: readString(result.posting_cadence),
    };
  });

export const generateCtas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; goal?: string; platform?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "cta");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      engagement?: unknown;
      sales?: unknown;
      save_share?: unknown;
      comment_hooks?: unknown;
    }>({
      toolName: "cta_pack",
      toolDescription:
        "Generate calls-to-action across 4 categories: engagement, sales, save/share, comment hooks.",
      parameters: {
        type: "object",
        properties: {
          engagement: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
          sales: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
          save_share: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
          comment_hooks: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
        },
        required: ["engagement", "sales", "save_share", "comment_hooks"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You write CTAs for UK mum creators. Sound human, warm, never salesy. British English. Each CTA must be ONE short line that could be spoken or typed in a caption. No emojis spam. No 'link in bio' filler — be specific. Comment hooks should bait a real reply (a question or a fill-in-the-blank).",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPost topic: ${data.topic}\nGoal (optional): ${data.goal ?? "any"}\nPlatform: ${data.platform ?? "Instagram/TikTok"}\n\nReturn 6 CTAs in each category: (1) engagement (likes/follows), (2) sales (towards a product/service), (3) save/share, (4) comment hooks (open-ended prompts).`,
        },
      ],
    });
    await quota.record();
    return {
      engagement: toStringList(result.engagement),
      sales: toStringList(result.sales),
      save_share: toStringList(result.save_share),
      comment_hooks: toStringList(result.comment_hooks),
    };
  });

export const repurposeContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { input: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "repurpose");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      tiktok?: unknown;
      reel?: unknown;
      pinterest?: unknown;
      carousel?: unknown;
      story?: unknown;
      youtube_short?: unknown;
      blog_snippet?: unknown;
      email?: unknown;
      twitter_thread?: unknown;
      facebook_post?: unknown;
    }>({
      toolName: "repurpose_pack",
      toolDescription:
        "Turn one idea/script/video into 10 platform-specific pieces of content.",
      parameters: {
        type: "object",
        properties: {
          tiktok: {
            type: "object",
            properties: {
              hook: { type: "string" },
              script: { type: "string" },
              caption: { type: "string" },
              hashtags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
            },
            required: ["hook", "script", "caption", "hashtags"],
            additionalProperties: false,
          },
          reel: {
            type: "object",
            properties: {
              hook: { type: "string" },
              script: { type: "string" },
              caption: { type: "string" },
              audio_suggestion: { type: "string" },
            },
            required: ["hook", "script", "caption", "audio_suggestion"],
            additionalProperties: false,
          },
          pinterest: {
            type: "object",
            properties: {
              pin_title: { type: "string" },
              pin_description: { type: "string" },
              keywords: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
            },
            required: ["pin_title", "pin_description", "keywords"],
            additionalProperties: false,
          },
          carousel: {
            type: "object",
            properties: {
              cover: { type: "string" },
              slides: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 8 },
              caption: { type: "string" },
            },
            required: ["cover", "slides", "caption"],
            additionalProperties: false,
          },
          story: {
            type: "object",
            properties: {
              frames: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              poll_or_question: { type: "string" },
            },
            required: ["frames", "poll_or_question"],
            additionalProperties: false,
          },
          youtube_short: {
            type: "object",
            properties: {
              title: { type: "string" },
              hook: { type: "string" },
              script: { type: "string" },
            },
            required: ["title", "hook", "script"],
            additionalProperties: false,
          },
          blog_snippet: {
            type: "object",
            properties: {
              title: { type: "string" },
              intro: { type: "string" },
              body: { type: "string" },
            },
            required: ["title", "intro", "body"],
            additionalProperties: false,
          },
          email: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" },
            },
            required: ["subject", "body"],
            additionalProperties: false,
          },
          twitter_thread: {
            type: "object",
            properties: {
              tweets: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 7 },
            },
            required: ["tweets"],
            additionalProperties: false,
          },
          facebook_post: {
            type: "object",
            properties: {
              post: { type: "string" },
            },
            required: ["post"],
            additionalProperties: false,
          },
        },
        required: [
          "tiktok",
          "reel",
          "pinterest",
          "carousel",
          "story",
          "youtube_short",
          "blog_snippet",
          "email",
          "twitter_thread",
          "facebook_post",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You repurpose ONE piece of content into 10 platform-native versions for a UK mum creator. Each version must respect the platform's actual format (Pinterest = SEO + keywords, TikTok = hook-first short script, carousel = punchy slides, story = casual + interactive, email = warm + scannable, Twitter = thread cadence). Same core message, different shape. British English, no AI clichés, no emoji spam.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nOriginal idea / script / video:\n${data.input}\n\nProduce all 10 platform versions.`,
        },
      ],
    });
    await quota.record();
    const obj = (v: unknown) => (v ?? {}) as Record<string, unknown>;
    const tk = obj(result.tiktok);
    const rl = obj(result.reel);
    const pn = obj(result.pinterest);
    const cr = obj(result.carousel);
    const st = obj(result.story);
    const ys = obj(result.youtube_short);
    const bl = obj(result.blog_snippet);
    const em = obj(result.email);
    const tw = obj(result.twitter_thread);
    const fb = obj(result.facebook_post);
    return {
      tiktok: {
        hook: readString(tk.hook),
        script: readString(tk.script),
        caption: readString(tk.caption),
        hashtags: toStringList(tk.hashtags),
      },
      reel: {
        hook: readString(rl.hook),
        script: readString(rl.script),
        caption: readString(rl.caption),
        audio_suggestion: readString(rl.audio_suggestion),
      },
      pinterest: {
        pin_title: readString(pn.pin_title),
        pin_description: readString(pn.pin_description),
        keywords: toStringList(pn.keywords),
      },
      carousel: {
        cover: readString(cr.cover),
        slides: toStringList(cr.slides),
        caption: readString(cr.caption),
      },
      story: {
        frames: toStringList(st.frames),
        poll_or_question: readString(st.poll_or_question),
      },
      youtube_short: {
        title: readString(ys.title),
        hook: readString(ys.hook),
        script: readString(ys.script),
      },
      blog_snippet: {
        title: readString(bl.title),
        intro: readString(bl.intro),
        body: readString(bl.body),
      },
      email: {
        subject: readString(em.subject),
        body: readString(em.body),
      },
      twitter_thread: {
        tweets: toStringList(tw.tweets),
      },
      facebook_post: {
        post: readString(fb.post),
      },
    };
  });

export const writeBrandResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string; rate?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "response");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      summary?: unknown;
      red_flags?: unknown;
      accept?: unknown;
      negotiate?: unknown;
      decline?: unknown;
      follow_up?: unknown;
    }>({
      toolName: "brand_response_pack",
      toolDescription:
        "Read a brand outreach message and write 4 reply options: accept, negotiate, decline, follow-up.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          red_flags: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 5 },
          accept: {
            type: "object",
            properties: { subject: { type: "string" }, body: { type: "string" } },
            required: ["subject", "body"],
            additionalProperties: false,
          },
          negotiate: {
            type: "object",
            properties: { subject: { type: "string" }, body: { type: "string" } },
            required: ["subject", "body"],
            additionalProperties: false,
          },
          decline: {
            type: "object",
            properties: { subject: { type: "string" }, body: { type: "string" } },
            required: ["subject", "body"],
            additionalProperties: false,
          },
          follow_up: {
            type: "object",
            properties: { subject: { type: "string" }, body: { type: "string" } },
            required: ["subject", "body"],
            additionalProperties: false,
          },
        },
        required: ["summary", "red_flags", "accept", "negotiate", "decline", "follow_up"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You write professional brand replies for UK mum creators. British English. Warm but business-like, never desperate. Each reply: a clear subject and a tight body under 180 words. Negotiate replies should ask for a higher fee, usage clarity, and exclusivity terms. Decline replies stay polite and leave the door open. Follow-up is short and gracious. Flag any red flags in the brief (no fee, free product only, exclusivity grab, unrealistic deliverables, vague usage rights).",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nBrand's message:\n${data.message}\n\nMy current rate / context (optional): ${data.rate ?? "n/a"}\nExtra notes (optional): ${data.notes ?? "n/a"}\n\nWrite all 4 reply options plus a 1-line summary of what the brand is asking and any red flags.`,
        },
      ],
    });
    await quota.record();
    const obj = (v: unknown) => (v ?? {}) as Record<string, unknown>;
    const pack = (v: unknown) => {
      const o = obj(v);
      return { subject: readString(o.subject), body: readString(o.body) };
    };
    return {
      summary: readString(result.summary),
      red_flags: toStringList(result.red_flags),
      accept: pack(result.accept),
      negotiate: pack(result.negotiate),
      decline: pack(result.decline),
      follow_up: pack(result.follow_up),
    };
  });

export const generateSeoKeywords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; platform: "tiktok" | "instagram" | "pinterest" }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "seo");
    const ctx = await getCtx(context.supabase, context.userId);
    const platformBrief = {
      tiktok:
        "TikTok SEO: keywords go in the on-screen caption, spoken hook (TikTok auto-transcribes), file caption and hashtags. Favour conversational long-tail (3-5 words) people actually type/say.",
      instagram:
        "Instagram SEO: keywords go in the bio, profile name field, alt text, caption (first 125 chars matter most), and hashtags. Mix branded, niche and broad. Hashtags lean specific (10-20k–500k posts is the sweet spot).",
      pinterest:
        "Pinterest SEO: pins behave like a search engine. Pack the pin title, pin description, board title, alt text and image filename with seasonal + intent-led keywords. Long-tail wins (e.g. 'easy lunchbox ideas for picky 4 year olds').",
    }[data.platform];
    const result = await callAITool<{
      primary?: unknown;
      long_tail?: unknown;
      hashtags?: unknown;
      questions?: unknown;
      seasonal?: unknown;
      placement_tips?: unknown;
      ready_to_paste_caption?: unknown;
    }>({
      toolName: "seo_keywords",
      toolDescription:
        "Generate platform-native SEO keywords, hashtags, search questions, seasonal terms and placement tips.",
      parameters: {
        type: "object",
        properties: {
          primary: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 10 },
          long_tail: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 12 },
          hashtags: {
            type: "array",
            minItems: 10,
            maxItems: 18,
            items: {
              type: "object",
              properties: {
                tag: { type: "string" },
                size: { type: "string", enum: ["niche", "mid", "broad"] },
              },
              required: ["tag", "size"],
              additionalProperties: false,
            },
          },
          questions: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 8 },
          seasonal: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
          placement_tips: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          ready_to_paste_caption: { type: "string" },
        },
        required: [
          "primary",
          "long_tail",
          "hashtags",
          "questions",
          "seasonal",
          "placement_tips",
          "ready_to_paste_caption",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You are an SEO strategist for UK mum content creators. British English (use British spellings like 'mum', 'lunchbox', 'cot'). Real keywords mums actually search — never invented. Hashtags: no spaces, no #, label size honestly (niche <50k posts, mid 50k–500k, broad >500k). Long-tail must be conversational and intent-driven.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPlatform: ${data.platform.toUpperCase()}\nTopic: ${data.topic}\n\nPlatform brief:\n${platformBrief}\n\nReturn primary keywords, long-tail keywords, sized hashtags, search questions, seasonal/timely angles, placement tips for ${data.platform}, and a ready-to-paste keyword-rich caption.`,
        },
      ],
    });
    await quota.record();
    const hashtagsRaw = Array.isArray(result.hashtags) ? result.hashtags : [];
    return {
      primary: toStringList(result.primary),
      long_tail: toStringList(result.long_tail),
      hashtags: hashtagsRaw.map((h) => {
        const it = h as Record<string, unknown>;
        return {
          tag: readString(it.tag).replace(/^#/, ""),
          size: readString(it.size, "mid"),
        };
      }),
      questions: toStringList(result.questions),
      seasonal: toStringList(result.seasonal),
      placement_tips: toStringList(result.placement_tips),
      ready_to_paste_caption: readString(result.ready_to_paste_caption),
    };
  });


