-- Revoke broad EXECUTE access on SECURITY DEFINER functions
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.handle_new_user()',
    'public.enqueue_email(text, jsonb)',
    'public.read_email_batch(text, integer, integer)',
    'public.delete_email(text, bigint)',
    'public.move_to_dlq(text, text, bigint, jsonb)',
    'public.trg_award_community_xp()',
    'public.trg_award_portfolio_xp()',
    'public.trg_award_income_xp()',
    'public.trg_award_post_xp()',
    'public.trg_award_brief_xp()',
    'public.has_active_subscription(uuid, text)',
    'public.award_xp(uuid, text, integer)',
    'public.claim_daily_xp(uuid)',
    'public.has_role(uuid, app_role)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- Re-grant EXECUTE only where the app actually needs it.
-- has_role is used inside RLS policy expressions evaluated as the calling role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
-- claim_daily_xp is invoked by an authenticated server function on behalf of the user.
GRANT EXECUTE ON FUNCTION public.claim_daily_xp(uuid) TO authenticated;