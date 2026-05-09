
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  number text not null,
  brand_name text not null,
  brand_email text,
  brand_address text,
  from_name text,
  from_email text,
  from_address text,
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'GBP',
  items jsonb not null default '[]'::jsonb,
  notes text,
  tax_rate numeric not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.invoices enable row level security;
create policy "Own invoices" on public.invoices for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_invoices_updated_at before update on public.invoices for each row execute function public.update_updated_at_column();

create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entry_date date not null default current_date,
  source text not null,
  brand text,
  amount numeric not null default 0,
  currency text not null default 'GBP',
  category text not null default 'brand_deal',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.income_entries enable row level security;
create policy "Own income" on public.income_entries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand text not null,
  product text not null,
  url text not null,
  code text,
  commission_rate text,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.affiliate_links enable row level security;
create policy "Own affiliate links" on public.affiliate_links for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_affiliate_links_updated_at before update on public.affiliate_links for each row execute function public.update_updated_at_column();

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  brand text,
  platform text,
  link text,
  image_url text,
  description text,
  metrics jsonb default '{}'::jsonb,
  posted_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_items enable row level security;
create policy "Own portfolio" on public.portfolio_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_portfolio_items_updated_at before update on public.portfolio_items for each row execute function public.update_updated_at_column();
