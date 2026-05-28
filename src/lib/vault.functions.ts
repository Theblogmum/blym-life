import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserTier } from "@/lib/generator-helpers.server";

/** Free tier: max 15 saved items in the vault. */
export const FREE_VAULT_LIMIT = 15;

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

/**
 * Save an item to the vault. Enforces the free-tier 15-item cap (excluding
 * auto-cached daily ideas). Paid tiers (creator/studio/pro) get unlimited saves.
 */
export const saveToVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: string; title?: string; body: string; meta?: Record<string, unknown> }) => {
    if (!d?.kind || typeof d.kind !== "string") throw new Error("invalid kind");
    if (!d?.body || typeof d.body !== "string") throw new Error("invalid body");
    if (d.kind === "daily_idea") throw new Error("daily ideas are cached automatically");
    if (d.body.length > 20000) throw new Error("item too large");
    return d;
  })
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const tier = await getUserTier(supabase, userId);
    if (tier === "free") {
      const { count } = await supabase
        .from("saved_content")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("kind", "daily_idea");
      if ((count ?? 0) >= FREE_VAULT_LIMIT) {
        throw new Error(
          `Your free vault is full (${FREE_VAULT_LIMIT} items) — unlimited saves are included in Creator (£6.99/mo).`,
        );
      }
    }
    const { error } = await supabase.from("saved_content").insert({
      user_id: userId,
      kind: data.kind,
      title: data.title ?? null,
      body: data.body,
      meta: (data.meta ?? null) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
