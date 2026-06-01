
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Leads / Reports
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  website_url text not null,
  business_type text not null,
  name text not null,
  email text not null,
  phone text,
  ai_visibility_score integer,
  geo_score integer,
  seo_score integer,
  content_score integer,
  authority_score integer,
  report jsonb,
  crawl_data jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);

grant select, insert on public.leads to anon;
grant select, insert, update on public.leads to authenticated;
grant all on public.leads to service_role;

alter table public.leads enable row level security;

-- Anyone (anon) can create a lead via the form
create policy "Anyone can insert leads" on public.leads
  for insert to anon, authenticated with check (true);

-- Anyone can read a lead by id (UUID is unguessable; this lets visitors see their own report link)
create policy "Anyone can read leads" on public.leads
  for select to anon, authenticated using (true);

-- Only admins can update
create policy "Admins can update leads" on public.leads
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
