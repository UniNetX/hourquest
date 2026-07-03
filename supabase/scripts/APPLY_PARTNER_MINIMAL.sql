-- =============================================================================
-- PARTNER SETUP — STEP 1 (run this file alone first)
-- Project MUST be: zfexfatuhcqmwozouwtk
-- Dashboard: https://supabase.com/dashboard/project/zfexfatuhcqmwozouwtk/sql/new
--
-- After Run, the last row must show partner_table = partner_organizations
-- Then: npm run verify:supabase
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.partner_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  website text,
  logo_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_organizations_owner_unique unique (owner_user_id)
);

create index if not exists partner_organizations_status_idx
  on public.partner_organizations (status);

alter table public.profiles
  add column if not exists partner_org_id uuid
  references public.partner_organizations(id) on delete set null;

alter table public.profiles
  drop constraint if exists profiles_user_type_check;

update public.profiles
set user_type = 'hs_student', updated_at = now()
where user_type is null
   or user_type in ('student', '')
   or user_type not in ('hs_student', 'partner');

alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('hs_student', 'partner'));

alter table public.partner_organizations enable row level security;

drop policy if exists "Owner read own partner org" on public.partner_organizations;
create policy "Owner read own partner org"
  on public.partner_organizations for select
  using (owner_user_id = auth.uid() or public.is_challenges_admin());

drop policy if exists "Public read approved partner orgs" on public.partner_organizations;
create policy "Public read approved partner orgs"
  on public.partner_organizations for select
  using (status = 'approved');

create or replace function public.admin_list_partner_orgs(p_status text default null)
returns setof public.partner_organizations
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_status is null then
    return query
    select * from public.partner_organizations
    order by created_at desc;
  else
    return query
    select * from public.partner_organizations
    where status = p_status
    order by created_at desc;
  end if;
end;
$$;

create or replace function public.admin_review_partner_org(
  p_org_id uuid,
  p_action text,
  p_rejection_reason text default null
)
returns public.partner_organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.partner_organizations;
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_action = 'approve' then
    update public.partner_organizations
    set status = 'approved',
        rejection_reason = null,
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        updated_at = now()
    where id = p_org_id and status = 'pending'
    returning * into v_row;
  elsif p_action = 'reject' then
    if p_rejection_reason is null or trim(p_rejection_reason) = '' then
      raise exception 'Rejection reason required';
    end if;
    update public.partner_organizations
    set status = 'rejected',
        rejection_reason = p_rejection_reason,
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        updated_at = now()
    where id = p_org_id and status = 'pending'
    returning * into v_row;
  else
    raise exception 'Invalid action';
  end if;

  if v_row.id is null then
    raise exception 'Organization not found or already reviewed';
  end if;

  return v_row;
end;
$$;

grant execute on function public.admin_list_partner_orgs(text) to authenticated;
grant execute on function public.admin_review_partner_org(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';

select to_regclass('public.partner_organizations') as partner_table;
