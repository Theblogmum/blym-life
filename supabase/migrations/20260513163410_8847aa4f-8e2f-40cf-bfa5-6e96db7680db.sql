
-- Storage bucket (private)
insert into storage.buckets (id, name, public) values ('digital-products', 'digital-products', false)
on conflict (id) do nothing;

-- Products
create table public.digital_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  stripe_price_id text,
  file_path text,
  cover_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger digital_products_updated_at
before update on public.digital_products
for each row execute function public.update_updated_at_column();

alter table public.digital_products enable row level security;

create policy "Anyone can view active products"
on public.digital_products for select
using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage products"
on public.digital_products for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Purchases
create table public.digital_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_id uuid not null references public.digital_products(id) on delete restrict,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text,
  environment text not null default 'live',
  created_at timestamptz not null default now()
);

create index digital_purchases_user_idx on public.digital_purchases(user_id);
create index digital_purchases_email_idx on public.digital_purchases(lower(email));

alter table public.digital_purchases enable row level security;

create policy "Users see their own purchases"
on public.digital_purchases for select
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- Storage policies for digital-products bucket
create policy "Admins read digital files"
on storage.objects for select
using (bucket_id = 'digital-products' and public.has_role(auth.uid(), 'admin'));

create policy "Admins write digital files"
on storage.objects for insert
with check (bucket_id = 'digital-products' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update digital files"
on storage.objects for update
using (bucket_id = 'digital-products' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete digital files"
on storage.objects for delete
using (bucket_id = 'digital-products' and public.has_role(auth.uid(), 'admin'));
