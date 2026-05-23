import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getClaimedRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("claimed_rewards")
      .select("chest_id, claimed_at")
      .eq("user_id", userId);
    if (error) {
      console.error("[db error] getClaimedRewards", error);
      throw new Error("Couldn't load your rewards");
    }
    return { claimed: data ?? [] };
  });

export const claimReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { chestId: string }) => {
    if (!input || typeof input.chestId !== "string" || input.chestId.length > 64) {
      throw new Error("Invalid reward");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("claimed_rewards")
      .upsert(
        { user_id: userId, chest_id: data.chestId },
        { onConflict: "user_id,chest_id", ignoreDuplicates: true },
      );
    if (error) {
      console.error("[db error] claimReward", error);
      throw new Error("Couldn't claim reward");
    }
    return { ok: true };
  });