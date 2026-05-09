
ALTER TABLE public.creator_profile ADD COLUMN IF NOT EXISTS tax_rate numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  contact_name text,
  email text,
  status text NOT NULL DEFAULT 'lead',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own clients" ON public.clients FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.tax_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tax_reminders" ON public.tax_reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tax_reminders_updated_at BEFORE UPDATE ON public.tax_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
