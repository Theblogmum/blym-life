import { buildCreatorContext } from "@/lib/ai.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

type SupabaseLike = SupabaseClient<Database>;

let _admin: SupabaseLike | null = null;
function getAdminClient(): SupabaseLike {
  if (_admin) return _admin;
  _admin = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  return _admin;
}

/**
 * Validate free-text user input destined for AI prompts. Throws on oversize
 * input so we never forward multi-megabyte strings to the AI gateway.
 */
export function assertAiInput(
  fields: Record<string, unknown>,
  opts?: { maxLong?: number; maxShort?: number },
) {
  const maxLong = opts?.maxLong ?? 4000;
  const maxShort = opts?.maxShort ?? 200;
  const shortKeys = new Set([
    "brand", "niche", "tone", "platform", "kind", "goal",
    "service_type", "vibe", "theme", "service_name",
  ]);
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string") continue;
    const limit = shortKeys.has(key) ? maxShort : maxLong;
    if (value.length > limit) {
      throw new Error(`Input too long. Please keep ${key} under ${limit} characters.`);
    }
  }
}

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
 * Free Forever tier — feature gating.
 *
 * Free users get a SHARED daily pool of 5 AI generations across hooks,
 * captions, and basic scripts (see FREE_DAILY_POOL_FEATURES + FREE_DAILY_POOL).
 * Daily motivation is always unlimited. Everything else is locked.
 *
 * FREE_MONTHLY_LIMITS is kept for back-compat with snapshot/UI code that
 * iterates feature buckets, but the real enforcement happens via the daily
 * shared pool below.
 */
export const FREE_DAILY_POOL = 5;
export const FREE_DAILY_POOL_FEATURES: Feature[] = [
  "generator",         // ideas + hooks
  "caption_generator", // captions
  "series",            // basic scripts
];

export const FREE_MONTHLY_LIMITS: Partial<Record<Feature, number>> = {
  generator: FREE_DAILY_POOL,         // shared daily pool — see FREE_DAILY_POOL
  caption_generator: FREE_DAILY_POOL, // shared daily pool — see FREE_DAILY_POOL
  series: FREE_DAILY_POOL,            // shared daily pool — see FREE_DAILY_POOL
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
 * Studio tier adds Growth Lab + Creator Business tooling on top of Creator.
 * Pro tier inherits every Studio feature — Pro's differentiation is
 * quality-of-service (priority generations, premium models, full gamification,
 * beta access, VIP perks), not feature gating.
 */
export const STUDIO_EXTRA_FEATURES: Feature[] = [
  // Growth Lab
  "recycler",
  "niche_audit",
  "profile_audit",
  "flop",
  "wins",
  // Creator Business
  "media_kit",
  "pitch",
  "deliverables",
  "usage_rights",
  "package_names",
  "service_desc",
  "passive_ideas",
  "rejection",
];

export const STUDIO_FEATURES: Feature[] = [...CREATOR_FEATURES, ...STUDIO_EXTRA_FEATURES];
// Pro inherits every Studio feature; differentiation is quality-of-service.
export const PRO_FEATURES: Feature[] = STUDIO_FEATURES;
// Back-compat alias (legacy imports).
export const PRO_EXTRA_FEATURES: Feature[] = STUDIO_EXTRA_FEATURES;

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function startOfDayISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

/**
 * Total AI generations used today across the free shared pool
 * (generator + caption_generator + series).
 */
export async function getDailyPoolUsage(
  supabase: SupabaseLike,
  userId: string,
): Promise<number> {
  const since = startOfDayISO();
  const { count } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("feature", FREE_DAILY_POOL_FEATURES)
    .gte("created_at", since);
  return count ?? 0;
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
  // Free tier is now a single shared daily pool. We surface it under every
  // pool feature so legacy UI code that reads `usage[feature]` keeps working,
  // plus a synthetic `daily_pool` entry for new UI.
  const poolUsed = await getDailyPoolUsage(supabase, userId);
  const usage: Record<string, { used: number; limit: number }> = {
    daily_pool: { used: poolUsed, limit: FREE_DAILY_POOL },
    motivation: { used: 0, limit: 9999 },
  };
  for (const f of FREE_DAILY_POOL_FEATURES) {
    usage[f] = { used: poolUsed, limit: FREE_DAILY_POOL };
  }
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

export type UserTier = "free" | "creator" | "studio" | "pro";

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
  // Legacy "ultimate" / "premium" / "lifetime" tier values are folded into Pro.
  if (tier === "ultimate" || tier === "premium" || tier === "lifetime") return "pro";
  if (tier === "pro" || tier === "studio" || tier === "creator") return tier as UserTier;
  // Fallback: any legacy active sub / lifetime purchase → top tier (Pro).
  const env = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "sandbox";
  const { data: hasSub } = await supabase.rpc("has_active_subscription", {
    user_uuid: userId,
    check_env: env,
  });
  if (hasSub) return "pro";
  // Free 48-hour trial → unlock everything as Pro while active
  if (await hasActiveTrial(supabase, userId)) return "pro";
  return "free";
}

export async function isPremium(supabase: SupabaseLike, userId: string): Promise<boolean> {
  // Full access = Pro tier (top tier).
  const tier = await getUserTier(supabase, userId);
  return tier === "pro";
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

  if (tier === "pro" || tier === "studio" || tier === "creator") {
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
      const admin = getAdminClient();
      await admin.from("usage_events").insert({ user_id: userId, feature });
    },
  };
  // Pro is the top tier — unlocks every feature.
  if (tier === "pro") return recorder;

  if (tier === "studio") {
    if (STUDIO_FEATURES.includes(feature)) return recorder;
    // Studio already inherits everything that's feature-gated;
    // anything not in STUDIO_FEATURES is treated as Pro-only QoS.
    throw new Error(
      `${FEATURE_LABELS[feature]} is included in Pro (£29.99/mo).`,
    );
  }

  if (tier === "creator") {
    if (CREATOR_FEATURES.includes(feature)) return recorder;
    // Anything beyond Creator lives on Studio (Growth Lab + Creator Business).
    throw new Error(
      `${FEATURE_LABELS[feature]} — unlock with Studio (£14.99/mo).`,
    );
  }

  const cap = FREE_MONTHLY_LIMITS[feature];
  const isFreeFeature = cap !== undefined || opts?.freeAllowed;

  if (!isFreeFeature) {
    const tierLine = CREATOR_FEATURES.includes(feature)
      ? "Included in Creator (£6.99/mo)."
      : "Unlock with Studio (£14.99/mo).";
    throw new Error(
      `${FEATURE_LABELS[feature]} — ${tierLine} Your free ideas, captions, planner and saves stay free forever.`,
    );
  }

  // Free shared daily pool: 5 generations/day across hooks, captions, basic scripts.
  if (FREE_DAILY_POOL_FEATURES.includes(feature)) {
    const used = await getDailyPoolUsage(supabase, userId);
    if (used >= FREE_DAILY_POOL) {
      throw new Error(
        `You've used all ${FREE_DAILY_POOL} free AI generations for today. Resets at midnight — unlimited hooks, captions and scripts are included in Creator (£6.99/mo).`,
      );
    }
  } else if (cap !== undefined && cap < 9999) {
    // Legacy per-feature monthly cap (e.g. for tools opted into via freeAllowed).
    const used = await getMonthlyUsage(supabase, userId, feature);
    if (used >= cap) {
      throw new Error(
        `You've used all ${cap} free ${FEATURE_LABELS[feature].toLowerCase()} this month. Unlimited is included in Creator (£6.99/mo).`,
      );
    }
  }
  return recorder;
}
