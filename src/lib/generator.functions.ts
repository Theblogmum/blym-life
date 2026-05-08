import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool, buildCreatorContext } from "@/lib/ai.server";

async function getCtx(supabase: any, userId: string) {
  const { data } = await supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
  return buildCreatorContext(data ?? {});
}

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; topic: string }) => d)
  .handler(async ({ data, context }) => {
    const ctx = await getCtx(context.supabase, context.userId);
    return await callAITool<{ options: string[] }>({
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
  });

export const analyseTrend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { input: string }) => d)
  .handler(async ({ data, context }) => {
    const ctx = await getCtx(context.supabase, context.userId);
    return await callAITool<{ hook_breakdown: string; structure: string; why_it_works: string; remix_for_you: string[] }>({
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
  });

export const recycleClip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { description: string }) => d)
  .handler(async ({ data }) => {
    return await callAITool<{ ideas: { title: string; hook: string; angle: string }[] }>({
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
  });

export const generatePitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { brand: string; deliverables: string; followers?: number }) => d)
  .handler(async ({ data, context }) => {
    const ctx = await getCtx(context.supabase, context.userId);
    return await callAITool<{ subject: string; body: string; suggested_price_gbp: number }>({
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
  });