
create table if not exists public.trial_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  ip_hash text not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now()
);

create unique index if not exists trial_claims_ip_hash_unique on public.trial_claims(ip_hash);
create index if not exists trial_claims_user_id_idx on public.trial_claims(user_id);

alter table public.trial_claims enable row level security;

create policy "Users can view own trial claim"
  on public.trial_claims for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role manages trial claims"
  on public.trial_claims for all
  to public
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
