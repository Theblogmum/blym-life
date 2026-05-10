
UPDATE public.profiles SET tier = 'ultimate' WHERE id = 'd101f689-fc46-4b19-b9e8-759347f90871';

INSERT INTO public.user_roles (user_id, role)
VALUES ('d101f689-fc46-4b19-b9e8-759347f90871', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.lifetime_purchases (user_id, stripe_payment_intent_id, product_id, price_id, environment)
VALUES
  ('d101f689-fc46-4b19-b9e8-759347f90871', 'owner_grant_live', 'lifetime_oneoff', 'lifetime_oneoff', 'live'),
  ('d101f689-fc46-4b19-b9e8-759347f90871', 'owner_grant_test', 'lifetime_oneoff', 'lifetime_oneoff', 'test')
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;
