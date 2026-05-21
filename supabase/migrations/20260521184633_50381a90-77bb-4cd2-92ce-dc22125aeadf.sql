GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.digital_products;

CREATE POLICY "Anyone can view active products"
ON public.digital_products
FOR SELECT
TO public
USING (
  active = true
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);