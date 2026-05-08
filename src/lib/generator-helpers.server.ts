import { buildCreatorContext } from "@/lib/ai.server";

export async function getCtx(supabase: any, userId: string) {
  const { data } = await supabase.from("creator_profile").select("*").eq("user_id", userId).maybeSingle();
  return buildCreatorContext(data ?? {});
}

export async function requirePremium(supabase: any, userId: string) {
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