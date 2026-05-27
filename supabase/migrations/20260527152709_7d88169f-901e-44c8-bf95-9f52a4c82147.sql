
-- 1) digital_products: hide file_path and stripe_price_id from anon + authenticated
REVOKE SELECT (file_path, stripe_price_id) ON public.digital_products FROM anon;
REVOKE SELECT (file_path, stripe_price_id) ON public.digital_products FROM authenticated;

-- 2) profiles: hide tier, onboarded, trial_started_at from anonymous visitors
REVOKE SELECT (tier, onboarded, trial_started_at) ON public.profiles FROM anon;
