import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { q?: string; category?: string }) => d ?? {})
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("brands").select("*").order("name", { ascending: true });
    if (data.category) q = q.eq("category", data.category);
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    const { data: rows, error } = await q.limit(2000);
    if (error) { console.error("[db] listBrands", error); throw new Error("Couldn't load brands."); }

    const { data: mine } = await supabase
      .from("user_brands")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    const cats = Array.from(new Set((rows ?? []).map((b) => b.category).filter(Boolean))) as string[];
    return { brands: rows ?? [], userBrands: mine ?? [], categories: cats.sort() };
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