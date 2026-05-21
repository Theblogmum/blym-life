-- Restore automatic profile and role creation for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make profile creation resilient if a user signs up more than once through OAuth metadata flows
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, trial_started_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.creator_xp (user_id, xp)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Restore XP triggers used throughout the app
DROP TRIGGER IF EXISTS award_xp_on_post ON public.posts_logged;
CREATE TRIGGER award_xp_on_post
  AFTER INSERT ON public.posts_logged
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_post_xp();

DROP TRIGGER IF EXISTS award_xp_on_brief ON public.daily_briefs;
CREATE TRIGGER award_xp_on_brief
  AFTER UPDATE ON public.daily_briefs
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_brief_xp();

DROP TRIGGER IF EXISTS award_xp_on_community ON public.community_posts;
CREATE TRIGGER award_xp_on_community
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_community_xp();

DROP TRIGGER IF EXISTS award_xp_on_portfolio ON public.portfolio_items;
CREATE TRIGGER award_xp_on_portfolio
  AFTER INSERT ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_portfolio_xp();

DROP TRIGGER IF EXISTS award_xp_on_income ON public.income_entries;
CREATE TRIGGER award_xp_on_income
  AFTER INSERT ON public.income_entries
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_income_xp();

DROP TRIGGER IF EXISTS award_xp_on_invoice ON public.invoices;
CREATE TRIGGER award_xp_on_invoice
  AFTER INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.trg_award_income_xp();

-- Ensure app server calls can execute the intended helper functions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_xp(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_xp(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;