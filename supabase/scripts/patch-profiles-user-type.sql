-- Run this if partner migration failed on profiles_user_type_check (error 23514).
-- Safe to re-run: drops constraint, normalizes data, re-adds constraint.

alter table public.profiles
  drop constraint if exists profiles_user_type_check;

-- Inspect legacy values (optional)
-- select user_type, count(*) from public.profiles group by 1 order by 2 desc;

update public.profiles p
set user_type = 'partner', updated_at = now()
from auth.users u
where p.id = u.id
  and coalesce(u.raw_user_meta_data->>'account_type', '') = 'partner'
  and p.user_type is distinct from 'partner';

update public.profiles
set user_type = 'hs_student', updated_at = now()
where user_type is null
   or user_type in ('student', '')
   or user_type not in ('hs_student', 'partner');

alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('hs_student', 'partner'));

-- Verify
select user_type, count(*) from public.profiles group by 1 order by 2 desc;
