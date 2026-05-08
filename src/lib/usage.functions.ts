import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FREE_DAILY_LIMIT, isPremium } from "@/lib/generator-helpers.server";

const FEATURES = ["generator", "viral_lab", "recycler", "ugc_pitch"] as const;

export const getUsageToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const premium = await isPremium(supabase, userId);
    if (premium) {
      return {
        premium: true,
        limit: null as number | null,
        usage: Object.fromEntries(FEATURES.map((f) => [f, 0])) as Record<
          (typeof FEATURES)[number],
          number
        >,
      };
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("usage_events")
      .select("feature")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString());
    const usage = Object.fromEntries(FEATURES.map((f) => [f, 0])) as Record<
      (typeof FEATURES)[number],
      number
    >;
    for (const row of data ?? []) {
      const f = (row as { feature: string }).feature;
      if (f in usage) usage[f as (typeof FEATURES)[number]]++;
    }
    return { premium: false, limit: FREE_DAILY_LIMIT, usage };
  });