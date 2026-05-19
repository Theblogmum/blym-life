-- Dedupe brands by (lower) name, contact_email, website. Keep earliest row.
-- Drop newer duplicates first so we can add unique indexes.

WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY lower(name) ORDER BY created_at, id) AS rn
  FROM public.brands
  WHERE name IS NOT NULL
)
DELETE FROM public.brands b USING ranked r WHERE b.id = r.id AND r.rn > 1;

WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY lower(contact_email) ORDER BY created_at, id) AS rn
  FROM public.brands
  WHERE contact_email IS NOT NULL AND contact_email <> ''
)
DELETE FROM public.brands b USING ranked r WHERE b.id = r.id AND r.rn > 1;

WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY lower(website) ORDER BY created_at, id) AS rn
  FROM public.brands
  WHERE website IS NOT NULL AND website <> ''
)
DELETE FROM public.brands b USING ranked r WHERE b.id = r.id AND r.rn > 1;

-- Enforce uniqueness going forward (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS brands_name_lower_uniq
  ON public.brands (lower(name)) WHERE name IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS brands_email_lower_uniq
  ON public.brands (lower(contact_email)) WHERE contact_email IS NOT NULL AND contact_email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS brands_website_lower_uniq
  ON public.brands (lower(website)) WHERE website IS NOT NULL AND website <> '';

-- Trigger: normalize + block duplicates on insert/update with friendly error
CREATE OR REPLACE FUNCTION public.brands_prevent_duplicates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.name IS NOT NULL THEN
    NEW.name := btrim(NEW.name);
  END IF;
  IF NEW.contact_email IS NOT NULL THEN
    NEW.contact_email := lower(btrim(NEW.contact_email));
    IF NEW.contact_email = '' THEN NEW.contact_email := NULL; END IF;
  END IF;
  IF NEW.website IS NOT NULL THEN
    NEW.website := lower(btrim(NEW.website));
    IF NEW.website = '' THEN NEW.website := NULL; END IF;
  END IF;

  IF NEW.name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.brands
    WHERE lower(name) = lower(NEW.name) AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'duplicate brand name: %', NEW.name USING ERRCODE = 'unique_violation';
  END IF;

  IF NEW.contact_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.brands
    WHERE lower(contact_email) = NEW.contact_email AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'duplicate brand email: %', NEW.contact_email USING ERRCODE = 'unique_violation';
  END IF;

  IF NEW.website IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.brands
    WHERE lower(website) = NEW.website AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'duplicate brand website: %', NEW.website USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_brands_prevent_duplicates ON public.brands;
CREATE TRIGGER trg_brands_prevent_duplicates
  BEFORE INSERT OR UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.brands_prevent_duplicates();