import { buildCreatorContext } from "@/lib/ai.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type SupabaseLike = SupabaseClient<Database>;

export const TRIAL_DAYS = 0; // legacy, kept for compatibility — trial is removed

export type Feature =
  | "generator"
  | "caption_generator"
  | "viral_lab"
  | "recycler"
  | "pitch"
  | "flop"
  | "niche_audit"
  | "broll"
  | "series"
  | "cta"
  | "repurpose"
  | "response"
  | "seo"
  | "engagement"
  | "bio"
  | "profile_audit"
  | "timing"
  | "faceless"
  | "pin"
  | "script_tighten"
  | "deliverables"
  | "usage_rights"
  | "media_kit"
  | "package_names"
  | "service_desc"
  | "passive_ideas"
  | "rejection"
  | "wins"
  | "motivation";

export const FEATURE_LABELS: Record<Feature, string> = {
  generator: "Content Generator",
  caption_generator: "Caption + Hook Generator",
  viral_lab: "Viral Lab",
  recycler: "Clip Recycler",
  pitch: "Pitch Generator",
  flop: "Flop Analyser",
  niche_audit: "Niche Audit",
  broll: "B-Roll Ideas",
  series: "Content Series Builder",
  cta: "CTA Generator",
  repurpose: "Repurposer",
  response: "Response Writer",
  seo: "SEO Keyword Generator",
  engagement: "Engagement Booster",
  bio: "Bio Optimiser",
  profile_audit: "Profile Audit",
  timing: "Post Timing",
  faceless: "Faceless Content Optimiser",
  pin: "Pinterest Pin Optimiser",
  script_tighten: "Script Tightener",
  deliverables: "Deliverables Builder",
  usage_rights: "Usage Rights Calculator",
  media_kit: "Media Kit Generator",
  package_names: "Package Naming",
  service_desc: "Service Description",
  passive_ideas: "Passive Product Ideas",
  rejection: "Rejection Recovery",
  wins: "Doing Better Insights",
  motivation: "Daily Motivation",
};

/**
 * Free Forever tier — monthly caps per feature bucket. Calendar month reset.
 * Features NOT listed here are Premium-only (locked for free users).
 * Premium subscribers always bypass these caps.
 */
export const FREE_MONTHLY_LIMITS: Partial<Record<Feature, number>> = {
  generator: 20,         // content ideas + scripts (rolled together)
  caption_generator: 10, // caption + hook generator
  motivation: 9999,      // effectively unlimited (free tool)
};

/**
 * Tier entitlements. A feature is unlocked at the named tier and every tier above.
 * Order: free < creator < premium.
 * Features NOT in CREATOR_FEATURES are Premium-only (advanced / business tools).
 */
export const CREATOR_FEATURES: Feature[] = [
  "generator",
  "caption_generator",
  "viral_lab",
  "cta",
  "broll",
  "series",
  "repurpose",
  "response",
  "seo",
  "engagement",
  "bio",
  "timing",
  "faceless",
  "pin",
  "script_tighten",
  "motivation",
];

/**
 * Pro tier adds advanced growth + insight tooling on top of Creator.
 * Premium-only (business/admin) tools are still gated above Pro.
 */
export const PRO_EXTRA_FEATURES: Feature[] = [
  "recycler",
  "niche_audit",
  "profile_audit",
  "flop",
  "wins",
];

export const PRO_FEATURES: Feature[] = [...CREATOR_FEATURES, ...PRO_EXTRA_FEATURES];

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export async function getMonthlyUsage(
  supabase: SupabaseLike,
  userId: string,
  feature: Feature,
): Promise<number> {
  const since = startOfMonthISO();
  const { count } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", since);
  return count ?? 0;
}

export async function getFreeTierSnapshot(supabase: SupabaseLike, userId: string) {
  const features = Object.keys(FREE_MONTHLY_LIMITS) as Feature[];
  const usage: Record<string, { used: number; limit: number }> = {};
  await Promise.all(
    features.map(async (f) => {
      const used = await getMonthlyUsage(supabase, userId, f);
      usage[f] = { used, limit: FREE_MONTHLY_LIMITS[f] ?? 0 };
    }),
  );
  return usage;
}

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

export type UserTier = "free" | "creator" | "pro" | "ultimate";

async function hasActiveTrial(supabase: SupabaseLike, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("trial_claims")
    .select("ends_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.ends_at) return false;
  return new Date(data.ends_at).getTime() > Date.now();
}

export async function getUserTier(supabase: SupabaseLike, userId: string): Promise<UserTier> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .maybeSingle();
  const tier = (profile?.tier ?? "free") as string;
  // Legacy "premium" tier values are treated as ultimate.
  if (tier === "ultimate" || tier === "premium") return "ultimate";
  if (tier === "pro" || tier === "creator") return tier as UserTier;
  // Fallback: lifetime / active sub → ultimate
  const env = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "sandbox";
  const { data: hasSub } = await supabase.rpc("has_active_subscription", {
    user_uuid: userId,
    check_env: env,
  });
  if (hasSub) return "ultimate";
  // Free 48-hour trial → unlock everything as ultimate while active
  if (await hasActiveTrial(supabase, userId)) return "ultimate";
  return "free";
}

export async function isPremium(supabase: SupabaseLike, userId: string): Promise<boolean> {
  // Backwards-compatible: full access = ultimate tier or lifetime.
  const tier = await getUserTier(supabase, userId);
  return tier === "ultimate";
}

/**
 * Returns plan / free-tier snapshot for a user.
 * Shape kept backwards-compatible with old trial UI: `inTrial` and `daysLeft`
 * are deprecated and always reflect "free forever" semantics now.
 */
export async function getTrialInfo(supabase: SupabaseLike, userId: string) {
  const tier = await getUserTier(supabase, userId);
  const { data: trialRow } = await supabase
    .from("trial_claims")
    .select("started_at, ends_at")
    .eq("user_id", userId)
    .maybeSingle();
  const trialEndsAt = trialRow?.ends_at ?? null;
  const trialActive = !!trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
  const trialClaimed = !!trialRow;

  if (tier === "ultimate" || tier === "pro" || tier === "creator") {
    return {
      premium: true, // legacy field: any paid tier reads as "premium" for old UI gating
      tier,
      inTrial: true, // legacy field — premium = unlimited
      daysLeft: null as number | null,
      trialEndsAt,
      trialActive,
      trialClaimed,
      freeUsage: {} as Record<string, { used: number; limit: number }>,
    };
  }
  const freeUsage = await getFreeTierSnapshot(supabase, userId);
  return {
    premium: false,
    tier: "free" as UserTier,
    inTrial: false,
    daysLeft: 0,
    trialEndsAt,
    trialActive,
    trialClaimed,
    freeUsage,
  };
}

/**
 * Plan gate. Name kept for backwards compatibility with existing call sites.
 * Behaviour:
 *   - Premium → always allowed, records usage.
 *   - Free + feature in FREE_MONTHLY_LIMITS (or `opts.freeAllowed`) → allowed
 *     up to the monthly cap, then soft-blocked with an upgrade message.
 *   - Free + premium-only feature → blocked immediately with upgrade message.
 */
export async function enforceTrial(
  supabase: SupabaseLike,
  userId: string,
  feature: Feature,
  opts?: { freeAllowed?: boolean },
) {
  const tier = await getUserTier(supabase, userId);
  const recorder = {
    record: async () => {
      await supabase.from("usage_events").insert({ user_id: userId, feature });
    },
  };
  if (tier === "ultimate") return recorder;

  if (tier === "pro") {
    if (PRO_FEATURES.includes(feature)) return recorder;
    throw new Error(
      `${FEATURE_LABELS[feature]} is unlocked on Ultimate (£44.99/mo). Upgrade from Pro to unlock invoices, media kit, pitch generator and elite brand tools.`,
    );
  }

  if (tier === "creator") {
    if (CREATOR_FEATURES.includes(feature)) return recorder;
    const nextTier = PRO_EXTRA_FEATURES.includes(feature) ? "Pro (£24.99/mo)" : "Ultimate (£44.99/mo)";
    throw new Error(
      `${FEATURE_LABELS[feature]} is unlocked on ${nextTier}. Upgrade from Creator to use it.`,
    );
  }

  const cap = FREE_MONTHLY_LIMITS[feature];
  const isFreeFeature = cap !== undefined || opts?.freeAllowed;

  if (!isFreeFeature) {
    const tierName = CREATOR_FEATURES.includes(feature)
      ? "Creator (£9.99/mo)"
      : PRO_EXTRA_FEATURES.includes(feature)
        ? "Pro (£24.99/mo)"
        : "Ultimate (£44.99/mo)";
    throw new Error(
      `${FEATURE_LABELS[feature]} is unlocked on ${tierName}. Upgrade to use it — your free ideas, captions, planner and saves stay free forever.`,
    );
  }

  if (cap !== undefined && cap < 9999) {
    const used = await getMonthlyUsage(supabase, userId, feature);
    if (used >= cap) {
      throw new Error(
        `You've used all ${cap} free ${FEATURE_LABELS[feature].toLowerCase()} this month. Upgrade to Creator (£9.99/mo) for unlimited — your monthly free allowance refreshes on the 1st.`,
      );
    }
  }
  return recorder;
}
