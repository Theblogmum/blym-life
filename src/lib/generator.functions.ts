import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { getCtx, readString, requirePremium, toStringList } from "@/lib/generator-helpers.server";

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; topic: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePremium(context.supabase, context.userId);
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ options?: unknown }>({
      toolName: "generate",
      toolDescription: `5 ${data.kind} options.`,
      parameters: {
        type: "object",
        properties: { options: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 } },
        required: ["options"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Write content for mum creators. British English, sound real, no AI clichés." },
        { role: "user", content: `Profile:\n${ctx}\n\n5 ${data.kind} options for: ${data.topic}` },
      ],
    });
    return { options: toStringList(result.options) };
  });

export const analyseTrend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { input: string }) => d)
  .handler(async ({ data, context }) => {
    await requirePremium(context.supabase, context.userId);
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ hook_breakdown?: unknown; structure?: unknown; why_it_works?: unknown; remix_for_you?: unknown }>({
      toolName: "analyse_trend", toolDescription: "Break down a viral trend and propose remixes.",
      parameters: {
        type: "object",
        properties: {
          hook_breakdown: { type: "string" }, structure: { type: "string" },
          why_it_works: { type: "string" },
          remix_for_you: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        },
        required: ["hook_breakdown", "structure", "why_it_works", "remix_for_you"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Viral analyst for mum creators. Specific and practical." },
        { role: "user", content: `Profile:\n${ctx}\n\nAnalyse:\n${data.input}` },
      ],
    });
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
    await requirePremium(context.supabase, context.userId);
    const result = await callAITool<{ ideas?: unknown }>({
      toolName: "clip_ideas", toolDescription: "5 post ideas using one clip.",
      parameters: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            items: {
              type: "object",
              properties: { title: { type: "string" }, hook: { type: "string" }, angle: { type: "string" } },
              required: ["title", "hook", "angle"], additionalProperties: false,
            },
            minItems: 5, maxItems: 5,
          },
        },
        required: ["ideas"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Reuse one clip 5 different ways for a mum creator." },
        { role: "user", content: `Clip: ${data.description}` },
      ],
    });
    const ideas = Array.isArray(result.ideas) ? result.ideas : [];
    return {
      ideas: ideas.map((idea: any) => ({
        title: readString(idea?.title, "Untitled idea"),
        hook: readString(idea?.hook),
        angle: readString(idea?.angle),
      })).filter((idea) => idea.hook || idea.angle),
    };
  });

export const generatePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { brand: string; deliverables: string; followers?: number }) => d)
  .handler(async ({ data, context }) => {
    await requirePremium(context.supabase, context.userId);
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ subject?: unknown; body?: unknown; suggested_price_gbp?: unknown }>({
      toolName: "brand_pitch", toolDescription: "Brand pitch email + UK GBP price.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" }, body: { type: "string" }, suggested_price_gbp: { type: "number" },
        },
        required: ["subject", "body", "suggested_price_gbp"], additionalProperties: false,
      },
      messages: [
        { role: "system", content: "Warm, professional brand pitches for UK mum creators." },
        { role: "user", content: `Creator:\n${ctx}\nFollowers: ${data.followers ?? "unknown"}\nBrand: ${data.brand}\nDeliverables: ${data.deliverables}` },
      ],
    });
    return {
      subject: readString(result.subject, `Collaboration idea for ${data.brand}`),
      body: readString(result.body),
      suggested_price_gbp: typeof result.suggested_price_gbp === "number" ? result.suggested_price_gbp : 0,
    };
  });