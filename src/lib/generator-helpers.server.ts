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
 * Free Forever tier — daily shared AI budget. ALL features in
 * FREE_AI_FEATURES draw from one shared 5/day pool. Resets daily (UTC).
 * Features NOT listed below are Premium-only and locked for free users.
 * Premium subscribers (creator/studio/pro/ultimate) always bypass this cap.
 */
export const FREE_DAILY_AI_LIMIT = 5;

/** Free AI tools — share the FREE_DAILY_AI_LIMIT pool. */
export const FREE_AI_FEATURES: Feature[] = [
  "generator",         // Daily Spark / basic scripts
  "caption_generator", // Captions
  "viral_lab",         // Hook Studio (hooks)
];

/** Free unlimited tools — don't count toward the daily AI pool. */
export const FREE_UNLIMITED_FEATURES: Feature[] = ["motivation"];

/** Legacy export kept for backwards compatibility — no longer drives gating. */
export const FREE_MONTHLY_LIMITS: Partial<Record<Feature, number>> = {
  generator: FREE_DAILY_AI_LIMIT,
  caption_generator: FREE_DAILY_AI_LIMIT,
  viral_lab: FREE_DAILY_AI_LIMIT,
  motivation: 9999,
};

/**
 * Tier entitlements. A feature is unlocked at the named tier and every tier above.
 * Order: free < creator < studio < pro < ultimate.
 * Creator = Create Studio + light growth. Studio adds extra creator polish
 * tools. Pro adds deep audits + insights. Ultimate adds business/brand-deal
 * systems (media kit, pitch, invoices, etc).
 */
export const CREATOR_FEATURES: Feature[] = [
  // Full Create Studio
  "generator",          // unlimited scripts
  "caption_generator",  // unlimited captions
  "viral_lab",          // unlimited hooks
  "cta",
  "broll",
  "response",
  "seo",
  "repurpose",
  // Light growth tools
  "engagement",
  "timing",
  // Always-on
  "motivation",
];

/**
 * Studio tier — adds extra creator polish tools on top of Creator.
 * Studio is the top tier: Creator + Growth Lab + Creator Business +
 * Advanced Strategy. Pro/Ultimate (legacy) inherit from Studio.
 */
export const STUDIO_EXTRA_FEATURES: Feature[] = [
  // Creator polish (formerly Studio-only)
  "bio",
  "series",
  "faceless",
  "pin",
  "script_tighten",
  // Growth Lab
  "profile_audit",
  "niche_audit",
  "flop",
  "recycler",
  "wins",
  // Creator Business
  "media_kit",
  "pitch",
  "deliverables",
  "usage_rights",
  // Advanced Strategy
  "package_names",
  "service_desc",
  "passive_ideas",
  "rejection",
];

export const STUDIO_FEATURES: Feature[] = [...CREATOR_FEATURES, ...STUDIO_EXTRA_FEATURES];

/**
 * Pro tier (legacy) — kept for backwards compatibility with existing
 * subscriptions. Now equivalent to Studio.
 */
export const PRO_EXTRA_FEATURES: Feature[] = [];

export const PRO_FEATURES: Feature[] = [...STUDIO_FEATURES];

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function startOfTodayISO(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

/**
 * Count today's (UTC) AI generations across the free shared pool.
 */
export async function getDailyAiUsage(
  supabase: SupabaseLike,
  userId: string,
): Promise<number> {
  const since = startOfTodayISO();
  const { count } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("feature", FREE_AI_FEATURES)
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

/**
 * Free-tier usage snapshot. Every FREE_AI_FEATURE reports the SAME shared
 * daily pool ({ used, limit }) so existing UsageChip lookups keep working.
 */
export async function getFreeTierSnapshot(supabase: SupabaseLike, userId: string) {
  const dailyUsed = await getDailyAiUsage(supabase, userId);
  const usage: Record<string, { used: number; limit: number }> = {
    daily: { used: dailyUsed, limit: FREE_DAILY_AI_LIMIT },
  };
  for (const f of FREE_AI_FEATURES) {
    usage[f] = { used: dailyUsed, limit: FREE_DAILY_AI_LIMIT };
  }
  for (const f of FREE_UNLIMITED_FEATURES) {
    usage[f] = { used: 0, limit: 9999 };
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

export type UserTier = "free" | "creator" | "studio" | "pro" | "ultimate";

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
  if (tier === "pro" || tier === "studio" || tier === "creator") return tier as UserTier;
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

  if (tier === "ultimate" || tier === "pro" || tier === "studio" || tier === "creator") {
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
 *   - Paid tiers (creator/studio/pro/ultimate) → existing per-tier rules.
 *   - Free + feature in FREE_AI_FEATURES → allowed up to a SHARED 5/day cap.
 *   - Free + feature in FREE_UNLIMITED_FEATURES or opts.freeAllowed → allowed.
 *   - Free + anything else → blocked immediately with upgrade message.
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
  if (tier === "ultimate") return recorder;

  if (tier === "pro") {
    if (PRO_FEATURES.includes(feature)) return recorder;
    // Pro is the top tier — inherits every feature from Studio.
    return recorder;
  }

  if (tier === "creator") {
    if (CREATOR_FEATURES.includes(feature)) return recorder;
    throw new Error(
      `${FEATURE_LABELS[feature]} is unlocked on Studio (£14.99/mo). Upgrade from Creator to unlock the Growth Lab, Creator Business and advanced strategy tools.`,
    );
  }

  if (tier === "studio") {
    if (STUDIO_FEATURES.includes(feature)) return recorder;
    throw new Error(
      `${FEATURE_LABELS[feature]} is unlocked on Pro (£29.99/mo) — advanced AI, priority generations, premium models, full gamification and VIP perks.`,
    );
  }

  // Free tier
  const isUnlimitedFree = FREE_UNLIMITED_FEATURES.includes(feature) || opts?.freeAllowed;
  const isPooledFree = FREE_AI_FEATURES.includes(feature);

  if (!isUnlimitedFree && !isPooledFree) {
    const tierName = CREATOR_FEATURES.includes(feature)
      ? "Creator (£6.99/mo)"
      : "Studio (£14.99/mo)";
    throw new Error(
      `${FEATURE_LABELS[feature]} is a premium tool — unlocked on ${tierName}. Free includes Hooks, Captions, basic Scripts, the weekly planner, daily ideas and motivation.`,
    );
  }

  if (isPooledFree) {
    const used = await getDailyAiUsage(supabase, userId);
    if (used >= FREE_DAILY_AI_LIMIT) {
      throw new Error(
        `You've used all ${FREE_DAILY_AI_LIMIT} free AI generations for today. Upgrade to Creator (£6.99/mo) for unlimited — or come back tomorrow, your free 5 refresh daily.`,
      );
    }
  }
  return recorder;
}

/**
 * Planner horizon gate for free users — they can only plan up to 7 days ahead.
 * Paid tiers bypass.
 */
export async function enforceFreePlannerHorizon(
  supabase: SupabaseLike,
  userId: string,
  planDate: string,
) {
  const tier = await getUserTier(supabase, userId);
  if (tier !== "free") return;
  const today = new Date();
  const horizon = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 7));
  const target = new Date(`${planDate}T00:00:00Z`);
  if (target.getTime() > horizon.getTime()) {
    throw new Error(
      "Free plan can only schedule the next 7 days. Upgrade to Creator (£6.99/mo) for the full content calendar.",
    );
  }
}

/**
 * Vault save cap for free users — max 15 saved items. Paid tiers bypass.
 * Counts everything in saved_content except daily_idea cache rows.
 */
export const FREE_VAULT_LIMIT = 15;
export async function enforceFreeVaultCapacity(
  supabase: SupabaseLike,
  userId: string,
) {
  const tier = await getUserTier(supabase, userId);
  if (tier !== "free") return;
  const { count } = await supabase
    .from("saved_content")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("kind", "daily_idea");
  if ((count ?? 0) >= FREE_VAULT_LIMIT) {
    throw new Error(
      `Free plan caps your vault at ${FREE_VAULT_LIMIT} saved items. Delete a few or upgrade to Creator (£6.99/mo) for unlimited saves.`,
    );
  }
}
