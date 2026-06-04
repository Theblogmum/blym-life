-- Lock down digital_products sensitive columns from public roles
REVOKE SELECT ON public.digital_products FROM anon, authenticated;
GRANT SELECT (id, slug, title, description, price_cents, currency, cover_url, thumbnail_url, sort_order, active, created_at, updated_at)
  ON public.digital_products TO anon, authenticated;

-- Lock down profiles sensitive columns from anonymous visitors
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, display_name, public_bio, avatar_url, public_slug)
  ON public.profiles TO anon;
