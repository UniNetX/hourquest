-- Read-only deployment diagnostics for Terraserveweb / HourQuest Supabase.
-- Run in Supabase SQL Editor after migrations. No writes.

-- ---------------------------------------------------------------------------
-- 1. Core tables
-- ---------------------------------------------------------------------------
select 'table' as kind, relname as name,
  case when to_regclass('public.' || relname) is not null then 'OK' else 'MISSING' end as status
from (values
  ('profiles'),
  ('challenges'),
  ('challenge_submissions'),
  ('student_stories'),
  ('homepage_testimonials'),
  ('partner_organizations'),
  ('challenge_admins'),
  ('badges'),
  ('certificates')
) as t(relname)
order by relname;

-- ---------------------------------------------------------------------------
-- 2. Key columns
-- ---------------------------------------------------------------------------
select 'column' as kind, 'profiles.partner_org_id' as name,
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'partner_org_id'
  ) then 'OK' else 'MISSING' end as status
union all
select 'column', 'homepage_testimonials.avatar_url',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'homepage_testimonials' and column_name = 'avatar_url'
  ) then 'OK' else 'MISSING' end
union all
select 'column', 'challenges.track',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'challenges' and column_name = 'track'
  ) then 'OK' else 'MISSING' end;

-- ---------------------------------------------------------------------------
-- 3. Key RPCs
-- ---------------------------------------------------------------------------
select 'rpc' as kind, proname as name, 'OK' as status
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in (
    'admin_upsert_challenge',
    'admin_review_submission',
    'admin_upsert_homepage_testimonial',
    'admin_delete_homepage_testimonial',
    'admin_moderate_story',
    'admin_list_partner_orgs',
    'admin_review_partner_org',
    'partner_upsert_challenge',
    'is_challenges_admin'
  )
order by proname;

-- ---------------------------------------------------------------------------
-- 4. Storage buckets
-- ---------------------------------------------------------------------------
select 'bucket' as kind, id as name, 'OK' as status
from storage.buckets
where id in ('challenge-proofs', 'homepage-testimonials', 'avatars')
order by id;

-- ---------------------------------------------------------------------------
-- 5. Auth signup trigger
-- ---------------------------------------------------------------------------
select 'trigger' as kind, tgname as name, 'OK' as status
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' and c.relname = 'users'
  and tgname = 'on_auth_user_created_challenges'
  and not t.tgisinternal;

-- ---------------------------------------------------------------------------
-- 6. Admin allowlist (must match ADMIN_EMAILS in .env)
-- ---------------------------------------------------------------------------
select 'data' as kind, 'challenge_admins' as name, count(*)::text || ' row(s)' as status
from public.challenge_admins;

-- ---------------------------------------------------------------------------
-- 7. Row counts / sanity
-- ---------------------------------------------------------------------------
select 'count' as kind, 'profiles' as name, count(*)::text as status from public.profiles
union all
select 'count', 'challenges (active)', count(*)::text from public.challenges where active = true
union all
select 'count', 'homepage_testimonials', count(*)::text from public.homepage_testimonials
union all
select 'count', 'partner_organizations', count(*)::text from public.partner_organizations
union all
select 'count', 'pending submissions', count(*)::text from public.challenge_submissions where status = 'pending';

-- ---------------------------------------------------------------------------
-- 8. Features without write paths (informational)
-- ---------------------------------------------------------------------------
select 'note' as kind, 'certificates' as name,
  case when (select count(*) from public.certificates) = 0
    then 'empty — no app write path yet'
    else (select count(*)::text from public.certificates)
  end as status;

select 'note' as kind, 'badges' as name,
  case when (select count(*) from public.badges) = 0
    then 'empty — no award logic yet'
    else (select count(*)::text from public.badges)
  end as status;
