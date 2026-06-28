-- TerraServe Challenges — website-only schema (no iOS / checkins dependencies)
-- Project: zfexfatuhcqmwozouwtk

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  school_name text,
  avatar_url text,
  total_verified_hours numeric(7,2) not null default 0 check (total_verified_hours >= 0),
  week_streak integer not null default 0 check (week_streak >= 0),
  is_public boolean not null default true,
  user_type text default 'hs_student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public read public profiles"
on public.profiles for select using (is_public = true or auth.uid() = id);

create policy "Users update own profile"
on public.profiles for update using (auth.uid() = id);

create policy "Users insert own profile"
on public.profiles for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_admins (
  email text primary key
);

insert into public.challenge_admins (email)
values ('markustang08@gmail.com')
on conflict do nothing;

create or replace function public.is_challenges_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.challenge_admins ca
    where lower(ca.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Badges & certificates
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_type text not null,
  earned_at timestamptz not null default now()
);

alter table public.badges enable row level security;
create policy "Users read own badges" on public.badges for select using (auth.uid() = user_id or public.is_challenges_admin());
create policy "Public read badges on public profiles" on public.badges for select using (
  exists (select 1 from public.profiles p where p.id = user_id and p.is_public = true)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  milestone integer not null,
  pdf_url text,
  cert_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.certificates enable row level security;
create policy "Users read own certificates" on public.certificates for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 100),
  description text not null check (char_length(description) <= 500),
  proof_instructions text check (char_length(proof_instructions) <= 300),
  track text not null default 'environmental' check (track in ('environmental','medical')),
  category text not null check (category in ('cleanup','plant','waste','water','social','community','health_education','wellness','first_aid','mental_health','nutrition','community_health')),
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  hours_earned numeric(4,2) not null,
  points integer not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  total_submissions integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists challenges_track_category_sort_idx on public.challenges (track, category, sort_order);

do $$ begin
  create type public.challenge_submission_status as enum ('pending','approved','rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id),
  challenge_title text not null,
  challenge_category text not null,
  hours_awarded numeric(4,2),
  points_awarded integer,
  photo_paths text[] not null default '{}',
  description text,
  date_completed date not null,
  status public.challenge_submission_status not null default 'pending',
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists public.student_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('challenge-proofs','challenge-proofs',false,10485760,array['image/jpeg','image/png','image/webp','image/heic']::text[])
on conflict (id) do update set file_size_limit=excluded.file_size_limit;

-- Hours (website only — approved challenge submissions)
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

-- Leaderboards
create or replace view public.individual_leaderboard_all_time as
select p.id, p.full_name, p.school_name, p.avatar_url, p.total_verified_hours,
  row_number() over (order by p.total_verified_hours desc, p.full_name) as rank
from public.profiles p where p.total_verified_hours > 0;

create or replace view public.individual_leaderboard_weekly as
select p.id, p.full_name, p.school_name, p.avatar_url, a.weekly_hours,
  row_number() over (order by a.weekly_hours desc, p.full_name) as rank
from (
  select user_id, coalesce(sum(hours_awarded),0) as weekly_hours
  from public.challenge_submissions
  where status = 'approved'
    and date_trunc('week', reviewed_at at time zone 'UTC') = date_trunc('week', now() at time zone 'UTC')
  group by user_id
) a join public.profiles p on p.id = a.user_id where a.weekly_hours > 0;

create or replace view public.school_leaderboard as
select
  min(trim(p.school_name)) as school_name,
  count(distinct p.id) as student_count,
  coalesce(sum(p.total_verified_hours), 0) as total_hours
from public.profiles p
where p.school_name is not null and trim(p.school_name) <> ''
group by lower(trim(p.school_name))
having count(distinct p.id) >= 1;

grant select on public.individual_leaderboard_all_time to anon, authenticated;
grant select on public.individual_leaderboard_weekly to anon, authenticated;
grant select on public.school_leaderboard to anon, authenticated;

-- Auth signup hook
create or replace function public.handle_new_challenges_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, school_name, user_type)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'school_name',''), 'hs_student')
  on conflict (id) do update set
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end,
    school_name = coalesce(excluded.school_name, public.profiles.school_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_challenges on auth.users;
create trigger on_auth_user_created_challenges
after insert on auth.users for each row execute function public.handle_new_challenges_user();

-- Admin RPCs (same as before)
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
    insert into public.challenges (title,description,proof_instructions,track,category,difficulty,hours_earned,points,active,sort_order)
    values (p_payload->>'title', p_payload->>'description', nullif(p_payload->>'proof_instructions',''), coalesce(p_payload->>'track','environmental'), p_payload->>'category', p_payload->>'difficulty', (p_payload->>'hours_earned')::numeric, (p_payload->>'points')::integer, coalesce((p_payload->>'active')::boolean,true), coalesce((p_payload->>'sort_order')::integer,0))
    returning * into v_row;
  else
    update public.challenges set title=coalesce(p_payload->>'title',title), description=coalesce(p_payload->>'description',description), track=coalesce(p_payload->>'track',track), category=coalesce(p_payload->>'category',category), difficulty=coalesce(p_payload->>'difficulty',difficulty), hours_earned=coalesce((p_payload->>'hours_earned')::numeric,hours_earned), points=coalesce((p_payload->>'points')::integer,points), active=coalesce((p_payload->>'active')::boolean,active), sort_order=coalesce((p_payload->>'sort_order')::integer,sort_order), updated_at=now() where id=v_id returning * into v_row;
  end if;
  return v_row;
end;
$$;

drop function if exists public.admin_reorder_challenges(text, uuid[]);

create or replace function public.admin_reorder_challenges(p_track text, p_category text, p_ordered_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare i integer;
begin
  if not public.is_challenges_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  for i in 1..array_length(p_ordered_ids,1) loop
    update public.challenges set sort_order=i-1, updated_at=now() where id=p_ordered_ids[i] and track=p_track and category=p_category;
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
grant execute on function public.admin_reorder_challenges(text, text, uuid[]) to authenticated;
grant execute on function public.admin_delete_challenge(uuid) to authenticated;
grant execute on function public.admin_moderate_story(uuid, boolean) to authenticated;

-- RLS
alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.student_stories enable row level security;

create policy "Public read active challenges" on public.challenges for select using (active=true or public.is_challenges_admin());
create policy "Admin manage challenges" on public.challenges for all using (public.is_challenges_admin()) with check (public.is_challenges_admin());
create policy "Users read own submissions" on public.challenge_submissions for select using (auth.uid()=user_id or public.is_challenges_admin());
create policy "Users insert own submissions" on public.challenge_submissions for insert with check (auth.uid()=user_id and status='pending');
create policy "Public read approved stories" on public.student_stories for select using (approved=true or auth.uid()=user_id or public.is_challenges_admin());
create policy "Users insert own stories" on public.student_stories for insert with check (auth.uid()=user_id and approved=false);

create policy "Users upload own proof photos" on storage.objects for insert to authenticated
with check (bucket_id='challenge-proofs' and auth.uid()::text=(storage.foldername(name))[1]);
create policy "Users read own proof photos" on storage.objects for select to authenticated
using (bucket_id='challenge-proofs' and (auth.uid()::text=(storage.foldername(name))[1] or public.is_challenges_admin()));

alter publication supabase_realtime add table public.challenges;

drop trigger if exists challenges_set_updated_at on public.challenges;
create trigger challenges_set_updated_at before update on public.challenges for each row execute function public.set_updated_at();

-- Seed 30 PRD challenges

do $$ begin if (select count(*) from public.challenges) = 0 then insert into public.challenges (title, description, proof_instructions, category, difficulty, hours_earned, points, sort_order) values
-- Clean Up (6)
('Pick up trash anywhere in your community for 30 minutes', 'Spend at least 30 minutes collecting litter in your neighborhood, park, or community space.', 'Photo showing you with trash bags or collected litter in a public area.', 'cleanup', 'easy', 0.5, 50, 0),
('Fill at least 2 full bags of trash from anywhere in your community', 'Collect and properly dispose of at least two full bags of trash from your community.', 'Photo of two filled trash bags ready for disposal.', 'cleanup', 'medium', 1, 100, 1),
('Organize a community cleanup with at least 3 friends', 'Lead a small group cleanup with at least three friends in your community.', 'Group photo of all participants with collected trash.', 'cleanup', 'hard', 2, 200, 2),
('Clean up a beach or riverbank near your community', 'Remove litter from a beach, lake shore, or riverbank in your area.', 'Before and after photos of the cleaned shoreline.', 'cleanup', 'medium', 1, 100, 3),
('Remove trash from a sports field or recreational area', 'Clean up litter from a local sports field, playground, or recreational area.', 'Photo of cleaned area with collected trash visible.', 'cleanup', 'easy', 0.5, 50, 4),
('Clean up a storm drain or catch basin near your home', 'Clear debris and litter from a storm drain or catch basin near your home.', 'Photo showing the cleaned storm drain area.', 'cleanup', 'easy', 0.5, 50, 5),
-- Plant & Grow (5)
('Plant a flower, small plant, or herb anywhere', 'Plant at least one flower, herb, or small plant in a pot, garden, or community space.', 'Photo of you planting or the finished planted item.', 'plant', 'easy', 0.5, 50, 0),
('Spread wildflower seeds in an empty patch of land in your community', 'Sow wildflower seeds in an appropriate empty patch of land in your community.', 'Photo of the seeded area with seed packet visible.', 'plant', 'easy', 0.5, 50, 1),
('Start a compost bin at home', 'Set up a working compost bin or compost system at home.', 'Photo of your compost bin with materials added.', 'plant', 'medium', 1, 100, 2),
('Plant at least 3 different plants in a community space', 'Plant three or more different plants in an approved community space.', 'Photo showing all three plants labeled or visible.', 'plant', 'hard', 2, 200, 3),
('Create a small pollinator garden with native flowers', 'Design and plant a small pollinator garden using native flowers.', 'Photo of the pollinator garden with native plants.', 'plant', 'medium', 1, 100, 4),
-- Reduce Waste (6)
('Bring reusable bags to the grocery store', 'Use reusable bags for an entire grocery shopping trip.', 'Photo at the store with reusable bags filled with groceries.', 'waste', 'easy', 0.5, 50, 0),
('Go one full day with zero single-use plastic', 'Avoid all single-use plastic for one full day.', 'Photo journal or collage showing plastic-free alternatives used.', 'waste', 'easy', 0.5, 50, 1),
('Donate a bag of old clothes instead of throwing them away', 'Donate at least one bag of clothes to a thrift store or donation center.', 'Photo at the donation drop-off with your bag of clothes.', 'waste', 'easy', 0.5, 50, 2),
('Collect and recycle old batteries or electronics from your home', 'Properly collect and recycle batteries or small electronics from home.', 'Photo at a recycling drop-off with collected items.', 'waste', 'medium', 1, 100, 3),
('Use a reusable water bottle every day for one full week', 'Use only a reusable water bottle for drinking water for seven days.', 'Photo of your reusable bottle used across the week.', 'waste', 'medium', 1, 100, 4),
('Finish all your food for one week — zero food waste', 'Eat or save all prepared food with zero waste for one week.', 'Photo showing meal planning or compost of unavoidable scraps only.', 'waste', 'medium', 1, 100, 5),
-- Water & Energy (5)
('Turn off lights every time you leave a room for one full week', 'Turn off lights when leaving any room for seven consecutive days.', 'Photo checklist or journal entry documenting the week.', 'water', 'easy', 0.5, 50, 0),
('Turn off the tap while brushing teeth for one full week', 'Keep the tap off while brushing teeth for seven days.', 'Photo of a note or checklist tracking the habit.', 'water', 'easy', 0.5, 50, 1),
('Take 5-minute showers for 5 days straight', 'Limit showers to five minutes for five consecutive days.', 'Photo of a timer or shower checklist.', 'water', 'medium', 1, 100, 2),
('Unplug all chargers and electronics when not in use for one full week', 'Unplug chargers and idle electronics when not in use for seven days.', 'Photo showing unplugged devices at home.', 'water', 'medium', 1, 100, 3),
('Walk or bike instead of getting a car ride for one full week', 'Use walking or biking instead of car rides for transportation for seven days.', 'Photo of you walking or biking to a destination.', 'water', 'hard', 2, 200, 4),
-- Social & Awareness (5)
('Post an environmental tip on Instagram and tag TerraServe', 'Share an environmental tip on Instagram and tag @TerraServe.', 'Screenshot of your Instagram post with TerraServe tagged.', 'social', 'easy', 0.5, 50, 0),
('Share a photo of nature in your community on social media', 'Post a photo of local nature on social media with an environmental caption.', 'Screenshot of your social media post.', 'social', 'easy', 0.5, 50, 1),
('Post a before and after cleanup photo on social media', 'Share before and after photos from a cleanup on social media.', 'Screenshot showing both before and after in the post.', 'social', 'medium', 1, 100, 2),
('Get one friend to sign up for TerraServe Challenges', 'Invite a friend who creates a TerraServe Challenges account.', 'Screenshot of friend confirmation or referral message.', 'social', 'medium', 1, 100, 3),
('Teach a younger student about one environmental issue', 'Teach a younger student about a specific environmental topic.', 'Photo of the teaching session or educational materials used.', 'social', 'medium', 1, 100, 4),
-- Community (3)
('Volunteer at a local environmental organization for at least 1 hour', 'Volunteer at least one hour with a local environmental organization.', 'Photo at the organization or signed volunteer confirmation.', 'community', 'hard', 2, 200, 0),
('Attend a local environmental event or meeting', 'Attend a local environmental event, town hall, or community meeting.', 'Photo or event program showing your attendance.', 'community', 'medium', 1, 100, 1),
('Write a letter to your local government about an environmental issue', 'Write and send a letter to local government about an environmental concern.', 'Photo of the letter or email confirmation sent.', 'community', 'hard', 2, 200, 2);
  end if;
end $$;
