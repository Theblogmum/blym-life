import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Map RevenueCat / App Store product IDs back to our internal plan IDs.
// Keep in sync with src/lib/iap-config.ts
const PRODUCT_ID_TO_INTERNAL: Record<string, string> = {
  blym_creator_monthly: "creator_monthly",
  blym_studio_monthly: "studio_monthly",
  blym_pro_monthly: "pro_monthly",
};

type RcEvent = {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  store?: string;
  environment?: string;
  expiration_at_ms?: number | null;
  purchased_at_ms?: number | null;
  transaction_id?: string;
  original_transaction_id?: string;
  cancel_reason?: string | null;
};

export const Route = createFileRoute("/api/public/revenuecat/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Verify shared-secret Authorization header (configured in RevenueCat dashboard)
        const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
        if (!expected) {
          return new Response("Webhook auth not configured", { status: 500 });
        }
        const auth = request.headers.get("authorization") ?? "";
        if (auth !== expected && auth !== `Bearer ${expected}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event: RcEvent | undefined = body?.event;
        if (!event?.type) {
          return new Response("Missing event", { status: 400 });
        }

        const userId = event.app_user_id ?? event.original_app_user_id;
        if (!userId) {
          // RevenueCat test events sometimes lack a user id — accept and noop.
          return new Response("ok", { status: 200 });
        }

        const productId = event.product_id ?? "";
        const internalPriceId = PRODUCT_ID_TO_INTERNAL[productId] ?? productId;
        const environment =
          event.environment === "SANDBOX" ? "sandbox" : "live";

        const isLifetime =
          LIFETIME_PRODUCT_IDS.has(productId) ||
          event.type === "NON_RENEWING_PURCHASE";

        try {
          if (isLifetime) {
            // Lifetime / one-off purchase
            if (
              event.type === "INITIAL_PURCHASE" ||
              event.type === "NON_RENEWING_PURCHASE" ||
              event.type === "UNCANCELLATION"
            ) {
              const { error } = await supabaseAdmin
                .from("lifetime_purchases")
                .upsert(
                  {
                    user_id: userId,
                    stripe_payment_intent_id:
                      event.original_transaction_id ??
                      event.transaction_id ??
                      `apple_${Date.now()}`,
                    product_id: productId,
                    price_id: internalPriceId,
                    environment,
                  },
                  { onConflict: "stripe_payment_intent_id" }
                );
              if (error) console.error("[rc-webhook] lifetime upsert", error);
            }
          } else {
            // Recurring subscription
            const periodEnd = event.expiration_at_ms
              ? new Date(event.expiration_at_ms).toISOString()
              : null;
            const periodStart = event.purchased_at_ms
              ? new Date(event.purchased_at_ms).toISOString()
              : null;

            let status: string = "active";
            let cancelAtPeriodEnd = false;
            switch (event.type) {
              case "INITIAL_PURCHASE":
              case "RENEWAL":
              case "UNCANCELLATION":
              case "PRODUCT_CHANGE":
                status = "active";
                break;
              case "CANCELLATION":
                status = "canceled";
                cancelAtPeriodEnd = true;
                break;
              case "EXPIRATION":
                status = "canceled";
                break;
              case "BILLING_ISSUE":
                status = "past_due";
                break;
              case "SUBSCRIPTION_PAUSED":
                status = "paused";
                break;
              default:
                // Ignore TEST, TRANSFER, REFUND-only events for status mapping
                return new Response("ok", { status: 200 });
            }

            const stripeSubId =
              event.original_transaction_id ?? event.transaction_id ?? `apple_${userId}`;

            const { error } = await supabaseAdmin
              .from("subscriptions")
              .upsert(
                {
                  user_id: userId,
                  stripe_customer_id: `apple_${userId}`,
                  stripe_subscription_id: stripeSubId,
                  status,
                  price_id: internalPriceId,
                  product_id: productId,
                  current_period_start: periodStart,
                  current_period_end: periodEnd,
                  cancel_at_period_end: cancelAtPeriodEnd,
                  environment,
                },
                { onConflict: "stripe_subscription_id" }
              );
            if (error) console.error("[rc-webhook] sub upsert", error);
          }

          return new Response("ok", { status: 200 });
        } catch (e) {
          console.error("[rc-webhook] handler error", e);
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});