-- Merge school name variants (case/whitespace) and expose a stable sort key.
create or replace view public.school_leaderboard as
select
  min(trim(p.school_name)) as school_name,
  count(distinct p.id) as student_count,
  coalesce(sum(p.total_verified_hours), 0) as total_hours
from public.profiles p
where p.school_name is not null and trim(p.school_name) <> ''
group by lower(trim(p.school_name))
having count(distinct p.id) >= 1;

grant select on public.school_leaderboard to anon, authenticated;
