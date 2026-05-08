import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhook, EventName, type PaddleEnv } from '@/lib/paddle.server';

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

async function setProfileTier(userId: string, tier: 'free' | 'premium') {
  await getSupabase().from('profiles').update({ tier, updated_at: new Date().toISOString() }).eq('id', userId);
}

async function maybeSendWelcomeEmail(userId: string) {
  // Best-effort welcome email. If the email infra isn't set up yet, just log and continue.
  try {
    const { data: userResp } = await getSupabase().auth.admin.getUserById(userId);
    const email = userResp?.user?.email;
    if (!email) return;
    const baseUrl = process.env.SITE_URL || process.env.SUPABASE_URL || '';
    // Try the project's published URL via env, else skip.
    const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/lovable/email/transactional/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        templateName: 'premium-welcome',
        recipientEmail: email,
        idempotencyKey: `welcome-premium-${userId}`,
        templateData: { name: userResp?.user?.user_metadata?.display_name ?? null },
      }),
    }).catch(() => null);
    if (resp && !resp.ok) console.warn('welcome email send failed', resp.status);
  } catch (e) {
    console.warn('welcome email error', e);
  }
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) { console.error('No userId in customData'); return; }
  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId');
    return;
  }
  await getSupabase().from('subscriptions').upsert(
    {
      user_id: userId,
      paddle_subscription_id: id,
      paddle_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'paddle_subscription_id' }
  );
  await setProfileTier(userId, 'premium');
  await maybeSendWelcomeEmail(userId);
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange, items, customData } = data;
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  await getSupabase()
    .from('subscriptions')
    .update({
      status,
      ...(priceId ? { price_id: priceId } : {}),
      ...(productId ? { product_id: productId } : {}),
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);

  // Tier sync: keep premium until period actually ends.
  if (customData?.userId) {
    const periodEnd = currentBillingPeriod?.endsAt ? new Date(currentBillingPeriod.endsAt).getTime() : 0;
    const stillEntitled = ['active', 'trialing', 'past_due'].includes(status) ||
      (status === 'canceled' && periodEnd > Date.now());
    await setProfileTier(customData.userId, stillEntitled ? 'premium' : 'free');
  }
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  const { id, currentBillingPeriod, customData } = data;
  await getSupabase()
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
  // Keep tier=premium until current_period_end passes; a separate check on app load handles expiry.
  if (customData?.userId) {
    const periodEnd = currentBillingPeriod?.endsAt ? new Date(currentBillingPeriod.endsAt).getTime() : 0;
    if (periodEnd <= Date.now()) await setProfileTier(customData.userId, 'free');
  }
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const { id, customerId, items, customData } = data;
  const userId = customData?.userId;
  if (!userId) return;
  // Only handle one-off lifetime: skip transactions tied to a subscription.
  if (data.subscriptionId) return;
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.price?.productId; // transaction events lack product object
  if (!priceId) return;
  await getSupabase().from('lifetime_purchases').upsert(
    {
      user_id: userId,
      paddle_transaction_id: id,
      paddle_customer_id: customerId,
      product_id: productId ?? 'lifetime',
      price_id: priceId,
      environment: env,
    },
    { onConflict: 'paddle_transaction_id' }
  );
  await setProfileTier(userId, 'premium');
  await maybeSendWelcomeEmail(userId);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env); break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env); break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env); break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env); break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});