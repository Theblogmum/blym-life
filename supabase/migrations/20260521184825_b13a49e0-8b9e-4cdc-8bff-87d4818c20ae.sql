REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.digital_products;
DROP POLICY IF EXISTS "Admins manage products" ON public.digital_products;

CREATE POLICY "Anyone can view active products"
ON public.digital_products
FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Service role manages products"
ON public.digital_products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);