import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAITool, buildCreatorContext } from "@/lib/ai.server";

type DailyIdea = {
  hook: string;
  format: string;
  why: string;
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const getDailyIdea = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = ymd(new Date());

    // Cache: store in saved_content with kind='daily_idea' once per day
    const { data: cached } = await supabase
      .from("saved_content")
      .select("id, body, created_at")
      .eq("user_id", userId)
      .eq("kind", "daily_idea")
      .gte("created_at", `${today}T00:00:00Z`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached?.body) {
      try {
        return { idea: JSON.parse(cached.body) as DailyIdea, cached: true };
      } catch {
        // fall through and regenerate
      }
    }

    const { data: creator } = await supabase
      .from("creator_profile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const ctx = buildCreatorContext(creator ?? {});
    const dayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });

    try {
      const idea = await callAITool<DailyIdea>({
        toolName: "daily_idea",
        toolDescription: "Generate ONE post idea for today tailored to this UK mum creator.",
        parameters: {
          type: "object",
          required: ["hook", "format", "why"],
          properties: {
            hook: { type: "string", description: "A scroll-stopping opening line, max 100 chars." },
            format: { type: "string", description: "Short label e.g. 'POV reel', '3-shot carousel', 'Talking-head 30s'." },
            why: { type: "string", description: "One sentence on why this works for them today." },
          },
        },
        messages: [
          { role: "system", content: "You suggest one fresh, specific, on-brand post idea. Be concrete, not generic. UK English." },
          { role: "user", content: `Today is ${dayName}. Creator profile:\n${ctx}\n\nGive me ONE post idea I could film today.` },
        ],
      });

      // Cache
      await supabase.from("saved_content").insert({
        user_id: userId,
        kind: "daily_idea",
        title: `Daily idea — ${today}`,
        body: JSON.stringify(idea),
      });

      return { idea, cached: false };
    } catch (e) {
      console.error("daily idea error", e);
      return {
        idea: {
          hook: "Show one small thing you do that secretly saves your sanity.",
          format: "Talking-head reel · 20s",
          why: "Mum-life relatability hooks fast and gets shared.",
        } as DailyIdea,
        cached: false,
      };
    }
  });