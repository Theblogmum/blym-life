
-- coach_messages: persistent chat with the AI strategist
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_coach_messages_user_created on public.coach_messages(user_id, created_at);
alter table public.coach_messages enable row level security;
create policy "Own coach_messages" on public.coach_messages
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scheduled_posts: in-app scheduler with reminders + Pinterest publish
create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  platform text not null check (platform in ('instagram','tiktok','youtube','pinterest','other')),
  caption text,
  hook text,
  media_url text,
  link_url text,
  pinterest_board_id text,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','reminded','posted','skipped','failed')),
  reminded_at timestamptz,
  posted_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_scheduled_posts_user on public.scheduled_posts(user_id, scheduled_for);
create index idx_scheduled_posts_due on public.scheduled_posts(scheduled_for, status);
alter table public.scheduled_posts enable row level security;
create policy "Own scheduled_posts" on public.scheduled_posts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Service role manages scheduled_posts" on public.scheduled_posts
  for all to public using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create trigger trg_scheduled_posts_updated before update on public.scheduled_posts
  for each row execute function public.update_updated_at_column();

-- growth_snapshots: weekly follower counts per platform
create table public.growth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  snapshot_date date not null default current_date,
  platform text not null,
  followers integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, snapshot_date, platform)
);
alter table public.growth_snapshots enable row level security;
create policy "Own growth_snapshots" on public.growth_snapshots
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- growth_reports: weekly AI report
create table public.growth_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  summary text not null,
  best_post text,
  ai_verdict text,
  next_hooks jsonb default '[]'::jsonb,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);
alter table public.growth_reports enable row level security;
create policy "Own growth_reports" on public.growth_reports
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Service role manages growth_reports" on public.growth_reports
  for all to public using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- pinterest_tokens: per-user OAuth tokens
create table public.pinterest_tokens (
  user_id uuid primary key,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  username text,
  default_board_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pinterest_tokens enable row level security;
create policy "Own pinterest_tokens read" on public.pinterest_tokens
  for select to authenticated using (auth.uid() = user_id);
create policy "Own pinterest_tokens delete" on public.pinterest_tokens
  for delete to authenticated using (auth.uid() = user_id);
create policy "Service role manages pinterest_tokens" on public.pinterest_tokens
  for all to public using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create trigger trg_pinterest_tokens_updated before update on public.pinterest_tokens
  for each row execute function public.update_updated_at_column();
