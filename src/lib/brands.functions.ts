import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserTier, type UserTier } from "@/lib/generator-helpers.server";

const BRAND_DIRECTORY_LIMITS: Record<UserTier, number> = {
  free: 0,
  creator: 0,
  studio: 1000,
  pro: 1000000,
  ultimate: 1000000,
};

export const listBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { q?: string; category?: string }) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const tier = await getUserTier(supabase, context.userId);
    if (tier === "free" || tier === "creator") {
      throw new Error(
        "The brand directory is unlocked on Studio (£14.99/mo). Upgrade to access 50,000+ brands, pitch templates and the full Brand Hub.",
      );
    }
    const tierLimit = BRAND_DIRECTORY_LIMITS[tier] ?? 0;
    let q = supabase.from("brands").select("*").order("name", { ascending: true });
    if (data.category) q = q.eq("category", data.category);
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    const { data: rows, error } = await q.limit(tierLimit);
    if (error) { console.error("[db] listBrands", error); throw new Error("Couldn't load brands."); }

    const { data: mine } = await supabase
      .from("user_brands")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    const cats = Array.from(new Set((rows ?? []).map((b) => b.category).filter(Boolean))) as string[];
    return {
      brands: rows ?? [],
      userBrands: mine ?? [],
      categories: cats.sort(),
      tier,
      tierLimit,
    };
  });

export const addUserBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; website?: string; contact_email?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    if (!data.name?.trim()) throw new Error("Name is required.");
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("user_brands")
      .insert({
        user_id: userId,
        name: data.name.trim(),
        website: data.website?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select()
      .single();
    if (error) { console.error("[db] addUserBrand", error); throw new Error("Couldn't save brand."); }
    return { brand: row };
  });