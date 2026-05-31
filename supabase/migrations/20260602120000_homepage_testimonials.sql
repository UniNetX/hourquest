-- Homepage testimonial curation for admin

alter table public.student_stories
  add column if not exists show_on_homepage boolean not null default false,
  add column if not exists homepage_sort_order int not null default 0,
  add column if not exists display_name text,
  add column if not exists display_school text;

create index if not exists student_stories_homepage_idx
  on public.student_stories (homepage_sort_order asc)
  where approved = true and show_on_homepage = true;

create or replace function public.admin_update_story(
  p_story_id uuid,
  p_comment text,
  p_rating smallint,
  p_show_on_homepage boolean,
  p_homepage_sort_order int,
  p_display_name text,
  p_display_school text
)
returns public.student_stories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.student_stories;
begin
  if not public.is_challenges_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.student_stories
  set
    comment = p_comment,
    rating = p_rating,
    show_on_homepage = p_show_on_homepage,
    homepage_sort_order = p_homepage_sort_order,
    display_name = nullif(trim(p_display_name), ''),
    display_school = nullif(trim(p_display_school), '')
  where id = p_story_id
  returning * into v_row;

  if not found then
    raise exception 'Story not found';
  end if;

  return v_row;
end;
$$;

grant execute on function public.admin_update_story(
  uuid, text, smallint, boolean, int, text, text
) to authenticated;
