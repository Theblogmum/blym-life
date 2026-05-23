import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getVaultData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const email = ((context.claims as any)?.email as string | undefined)?.toLowerCase();

    const purchasesQuery = supabaseAdmin
      .from("digital_purchases")
      .select("id, created_at, product:digital_products(id, slug, title, cover_url, file_path)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const [purchasesRes, claimedRes, savedRes] = await Promise.all([
      purchasesQuery,
      supabase
        .from("claimed_rewards")
        .select("chest_id, claimed_at")
        .eq("user_id", userId),
      supabase
        .from("saved_content")
        .select("id, kind, title, body, meta, created_at")
        .eq("user_id", userId)
        .neq("kind", "daily_idea")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    return {
      purchases: purchasesRes.data ?? [],
      claimed: claimedRes.data ?? [],
      saved: savedRes.data ?? [],
    };
  });

export const deleteSavedItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => {
    if (!d?.id || typeof d.id !== "string") throw new Error("invalid id");
    return d;
  })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
