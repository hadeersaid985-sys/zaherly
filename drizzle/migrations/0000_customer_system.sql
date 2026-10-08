ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON public.leads(user_id);
CREATE POLICY "Users read own leads" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.customer_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature)
);
GRANT SELECT ON public.customer_features TO authenticated;
GRANT ALL ON public.customer_features TO service_role;
ALTER TABLE public.customer_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own features" ON public.customer_features FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  topic text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own content" ON public.content_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own content" ON public.content_items FOR DELETE TO authenticated USING (auth.uid() = user_id);