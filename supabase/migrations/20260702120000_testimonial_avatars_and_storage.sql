-- Homepage testimonial photos, user avatars bucket, admin profile reads

-- ---------------------------------------------------------------------------
-- homepage_testimonials.avatar_url
-- ---------------------------------------------------------------------------
alter table public.homepage_testimonials
  add column if not exists avatar_url text;

-- ---------------------------------------------------------------------------
-- Storage: homepage-testimonials (public, admin-managed)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'homepage-testimonials',
  'homepage-testimonials',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read homepage testimonial photos" on storage.objects;
create policy "Public read homepage testimonial photos"
  on storage.objects for select
  using (bucket_id = 'homepage-testimonials');

drop policy if exists "Admin upload homepage testimonial photos" on storage.objects;
create policy "Admin upload homepage testimonial photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'homepage-testimonials'
    and public.is_challenges_admin()
  );

drop policy if exists "Admin update homepage testimonial photos" on storage.objects;
create policy "Admin update homepage testimonial photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'homepage-testimonials'
    and public.is_challenges_admin()
  );

drop policy if exists "Admin delete homepage testimonial photos" on storage.objects;
create policy "Admin delete homepage testimonial photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'homepage-testimonials'
    and public.is_challenges_admin()
  );

-- ---------------------------------------------------------------------------
-- Storage: avatars (private, user-scoped folders)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Users can read own avatars" on storage.objects;
create policy "Users can read own avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Admin read all profiles (accurate stats for admin + homepage impact)
-- ---------------------------------------------------------------------------
drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
  on public.profiles for select
  using (public.is_challenges_admin());

-- ---------------------------------------------------------------------------
-- Extend admin_upsert_homepage_testimonial for avatar_url
-- ---------------------------------------------------------------------------
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
      rating, comment, display_name, display_school, sort_order, avatar_url
    ) values (
      coalesce((p_payload ->> 'rating')::smallint, 5),
      p_payload ->> 'comment',
      p_payload ->> 'display_name',
      coalesce(p_payload ->> 'display_school', ''),
      coalesce((p_payload ->> 'sort_order')::int, v_count),
      nullif(p_payload ->> 'avatar_url', '')
    ) returning * into v_row;
  else
    update public.homepage_testimonials set
      rating = coalesce((p_payload ->> 'rating')::smallint, rating),
      comment = coalesce(p_payload ->> 'comment', comment),
      display_name = coalesce(p_payload ->> 'display_name', display_name),
      display_school = coalesce(p_payload ->> 'display_school', display_school),
      sort_order = coalesce((p_payload ->> 'sort_order')::int, sort_order),
      avatar_url = case
        when p_payload ? 'avatar_url' then nullif(p_payload ->> 'avatar_url', '')
        else avatar_url
      end,
      updated_at = now()
    where id = v_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;
