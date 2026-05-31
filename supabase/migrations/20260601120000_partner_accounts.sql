-- Partner organizations, partnership track challenges, partner RPCs

-- Partner organizations
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

-- Profiles: partner link
alter table public.profiles
  add column if not exists partner_org_id uuid references public.partner_organizations(id) on delete set null;

alter table public.profiles
  drop constraint if exists profiles_user_type_check;

alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('hs_student', 'partner'));

-- Challenges: partnership track + org ownership
alter table public.challenges
  add column if not exists partner_org_id uuid references public.partner_organizations(id) on delete cascade;

alter table public.challenges
  drop constraint if exists challenges_track_check;

alter table public.challenges
  add constraint challenges_track_check
  check (track in ('environmental', 'medical', 'partnership'));

alter table public.challenges
  drop constraint if exists challenges_category_check;

alter table public.challenges
  add constraint challenges_category_check
  check (
    category in (
      'cleanup', 'plant', 'waste', 'water', 'social', 'community',
      'health_education', 'wellness', 'first_aid', 'mental_health',
      'nutrition', 'community_health',
      'community_service', 'education', 'fundraising', 'outreach', 'wellness_partner', 'other'
    )
  );

alter table public.challenges
  drop constraint if exists challenges_partner_org_track_check;

alter table public.challenges
  add constraint challenges_partner_org_track_check
  check (
    (track = 'partnership' and partner_org_id is not null)
    or (track in ('environmental', 'medical') and partner_org_id is null)
  );

create index if not exists challenges_partner_org_idx
  on public.challenges (partner_org_id)
  where partner_org_id is not null;

-- Partner helpers
create or replace function public.get_my_partner_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select po.id
  from public.partner_organizations po
  where po.owner_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_approved_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.partner_organizations po
    where po.owner_user_id = auth.uid()
      and po.status = 'approved'
  );
$$;

-- Auth signup: students vs partners
create or replace function public.handle_new_challenges_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_type text;
  v_org_id uuid;
  v_org_name text;
begin
  v_account_type := coalesce(new.raw_user_meta_data->>'account_type', 'student');

  if v_account_type = 'partner' then
    v_org_name := trim(coalesce(new.raw_user_meta_data->>'organization_name', ''));
    if v_org_name = '' then
      v_org_name := coalesce(new.raw_user_meta_data->>'full_name', 'Partner organization');
    end if;

    insert into public.profiles (id, full_name, school_name, user_type)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      null,
      'partner'
    )
    on conflict (id) do update set
      full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
      user_type = 'partner',
      updated_at = now();

    insert into public.partner_organizations (
      name,
      description,
      website,
      status,
      owner_user_id
    ) values (
      v_org_name,
      nullif(trim(coalesce(new.raw_user_meta_data->>'organization_description', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data->>'organization_website', '')), ''),
      'pending',
      new.id
    )
    returning id into v_org_id;

    update public.profiles
    set partner_org_id = v_org_id, updated_at = now()
    where id = new.id;
  else
    insert into public.profiles (id, full_name, school_name, user_type)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'school_name', ''),
      'hs_student'
    )
    on conflict (id) do update set
      full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
      school_name = coalesce(excluded.school_name, public.profiles.school_name),
      updated_at = now();
  end if;

  return new;
end;
$$;

-- RLS: partner_organizations
alter table public.partner_organizations enable row level security;

drop policy if exists "Owner read own partner org" on public.partner_organizations;
create policy "Owner read own partner org"
  on public.partner_organizations for select
  using (owner_user_id = auth.uid() or public.is_challenges_admin());

drop policy if exists "Public read approved partner orgs" on public.partner_organizations;
create policy "Public read approved partner orgs"
  on public.partner_organizations for select
  using (status = 'approved');

-- RLS: challenges — partners read own org challenges (incl. inactive)
drop policy if exists "Partner read own org challenges" on public.challenges;
create policy "Partner read own org challenges"
  on public.challenges for select
  using (
    partner_org_id is not null
    and partner_org_id = public.get_my_partner_org_id()
    and public.is_approved_partner()
  );

-- Admin upsert: allow partner_org_id for partnership track
create or replace function public.admin_upsert_challenge(p_payload jsonb)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_row public.challenges;
  v_track text;
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_id := nullif(p_payload ->> 'id', '')::uuid;
  v_track := coalesce(p_payload ->> 'track', 'environmental');

  if v_id is null then
    insert into public.challenges (
      title, description, proof_instructions, track, category, difficulty,
      hours_earned, points, active, sort_order, partner_org_id
    ) values (
      p_payload ->> 'title',
      p_payload ->> 'description',
      nullif(p_payload ->> 'proof_instructions', ''),
      v_track,
      p_payload ->> 'category',
      p_payload ->> 'difficulty',
      (p_payload ->> 'hours_earned')::numeric,
      (p_payload ->> 'points')::integer,
      coalesce((p_payload ->> 'active')::boolean, true),
      coalesce((p_payload ->> 'sort_order')::integer, 0),
      nullif(p_payload ->> 'partner_org_id', '')::uuid
    ) returning * into v_row;
  else
    update public.challenges set
      title = coalesce(p_payload ->> 'title', title),
      description = coalesce(p_payload ->> 'description', description),
      proof_instructions = case when p_payload ? 'proof_instructions'
        then nullif(p_payload ->> 'proof_instructions', '') else proof_instructions end,
      track = coalesce(p_payload ->> 'track', track),
      category = coalesce(p_payload ->> 'category', category),
      difficulty = coalesce(p_payload ->> 'difficulty', difficulty),
      hours_earned = coalesce((p_payload ->> 'hours_earned')::numeric, hours_earned),
      points = coalesce((p_payload ->> 'points')::integer, points),
      active = coalesce((p_payload ->> 'active')::boolean, active),
      sort_order = coalesce((p_payload ->> 'sort_order')::integer, sort_order),
      updated_at = now()
    where id = v_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

-- Partner challenge RPCs
create or replace function public.partner_upsert_challenge(p_payload jsonb)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_org_id uuid;
  v_row public.challenges;
begin
  if not public.is_approved_partner() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_org_id := public.get_my_partner_org_id();
  if v_org_id is null then
    raise exception 'No partner organization';
  end if;

  v_id := nullif(p_payload ->> 'id', '')::uuid;

  if v_id is null then
    insert into public.challenges (
      title, description, proof_instructions, track, category, difficulty,
      hours_earned, points, active, sort_order, partner_org_id
    ) values (
      p_payload ->> 'title',
      p_payload ->> 'description',
      nullif(p_payload ->> 'proof_instructions', ''),
      'partnership',
      p_payload ->> 'category',
      p_payload ->> 'difficulty',
      (p_payload ->> 'hours_earned')::numeric,
      (p_payload ->> 'points')::integer,
      coalesce((p_payload ->> 'active')::boolean, true),
      coalesce((p_payload ->> 'sort_order')::integer, 0),
      v_org_id
    ) returning * into v_row;
  else
    update public.challenges set
      title = coalesce(p_payload ->> 'title', title),
      description = coalesce(p_payload ->> 'description', description),
      proof_instructions = case when p_payload ? 'proof_instructions'
        then nullif(p_payload ->> 'proof_instructions', '') else proof_instructions end,
      category = coalesce(p_payload ->> 'category', category),
      difficulty = coalesce(p_payload ->> 'difficulty', difficulty),
      hours_earned = coalesce((p_payload ->> 'hours_earned')::numeric, hours_earned),
      points = coalesce((p_payload ->> 'points')::integer, points),
      active = coalesce((p_payload ->> 'active')::boolean, active),
      sort_order = coalesce((p_payload ->> 'sort_order')::integer, sort_order),
      updated_at = now()
    where id = v_id
      and partner_org_id = v_org_id
      and track = 'partnership'
    returning * into v_row;

    if v_row.id is null then
      raise exception 'Challenge not found or not owned by your organization';
    end if;
  end if;

  return v_row;
end;
$$;

create or replace function public.partner_delete_challenge(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_org_id uuid;
begin
  if not public.is_approved_partner() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_org_id := public.get_my_partner_org_id();

  select total_submissions into v_total
  from public.challenges
  where id = p_challenge_id
    and partner_org_id = v_org_id
    and track = 'partnership';

  if not found then
    raise exception 'Challenge not found';
  end if;

  if v_total > 0 then
    raise exception 'Cannot delete challenge with submissions';
  end if;

  delete from public.challenges
  where id = p_challenge_id
    and partner_org_id = v_org_id;
end;
$$;

create or replace function public.partner_reorder_challenges(
  p_category text,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
  v_org_id uuid;
begin
  if not public.is_approved_partner() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_org_id := public.get_my_partner_org_id();

  for i in 1..array_length(p_ordered_ids, 1) loop
    update public.challenges
    set sort_order = i - 1, updated_at = now()
    where id = p_ordered_ids[i]
      and track = 'partnership'
      and category = p_category
      and partner_org_id = v_org_id;
  end loop;
end;
$$;

-- Admin: review partner applications
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

drop trigger if exists partner_organizations_set_updated_at on public.partner_organizations;
create trigger partner_organizations_set_updated_at
  before update on public.partner_organizations
  for each row execute function public.set_updated_at();

grant execute on function public.get_my_partner_org_id() to authenticated;
grant execute on function public.is_approved_partner() to authenticated;
grant execute on function public.partner_upsert_challenge(jsonb) to authenticated;
grant execute on function public.partner_delete_challenge(uuid) to authenticated;
grant execute on function public.partner_reorder_challenges(text, uuid[]) to authenticated;
grant execute on function public.admin_review_partner_org(uuid, text, text) to authenticated;
grant execute on function public.admin_list_partner_orgs(text) to authenticated;
