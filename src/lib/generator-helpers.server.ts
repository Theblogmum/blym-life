import { buildCreatorContext } from "@/lib/ai.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type SupabaseLike = SupabaseClient<Database>;

export const TRIAL_DAYS = 3;

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

/**
 * Returns trial info for a user. Trial = first 3 days from `trial_started_at`.
 * Premium subscribers always pass.
 */
export async function getTrialInfo(supabase: SupabaseLike, userId: string) {
  const premium = await isPremium(supabase, userId);
  if (premium) {
    return { premium: true, inTrial: true, daysLeft: null as number | null, trialEndsAt: null as string | null };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_started_at")
    .eq("id", userId)
    .maybeSingle();
  const start = profile?.trial_started_at ? new Date(profile.trial_started_at) : new Date();
  const end = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const now = Date.now();
  const inTrial = now < end.getTime();
  const msLeft = end.getTime() - now;
  const daysLeft = inTrial ? Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000))) : 0;
  return { premium: false, inTrial, daysLeft, trialEndsAt: end.toISOString() };
}

/**
 * Gates a premium-only feature. Allows premium users + users in their 3-day trial.
 * Records a usage event for analytics (non-blocking).
 * Pass `freeAllowed: true` to let everyone through (e.g. basic captions).
 */
export async function enforceTrial(
  supabase: SupabaseLike,
  userId: string,
  feature: Feature,
  opts?: { freeAllowed?: boolean },
) {
  if (opts?.freeAllowed) {
    return {
      record: async () => {
        await supabase.from("usage_events").insert({ user_id: userId, feature });
      },
    };
  }
  const info = await getTrialInfo(supabase, userId);
  if (!info.premium && !info.inTrial) {
    throw new Error(
      `Your 3-day trial of ${FEATURE_LABELS[feature]} has ended. Upgrade to Premium to keep using it — basic captions stay free.`,
    );
  }
  return {
    record: async () => {
      await supabase.from("usage_events").insert({ user_id: userId, feature });
    },
  };
}
