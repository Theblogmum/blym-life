REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_daily_xp(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_xp(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_daily_xp(uuid) FROM PUBLIC;