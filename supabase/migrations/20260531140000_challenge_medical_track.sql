-- Environmental + medical challenge tracks

alter table public.challenges
  add column if not exists track text not null default 'environmental';

update public.challenges set track = 'environmental' where track is null;

alter table public.challenges
  drop constraint if exists challenges_track_check;

alter table public.challenges
  add constraint challenges_track_check
  check (track in ('environmental', 'medical'));

alter table public.challenges
  drop constraint if exists challenges_category_check;

alter table public.challenges
  add constraint challenges_category_check
  check (
    category in (
      'cleanup', 'plant', 'waste', 'water', 'social', 'community',
      'health_education', 'wellness', 'first_aid', 'mental_health',
      'nutrition', 'community_health'
    )
  );

drop index if exists public.challenges_category_sort_idx;

create index if not exists challenges_track_category_sort_idx
  on public.challenges (track, category, sort_order);

create or replace function public.admin_upsert_challenge(p_payload jsonb)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_row public.challenges;
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_id := nullif(p_payload ->> 'id', '')::uuid;

  if v_id is null then
    insert into public.challenges (
      title, description, proof_instructions, track, category, difficulty,
      hours_earned, points, active, sort_order
    ) values (
      p_payload ->> 'title',
      p_payload ->> 'description',
      nullif(p_payload ->> 'proof_instructions', ''),
      coalesce(p_payload ->> 'track', 'environmental'),
      p_payload ->> 'category',
      p_payload ->> 'difficulty',
      (p_payload ->> 'hours_earned')::numeric,
      (p_payload ->> 'points')::integer,
      coalesce((p_payload ->> 'active')::boolean, true),
      coalesce((p_payload ->> 'sort_order')::integer, 0)
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

drop function if exists public.admin_reorder_challenges(text, uuid[]);

create or replace function public.admin_reorder_challenges(
  p_track text,
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
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  for i in 1..array_length(p_ordered_ids, 1) loop
    update public.challenges
    set sort_order = i - 1, updated_at = now()
    where id = p_ordered_ids[i]
      and track = p_track
      and category = p_category;
  end loop;
end;
$$;

grant execute on function public.admin_reorder_challenges(text, text, uuid[]) to authenticated;
