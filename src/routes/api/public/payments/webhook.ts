import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe, getStripeEnv, PRODUCT_BY_PRICE } from "@/lib/stripe.server";

let _supabase: any = null;
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

function priceKeyFromStripePriceId(stripePriceId: string | undefined | null): string | null {
  if (!stripePriceId) return null;
  return PRODUCT_BY_PRICE[stripePriceId] ?? stripePriceId;
}

type Tier = "free" | "creator" | "pro" | "premium";

async function setProfileTier(userId: string, tier: Tier, env: string) {
  if (tier === "free") {
    const { data: lifetime } = await getSupabase()
      .from("lifetime_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("environment", env)
      .limit(1)
      .maybeSingle();
    if (lifetime) return;
  }
  await getSupabase()
    .from("profiles")
    .update({ tier, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

async function maybeSendWelcomeEmail(userId: string, requestUrl: string) {
  try {
    const { data: userResp } = await getSupabase().auth.admin.getUserById(userId);
    const email = userResp?.user?.email;
    if (!email) return;
    const baseUrl = process.env.SITE_URL || new URL(requestUrl).origin;
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/lovable/email/transactional/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        templateName: "premium-welcome",
        recipientEmail: email,
        idempotencyKey: `welcome-premium-${userId}`,
        templateData: { name: userResp?.user?.user_metadata?.display_name ?? null },
      }),
    }).catch(() => null);
    if (resp && !resp.ok) console.warn("welcome email send failed", resp.status);
  } catch (e) {
    console.warn("welcome email error", e);
  }
}

function getUserIdFromSubscription(sub: Stripe.Subscription): string | null {
  return (sub.metadata?.userId as string) ?? null;
}

async function upsertSubscription(sub: Stripe.Subscription, env: string) {
  const userId = getUserIdFromSubscription(sub);
  if (!userId) {
    console.warn("Subscription missing userId metadata", sub.id);
    return;
  }
  const item = sub.items.data[0];
  const stripePriceId = item?.price?.id;
  const stripeProductId =
    typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id;
  const priceKey = priceKeyFromStripePriceId(stripePriceId);
  const productKey = priceKey?.startsWith("creator_")
    ? "creator"
    : priceKey?.startsWith("pro_")
      ? "pro"
      : priceKey?.startsWith("premium_")
        ? "premium"
        : (priceKey ?? stripeProductId ?? "premium");

  const periodStart = (sub as any).current_period_start
    ? new Date((sub as any).current_period_start * 1000).toISOString()
    : null;
  const periodEnd = (sub as any).current_period_end
    ? new Date((sub as any).current_period_end * 1000).toISOString()
    : null;

  await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        product_id: productKey,
        price_id: priceKey ?? stripePriceId ?? "unknown",
        status: sub.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: sub.cancel_at_period_end,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );

  const stillEntitled =
    ["active", "trialing", "past_due"].includes(sub.status) ||
    (sub.status === "canceled" &&
      (sub as any).current_period_end &&
      (sub as any).current_period_end * 1000 > Date.now());
  const targetTier: Tier = stillEntitled
    ? (productKey === "creator" ? "creator" : productKey === "pro" ? "pro" : "premium")
    : "free";
  await setProfileTier(userId, targetTier, env);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription, env: string) {
  const userId = getUserIdFromSubscription(sub);
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", sub.id);
  if (userId) {
    const periodEnd = (sub as any).current_period_end
      ? (sub as any).current_period_end * 1000
      : 0;
    if (periodEnd <= Date.now()) await setProfileTier(userId, "free", env);
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  env: string,
  requestUrl: string
) {
  const userId = (session.metadata?.userId as string) || (session.client_reference_id as string);
  if (!userId) return;

  if (session.mode === "subscription") {
    await maybeSendWelcomeEmail(userId, requestUrl);
    return;
  }

  if (session.mode === "payment" && session.payment_status === "paid") {
    const stripe = getStripe();
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });
    const item = full.line_items?.data[0];
    const stripePriceId = item?.price?.id;
    const priceKey = priceKeyFromStripePriceId(stripePriceId);
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? session.id;

    await getSupabase()
      .from("lifetime_purchases")
      .upsert(
        {
          user_id: userId,
          stripe_payment_intent_id: paymentIntentId,
          stripe_customer_id: customerId,
          product_id: "lifetime",
          price_id: priceKey ?? stripePriceId ?? "lifetime",
          environment: env,
        },
        { onConflict: "stripe_payment_intent_id" }
      );
    await setProfileTier(userId, "premium", env);
    await maybeSendWelcomeEmail(userId, requestUrl);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripe();
        const sig = request.headers.get("stripe-signature");
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET is not set");
          return new Response("Webhook secret not configured", { status: 500 });
        }
        if (!sig) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        let event: Stripe.Event;
        try {
          event = await (stripe.webhooks as any).constructEventAsync(body, sig, webhookSecret);
        } catch (e: any) {
          console.error("Webhook signature verification failed:", e?.message);
          return new Response(`Invalid signature: ${e?.message}`, { status: 400 });
        }

        const env = getStripeEnv();

        try {
          switch (event.type) {
            case "checkout.session.completed":
              await handleCheckoutCompleted(
                event.data.object as Stripe.Checkout.Session,
                env,
                request.url
              );
              break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await upsertSubscription(event.data.object as Stripe.Subscription, env);
              break;
            case "customer.subscription.deleted":
              await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, env);
              break;
            default:
              break;
          }
        } catch (e: any) {
          console.error("Webhook handler error:", e);
          return new Response("Handler error", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});