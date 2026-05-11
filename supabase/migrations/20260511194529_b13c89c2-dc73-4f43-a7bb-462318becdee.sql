
-- Brands directory
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  category text,
  hq_country text default 'UK',
  description text,
  logo_url text,
  contact_email text,
  instagram text,
  notes text,
  is_seeded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.brands enable row level security;
create policy "Anyone authed can read brands" on public.brands for select to authenticated using (true);
create policy "Admins manage brands" on public.brands for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_brands_updated_at before update on public.brands
  for each row execute function public.update_updated_at_column();
create index idx_brands_category on public.brands (category);
create index idx_brands_name_lower on public.brands (lower(name));

-- User-added brands
create table public.user_brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  website text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_brands enable row level security;
create policy "Own user_brands" on public.user_brands for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_user_brands_updated_at before update on public.user_brands
  for each row execute function public.update_updated_at_column();

-- Pitches
create table public.brand_pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand_id uuid references public.brands(id) on delete set null,
  user_brand_id uuid references public.user_brands(id) on delete set null,
  recipient_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'draft',
  gmail_message_id text,
  gmail_thread_id text,
  sent_at timestamptz,
  follow_up_due_at timestamptz,
  follow_up_sent_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.brand_pitches enable row level security;
create policy "Own brand_pitches" on public.brand_pitches for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_brand_pitches_updated_at before update on public.brand_pitches
  for each row execute function public.update_updated_at_column();
create index idx_pitches_user on public.brand_pitches (user_id, created_at desc);
create unique index uniq_pitches_active_recipient on public.brand_pitches
  (user_id, lower(recipient_email))
  where status in ('sent','followed_up');

-- Seed ~50 UK brands (only seed if directory is empty)
insert into public.brands (name, website, category, description, contact_email, is_seeded) values
('Mori','https://babymori.com','Baby clothing','Sustainable baby & toddler basics in soft bamboo cotton.','press@babymori.com',true),
('Frugi','https://frugi.com','Baby clothing','Organic, colourful kidswear made in the UK.','press@frugi.com',true),
('JoJo Maman Bébé','https://jojomamanbebe.co.uk','Baby clothing','British high-street favourite for maternity & kids.','marketing@jojomamanbebe.com',true),
('Tutti Frutti Clothing','https://tuttifrutticlothing.com','Baby clothing','Bright, fun handmade kidswear.','hello@tuttifrutticlothing.com',true),
('Boden Mini','https://boden.co.uk','Baby clothing','Playful prints, premium kidswear.','press@boden.co.uk',true),
('My1stYears','https://my1stYears.com','Personalised gifts','Personalised baby & kids gifts.','press@my1styears.com',true),
('PoppyAdeline','https://poppyadeline.com','Baby clothing','Independent UK baby & toddler brand.','hello@poppyadeline.com',true),
('Lottie & Lysh','https://lottieandlysh.co.uk','Baby clothing','Inclusive, gender-neutral kidswear.','hello@lottieandlysh.co.uk',true),
('Kit & Kin','https://kitandkin.com','Baby essentials','Eco nappies & wipes co-founded by Emma Bunton.','hello@kitandkin.com',true),
('Bambino Mio','https://bambinomio.com','Baby essentials','Reusable nappies and potty-training pants.','press@bambinomio.com',true),
('Cheeky Wipes','https://cheekywipes.com','Baby essentials','Reusable wipes and period care.','helen@cheekywipes.com',true),
('The Little Loop','https://thelittleloop.com','Baby clothing','Rental kids clothing subscription.','press@thelittleloop.com',true),
('Mamas & Papas','https://mamasandpapas.com','Baby gear','Buggies, nursery furniture & maternity wear.','press@mamasandpapas.com',true),
('iCandy World','https://icandyworld.com','Baby gear','Premium British buggies and travel systems.','marketing@icandyworld.com',true),
('Bugaboo UK','https://bugaboo.com','Baby gear','Iconic strollers and travel accessories.','press.uk@bugaboo.com',true),
('Stokke UK','https://stokke.com','Baby gear','Tripp Trapp highchair and ergonomic kit.','marketing.uk@stokke.com',true),
('Joie','https://joiebaby.com','Baby gear','Affordable buggies, car seats and highchairs.','marketing@joiebaby.com',true),
('Silver Cross','https://silvercrossbaby.com','Baby gear','Heritage British prams and buggies.','press@silvercrossbaby.com',true),
('Cybex UK','https://cybex-online.com','Baby gear','Designer car seats and strollers.','marketing.uk@cybex-online.com',true),
('Snuz','https://snuz.co.uk','Sleep & nursery','Nursery furniture and SnüzPod bedside crib.','hello@snuz.co.uk',true),
('Tutti Bambini','https://tuttibambini.com','Sleep & nursery','Cribs, cots and nursery sets.','marketing@tuttibambini.com',true),
('The Gro Company','https://gro-store.com','Sleep & nursery','Grobags and sleep aids.','hello@gro-store.com',true),
('ergoPouch UK','https://ergopouch.co.uk','Sleep & nursery','Sleep bags and swaddles.','hello@ergopouch.co.uk',true),
('Slumbersac','https://slumbersac.co.uk','Sleep & nursery','Sleeping bags for babies and toddlers.','press@slumbersac.co.uk',true),
('Tommee Tippee','https://tommeetippee.com','Feeding','Bottles, sterilisers and weaning kit.','press@tommeetippee.com',true),
('MAM Baby UK','https://mambaby.com','Feeding','Bottles, dummies and oral care.','marketing.uk@mambaby.com',true),
('Ella''s Kitchen','https://ellaskitchen.co.uk','Weaning & food','Organic baby and toddler food pouches.','press@ellaskitchen.co.uk',true),
('Piccolo','https://mylittlepiccolo.com','Weaning & food','Mediterranean-inspired baby food.','hello@mylittlepiccolo.com',true),
('Annabel Karmel','https://annabelkarmel.com','Weaning & food','Recipe brand and toddler food range.','press@annabelkarmel.com',true),
('Organix','https://organix.com','Weaning & food','No junk baby and toddler snacks.','hello@organix.com',true),
('Kiddylicious','https://kiddylicious.co.uk','Weaning & food','Toddler snacks and lunchbox bites.','marketing@kiddylicious.co.uk',true),
('Aptamil','https://aptaclub.co.uk','Feeding','Formula and toddler milks.','press@aptaclub.co.uk',true),
('Childs Farm','https://childsfarm.com','Beauty & skincare','Dermatologist-tested baby & kids skincare.','hello@childsfarm.com',true),
('Burt''s Bees Baby UK','https://burtsbees.co.uk','Beauty & skincare','Natural baby skincare.','marketing.uk@burtsbees.com',true),
('Mama Mio','https://mamamio.com','Beauty & skincare','Mama bump & post-bump skincare.','hello@mamamio.com',true),
('Pai Skincare','https://paiskincare.com','Beauty & skincare','Sensitive-skin certified organic skincare.','press@paiskincare.com',true),
('Mio Skincare','https://mioskincare.com','Beauty & skincare','Body-positive skincare.','hello@mioskincare.com',true),
('The White Company','https://thewhitecompany.com','Home & lifestyle','Premium home and baby essentials.','press@thewhitecompany.com',true),
('Dunelm','https://dunelm.com','Home & lifestyle','High-street home and nursery decor.','press@dunelm.com',true),
('John Lewis','https://johnlewis.com','Home & lifestyle','Department store with strong baby & kids range.','press@johnlewis.co.uk',true),
('Mothercare','https://mothercare.com','Baby gear','Baby essentials, clothing and gear.','press@mothercare.com',true),
('Smyths Toys','https://smythstoys.com','Toys','UK toy retailer.','marketing@smythstoys.com',true),
('Early Learning Centre','https://elc.co.uk','Toys','Educational toys for babies and toddlers.','press@elc.co.uk',true),
('Lovevery UK','https://lovevery.co.uk','Toys','Stage-based play kits.','press.uk@lovevery.com',true),
('Babylonia UK','https://babylonia.eu','Baby carriers','Baby slings and carriers.','press@babylonia.eu',true),
('Close Parent','https://closeparent.com','Baby essentials','Carriers, swaddles and reusable nappies.','hello@closeparent.com',true),
('Hippychick','https://hippychick.com','Baby gear','Hipseats, sleep aids and travel kit.','press@hippychick.com',true),
('Cuddledry','https://cuddledry.com','Baby essentials','Towels, robes and bath kit.','press@cuddledry.com',true),
('Tutti Bimbi','https://tuttibimbi.com','Baby clothing','UK independent kidswear brand.','hello@tuttibimbi.com',true),
('Neom Organics','https://neomorganics.com','Beauty & skincare','Wellbeing candles, sleep mists & body care.','press@neomorganics.com',true),
('Beauty Pie UK','https://beautypie.com','Beauty & skincare','Members-only beauty buyers club.','marketing.uk@beautypie.com',true)
on conflict do nothing;
