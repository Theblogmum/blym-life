
-- Roles enum + table (separate, security-definer pattern)
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  tier text not null default 'free', -- 'free' | 'premium'
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Creator profile (onboarding answers)
create table public.creator_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  niches text[] not null default '{}',           -- relatable mum, aesthetic, working, etc
  vibe text,                                      -- e.g. "warm chaotic real"
  kids_ages text,                                 -- free text e.g. "2 and 5"
  location text,
  work_status text,                               -- 'sahm' | 'wfh' | 'office' | 'self-employed'
  platforms text[] not null default '{}',         -- 'tiktok','instagram'
  follower_goal int,
  posting_frequency text,                          -- 'daily','few-week','weekly'
  known_for text,                                  -- free text
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_profile enable row level security;
create policy "Own creator_profile" on public.creator_profile
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily briefs (the killer feature, also used to enforce free tier limit)
create table public.daily_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brief_date date not null default current_date,
  film text not null,           -- "making coffee → toddler interrupts → your reaction"
  hook text not null,
  caption text not null,
  shot_list jsonb not null default '[]'::jsonb,   -- array of {description, seconds}
  why_it_works text,
  post_at text,                  -- e.g. "7 PM"
  filmed boolean not null default false,
  saved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.daily_briefs enable row level security;
create policy "Own daily_briefs" on public.daily_briefs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index daily_briefs_user_date on public.daily_briefs(user_id, brief_date);

-- Saved content
create table public.saved_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,            -- 'hook' | 'script' | 'caption' | 'hashtags' | 'shot_list' | 'idea'
  title text,
  body text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);
alter table public.saved_content enable row level security;
create policy "Own saved_content" on public.saved_content
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Posts logged
create table public.posts_logged (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  posted_at date not null default current_date,
  platform text not null,           -- 'tiktok' | 'instagram'
  description text not null,
  hook text,
  views int default 0,
  likes int default 0,
  saves int default 0,
  comments int default 0,
  shares int default 0,
  created_at timestamptz not null default now()
);
alter table public.posts_logged enable row level security;
create policy "Own posts_logged" on public.posts_logged
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weekly plans (one row per slot)
create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  slot_label text,                 -- e.g. "morning", "evening"
  idea text not null,
  hook text,
  caption text,
  notes text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.weekly_plans enable row level security;
create policy "Own weekly_plans" on public.weekly_plans
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index weekly_plans_user_date on public.weekly_plans(user_id, plan_date);
