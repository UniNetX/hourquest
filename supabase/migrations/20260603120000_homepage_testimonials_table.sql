-- Curated homepage testimonials (max 3), separate from student-submitted stories

create table if not exists public.homepage_testimonials (
  id uuid primary key default gen_random_uuid(),
  rating smallint not null default 5 check (rating between 1 and 5),
  comment text not null,
  display_name text not null,
  display_school text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_testimonials enable row level security;

drop policy if exists "Public read homepage testimonials" on public.homepage_testimonials;
create policy "Public read homepage testimonials"
  on public.homepage_testimonials for select
  using (true);

drop policy if exists "Admin manage homepage testimonials" on public.homepage_testimonials;
create policy "Admin manage homepage testimonials"
  on public.homepage_testimonials for all
  using (public.is_challenges_admin())
  with check (public.is_challenges_admin());

insert into public.homepage_testimonials (rating, comment, display_name, display_school, sort_order)
select * from (values
  (
    5,
    'HourQuest made it easy to log real volunteer work. My counselor loved the verified hours on my application.',
    'Maya R.',
    'Lincoln High School',
    0
  ),
  (
    5,
    'The medical challenges pushed me to learn first aid and help at community health events. Proof upload was simple.',
    'Jordan K.',
    'Westview Academy',
    1
  ),
  (
    5,
    'I completed environmental challenges with my club and earned certificates I could share with colleges.',
    'Priya S.',
    'Oak Ridge High',
    2
  )
) as v(rating, comment, display_name, display_school, sort_order)
where not exists (select 1 from public.homepage_testimonials limit 1);

create or replace function public.admin_upsert_homepage_testimonial(p_payload jsonb)
returns public.homepage_testimonials
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_count int;
  v_row public.homepage_testimonials;
begin
  if not public.is_challenges_admin() then
    raise exception 'Unauthorized';
  end if;

  v_id := nullif(p_payload ->> 'id', '')::uuid;

  if v_id is null then
    select count(*)::int into v_count from public.homepage_testimonials;
    if v_count >= 3 then
      raise exception 'Homepage allows at most 3 testimonials';
    end if;

    insert into public.homepage_testimonials (
      rating, comment, display_name, display_school, sort_order
    ) values (
      coalesce((p_payload ->> 'rating')::smallint, 5),
      p_payload ->> 'comment',
      p_payload ->> 'display_name',
      coalesce(p_payload ->> 'display_school', ''),
      coalesce((p_payload ->> 'sort_order')::int, v_count)
    ) returning * into v_row;
  else
    update public.homepage_testimonials set
      rating = coalesce((p_payload ->> 'rating')::smallint, rating),
      comment = coalesce(p_payload ->> 'comment', comment),
      display_name = coalesce(p_payload ->> 'display_name', display_name),
      display_school = coalesce(p_payload ->> 'display_school', display_school),
      sort_order = coalesce((p_payload ->> 'sort_order')::int, sort_order),
      updated_at = now()
    where id = v_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

create or replace function public.admin_delete_homepage_testimonial(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_challenges_admin() then
    raise exception 'Unauthorized';
  end if;
  delete from public.homepage_testimonials where id = p_id;
end;
$$;

grant execute on function public.admin_upsert_homepage_testimonial(jsonb) to authenticated;
grant execute on function public.admin_delete_homepage_testimonial(uuid) to authenticated;
