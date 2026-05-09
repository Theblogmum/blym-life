ALTER TABLE public.trial_claims
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_trial_claims_ends_at ON public.trial_claims(ends_at);