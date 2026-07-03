-- Ensure ADMIN_EMAILS from .env are in challenge_admins (required for admin_list_partner_orgs).
-- Add one row per admin email; safe to re-run.

insert into public.challenge_admins (email)
values ('markustang08@gmail.com')
on conflict do nothing;

-- Add additional admin emails below:
-- insert into public.challenge_admins (email) values ('you@example.com') on conflict do nothing;

select * from public.challenge_admins order by email;
