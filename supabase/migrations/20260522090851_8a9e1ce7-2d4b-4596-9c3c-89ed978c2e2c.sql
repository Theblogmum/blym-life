CREATE TABLE public.claimed_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chest_id text NOT NULL,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, chest_id)
);

ALTER TABLE public.claimed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own claimed_rewards"
ON public.claimed_rewards
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_claimed_rewards_user ON public.claimed_rewards(user_id);