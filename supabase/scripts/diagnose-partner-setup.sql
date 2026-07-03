-- Partner setup diagnostics — run in Supabase SQL Editor
-- Replace <partner-email> with the affected user's email when checking a specific account.

-- 1. Partner infrastructure
select to_regclass('public.partner_organizations') as partner_organizations_table;
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'partner_org_id';

-- 2. Partner signup trigger (should mention account_type = 'partner')
select pg_get_functiondef('public.handle_new_challenges_user()'::regprocedure);

-- 3. Admin RPCs
select proname
from pg_proc
where proname in ('admin_list_partner_orgs', 'admin_review_partner_org');

-- 4. challenge_admins allowlist (must match ADMIN_EMAILS in .env)
select * from public.challenge_admins order by email;

-- 5. Specific user state (optional)
select
  u.id,
  u.email,
  u.raw_user_meta_data->>'account_type' as account_type,
  u.raw_user_meta_data->>'organization_name' as organization_name,
  p.user_type,
  p.partner_org_id
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('<partner-email>');

-- 6. Org row for that user (optional)
select po.*
from public.partner_organizations po
where po.owner_user_id = (
  select id from auth.users where lower(email) = lower('<partner-email>')
);

-- 7. All users who may need backfill (partner metadata but no linked org)
select
  u.id,
  u.email,
  u.raw_user_meta_data->>'account_type' as account_type,
  p.user_type,
  p.partner_org_id
from auth.users u
left join public.profiles p on p.id = u.id
where coalesce(u.raw_user_meta_data->>'account_type', '') = 'partner'
  and (p.partner_org_id is null or p.user_type is distinct from 'partner');
