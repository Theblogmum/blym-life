import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool } from "@/lib/ai.server";
import { enforceTrial, getCtx, readString } from "@/lib/generator-helpers.server";

export const generateTemplates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { need: string }) => d)
  .handler(async ({ data, context }) => {
    const quota = await enforceTrial(context.supabase, context.userId, "generator");
    const ctx = await getCtx(context.supabase, context.userId);
    const result = await callAITool<{ kind?: unknown; templates?: unknown }>({
      toolName: "smart_templates",
      toolDescription:
        "Detect whether the user needs a social post template OR an email/DM template, then return 4 ready-to-use options.",
      parameters: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["post", "email", "dm"] },
          templates: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                why: { type: "string" },
              },
              required: ["title", "body", "why"],
              additionalProperties: false,
            },
          },
        },
        required: ["kind", "templates"],
        additionalProperties: false,
      },
      messages: [
        {
          role: "system",
          content:
            "You write templates for UK mum creators. Detect whether they want a SOCIAL POST script OR an EMAIL/DM. British English, warm, real, no AI clichés. Each template body must be the FULL ready-to-send text (not bullet points).",
        },
        {
          role: "user",
          content: `Creator profile:\n${ctx}\n\nWhat they need: ${data.need}\n\nReturn 4 distinct template options with a short reason each.`,
        },
      ],
    });
    await quota.record();
    const templates = Array.isArray(result.templates) ? result.templates : [];
    return {
      kind: readString(result.kind, "post"),
      templates: templates.map((t) => {
        const item = t as Record<string, unknown>;
        return {
          title: readString(item.title, "Untitled"),
          body: readString(item.body),
          why: readString(item.why),
        };
      }),
    };
  });