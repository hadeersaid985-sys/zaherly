-- Create enum for lead stages
CREATE TYPE public.lead_stage AS ENUM ('new', 'contacted', 'interested', 'customer', 'lost');

-- Add stage and notes columns to leads
ALTER TABLE public.leads
  ADD COLUMN stage public.lead_stage NOT NULL DEFAULT 'new',
  ADD COLUMN notes text;

CREATE INDEX leads_stage_idx ON public.leads(stage);
