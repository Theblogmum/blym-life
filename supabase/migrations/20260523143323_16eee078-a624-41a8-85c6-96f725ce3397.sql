
-- 1. claimed_rewards: SELECT only for authenticated users; writes via service role
DROP POLICY IF EXISTS "Own claimed_rewards" ON public.claimed_rewards;
CREATE POLICY "Own claimed_rewards select"
  ON public.claimed_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. creator_xp: SELECT only; writes via SECURITY DEFINER functions / service role
DROP POLICY IF EXISTS "Own xp" ON public.creator_xp;
CREATE POLICY "Own xp select"
  ON public.creator_xp FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. digital_products: hide sensitive columns from anon/authenticated SELECT
REVOKE SELECT ON public.digital_products FROM anon, authenticated;
GRANT SELECT
  (id, slug, title, description, price_cents, currency, cover_url, thumbnail_url, sort_order, created_at, updated_at, active)
  ON public.digital_products TO anon, authenticated;

-- 4. profiles: prevent users from changing their own tier
CREATE OR REPLACE FUNCTION public.prevent_profile_tier_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role'
     AND NEW.tier IS DISTINCT FROM OLD.tier THEN
    NEW.tier := OLD.tier;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_tier_change_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_tier_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_tier_change();
