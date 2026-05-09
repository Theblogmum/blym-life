
CREATE TABLE public.creator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creator_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own goals" ON public.creator_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER creator_goals_set_updated BEFORE UPDATE ON public.creator_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own follow_ups" ON public.follow_ups FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER follow_ups_set_updated BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX follow_ups_due_idx ON public.follow_ups(user_id, done, due_date);
