import { buildCreatorContext } from "@/lib/ai.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type SupabaseLike = SupabaseClient<Database>;

export const FREE_DAILY_LIMIT = 3;

export type Feature = "generator" | "viral_lab" | "recycler" | "ugc_pitch";

export const FEATURE_LABELS: Record<Feature, string> = {
  generator: "Content Generator",
  viral_lab: "Viral Lab",
  recycler: "Clip Recycler",
  ugc_pitch: "UGC Pitch",
};

export function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(/\n+/)
      .map((item) => item.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);
  return [];
}

export function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function getCtx(supabase: SupabaseLike, userId: string) {
  const { data } = await supabase
    .from("creator_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return buildCreatorContext(data ?? {});
}

export async function requirePremium(supabase: SupabaseLike, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .maybeSingle();
  let entitled = (profile?.tier ?? "free") !== "free";
  if (!entitled) {
    const env = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "sandbox";
    const { data: hasSub } = await supabase.rpc("has_active_subscription", {
      user_uuid: userId,
      check_env: env,
    });
    entitled = !!hasSub;
  }
  if (!entitled) throw new Error("Upgrade to Premium to use this feature.");
}

export async function isPremium(supabase: SupabaseLike, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .maybeSingle();
  if ((profile?.tier ?? "free") !== "free") return true;
  const env = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "sandbox";
  const { data: hasSub } = await supabase.rpc("has_active_subscription", {
    user_uuid: userId,
    check_env: env,
  });
  return !!hasSub;
}

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Enforces a per-feature daily quota for free users. Premium users are unlimited.
 * Logs the usage event AFTER the caller's work succeeds via the returned `record()` callback.
 */
export async function enforceQuota(
  supabase: SupabaseLike,
  userId: string,
  feature: Feature,
) {
  const premium = await isPremium(supabase, userId);
  if (premium) {
    return { record: async () => {} };
  }
  const { count } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", startOfTodayIso());
  const used = count ?? 0;
  if (used >= FREE_DAILY_LIMIT) {
    throw new Error(
      `You've used your ${FREE_DAILY_LIMIT} free ${FEATURE_LABELS[feature]} runs for today. Upgrade for unlimited access.`,
    );
  }
  return {
    record: async () => {
      await supabase.from("usage_events").insert({ user_id: userId, feature });
    },
  };
}
