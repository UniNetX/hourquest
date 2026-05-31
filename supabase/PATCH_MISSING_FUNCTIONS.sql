-- Run in Supabase SQL Editor if admin actions or submission reviews fail.
-- Safe to re-run (uses CREATE OR REPLACE / IF NOT EXISTS patterns).

create or replace function public.recalculate_profile_verified_hours(profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set
    total_verified_hours = coalesce((
      select sum(hours_awarded) from public.challenge_submissions
      where user_id = profile_id and status = 'approved'
    ), 0),
    updated_at = now()
  where id = profile_id;
end;
$$;

create or replace function public.recalculate_week_streak(p_user_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_streak integer := 0; v_week timestamptz; v_has boolean;
begin
  v_week := date_trunc('week', now() at time zone 'UTC');
  loop
    select exists (
      select 1 from public.challenge_submissions cs
      where cs.user_id = p_user_id and cs.status = 'approved'
        and date_trunc('week', cs.reviewed_at at time zone 'UTC') = v_week
    ) into v_has;
    exit when not v_has;
    v_streak := v_streak + 1;
    v_week := v_week - interval '1 week';
  end loop;
  update public.profiles set week_streak = v_streak, updated_at = now() where id = p_user_id;
  return v_streak;
end;
$$;

create or replace function public.sync_challenge_submission_side_effects()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.challenges set total_submissions = total_submissions + 1, updated_at = now()
    where id = new.challenge_id;
  end if;
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('approved','rejected') then
    perform public.recalculate_profile_verified_hours(new.user_id);
    perform public.recalculate_week_streak(new.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists challenge_submissions_side_effects on public.challenge_submissions;
create trigger challenge_submissions_side_effects
after insert or update on public.challenge_submissions
for each row execute function public.sync_challenge_submission_side_effects();

create or replace function public.admin_review_submission(p_submission_id uuid, p_action text, p_rejection_reason text default null)
returns public.challenge_submissions language plpgsql security definer set search_path = public as $$
declare v_sub public.challenge_submissions; v_challenge public.challenges;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  select * into v_sub from public.challenge_submissions where id = p_submission_id;
  if not found then raise exception 'Submission not found'; end if;
  if v_sub.status <> 'pending' then raise exception 'Already reviewed'; end if;
  select * into v_challenge from public.challenges where id = v_sub.challenge_id;
  if p_action = 'approve' then
    update public.challenge_submissions set status='approved', hours_awarded=v_challenge.hours_earned, points_awarded=v_challenge.points, reviewed_at=now(), reviewed_by=auth.uid(), rejection_reason=null where id=p_submission_id returning * into v_sub;
  elsif p_action = 'reject' then
    if p_rejection_reason is null or trim(p_rejection_reason)='' then raise exception 'Rejection reason required'; end if;
    update public.challenge_submissions set status='rejected', rejection_reason=p_rejection_reason, reviewed_at=now(), reviewed_by=auth.uid() where id=p_submission_id returning * into v_sub;
  else raise exception 'Invalid action'; end if;
  return v_sub;
end;
$$;

create or replace function public.admin_upsert_challenge(p_payload jsonb)
returns public.challenges language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_row public.challenges;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  v_id := nullif(p_payload->>'id','')::uuid;
  if v_id is null then
    insert into public.challenges (title,description,proof_instructions,category,difficulty,hours_earned,points,active,sort_order)
    values (p_payload->>'title', p_payload->>'description', nullif(p_payload->>'proof_instructions',''), p_payload->>'category', p_payload->>'difficulty', (p_payload->>'hours_earned')::numeric, (p_payload->>'points')::integer, coalesce((p_payload->>'active')::boolean,true), coalesce((p_payload->>'sort_order')::integer,0))
    returning * into v_row;
  else
    update public.challenges set title=coalesce(p_payload->>'title',title), description=coalesce(p_payload->>'description',description), category=coalesce(p_payload->>'category',category), difficulty=coalesce(p_payload->>'difficulty',difficulty), hours_earned=coalesce((p_payload->>'hours_earned')::numeric,hours_earned), points=coalesce((p_payload->>'points')::integer,points), active=coalesce((p_payload->>'active')::boolean,active), sort_order=coalesce((p_payload->>'sort_order')::integer,sort_order), updated_at=now() where id=v_id returning * into v_row;
  end if;
  return v_row;
end;
$$;

create or replace function public.admin_reorder_challenges(p_category text, p_ordered_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare i integer;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  for i in 1..array_length(p_ordered_ids,1) loop
    update public.challenges set sort_order=i-1, updated_at=now() where id=p_ordered_ids[i] and category=p_category;
  end loop;
end;
$$;

create or replace function public.admin_delete_challenge(p_challenge_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_total integer;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  select total_submissions into v_total from public.challenges where id=p_challenge_id;
  if v_total > 0 then raise exception 'Cannot delete'; end if;
  delete from public.challenges where id=p_challenge_id;
end;
$$;

create or replace function public.admin_moderate_story(p_story_id uuid, p_approved boolean)
returns public.student_stories language plpgsql security definer set search_path = public as $$
declare v_row public.student_stories;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  update public.student_stories set approved=p_approved, approved_at=case when p_approved then now() else null end, approved_by=case when p_approved then auth.uid() else null end where id=p_story_id returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.admin_review_submission(uuid, text, text) to authenticated;
grant execute on function public.admin_upsert_challenge(jsonb) to authenticated;
grant execute on function public.admin_reorder_challenges(text, uuid[]) to authenticated;
grant execute on function public.admin_delete_challenge(uuid) to authenticated;
grant execute on function public.admin_moderate_story(uuid, boolean) to authenticated;
