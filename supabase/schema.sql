create table if not exists public.portal_customer_profiles (
  id text primary key,
  status text not null,
  loan_type text not null,
  application_number text not null,
  loan_number text not null,
  apply_date text not null,
  id_number text not null,
  name text not null,
  mobile text not null,
  partaker_type text not null,
  blacklist_flag boolean not null default false,
  source_system text not null,
  age integer not null,
  job text not null,
  company_unit text not null,
  apply_info jsonb not null,
  partakers jsonb not null default '[]'::jsonb,
  credit_ref jsonb not null,
  documents jsonb not null default '[]'::jsonb,
  mortgage jsonb not null,
  dsr jsonb not null,
  loan_history jsonb not null default '[]'::jsonb,
  partaking_history jsonb not null default '[]'::jsonb,
  approval_info jsonb not null default '[]'::jsonb,
  repay_history jsonb not null default '[]'::jsonb,
  repay_condition jsonb not null,
  crm jsonb not null default '[]'::jsonb,
  oca_write_off jsonb not null
);

create index if not exists portal_customer_profiles_name_idx
  on public.portal_customer_profiles using gin (to_tsvector('simple', name));

create index if not exists portal_customer_profiles_id_number_idx
  on public.portal_customer_profiles (id_number);

create index if not exists portal_customer_profiles_application_number_idx
  on public.portal_customer_profiles (application_number);

create index if not exists portal_customer_profiles_loan_number_idx
  on public.portal_customer_profiles (loan_number);

create index if not exists portal_customer_profiles_company_unit_idx
  on public.portal_customer_profiles (company_unit);

create index if not exists portal_customer_profiles_blacklist_idx
  on public.portal_customer_profiles (blacklist_flag);
