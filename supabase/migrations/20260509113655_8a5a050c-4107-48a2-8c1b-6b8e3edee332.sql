-- Ensure each user has at most one google connection (used for upsert in OAuth callback)
ALTER TABLE public.google_tokens DROP CONSTRAINT IF EXISTS google_tokens_user_id_key;
ALTER TABLE public.google_tokens ADD CONSTRAINT google_tokens_user_id_key UNIQUE (user_id);

-- Service role manages writes (OAuth callback runs server-side with admin client)
DROP POLICY IF EXISTS "Service role manages google tokens" ON public.google_tokens;
CREATE POLICY "Service role manages google tokens"
ON public.google_tokens
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');