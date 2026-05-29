
-- Brain Dump feature: organise messy ideas + camera roll into full content plans

CREATE TABLE public.brain_dumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  raw_text TEXT NOT NULL DEFAULT '',
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_dumps TO authenticated;
GRANT ALL ON public.brain_dumps TO service_role;

ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_dumps own select" ON public.brain_dumps
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "brain_dumps own insert" ON public.brain_dumps
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brain_dumps own update" ON public.brain_dumps
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "brain_dumps own delete" ON public.brain_dumps
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_brain_dumps_user_created ON public.brain_dumps(user_id, created_at DESC);

CREATE TRIGGER brain_dumps_updated_at
  BEFORE UPDATE ON public.brain_dumps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.brain_dump_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dump_id UUID NOT NULL REFERENCES public.brain_dumps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  category TEXT,
  format TEXT,
  hook TEXT,
  script TEXT,
  voiceover TEXT,
  text_overlay TEXT,
  caption TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  seo_keywords TEXT[] NOT NULL DEFAULT '{}',
  best_platform TEXT,
  best_time TEXT,
  posting_strategy TEXT,
  uses_media TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_dump_ideas TO authenticated;
GRANT ALL ON public.brain_dump_ideas TO service_role;

ALTER TABLE public.brain_dump_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_dump_ideas own select" ON public.brain_dump_ideas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "brain_dump_ideas own insert" ON public.brain_dump_ideas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brain_dump_ideas own delete" ON public.brain_dump_ideas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_brain_dump_ideas_dump ON public.brain_dump_ideas(dump_id, position);


-- Private storage bucket for camera-roll uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('brain-dump-media', 'brain-dump-media', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "brain_dump_media own read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'brain-dump-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brain_dump_media own insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brain-dump-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brain_dump_media own delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'brain-dump-media' AND auth.uid()::text = (storage.foldername(name))[1]);
