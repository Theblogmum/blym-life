
-- 1. Trial start
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz NOT NULL DEFAULT now();

-- Backfill existing users (in case column was just added)
UPDATE public.profiles SET trial_started_at = now() WHERE trial_started_at IS NULL;

-- Update the new-user trigger to set trial_started_at on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, display_name, trial_started_at)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), now());
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$function$;

-- 2. Brands (public directory)
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website text,
  category text NOT NULL,
  hq_country text DEFAULT 'UK',
  description text,
  logo_url text,
  contact_email text,
  instagram text,
  notes text,
  is_seeded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_brands_category ON public.brands(category);
CREATE INDEX idx_brands_name ON public.brands(lower(name));

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view brands"
  ON public.brands FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert brands"
  ON public.brands FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
  ON public.brands FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
  ON public.brands FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. User brands (private additions)
CREATE TABLE public.user_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  website text,
  category text,
  contact_email text,
  instagram text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_brands_user ON public.user_brands(user_id);

ALTER TABLE public.user_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own user_brands"
  ON public.user_brands FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Brand pitches
CREATE TABLE public.brand_pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  user_brand_id uuid REFERENCES public.user_brands(id) ON DELETE SET NULL,
  brand_name text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  follow_up_body text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','followed_up','replied','bounced','cancelled')),
  gmail_message_id text,
  gmail_thread_id text,
  sent_at timestamptz,
  follow_up_due_at timestamptz,
  follow_up_sent_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_brand_pitches_user ON public.brand_pitches(user_id);
CREATE INDEX idx_brand_pitches_status ON public.brand_pitches(status);
CREATE INDEX idx_brand_pitches_followup ON public.brand_pitches(follow_up_due_at) WHERE status = 'sent';

-- Prevent double-pitching the same email address with an active pitch
CREATE UNIQUE INDEX uniq_pitch_active_recipient
  ON public.brand_pitches(user_id, lower(recipient_email))
  WHERE status IN ('draft','sent','followed_up');

ALTER TABLE public.brand_pitches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own brand_pitches"
  ON public.brand_pitches FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Google OAuth tokens (per creator)
CREATE TABLE public.google_tokens (
  user_id uuid PRIMARY KEY,
  access_token text,
  refresh_token text NOT NULL,
  expires_at timestamptz,
  scope text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- Owner can read existence + email (not raw tokens via app — service role bypasses)
CREATE POLICY "Users can view own google connection"
  ON public.google_tokens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own google connection"
  ON public.google_tokens FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Service role only writes (via OAuth callback)

-- 6. Seed brand directory (UK mum-friendly brands with public PR/marketing emails)
INSERT INTO public.brands (name, website, category, description, contact_email, instagram, is_seeded) VALUES
  ('Mori', 'https://babymori.com', 'Baby', 'Soft organic baby clothing and sleepwear', 'press@babymori.com', '@babymori', true),
  ('Frugi', 'https://welovefrugi.com', 'Baby & Kids', 'Organic kidswear, ethical and colourful', 'marketing@welovefrugi.com', '@frugi_official', true),
  ('JoJo Maman Bébé', 'https://jojomamanbebe.co.uk', 'Maternity & Kids', 'Maternity, baby and kids essentials', 'press@jojomamanbebe.co.uk', '@jojomamanbebe', true),
  ('Trotters Childrenswear', 'https://trotters.co.uk', 'Kids', 'Classic British childrenswear', 'pr@trotters.co.uk', '@trotterschildrenswear', true),
  ('My 1st Years', 'https://my1styears.com', 'Baby Gifts', 'Personalised baby gifts and keepsakes', 'press@my1styears.com', '@my1styears', true),
  ('The Little White Company', 'https://thewhitecompany.com', 'Home & Baby', 'Premium baby and home essentials', 'press@thewhitecompany.com', '@thewhitecompany', true),
  ('Mamas & Papas', 'https://mamasandpapas.com', 'Baby Gear', 'Pushchairs, nursery and baby essentials', 'press@mamasandpapas.com', '@mamasandpapas', true),
  ('Silver Cross', 'https://silvercross.co.uk', 'Baby Gear', 'Heritage British baby brand', 'marketing@silvercross.co.uk', '@silvercrossuk', true),
  ('Cybex', 'https://cybex-online.com', 'Baby Gear', 'Premium pushchairs and car seats', 'pr.uk@cybex-online.com', '@cybex_global', true),
  ('Bugaboo', 'https://bugaboo.com', 'Baby Gear', 'Designer pushchairs and travel systems', 'press@bugaboo.com', '@bugaboo', true),
  ('Stokke', 'https://stokke.com', 'Baby Gear', 'High chairs, prams and nursery furniture', 'pr@stokke.com', '@stokkebaby', true),
  ('Tommee Tippee', 'https://tommeetippee.com', 'Baby Feeding', 'Bottles, breast pumps and weaning', 'press@tommeetippee.com', '@tommeetippeeuk', true),
  ('MAM Baby', 'https://mambaby.com', 'Baby Feeding', 'Bottles, soothers and weaning', 'press@mambaby.com', '@mambaby', true),
  ('Ella''s Kitchen', 'https://ellaskitchen.co.uk', 'Baby Food', 'Organic baby and toddler food', 'press@ellaskitchen.co.uk', '@ellaskitchenuk', true),
  ('Piccolo', 'https://mylittlepiccolo.com', 'Baby Food', 'Mediterranean-inspired baby food', 'hello@mylittlepiccolo.com', '@piccolo_baby', true),
  ('Kiddylicious', 'https://kiddylicious.com', 'Toddler Snacks', 'Toddler snacks and treats', 'press@kiddylicious.com', '@kiddylicious', true),
  ('Organix', 'https://organix.com', 'Baby Food', 'Organic baby and toddler snacks', 'press@organix.com', '@organix_uk', true),
  ('Pampers', 'https://pampers.co.uk', 'Nappies', 'Nappies and baby wipes', 'pampersuk.im@pg.com', '@pampersuk', true),
  ('WaterWipes', 'https://waterwipes.com', 'Baby Wipes', 'Pure baby wipes', 'pr@waterwipes.com', '@waterwipesuk', true),
  ('Childs Farm', 'https://childsfarm.com', 'Baby Skincare', 'Suitable-for-newborns skincare', 'press@childsfarm.com', '@childsfarm', true),
  ('Kit & Kin', 'https://kitandkin.com', 'Eco Baby', 'Eco nappies and skincare by Emma Bunton', 'hello@kitandkin.com', '@kitandkin', true),
  ('Bambino Mio', 'https://bambinomio.com', 'Reusable Nappies', 'Reusable nappies and swim wear', 'press@bambinomio.com', '@bambino_mio', true),
  ('Sudocrem', 'https://sudocrem.co.uk', 'Baby Skincare', 'Nappy rash cream and skincare', 'sudocrem@teneo.com', '@sudocremuk', true),
  ('Lansinoh', 'https://lansinoh.co.uk', 'Breastfeeding', 'Breastfeeding products and supplies', 'press@lansinoh.co.uk', '@lansinohuk', true),
  ('Medela', 'https://medela.co.uk', 'Breastfeeding', 'Breast pumps and feeding', 'medela.uk@medela.com', '@medelauk', true),
  ('Elvie', 'https://elvie.com', 'Women''s Health', 'Smart breast pumps and pelvic floor', 'press@elvie.com', '@elvie', true),
  ('Mama Mio', 'https://mioskincare.co.uk', 'Maternity Skincare', 'Pregnancy and post-natal skincare', 'press@mioskincare.co.uk', '@mamamio', true),
  ('Bio-Oil', 'https://bio-oil.com', 'Skincare', 'Specialist skincare oil', 'bio-oil@frankpr.it', '@biooiluk', true),
  ('Weleda', 'https://weleda.co.uk', 'Natural Skincare', 'Natural baby and mum skincare', 'press@weleda.co.uk', '@weledauk', true),
  ('Burt''s Bees Baby', 'https://burtsbees.co.uk', 'Natural Baby', 'Natural baby skincare', 'press@burtsbees.co.uk', '@burtsbees', true),
  ('Mothercare', 'https://mothercare.com', 'Baby & Kids', 'Maternity, baby and child essentials', 'press@mothercare.com', '@mothercareuk', true),
  ('Boden Mini', 'https://boden.co.uk', 'Kids Clothing', 'British kidswear and family clothing', 'press@boden.co.uk', '@bodenclothing', true),
  ('Next', 'https://next.co.uk', 'Family Clothing', 'High-street family fashion and home', 'press.office@next.co.uk', '@nextofficial', true),
  ('M&S Kids', 'https://marksandspencer.com', 'Family Retail', 'Kidswear, food and home', 'press.office@marks-and-spencer.com', '@marksandspencer', true),
  ('John Lewis', 'https://johnlewis.com', 'Department Store', 'Baby, kids, home and lifestyle', 'press_office@johnlewis.co.uk', '@johnlewisandpartners', true),
  ('Sainsbury''s Tu', 'https://tuclothing.sainsburys.co.uk', 'Family Clothing', 'Affordable family fashion', 'press_office@sainsburys.co.uk', '@tuclothing', true),
  ('Petit Bateau UK', 'https://petit-bateau.co.uk', 'Kids Clothing', 'French heritage childrenswear', 'press@petit-bateau.com', '@petitbateau', true),
  ('Joules', 'https://joules.com', 'Family Clothing', 'British country lifestyle clothing', 'press@joules.com', '@joulesclothing', true),
  ('White Stuff', 'https://whitestuff.com', 'Family Clothing', 'British lifestyle brand', 'press@whitestuff.com', '@whitestuffuk', true),
  ('Dunelm', 'https://dunelm.com', 'Home', 'Home essentials and nursery decor', 'press@dunelm.com', '@dunelmuk', true),
  ('La Redoute', 'https://laredoute.co.uk', 'Home & Family', 'French lifestyle, kids and home', 'press@laredoute.co.uk', '@laredouteuk', true),
  ('Cotton Traders', 'https://cottontraders.com', 'Family Clothing', 'Comfortable everyday clothing', 'press@cottontraders.com', '@cottontradersofficial', true),
  ('IKEA UK', 'https://ikea.com/gb', 'Home', 'Home and nursery furniture', 'press.uk@ikea.com', '@ikeauk', true),
  ('Wickes', 'https://wickes.co.uk', 'Home', 'Home improvement and nursery setup', 'press@wickes.co.uk', '@wickes', true),
  ('Gousto', 'https://gousto.co.uk', 'Meal Kits', 'Recipe boxes for busy families', 'press@gousto.co.uk', '@goustocooking', true),
  ('HelloFresh UK', 'https://hellofresh.co.uk', 'Meal Kits', 'Weekly meal-kit delivery', 'press@hellofresh.co.uk', '@hellofreshuk', true),
  ('Mindful Chef', 'https://mindfulchef.com', 'Meal Kits', 'Healthy recipe boxes', 'press@mindfulchef.com', '@mindfulchefuk', true),
  ('Innocent Drinks', 'https://innocentdrinks.co.uk', 'Drinks', 'Smoothies, juices and family snacks', 'press@innocentdrinks.com', '@innocent', true),
  ('Yoto', 'https://yotoplay.com', 'Kids Tech', 'Screen-free audio player for kids', 'press@yotoplay.com', '@yotoplay', true),
  ('Tonies', 'https://tonies.com', 'Kids Tech', 'Audio play for children', 'press@tonies.com', '@tonies_uk', true),
  ('Smyths Toys', 'https://smythstoys.com', 'Toys', 'Toys, games and outdoor', 'press@smythstoys.com', '@smythstoys', true),
  ('Early Learning Centre', 'https://elc.co.uk', 'Toys', 'Educational toys for early years', 'press@elc.co.uk', '@earlylearningcentre', true),
  ('Lego UK', 'https://lego.com/en-gb', 'Toys', 'Building blocks and creative play', 'press@lego.com', '@lego', true);
