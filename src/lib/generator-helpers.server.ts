import { buildCreatorContext } from "@/lib/ai.server";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
      };
    };
  };
  rpc: (name: string, args: Record<string, string>) => Promise<{ data: unknown }>;
};

export function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\n+/).map((item) => item.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean);
  return [];
}

export function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function getCtx(supabase: SupabaseLike, userId: string) {
  const { data } = await supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
  return buildCreatorContext((data ?? {}) as Parameters<typeof buildCreatorContext>[0]);
}

export async function requirePremium(supabase: SupabaseLike, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("tier").eq("id", userId).maybeSingle();
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