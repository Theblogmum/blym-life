
ALTER TABLE public.subscriptions RENAME COLUMN paddle_subscription_id TO stripe_subscription_id;
ALTER TABLE public.subscriptions RENAME COLUMN paddle_customer_id TO stripe_customer_id;
ALTER TABLE public.subscriptions ALTER COLUMN environment SET DEFAULT 'live';

ALTER TABLE public.lifetime_purchases RENAME COLUMN paddle_transaction_id TO stripe_payment_intent_id;
ALTER TABLE public.lifetime_purchases RENAME COLUMN paddle_customer_id TO stripe_customer_id;
ALTER TABLE public.lifetime_purchases ALTER COLUMN environment SET DEFAULT 'live';
