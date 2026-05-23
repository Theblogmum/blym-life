-- Revoke public/anon/authenticated EXECUTE on internal SECURITY DEFINER functions.
-- Keep has_role() and has_active_subscription() executable because RLS policies invoke them.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_daily_xp(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_tier_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_community_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_portfolio_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_income_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_post_xp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_award_brief_xp() FROM PUBLIC, anon, authenticated;