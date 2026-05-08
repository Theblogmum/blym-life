import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripe, getStripeEnv, PRICE_MAP } from "@/lib/stripe.server";
import { findOrCreateCustomerId } from "@/lib/payments-helpers.server";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; successUrl: string; cancelUrl: string }) => data)
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const email = (context.claims as any)?.email as string | undefined;
    if (!email) throw new Error("No email on user account");

    const mapping = PRICE_MAP[data.priceId];
    if (!mapping) throw new Error(`Unknown priceId: ${data.priceId}`);

    const stripe = getStripe();
    const customerId = await findOrCreateCustomerId(email, userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mapping.mode,
      line_items: [{ price: mapping.stripePriceId, quantity: 1 }],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      allow_promotion_codes: true,
      client_reference_id: userId,
      metadata: { userId, priceKey: data.priceId },
      subscription_data:
        mapping.mode === "subscription"
          ? { metadata: { userId, priceKey: data.priceId } }
          : undefined,
      payment_intent_data:
        mapping.mode === "payment"
          ? { metadata: { userId, priceKey: data.priceId } }
          : undefined,
    });

    return { url: session.url };
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string }) => data)
  .handler(async ({ data, context }) => {
    const userId = context.userId as string;
    const email = (context.claims as any)?.email as string | undefined;
    if (!email) throw new Error("No email on user account");

    const env = getStripeEnv();
    const supabase: any = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId: string | null = sub?.stripe_customer_id ?? null;
    if (!customerId) {
      // Fallback: lookup by email (lifetime-only customers won't have a sub row)
      const stripe = getStripe();
      const existing = await stripe.customers.list({ email, limit: 1 });
      customerId = existing.data[0]?.id ?? null;
    }
    if (!customerId) throw new Error("No billing account found");

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: data.returnUrl ?? process.env.SITE_URL ?? "https://theblogmumstudio.lovable.app/settings",
    });
    return { url: portal.url };
  });