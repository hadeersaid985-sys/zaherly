ALTER TABLE public.leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;