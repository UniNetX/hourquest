-- Partner logo storage and admin update RPC for showcase content

-- ---------------------------------------------------------------------------
-- Storage: partner-logos (public, admin-managed)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-logos',
  'partner-logos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read partner logos" on storage.objects;
create policy "Public read partner logos"
  on storage.objects for select
  using (bucket_id = 'partner-logos');

drop policy if exists "Admin upload partner logos" on storage.objects;
create policy "Admin upload partner logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'partner-logos'
    and public.is_challenges_admin()
  );

drop policy if exists "Admin update partner logos" on storage.objects;
create policy "Admin update partner logos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'partner-logos'
    and public.is_challenges_admin()
  );

drop policy if exists "Admin delete partner logos" on storage.objects;
create policy "Admin delete partner logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'partner-logos'
    and public.is_challenges_admin()
  );

-- ---------------------------------------------------------------------------
-- admin_update_partner_org
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_partner_org(
  p_id uuid,
  p_payload jsonb
)
returns public.partner_organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.partner_organizations;
begin
  if not public.is_challenges_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.partner_organizations set
    name = coalesce(nullif(trim(p_payload ->> 'name'), ''), name),
    description = case
      when p_payload ? 'description' then nullif(trim(p_payload ->> 'description'), '')
      else description
    end,
    website = case
      when p_payload ? 'website' then nullif(trim(p_payload ->> 'website'), '')
      else website
    end,
    logo_url = case
      when p_payload ? 'logo_url' then nullif(p_payload ->> 'logo_url', '')
      else logo_url
    end,
    updated_at = now()
  where id = p_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Partner organization not found';
  end if;

  return v_row;
end;
$$;

grant execute on function public.admin_update_partner_org(uuid, jsonb) to authenticated;
