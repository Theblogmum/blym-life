CREATE OR REPLACE FUNCTION public.brands_prevent_duplicates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
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

REVOKE EXECUTE ON FUNCTION public.brands_prevent_duplicates() FROM PUBLIC, anon, authenticated;