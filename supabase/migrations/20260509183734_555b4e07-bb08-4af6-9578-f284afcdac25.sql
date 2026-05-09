
-- Community feed
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authed can read posts" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert their posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update their posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete their posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER community_posts_set_updated BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX community_posts_created_idx ON public.community_posts(created_at DESC);

CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authed can read comments" ON public.community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert their comments" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete their comments" ON public.community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX community_comments_post_idx ON public.community_comments(post_id, created_at);

CREATE TABLE public.community_likes (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authed can read likes" ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert their likes" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete their likes" ON public.community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
