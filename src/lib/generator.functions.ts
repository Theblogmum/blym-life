import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { assertAiInput, enforceTrial, getCtx, readString, toStringList } from "@/lib/generator-helpers.server";

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; topic: string }) => d)
  .handler(async ({ data, context }) => {
    // Free Forever tier:
    //   - captions/hooks → 10 / month (caption_generator bucket)
    //   - ideas + scripts → 20 / month (generator bucket)
    // Premium → unlimited.
    const kindLower = String(data.kind).toLowerCase();
    const isCaption = kindLower.includes("caption") || kindLower.includes("hook");
    const quota = await enforceTrial(
      context.supabase,
      context.userId,
      isCaption ? "caption_generator" : "generator",
    );
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

export const boostEngagement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; current_caption?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "engagement");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      reply_starters?: unknown;
      story_prompts?: unknown;
      polls?: unknown;
      dm_starters?: unknown;
      community_rituals?: unknown;
      caption_tweaks?: unknown;
    }>({
      toolName: "engagement_boost",
      toolDescription:
        "Suggest concrete tactics to boost engagement for a specific post topic.",
      parameters: {
        type: "object",
        properties: {
          reply_starters: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 7 },
          story_prompts: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
          polls: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
              },
              required: ["question", "options"],
              additionalProperties: false,
            },
          },
          dm_starters: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
          community_rituals: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
          caption_tweaks: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: [
          "reply_starters",
          "story_prompts",
          "polls",
          "dm_starters",
          "community_rituals",
          "caption_tweaks",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You are a community growth coach for UK mum creators. British English, warm, never gimmicky. Tactics must be doable today on a phone — no fancy tools. Story prompts use real IG sticker types (poll, slider, question, quiz, emoji). Caption tweaks are short rewrites or additions, not vague advice.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPost topic: ${data.topic}\nCurrent caption (optional): ${data.current_caption ?? "n/a"}\n\nReturn reply starters (to seed comments), story prompts, polls (with options), DM conversation starters, community rituals (recurring engagement bits), and 3-5 caption tweaks that boost replies.`,
        },
      ],
    });
    await quota.record();
    const pollsRaw = Array.isArray(result.polls) ? result.polls : [];
    return {
      reply_starters: toStringList(result.reply_starters),
      story_prompts: toStringList(result.story_prompts),
      polls: pollsRaw.map((p) => {
        const it = p as Record<string, unknown>;
        return { question: readString(it.question), options: toStringList(it.options) };
      }),
      dm_starters: toStringList(result.dm_starters),
      community_rituals: toStringList(result.community_rituals),
      caption_tweaks: toStringList(result.caption_tweaks),
    };
  });

export const optimiseBio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      current_bio: string;
      platform: "instagram" | "tiktok" | "pinterest";
      goal: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "bio");
    const ctx = await getCtx(context.supabase, context.userId);
    const limits: Record<string, string> = {
      instagram: "150 characters max for bio. Name field is searchable (30 chars).",
      tiktok: "80 characters max for bio. Display name is searchable (30 chars).",
      pinterest: "160 characters max. Pinterest treats bio like SEO copy.",
    };
    const result = await callAITool<{
      score?: unknown;
      diagnosis?: unknown;
      missing?: unknown;
      keywords?: unknown;
      options?: unknown;
      name_suggestions?: unknown;
      link_advice?: unknown;
    }>({
      toolName: "bio_optimise",
      toolDescription:
        "Optimise a creator bio for clarity, search and conversion. Return 3 ready-to-paste options.",
      parameters: {
        type: "object",
        properties: {
          score: { type: "number" },
          diagnosis: { type: "string" },
          missing: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
          keywords: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
          options: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["clear", "playful", "bold"] },
                bio: { type: "string" },
              },
              required: ["style", "bio"],
              additionalProperties: false,
            },
          },
          name_suggestions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          link_advice: { type: "string" },
        },
        required: ["score", "diagnosis", "missing", "keywords", "options", "name_suggestions", "link_advice"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You optimise creator bios for UK mum creators. British English. Each rewritten bio must respect platform character limits and feel human (no buzzwords like 'wife. mum. boss.'). Score current bio 1-10. Provide 3 styles: clear (literal), playful (warm), bold (punchy). Name field suggestions must be SEARCHABLE keyword combos people actually type.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPlatform: ${data.platform.toUpperCase()}\nLimits: ${limits[data.platform]}\nGoal: ${data.goal}\nCurrent bio:\n${data.current_bio}\n\nReturn a score, diagnosis, what's missing, target keywords, 3 rewrites (clear/playful/bold), 3-5 searchable name field options, and link-in-bio advice.`,
        },
      ],
    });
    await quota.record();
    const score =
      typeof result.score === "number" ? Math.max(1, Math.min(10, Math.round(result.score))) : 0;
    const optionsRaw = Array.isArray(result.options) ? result.options : [];
    return {
      score,
      diagnosis: readString(result.diagnosis),
      missing: toStringList(result.missing),
      keywords: toStringList(result.keywords),
      options: optionsRaw.map((o) => {
        const it = o as Record<string, unknown>;
        return { style: readString(it.style, "clear"), bio: readString(it.bio) };
      }),
      name_suggestions: toStringList(result.name_suggestions),
      link_advice: readString(result.link_advice),
    };
  });

export const auditProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      handle: string;
      platform: "instagram" | "tiktok";
      bio: string;
      grid_summary: string;
      pinned_hooks?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "profile_audit");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      overall_score?: unknown;
      one_line_verdict?: unknown;
      first_impression?: unknown;
      scores?: unknown;
      strengths?: unknown;
      weaknesses?: unknown;
      quick_wins?: unknown;
      thirty_day_plan?: unknown;
    }>({
      toolName: "profile_audit",
      toolDescription:
        "Audit a creator's profile (bio + grid + pinned content) and return scores, strengths, weaknesses, quick wins and a 30-day plan.",
      parameters: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          one_line_verdict: { type: "string" },
          first_impression: { type: "string" },
          scores: {
            type: "object",
            properties: {
              clarity: { type: "number" },
              consistency: { type: "number" },
              hook_quality: { type: "number" },
              visual_cohesion: { type: "number" },
              monetisation_readiness: { type: "number" },
            },
            required: [
              "clarity",
              "consistency",
              "hook_quality",
              "visual_cohesion",
              "monetisation_readiness",
            ],
            additionalProperties: false,
          },
          strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          weaknesses: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          quick_wins: {
            type: "array",
            minItems: 4,
            maxItems: 6,
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                impact: { type: "string", enum: ["low", "medium", "high"] },
                effort: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["action", "impact", "effort"],
              additionalProperties: false,
            },
          },
          thirty_day_plan: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                week: { type: "number" },
                focus: { type: "string" },
                actions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
              },
              required: ["week", "focus", "actions"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "overall_score",
          "one_line_verdict",
          "first_impression",
          "scores",
          "strengths",
          "weaknesses",
          "quick_wins",
          "thirty_day_plan",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You audit social profiles for UK mum creators. British English. Be honest, kind and specific — quote actual words from the bio/grid summary in your reasoning. Score each axis 1-10 (10 = excellent). Quick wins must be doable today.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPlatform: ${data.platform.toUpperCase()}\nHandle: @${data.handle}\nBio:\n${data.bio}\n\nGrid / recent posts summary:\n${data.grid_summary}\n\nPinned / top hooks:\n${data.pinned_hooks ?? "n/a"}\n\nReturn an overall score (1-10), one-line verdict, first impression, axis scores, strengths, weaknesses, quick wins (with impact/effort), and a 4-week (30 day) growth plan.`,
        },
      ],
    });
    await quota.record();
    const overall =
      typeof result.overall_score === "number"
        ? Math.max(1, Math.min(10, Math.round(result.overall_score)))
        : 0;
    const num = (v: unknown) =>
      typeof v === "number" ? Math.max(1, Math.min(10, Math.round(v))) : 0;
    const sc = (result.scores ?? {}) as Record<string, unknown>;
    const winsRaw = Array.isArray(result.quick_wins) ? result.quick_wins : [];
    const planRaw = Array.isArray(result.thirty_day_plan) ? result.thirty_day_plan : [];
    return {
      overall_score: overall,
      one_line_verdict: readString(result.one_line_verdict),
      first_impression: readString(result.first_impression),
      scores: {
        clarity: num(sc.clarity),
        consistency: num(sc.consistency),
        hook_quality: num(sc.hook_quality),
        visual_cohesion: num(sc.visual_cohesion),
        monetisation_readiness: num(sc.monetisation_readiness),
      },
      strengths: toStringList(result.strengths),
      weaknesses: toStringList(result.weaknesses),
      quick_wins: winsRaw.map((w) => {
        const it = w as Record<string, unknown>;
        return {
          action: readString(it.action),
          impact: readString(it.impact, "medium"),
          effort: readString(it.effort, "medium"),
        };
      }),
      thirty_day_plan: planRaw.map((w, i) => {
        const it = w as Record<string, unknown>;
        return {
          week: typeof it.week === "number" ? it.week : i + 1,
          focus: readString(it.focus),
          actions: toStringList(it.actions),
        };
      }),
    };
  });

export const suggestPostTiming = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      platform: "instagram" | "tiktok" | "pinterest" | "facebook";
      audience_timezone?: string;
      audience_notes?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "timing");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      summary?: unknown;
      best_windows?: unknown;
      avoid_windows?: unknown;
      schedule?: unknown;
      content_type_timing?: unknown;
      tips?: unknown;
    }>({
      toolName: "post_timing",
      toolDescription:
        "Suggest realistic posting windows for a UK mum creator's audience, with a 7-day schedule and content-type timing.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          best_windows: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                day: { type: "string" },
                window: { type: "string" },
                why: { type: "string" },
              },
              required: ["day", "window", "why"],
              additionalProperties: false,
            },
          },
          avoid_windows: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          schedule: {
            type: "array",
            minItems: 7,
            maxItems: 7,
            items: {
              type: "object",
              properties: {
                day: { type: "string" },
                time: { type: "string" },
                content_type: { type: "string" },
                rationale: { type: "string" },
              },
              required: ["day", "time", "content_type", "rationale"],
              additionalProperties: false,
            },
          },
          content_type_timing: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                content_type: { type: "string" },
                best_time: { type: "string" },
                why: { type: "string" },
              },
              required: ["content_type", "best_time", "why"],
              additionalProperties: false,
            },
          },
          tips: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: [
          "summary",
          "best_windows",
          "avoid_windows",
          "schedule",
          "content_type_timing",
          "tips",
        ],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You advise on social posting times for UK mum creators. British English. All times in 24h format (e.g. 19:30) and explicitly in the audience timezone. Anchor advice to real mum-of-young-kids rhythms (school run, nap times, 9pm scroll). Be specific — never 'evenings'.",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nPlatform: ${data.platform.toUpperCase()}\nAudience timezone: ${data.audience_timezone ?? "GMT/BST (UK)"}\nAudience notes: ${data.audience_notes ?? "n/a"}\n\nReturn a 1-line summary, 3-5 best posting windows (day + time + why), 2-4 windows to avoid, a Mon-Sun schedule (one slot per day with content type), content-type-specific timing (Reels vs Stories vs Carousels etc.), and 3-5 timing tips.`,
        },
      ],
    });
    await quota.record();
    const bw = Array.isArray(result.best_windows) ? result.best_windows : [];
    const sch = Array.isArray(result.schedule) ? result.schedule : [];
    const ctt = Array.isArray(result.content_type_timing) ? result.content_type_timing : [];
    return {
      summary: readString(result.summary),
      best_windows: bw.map((w) => {
        const it = w as Record<string, unknown>;
        return {
          day: readString(it.day),
          window: readString(it.window),
          why: readString(it.why),
        };
      }),
      avoid_windows: toStringList(result.avoid_windows),
      schedule: sch.map((s) => {
        const it = s as Record<string, unknown>;
        return {
          day: readString(it.day),
          time: readString(it.time),
          content_type: readString(it.content_type),
          rationale: readString(it.rationale),
        };
      }),
      content_type_timing: ctt.map((c) => {
        const it = c as Record<string, unknown>;
        return {
          content_type: readString(it.content_type),
          best_time: readString(it.best_time),
          why: readString(it.why),
        };
      }),
      tips: toStringList(result.tips),
    };
  });

// ============== Faceless Content Optimiser ==============
export const optimiseFaceless = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; current_format?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "faceless");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      formats?: unknown;
      voiceover_scripts?: unknown;
      visual_options?: unknown;
      hook_overlays?: unknown;
      retention_tactics?: unknown;
      tools?: unknown;
    }>({
      toolName: "faceless_optimise",
      toolDescription: "Plan a faceless short-form video: format, visuals, overlays, voiceover and retention.",
      parameters: {
        type: "object",
        properties: {
          formats: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
          voiceover_scripts: {
            type: "array", minItems: 3, maxItems: 3,
            items: {
              type: "object",
              properties: { style: { type: "string" }, script: { type: "string" } },
              required: ["style", "script"], additionalProperties: false,
            },
          },
          visual_options: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 8 },
          hook_overlays: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 7 },
          retention_tactics: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
          tools: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
        },
        required: ["formats", "voiceover_scripts", "visual_options", "hook_overlays", "retention_tactics", "tools"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You design faceless content for UK mum creators who don't want to film themselves. British English. Practical, no fluff. Visuals must be do-able on a phone (b-roll, screen recording, stock, AI image, text-on-photo). Tools: free or cheap." },
        { role: "user", content: `Profile:\n${ctx}\n\nTopic: ${data.topic}\nCurrent format (optional): ${data.current_format ?? "n/a"}\n\nReturn 4-6 faceless format ideas, 3 voiceover scripts (calm/energetic/storyteller), visual options, hook text overlays, retention tactics, and tools to use.` },
      ],
    });
    await quota.record();
    const vo = Array.isArray(result.voiceover_scripts) ? result.voiceover_scripts : [];
    return {
      formats: toStringList(result.formats),
      voiceover_scripts: vo.map((v) => {
        const it = v as Record<string, unknown>;
        return { style: readString(it.style), script: readString(it.script) };
      }),
      visual_options: toStringList(result.visual_options),
      hook_overlays: toStringList(result.hook_overlays),
      retention_tactics: toStringList(result.retention_tactics),
      tools: toStringList(result.tools),
    };
  });

// ============== Pinterest Pin Optimiser ==============
export const optimisePin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; current_title?: string; current_description?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "pin");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      titles?: unknown;
      descriptions?: unknown;
      board_suggestions?: unknown;
      keywords?: unknown;
      hashtags?: unknown;
      pin_image_brief?: unknown;
      text_overlay?: unknown;
      cta?: unknown;
      seasonality?: unknown;
    }>({
      toolName: "pin_optimise",
      toolDescription: "Optimise a Pinterest pin: titles, descriptions, board, image brief and overlays.",
      parameters: {
        type: "object",
        properties: {
          titles: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
          descriptions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          board_suggestions: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
          keywords: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 12 },
          hashtags: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
          pin_image_brief: { type: "string" },
          text_overlay: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          cta: { type: "string" },
          seasonality: { type: "string" },
        },
        required: ["titles", "descriptions", "board_suggestions", "keywords", "hashtags", "pin_image_brief", "text_overlay", "cta", "seasonality"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You optimise Pinterest pins for UK mum creators. Pinterest = SEO + saves. Titles under 100 chars, keyword-led but readable. Descriptions 200-500 chars, conversational, keyword-rich. Image brief = exact composition, colour, layout. Overlays = punchy 3-7 word lines. British English." },
        { role: "user", content: `Profile:\n${ctx}\n\nTopic: ${data.topic}\nCurrent title: ${data.current_title ?? "n/a"}\nCurrent description: ${data.current_description ?? "n/a"}\n\nReturn 5 titles, 3 descriptions, 4-6 board name ideas, keywords, hashtags, an image brief, 3-5 text overlay options, a CTA, and a seasonality note (when this pin will peak).` },
      ],
    });
    await quota.record();
    return {
      titles: toStringList(result.titles),
      descriptions: toStringList(result.descriptions),
      board_suggestions: toStringList(result.board_suggestions),
      keywords: toStringList(result.keywords),
      hashtags: toStringList(result.hashtags).map((h) => (h.startsWith("#") ? h : `#${h}`)),
      pin_image_brief: readString(result.pin_image_brief),
      text_overlay: toStringList(result.text_overlay),
      cta: readString(result.cta),
      seasonality: readString(result.seasonality),
    };
  });

// ============== Script Tightener ==============
export const tightenScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { script: string; target_seconds?: number }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "script_tighten");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      original_word_count?: unknown;
      tightened_word_count?: unknown;
      tightened_seconds?: unknown;
      hook_score?: unknown;
      issues?: unknown;
      tightened_script?: unknown;
      cuts?: unknown;
      hook_alternatives?: unknown;
      ending_alternatives?: unknown;
    }>({
      toolName: "script_tighten",
      toolDescription: "Tighten a short-form script: cut filler, sharpen hook, hit a target length.",
      parameters: {
        type: "object",
        properties: {
          original_word_count: { type: "number" },
          tightened_word_count: { type: "number" },
          tightened_seconds: { type: "number" },
          hook_score: { type: "number" },
          issues: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
          tightened_script: { type: "string" },
          cuts: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
          hook_alternatives: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          ending_alternatives: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: ["original_word_count", "tightened_word_count", "tightened_seconds", "hook_score", "issues", "tightened_script", "cuts", "hook_alternatives", "ending_alternatives"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You're a short-form script editor for UK mum creators. Cut every filler. Use ~2.5 words per second of voice-over. Keep voice human and natural — no AI clichés. Score hook 1-10. Show specific cuts." },
        { role: "user", content: `Profile:\n${ctx}\n\nTarget length: ${data.target_seconds ?? 30}s\n\nScript:\n${data.script}\n\nReturn the original word count, tightened word count, tightened seconds, hook score, issues, the tightened script, the specific phrases you cut, alternative hooks and alternative endings.` },
      ],
    });
    await quota.record();
    const num = (v: unknown) => (typeof v === "number" ? v : 0);
    return {
      original_word_count: num(result.original_word_count),
      tightened_word_count: num(result.tightened_word_count),
      tightened_seconds: num(result.tightened_seconds),
      hook_score: Math.max(1, Math.min(10, num(result.hook_score) || 0)),
      issues: toStringList(result.issues),
      tightened_script: readString(result.tightened_script),
      cuts: toStringList(result.cuts),
      hook_alternatives: toStringList(result.hook_alternatives),
      ending_alternatives: toStringList(result.ending_alternatives),
    };
  });

// ============== Deliverables Builder ==============
export const buildDeliverables = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { brand: string; budget?: string; campaign_goal: string; platforms: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "deliverables");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      summary?: unknown;
      packages?: unknown;
      timeline?: unknown;
      exclusions?: unknown;
      add_ons?: unknown;
      contract_clauses?: unknown;
    }>({
      toolName: "deliverables_build",
      toolDescription: "Build 3 brand-deal package tiers with deliverables, timeline and add-ons.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          packages: {
            type: "array", minItems: 3, maxItems: 3,
            items: {
              type: "object",
              properties: {
                tier: { type: "string", enum: ["starter", "standard", "premium"] },
                price_range: { type: "string" },
                deliverables: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
                usage_rights: { type: "string" },
                exclusivity: { type: "string" },
              },
              required: ["tier", "price_range", "deliverables", "usage_rights", "exclusivity"],
              additionalProperties: false,
            },
          },
          timeline: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          exclusions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          add_ons: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          contract_clauses: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
        },
        required: ["summary", "packages", "timeline", "exclusions", "add_ons", "contract_clauses"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You build brand-deal scopes for UK mum creators. British English, GBP. Realistic UK market rates for micro/mid-tier creators. Include usage rights, exclusivity windows. Be specific (e.g. '1 x 60s Reel', not 'video content')." },
        { role: "user", content: `Profile:\n${ctx}\n\nBrand: ${data.brand}\nBudget: ${data.budget ?? "not set"}\nCampaign goal: ${data.campaign_goal}\nPlatforms: ${data.platforms}\n\nReturn 3 tiered packages (starter/standard/premium) with price range, deliverables, usage rights, exclusivity, plus a timeline, what's NOT included, optional add-ons, and key contract clauses.` },
      ],
    });
    await quota.record();
    const pkgs = Array.isArray(result.packages) ? result.packages : [];
    return {
      summary: readString(result.summary),
      packages: pkgs.map((p) => {
        const it = p as Record<string, unknown>;
        return {
          tier: readString(it.tier, "standard"),
          price_range: readString(it.price_range),
          deliverables: toStringList(it.deliverables),
          usage_rights: readString(it.usage_rights),
          exclusivity: readString(it.exclusivity),
        };
      }),
      timeline: toStringList(result.timeline),
      exclusions: toStringList(result.exclusions),
      add_ons: toStringList(result.add_ons),
      contract_clauses: toStringList(result.contract_clauses),
    };
  });

// ============== Usage Rights Calculator ==============
export const calculateUsageRights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { base_fee: number; channels: string; duration_months: number; territory: string; exclusivity: string; whitelisting: boolean; paid_ads: boolean }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "usage_rights");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      multiplier?: unknown;
      suggested_uplift_gbp?: unknown;
      suggested_total_gbp?: unknown;
      breakdown?: unknown;
      negotiation_script?: unknown;
      red_flags?: unknown;
    }>({
      toolName: "usage_rights_calc",
      toolDescription: "Calculate a fair usage-rights uplift on top of a base content fee.",
      parameters: {
        type: "object",
        properties: {
          multiplier: { type: "number" },
          suggested_uplift_gbp: { type: "number" },
          suggested_total_gbp: { type: "number" },
          breakdown: {
            type: "array", minItems: 3, maxItems: 8,
            items: {
              type: "object",
              properties: { factor: { type: "string" }, impact: { type: "string" }, multiplier: { type: "number" } },
              required: ["factor", "impact", "multiplier"], additionalProperties: false,
            },
          },
          negotiation_script: { type: "string" },
          red_flags: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 5 },
        },
        required: ["multiplier", "suggested_uplift_gbp", "suggested_total_gbp", "breakdown", "negotiation_script", "red_flags"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You calculate usage rights for UK creator brand deals in GBP. Industry norms: organic-only = 0 uplift, brand whitelisting +50-100%, paid social ads +50-150%, all-media buyout +200-400%. Multiplier scales with duration, territory, exclusivity. Be honest, never undersell." },
        { role: "user", content: `Profile:\n${ctx}\n\nBase content fee: £${data.base_fee}\nChannels brand wants: ${data.channels}\nDuration: ${data.duration_months} months\nTerritory: ${data.territory}\nExclusivity: ${data.exclusivity}\nWhitelisting: ${data.whitelisting ? "yes" : "no"}\nPaid ads: ${data.paid_ads ? "yes" : "no"}\n\nReturn the multiplier, uplift in £, total in £, factor breakdown, a 2-line negotiation script, and any red flags.` },
      ],
    });
    await quota.record();
    const num = (v: unknown) => (typeof v === "number" ? v : 0);
    const br = Array.isArray(result.breakdown) ? result.breakdown : [];
    return {
      multiplier: num(result.multiplier),
      suggested_uplift_gbp: Math.round(num(result.suggested_uplift_gbp)),
      suggested_total_gbp: Math.round(num(result.suggested_total_gbp)),
      breakdown: br.map((b) => {
        const it = b as Record<string, unknown>;
        return { factor: readString(it.factor), impact: readString(it.impact), multiplier: num(it.multiplier) };
      }),
      negotiation_script: readString(result.negotiation_script),
      red_flags: toStringList(result.red_flags),
    };
  });

// ============== Media Kit Generator ==============
export const generateMediaKit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { stats: string; rates: string; past_brands?: string; goal: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "media_kit");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      tagline?: unknown;
      about?: unknown;
      audience_summary?: unknown;
      stats_block?: unknown;
      services?: unknown;
      testimonial_prompts?: unknown;
      cta?: unknown;
      design_brief?: unknown;
    }>({
      toolName: "media_kit",
      toolDescription: "Write all the copy for a creator's media kit one-pager.",
      parameters: {
        type: "object",
        properties: {
          tagline: { type: "string" },
          about: { type: "string" },
          audience_summary: { type: "string" },
          stats_block: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          services: {
            type: "array", minItems: 3, maxItems: 5,
            items: {
              type: "object",
              properties: { name: { type: "string" }, description: { type: "string" }, price_from: { type: "string" } },
              required: ["name", "description", "price_from"], additionalProperties: false,
            },
          },
          testimonial_prompts: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          cta: { type: "string" },
          design_brief: { type: "string" },
        },
        required: ["tagline", "about", "audience_summary", "stats_block", "services", "testimonial_prompts", "cta", "design_brief"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You write media kit copy for UK mum creators. Warm, professional, confident. British English, GBP. About section under 80 words. Tagline under 12 words. Stats reformatted as scannable lines. Design brief = specific colours/layout suggestions." },
        { role: "user", content: `Profile:\n${ctx}\n\nGoal of media kit: ${data.goal}\nStats:\n${data.stats}\n\nRates summary:\n${data.rates}\n\nPast brands worked with:\n${data.past_brands ?? "n/a"}\n\nReturn tagline, about (under 80 words), audience summary, stats block, 3-5 services with starting prices, testimonial prompts to send to past clients, a CTA, and a design brief.` },
      ],
    });
    await quota.record();
    const sv = Array.isArray(result.services) ? result.services : [];
    return {
      tagline: readString(result.tagline),
      about: readString(result.about),
      audience_summary: readString(result.audience_summary),
      stats_block: toStringList(result.stats_block),
      services: sv.map((s) => {
        const it = s as Record<string, unknown>;
        return { name: readString(it.name), description: readString(it.description), price_from: readString(it.price_from) };
      }),
      testimonial_prompts: toStringList(result.testimonial_prompts),
      cta: readString(result.cta),
      design_brief: readString(result.design_brief),
    };
  });

// ============== Package Naming Generator ==============
export const generatePackageNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { service_type: string; vibe: string; theme?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "package_names");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ sets?: unknown }>({
      toolName: "package_names",
      toolDescription: "Generate 3 sets of 3-tier service package names.",
      parameters: {
        type: "object",
        properties: {
          sets: {
            type: "array", minItems: 5, maxItems: 5,
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                tiers: {
                  type: "array", minItems: 3, maxItems: 3,
                  items: {
                    type: "object",
                    properties: { name: { type: "string" }, tagline: { type: "string" } },
                    required: ["name", "tagline"], additionalProperties: false,
                  },
                },
              },
              required: ["theme", "tiers"], additionalProperties: false,
            },
          },
        },
        required: ["sets"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You name service packages for UK mum creators. British English. Names should feel premium, on-brand, easy to say, never cringy. Each set has a clear theme (e.g. 'cosy/garden', 'bold/bakery', 'minimal/clean'). Tiers ordered low → high." },
        { role: "user", content: `Profile:\n${ctx}\n\nService type: ${data.service_type}\nVibe: ${data.vibe}\nTheme hint: ${data.theme ?? "open"}\n\nReturn 5 sets of 3-tier package names with a one-line tagline each.` },
      ],
    });
    await quota.record();
    const sets = Array.isArray(result.sets) ? result.sets : [];
    return {
      sets: sets.map((s) => {
        const it = s as Record<string, unknown>;
        const tiers = Array.isArray(it.tiers) ? it.tiers : [];
        return {
          theme: readString(it.theme),
          tiers: tiers.map((t) => {
            const ti = t as Record<string, unknown>;
            return { name: readString(ti.name), tagline: readString(ti.tagline) };
          }),
        };
      }),
    };
  });

// ============== Service Description Generator ==============
export const generateServiceDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { service_name: string; what_it_includes: string; ideal_client: string; price?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "service_desc");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      one_liner?: unknown;
      short?: unknown;
      long?: unknown;
      bullets?: unknown;
      who_its_for?: unknown;
      who_its_not_for?: unknown;
      faq?: unknown;
    }>({
      toolName: "service_description",
      toolDescription: "Write multi-length service descriptions plus FAQs.",
      parameters: {
        type: "object",
        properties: {
          one_liner: { type: "string" },
          short: { type: "string" },
          long: { type: "string" },
          bullets: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 7 },
          who_its_for: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          who_its_not_for: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          faq: {
            type: "array", minItems: 3, maxItems: 5,
            items: {
              type: "object",
              properties: { q: { type: "string" }, a: { type: "string" } },
              required: ["q", "a"], additionalProperties: false,
            },
          },
        },
        required: ["one_liner", "short", "long", "bullets", "who_its_for", "who_its_not_for", "faq"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You write service descriptions for UK mum creators. British English. Warm, clear, never salesy. Short = ~40 words. Long = ~120 words. Bullets = scannable benefits. FAQs = real things buyers ask." },
        { role: "user", content: `Profile:\n${ctx}\n\nService: ${data.service_name}\nWhat's included: ${data.what_it_includes}\nIdeal client: ${data.ideal_client}\nPrice: ${data.price ?? "n/a"}\n\nReturn one-liner, short, long, bullets, who it's for, who it's NOT for, and 3-5 FAQs.` },
      ],
    });
    await quota.record();
    const faq = Array.isArray(result.faq) ? result.faq : [];
    return {
      one_liner: readString(result.one_liner),
      short: readString(result.short),
      long: readString(result.long),
      bullets: toStringList(result.bullets),
      who_its_for: toStringList(result.who_its_for),
      who_its_not_for: toStringList(result.who_its_not_for),
      faq: faq.map((f) => {
        const it = f as Record<string, unknown>;
        return { q: readString(it.q), a: readString(it.a) };
      }),
    };
  });

// ============== Passive Product Ideas ==============
export const generatePassiveIdeas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { audience: string; existing_skills: string; price_range?: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "passive_ideas");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ ideas?: unknown; first_steps?: unknown }>({
      toolName: "passive_ideas",
      toolDescription: "Generate passive / digital product ideas with effort, market and pricing.",
      parameters: {
        type: "object",
        properties: {
          ideas: {
            type: "array", minItems: 8, maxItems: 10,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                format: { type: "string" },
                what_it_is: { type: "string" },
                target_buyer: { type: "string" },
                price_range: { type: "string" },
                effort: { type: "string", enum: ["low", "medium", "high"] },
                profit_potential: { type: "string", enum: ["low", "medium", "high"] },
                first_post_idea: { type: "string" },
              },
              required: ["title", "format", "what_it_is", "target_buyer", "price_range", "effort", "profit_potential", "first_post_idea"],
              additionalProperties: false,
            },
          },
          first_steps: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: ["ideas", "first_steps"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You generate digital/passive product ideas for UK mum creators. British English, GBP pricing. Realistic effort. Formats: PDF guide, Notion template, mini-course, preset pack, swipe file, sticker pack, printable, email mini-series, audio guide, etc." },
        { role: "user", content: `Profile:\n${ctx}\n\nAudience: ${data.audience}\nExisting skills: ${data.existing_skills}\nPrice range: ${data.price_range ?? "open"}\n\nReturn 8-10 product ideas with format, what-it-is, target buyer, price, effort, profit, and a first-post hook idea.` },
      ],
    });
    await quota.record();
    const ideas = Array.isArray(result.ideas) ? result.ideas : [];
    return {
      ideas: ideas.map((i) => {
        const it = i as Record<string, unknown>;
        return {
          title: readString(it.title), format: readString(it.format),
          what_it_is: readString(it.what_it_is), target_buyer: readString(it.target_buyer),
          price_range: readString(it.price_range),
          effort: readString(it.effort, "medium"),
          profit_potential: readString(it.profit_potential, "medium"),
          first_post_idea: readString(it.first_post_idea),
        };
      }),
      first_steps: toStringList(result.first_steps),
    };
  });

// ===================== Rejection Recovery =====================
export const recoverRejection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { situation: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "rejection");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{
      reframe?: unknown;
      pep_talk?: unknown;
      reply_draft?: unknown;
      lessons?: unknown;
      next_steps?: unknown;
      affirmation?: unknown;
    }>({
      toolName: "rejection_recovery",
      toolDescription: "Help a creator process a rejection (brand no, flop, harsh comment, ghosted pitch) and bounce back.",
      parameters: {
        type: "object",
        properties: {
          reframe: { type: "string" },
          pep_talk: { type: "string" },
          reply_draft: { type: "string" },
          lessons: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          next_steps: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
          affirmation: { type: "string" },
        },
        required: ["reframe", "pep_talk", "reply_draft", "lessons", "next_steps", "affirmation"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You're a kind, no-BS creator coach for UK mums. Validate first, then help them act. British English. Warm, not saccharine. The reply_draft should be a short, professional, classy reply they could send back (or 'no reply needed — here's why' if a reply isn't appropriate)." },
        { role: "user", content: `Profile:\n${ctx}\n\nRejection / setback:\n${data.situation}\n\nGive: reframe, pep_talk (2-3 sentences), reply_draft, lessons, 3-4 next_steps (today/this week), and one short affirmation.` },
      ],
    });
    await quota.record();
    return {
      reframe: readString(result.reframe),
      pep_talk: readString(result.pep_talk),
      reply_draft: readString(result.reply_draft),
      lessons: toStringList(result.lessons),
      next_steps: toStringList(result.next_steps),
      affirmation: readString(result.affirmation),
    };
  });

// ===================== "You're doing better than you think" =====================
export const summariseWins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "wins");
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: posts }, { data: portfolio }, { data: income }, { data: invoices }] = await Promise.all([
      supabase.from("posts_logged").select("description, platform, views, likes, comments, saves, shares, posted_at").eq("user_id", userId).gte("posted_at", since).order("posted_at", { ascending: false }),
      supabase.from("portfolio_items").select("title, brand, platform, posted_on").eq("user_id", userId).order("posted_on", { ascending: false, nullsFirst: false }).limit(20),
      supabase.from("income_entries").select("amount, currency, category, entry_date, brand").eq("user_id", userId).gte("entry_date", since.slice(0, 10)),
      supabase.from("invoices").select("number, brand_name, status, currency, items").eq("user_id", userId).gte("created_at", since),
    ]);
    const postsArr = posts ?? [];
    const incomeArr = income ?? [];
    // Numeric stats
    const totalViews = postsArr.reduce((s, p) => s + (p.views ?? 0), 0);
    const totalLikes = postsArr.reduce((s, p) => s + (p.likes ?? 0), 0);
    const totalComments = postsArr.reduce((s, p) => s + (p.comments ?? 0), 0);
    const totalSaves = postsArr.reduce((s, p) => s + (p.saves ?? 0), 0);
    const incomeByCcy = new Map<string, number>();
    for (const e of incomeArr) incomeByCcy.set(e.currency, (incomeByCcy.get(e.currency) ?? 0) + Number(e.amount ?? 0));
    const stats = {
      posts_30d: postsArr.length,
      portfolio_items: (portfolio ?? []).length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      total_saves: totalSaves,
      invoices_30d: (invoices ?? []).length,
      income_30d: Object.fromEntries(incomeByCcy),
    };

    if (postsArr.length === 0 && (portfolio ?? []).length === 0 && incomeArr.length === 0) {
      await quota.record();
      return {
        stats,
        wins: ["You showed up to read this. That's the first win."],
        proud_of: ["Choosing to take this seriously enough to track it."],
        invisible_progress: ["Most of what builds a creator career happens before anyone claps for it."],
        message: "There's nothing logged yet — and that doesn't mean nothing's happened. Log one post or one invoice and we'll have something to celebrate.",
        next_tiny_step: "Log one post you're slightly proud of in Insights.",
      };
    }

    const ctx = await getCtx(supabase, userId);
    const result = await callAITool<{
      wins?: unknown; proud_of?: unknown; invisible_progress?: unknown; message?: unknown; next_tiny_step?: unknown;
    }>({
      toolName: "doing_better",
      toolDescription: "Reframe a creator's last 30 days as a list of genuine wins — even small ones.",
      parameters: {
        type: "object",
        properties: {
          wins: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 7 },
          proud_of: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
          invisible_progress: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          message: { type: "string" },
          next_tiny_step: { type: "string" },
        },
        required: ["wins", "proud_of", "invisible_progress", "message", "next_tiny_step"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "You write warm, specific 'you're doing better than you think' summaries for UK mum creators. Use their actual numbers. Never fluffy. Celebrate effort + invisible progress. British English." },
        { role: "user", content: `Profile:\n${ctx}\n\nLast 30 days stats: ${JSON.stringify(stats)}\nRecent posts (top 10): ${JSON.stringify(postsArr.slice(0, 10))}\nPortfolio entries: ${JSON.stringify((portfolio ?? []).slice(0, 10))}\nIncome entries: ${JSON.stringify(incomeArr.slice(0, 10))}` },
      ],
    });
    await quota.record();
    return {
      stats,
      wins: toStringList(result.wins),
      proud_of: toStringList(result.proud_of),
      invisible_progress: toStringList(result.invisible_progress),
      message: readString(result.message),
      next_tiny_step: readString(result.next_tiny_step),
    };
  });

// ===================== Daily Motivation =====================
export const dailyMotivation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "motivation", { freeAllowed: true });
    const ctx = await getCtx(context.supabase, context.userId);
    const today = new Date().toISOString().slice(0, 10);
    const result = await callAITool<{
      affirmation?: unknown; truth_bomb?: unknown; tiny_action?: unknown; journal_prompt?: unknown; permission_slip?: unknown;
    }>({
      toolName: "daily_motivation",
      toolDescription: "Generate one short daily creator pep talk for a mum creator.",
      parameters: {
        type: "object",
        properties: {
          affirmation: { type: "string" },
          truth_bomb: { type: "string" },
          tiny_action: { type: "string" },
          journal_prompt: { type: "string" },
          permission_slip: { type: "string" },
        },
        required: ["affirmation", "truth_bomb", "tiny_action", "journal_prompt", "permission_slip"],
        additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Daily pep talks for mum creators. Real, warm, no toxic positivity. British English. Short — every field 1-2 sentences max. Tiny_action must be doable in under 5 minutes today." },
        { role: "user", content: `Profile:\n${ctx}\n\nToday is ${today}. Generate today's prompts.` },
      ],
    });
    await quota.record();
    return {
      date: today,
      affirmation: readString(result.affirmation),
      truth_bomb: readString(result.truth_bomb),
      tiny_action: readString(result.tiny_action),
      journal_prompt: readString(result.journal_prompt),
      permission_slip: readString(result.permission_slip),
    };
  });

