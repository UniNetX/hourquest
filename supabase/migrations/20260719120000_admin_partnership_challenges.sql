-- Allow admins to manage partnership challenges per org and validate approved partners.

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
  v_partner_org_id uuid;
begin
  if not public.is_challenges_admin() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_id := nullif(p_payload ->> 'id', '')::uuid;
  v_track := coalesce(p_payload ->> 'track', 'environmental');

  if v_track = 'partnership' then
    v_partner_org_id := nullif(p_payload ->> 'partner_org_id', '')::uuid;
    if v_partner_org_id is null then
      raise exception 'partnership track requires partner_org_id';
    end if;
    if not exists (
      select 1
      from public.partner_organizations po
      where po.id = v_partner_org_id
        and po.status = 'approved'
    ) then
      raise exception 'Partner organization must be approved';
    end if;
  else
    v_partner_org_id := null;
  end if;

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
      v_partner_org_id
    ) returning * into v_row;
  else
    v_track := coalesce(p_payload ->> 'track', (select track from public.challenges where id = v_id));

    if v_track = 'partnership' then
      v_partner_org_id := coalesce(
        nullif(p_payload ->> 'partner_org_id', '')::uuid,
        (select partner_org_id from public.challenges where id = v_id)
      );
      if v_partner_org_id is null then
        raise exception 'partnership track requires partner_org_id';
      end if;
      if not exists (
        select 1
        from public.partner_organizations po
        where po.id = v_partner_org_id
          and po.status = 'approved'
      ) then
        raise exception 'Partner organization must be approved';
      end if;
    else
      v_partner_org_id := null;
    end if;

    update public.challenges set
      title = coalesce(p_payload ->> 'title', title),
      description = coalesce(p_payload ->> 'description', description),
      proof_instructions = case when p_payload ? 'proof_instructions'
        then nullif(p_payload ->> 'proof_instructions', '') else proof_instructions end,
      track = v_track,
      category = coalesce(p_payload ->> 'category', category),
      difficulty = coalesce(p_payload ->> 'difficulty', difficulty),
      hours_earned = coalesce((p_payload ->> 'hours_earned')::numeric, hours_earned),
      points = coalesce((p_payload ->> 'points')::integer, points),
      active = coalesce((p_payload ->> 'active')::boolean, active),
      sort_order = coalesce((p_payload ->> 'sort_order')::integer, sort_order),
      partner_org_id = v_partner_org_id,
      updated_at = now()
    where id = v_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

drop function if exists public.admin_reorder_challenges(text, text, uuid[]);

create or replace function public.admin_reorder_challenges(
  p_track text,
  p_category text,
  p_ordered_ids uuid[],
  p_partner_org_id uuid default null
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

  if p_track = 'partnership' and p_partner_org_id is null then
    raise exception 'partnership reorder requires partner_org_id';
  end if;

  for i in 1..array_length(p_ordered_ids, 1) loop
    update public.challenges
    set sort_order = i - 1, updated_at = now()
    where id = p_ordered_ids[i]
      and track = p_track
      and category = p_category
      and (
        p_track <> 'partnership'
        or partner_org_id = p_partner_org_id
      );
  end loop;
end;
$$;

grant execute on function public.admin_reorder_challenges(text, text, uuid[], uuid) to authenticated;
