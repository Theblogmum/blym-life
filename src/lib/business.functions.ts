import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============== Invoices ==============
export type InvoiceItem = { description: string; quantity: number; unit_price: number };

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("invoices").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { invoices: data ?? [] };
  });

export const saveInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string; number: string; brand_name: string; brand_email?: string;
    brand_address?: string; from_name?: string; from_email?: string; from_address?: string;
    issue_date: string; due_date?: string; currency: string;
    items: InvoiceItem[]; notes?: string; tax_rate?: number; status?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      number: data.number,
      brand_name: data.brand_name,
      brand_email: data.brand_email ?? null,
      brand_address: data.brand_address ?? null,
      from_name: data.from_name ?? null,
      from_email: data.from_email ?? null,
      from_address: data.from_address ?? null,
      issue_date: data.issue_date,
      due_date: data.due_date ?? null,
      currency: data.currency,
      items: data.items as unknown as import("@/integrations/supabase/types").Json,
      notes: data.notes ?? null,
      tax_rate: data.tax_rate ?? 0,
      status: data.status ?? "draft",
    };
    if (data.id) {
      const { data: r, error } = await context.supabase.from("invoices").update(row).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle();
      if (error) throw new Error(error.message);
      return { invoice: r };
    }
    const { data: r, error } = await context.supabase.from("invoices").insert(row).select().maybeSingle();
    if (error) throw new Error(error.message);
    return { invoice: r };
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("invoices").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== Income ==============
export const listIncome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("income_entries").select("*").eq("user_id", context.userId)
      .order("entry_date", { ascending: false });
    if (error) throw new Error(error.message);
    return { entries: data ?? [] };
  });

export const saveIncome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; entry_date: string; source: string; brand?: string; amount: number; currency: string; category: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      entry_date: data.entry_date,
      source: data.source,
      brand: data.brand ?? null,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { data: r, error } = await context.supabase.from("income_entries").update(row).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle();
      if (error) throw new Error(error.message);
      return { entry: r };
    }
    const { data: r, error } = await context.supabase.from("income_entries").insert(row).select().maybeSingle();
    if (error) throw new Error(error.message);
    return { entry: r };
  });

export const deleteIncome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("income_entries").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== Affiliate Links ==============
export const listAffiliates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("affiliate_links").select("*").eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { links: data ?? [] };
  });

export const saveAffiliate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; brand: string; product: string; url: string; code?: string; commission_rate?: string; category?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      brand: data.brand, product: data.product, url: data.url,
      code: data.code ?? null, commission_rate: data.commission_rate ?? null,
      category: data.category ?? null, notes: data.notes ?? null,
    };
    if (data.id) {
      const { data: r, error } = await context.supabase.from("affiliate_links").update(row).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle();
      if (error) throw new Error(error.message);
      return { link: r };
    }
    const { data: r, error } = await context.supabase.from("affiliate_links").insert(row).select().maybeSingle();
    if (error) throw new Error(error.message);
    return { link: r };
  });

export const deleteAffiliate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("affiliate_links").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== Portfolio ==============
export const listPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("portfolio_items").select("*").eq("user_id", context.userId)
      .order("posted_on", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const savePortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; title: string; brand?: string; platform?: string; link?: string; image_url?: string; description?: string; metrics?: Record<string, string | number>; posted_on?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      title: data.title, brand: data.brand ?? null, platform: data.platform ?? null,
      link: data.link ?? null, image_url: data.image_url ?? null, description: data.description ?? null,
      metrics: (data.metrics ?? {}) as unknown as import("@/integrations/supabase/types").Json,
      posted_on: data.posted_on ?? null,
    };
    if (data.id) {
      const { data: r, error } = await context.supabase.from("portfolio_items").update(row).eq("id", data.id).eq("user_id", context.userId).select().maybeSingle();
      if (error) throw new Error(error.message);
      return { item: r };
    }
    const { data: r, error } = await context.supabase.from("portfolio_items").insert(row).select().maybeSingle();
    if (error) throw new Error(error.message);
    return { item: r };
  });

export const deletePortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("portfolio_items").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });