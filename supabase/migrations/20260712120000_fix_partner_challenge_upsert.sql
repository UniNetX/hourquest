-- Fix partner challenge creation: harden org lookup, repair profile links,
-- re-deploy RPCs, and sync partner_org_id when admin changes track.

-- Backfill broken profile ↔ org links for approved partners
update public.profiles p
set partner_org_id = po.id,
    updated_at = now()
from public.partner_organizations po
where po.owner_user_id = p.id
  and po.status = 'approved'
  and p.user_type = 'partner'
  and (p.partner_org_id is null or p.partner_org_id <> po.id);

create or replace function public.get_my_partner_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select po.id
      from public.partner_organizations po
      where po.owner_user_id = auth.uid()
        and po.status = 'approved'
      limit 1
    ),
    (
      select p.partner_org_id
      from public.profiles p
      join public.partner_organizations po on po.id = p.partner_org_id
      where p.id = auth.uid()
        and po.status = 'approved'
      limit 1
    )
  );
$$;

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
    raise exception 'No partner organization linked to your account';
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
