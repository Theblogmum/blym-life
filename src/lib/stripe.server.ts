import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" as any });
  return _stripe;
}

// Single source of truth for env; Stripe BYOK key prefix tells us which mode
// the connected account is in.
export type StripeEnv = "sandbox" | "live";
export function getStripeEnv(): StripeEnv {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "sandbox";
}

// Human-readable price IDs map → Stripe price IDs.
// Update these if you create new prices in your Stripe dashboard.
export const PRICE_MAP: Record<string, { stripePriceId: string; mode: "subscription" | "payment" }> = {
  creator_monthly: { stripePriceId: "price_1Tc2LLPq1j7CmigdPDw6HxWO", mode: "subscription" },
  studio_monthly:  { stripePriceId: "price_1TbgwfPq1j7CmigdKwlMwaaD", mode: "subscription" },
  pro_monthly:     { stripePriceId: "price_1TbksIPq1j7CmigdNsdFj6q3", mode: "subscription" },
};

export const PRODUCT_BY_PRICE: Record<string, string> = {
  price_1Tc2LLPq1j7CmigdPDw6HxWO: "creator_monthly",
  price_1TYWwgLG4ux3wieX3NHxVp4A: "creator_monthly",
  price_1TbgwfPq1j7CmigdKwlMwaaD: "studio_monthly",
  price_1TbksIPq1j7CmigdNsdFj6q3: "pro_monthly",
  price_1TYWx5LG4ux3wieX3qXpukNM: "pro_monthly",
  // Legacy prices kept for back-compat with existing subscriptions
  price_1TVH9ELG4ux3wieXEBuL6Ydb: "creator_monthly",
  price_1TVHIDLG4ux3wieXnex53SJN: "pro_monthly",
  // Legacy ultimate/lifetime customers are folded into Pro on next webhook event.
  price_1TVHS9LG4ux3wieXFiEN5Met: "pro_monthly",
  price_1TUs4oLG4ux3wieXM0IbSxDW: "pro_monthly",
};