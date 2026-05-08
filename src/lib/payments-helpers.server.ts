import { getStripe } from "@/lib/stripe.server";

export function getOrigin(fallback: string) {
  return process.env.SITE_URL || fallback;
}

export async function findOrCreateCustomerId(email: string, userId: string) {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length) return existing.data[0].id;
  const created = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  return created.id;
}