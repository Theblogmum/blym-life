import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripe, getStripeEnv } from "@/lib/stripe.server";
import { findOrCreateCustomerId } from "@/lib/payments-helpers.server";

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await admin()
    .from("digital_products")
    .select("id, slug, title, description, price_cents, currency, cover_url, thumbnail_url, sort_order, created_at")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return { products: data ?? [] };
});

export const getProductBySlug = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: p } = await admin()
      .from("digital_products")
      .select("id, slug, title, description, price_cents, currency, cover_url, active")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!p || !p.active) return { product: null };
    return { product: p };
  });

export const createProductCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: {
    productId: string;
    successUrl: string;
    cancelUrl: string;
    email?: string;
  }) => d)
  .handler(async ({ data }) => {
    const { data: p } = await admin()
      .from("digital_products")
      .select("id, slug, title, price_cents, currency, stripe_price_id, active")
      .eq("id", data.productId)
      .maybeSingle();
    if (!p || !p.active) throw new Error("Product not available");

    const stripe = getStripe();
    const env = getStripeEnv();

    // Resolve user (optional)
    let userId: string | null = null;
    let email = data.email?.trim() || "";
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const auth = getRequestHeader("Authorization") || getRequestHeader("authorization");
      if (auth?.startsWith("Bearer ")) {
        const { data: u } = await admin().auth.getUser(auth.slice(7));
        if (u?.user) {
          userId = u.user.id;
          email = u.user.email ?? email;
        }
      }
    } catch {}

    const lineItems = p.stripe_price_id
      ? [{ price: p.stripe_price_id, quantity: 1 }]
      : [
          {
            price_data: {
              currency: p.currency || "usd",
              unit_amount: p.price_cents,
              product_data: { name: p.title },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems as any,
      customer: userId && email ? await findOrCreateCustomerId(email, userId) : undefined,
      customer_email: !userId && email ? email : undefined,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      allow_promotion_codes: true,
      client_reference_id: userId ?? undefined,
      metadata: {
        kind: "digital_product",
        productId: p.id,
        productSlug: p.slug,
        userId: userId ?? "",
        env,
      },
      payment_intent_data: {
        metadata: {
          kind: "digital_product",
          productId: p.id,
          userId: userId ?? "",
        },
      },
    });

    return { url: session.url };
  });

export const getMyPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId as string;
    const email = ((context.claims as any)?.email as string | undefined)?.toLowerCase();

    const sb = admin();
    let q = sb
      .from("digital_purchases")
      .select("id, created_at, amount_cents, currency, product:digital_products(id, slug, title, cover_url, file_path)")
      .order("created_at", { ascending: false });
    if (email) {
      q = q.or(`user_id.eq.${userId},email.eq.${email}`);
    } else {
      q = q.eq("user_id", userId);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { purchases: data ?? [] };
  });

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { purchaseId: string }) => d)
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const email = ((context.claims as any)?.email as string | undefined)?.toLowerCase();

    const sb = admin();
    const { data: row } = await sb
      .from("digital_purchases")
      .select("user_id, email, product:digital_products(file_path, title)")
      .eq("id", data.purchaseId)
      .maybeSingle();
    if (!row) throw new Error("Purchase not found");
    const owns = row.user_id === userId || (email && row.email?.toLowerCase() === email);
    if (!owns) throw new Error("Not authorised");
    const filePath = (row.product as any)?.file_path as string | undefined;
    if (!filePath) throw new Error("File not available yet");

    const { data: signed, error } = await sb.storage
      .from("digital-products")
      .createSignedUrl(filePath, 60 * 60, { download: true });
    if (error || !signed) throw new Error(error?.message || "Signing failed");
    return { url: signed.signedUrl };
  });

/* -------------------- Admin -------------------- */

async function assertAdmin(userId: string) {
  const { data } = await admin()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Not authorised");
}

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId as string);
    const { data } = await admin()
      .from("digital_products")
      .select("*")
      .order("created_at", { ascending: false });
    return { products: data ?? [] };
  });

export const adminUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    slug: string;
    title: string;
    description?: string | null;
    price_cents: number;
    currency?: string;
    cover_url?: string | null;
    thumbnail_url?: string | null;
    file_path?: string | null;
    active?: boolean;
    sort_order?: number;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId as string);
    const payload = {
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      price_cents: data.price_cents,
      currency: data.currency ?? "usd",
      cover_url: data.cover_url ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      file_path: data.file_path ?? null,
      active: data.active ?? true,
      sort_order: data.sort_order ?? 0,
    };
    if (data.id) {
      const { error } = await admin().from("digital_products").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await admin()
      .from("digital_products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId as string);
    await admin().from("digital_products").update({ active: false }).eq("id", data.id);
    return { ok: true };
  });

export const adminGetUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileName: string; kind: "file" | "cover" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId as string);
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${data.kind}/${Date.now()}-${safeName}`;
    const { data: signed, error } = await admin()
      .storage.from("digital-products")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "Upload URL failed");
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const adminGetCoverUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId as string);
    const { data: signed } = await admin()
      .storage.from("digital-products")
      .createSignedUrl(data.path, 60 * 60 * 24 * 365);
    return { url: signed?.signedUrl ?? null };
  });