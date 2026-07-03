-- Run AFTER supabase/migrations/20260601120000_partner_accounts.sql
-- Creates pending partner_organizations rows for users who signed up as partners
-- before the partner migration was applied.

do $$
declare
  r record;
  v_org_id uuid;
  v_org_name text;
begin
  for r in
    select u.id, u.raw_user_meta_data
    from auth.users u
    left join public.profiles p on p.id = u.id
    where coalesce(u.raw_user_meta_data->>'account_type', '') = 'partner'
      and (
        p.id is null
        or p.partner_org_id is null
        or p.user_type is distinct from 'partner'
      )
  loop
    v_org_name := trim(coalesce(r.raw_user_meta_data->>'organization_name', ''));
    if v_org_name = '' then
      v_org_name := coalesce(r.raw_user_meta_data->>'full_name', 'Partner organization');
    end if;

    insert into public.profiles (id, full_name, school_name, user_type)
    values (
      r.id,
      coalesce(r.raw_user_meta_data->>'full_name', ''),
      null,
      'partner'
    )
    on conflict (id) do update set
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
      nullif(trim(coalesce(r.raw_user_meta_data->>'organization_description', '')), ''),
      nullif(trim(coalesce(r.raw_user_meta_data->>'organization_website', '')), ''),
      'pending',
      r.id
    )
    on conflict (owner_user_id) do nothing
    returning id into v_org_id;

    if v_org_id is null then
      select id into v_org_id
      from public.partner_organizations
      where owner_user_id = r.id;
    end if;

    update public.profiles
    set user_type = 'partner',
        partner_org_id = v_org_id,
        updated_at = now()
    where id = r.id;
  end loop;
end $$;

-- Verify backfill
select
  u.email,
  p.user_type,
  p.partner_org_id,
  po.name,
  po.status
from auth.users u
join public.profiles p on p.id = u.id
left join public.partner_organizations po on po.id = p.partner_org_id
where coalesce(u.raw_user_meta_data->>'account_type', '') = 'partner'
order by u.created_at desc;
