
ALTER TABLE public.creator_profile
  ADD COLUMN IF NOT EXISTS tone text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS content_style text,
  ADD COLUMN IF NOT EXISTS hook_style text,
  ADD COLUMN IF NOT EXISTS goals text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.creator_xp (
  user_id uuid PRIMARY KEY,
  xp integer NOT NULL DEFAULT 0,
  last_claim_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.creator_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own xp" ON public.creator_xp FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own xp_events" ON public.xp_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.award_xp(_user_id uuid, _reason text, _amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _amount IS NULL OR _amount = 0 THEN RETURN; END IF;
  INSERT INTO public.creator_xp (user_id, xp) VALUES (_user_id, _amount)
  ON CONFLICT (user_id) DO UPDATE SET xp = public.creator_xp.xp + EXCLUDED.xp, updated_at = now();
  INSERT INTO public.xp_events (user_id, reason, amount) VALUES (_user_id, _reason, _amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_daily_xp(_user_id uuid)
RETURNS TABLE(awarded boolean, xp integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last date;
  _xp integer;
BEGIN
  SELECT last_claim_date, public.creator_xp.xp INTO _last, _xp FROM public.creator_xp WHERE user_id = _user_id;
  IF _last IS DISTINCT FROM CURRENT_DATE THEN
    PERFORM public.award_xp(_user_id, 'daily_login', 5);
    UPDATE public.creator_xp SET last_claim_date = CURRENT_DATE WHERE user_id = _user_id;
    SELECT public.creator_xp.xp INTO _xp FROM public.creator_xp WHERE user_id = _user_id;
    RETURN QUERY SELECT true, COALESCE(_xp, 5);
  ELSE
    RETURN QUERY SELECT false, COALESCE(_xp, 0);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_award_post_xp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.award_xp(NEW.user_id, 'post_logged', 10); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS award_xp_on_post ON public.posts_logged;
CREATE TRIGGER award_xp_on_post AFTER INSERT ON public.posts_logged
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_post_xp();

CREATE OR REPLACE FUNCTION public.trg_award_brief_xp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.filmed = true AND (OLD.filmed IS NULL OR OLD.filmed = false) THEN
    PERFORM public.award_xp(NEW.user_id, 'brief_filmed', 15);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS award_xp_on_brief ON public.daily_briefs;
CREATE TRIGGER award_xp_on_brief AFTER UPDATE ON public.daily_briefs
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_brief_xp();

CREATE OR REPLACE FUNCTION public.trg_award_community_xp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.award_xp(NEW.user_id, 'community_post', 5); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS award_xp_on_community ON public.community_posts;
CREATE TRIGGER award_xp_on_community AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_community_xp();

CREATE OR REPLACE FUNCTION public.trg_award_portfolio_xp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.award_xp(NEW.user_id, 'portfolio_item', 10); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS award_xp_on_portfolio ON public.portfolio_items;
CREATE TRIGGER award_xp_on_portfolio AFTER INSERT ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_portfolio_xp();

CREATE OR REPLACE FUNCTION public.trg_award_income_xp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.award_xp(NEW.user_id, 'income_logged', 20); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS award_xp_on_income ON public.income_entries;
CREATE TRIGGER award_xp_on_income AFTER INSERT ON public.income_entries
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_income_xp();

DROP TRIGGER IF EXISTS award_xp_on_invoice ON public.invoices;
CREATE TRIGGER award_xp_on_invoice AFTER INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_income_xp();
