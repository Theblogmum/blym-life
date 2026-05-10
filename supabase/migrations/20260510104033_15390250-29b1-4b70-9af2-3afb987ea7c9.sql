-- Restrict xp_events: SELECT for owner, all writes service_role only
DROP POLICY IF EXISTS "Own xp_events" ON public.xp_events;
CREATE POLICY "Users view own xp_events"
  ON public.xp_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages xp_events"
  ON public.xp_events FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Restrict usage_events: SELECT for owner, all writes service_role only
DROP POLICY IF EXISTS "Own usage_events" ON public.usage_events;
CREATE POLICY "Users view own usage_events"
  ON public.usage_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages usage_events"
  ON public.usage_events FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');