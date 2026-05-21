DROP POLICY IF EXISTS "Admins manage brands" ON public.brands;
DROP POLICY IF EXISTS "Users see their own purchases" ON public.digital_purchases;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE POLICY "Service role manages brands"
ON public.brands
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users see their own purchases"
ON public.digital_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role manages purchases"
ON public.digital_purchases
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;