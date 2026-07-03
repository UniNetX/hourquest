# HourQuest Web

Next.js web app for [challenges.terraserve.org](https://challenges.terraserve.org) — environmental and medical volunteer challenges with verified hours and certificates.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + admin email values.
2. Apply the database schema — either:
   - **CLI (recommended):** add your database connection string to `.env.local`, then:
     ```bash
     # Dashboard → Settings → Database → Session pooler (port 5432)
     # Add to .env.local: SUPABASE_DB_URL=postgresql://postgres.zfexfatuhcqmwozouwtk:...
     npm run db:push
     ```
     No `supabase login` or `supabase link` required — only the database password.
   - **SQL Editor (fresh project):** run [`supabase/RUN_IN_SQL_EDITOR.sql`](supabase/RUN_IN_SQL_EDITOR.sql), then all migrations in [`supabase/migrations/`](supabase/migrations/) in filename order. `RUN_IN_SQL_EDITOR.sql` alone does not create partner tables or homepage testimonials.
   - **SQL Editor (existing DB, partner only):** run [`supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql`](supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql), then apply any newer migrations (e.g. [`20260702120000_testimonial_avatars_and_storage.sql`](supabase/migrations/20260702120000_testimonial_avatars_and_storage.sql)).
3. Verify: `npm run verify:supabase` (loads `.env.local` automatically)
4. **Sync admin emails:** every address in `ADMIN_EMAILS` must exist in `challenge_admins` (see [`supabase/scripts/sync-challenge-admins.sql`](supabase/scripts/sync-challenge-admins.sql)). Without this, `/admin` loads but RPC actions fail with Forbidden.
5. If partners signed up before the partner migration, run [`supabase/scripts/backfill-broken-partner-profiles.sql`](supabase/scripts/backfill-broken-partner-profiles.sql).
6. Full SQL audit (optional): run [`supabase/scripts/diagnose-deployment.sql`](supabase/scripts/diagnose-deployment.sql) in the Supabase SQL Editor.
7. Configure Supabase Auth email templates for password reset (Auth → Email).

### Deployment checklist (existing production DB)

1. [`APPLY_PARTNER_SETUP_ALL.sql`](supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql) — if partner setup not yet applied
2. New migrations via `npm run db:push` or paste in SQL Editor (includes testimonial photos + avatars storage)
3. [`sync-challenge-admins.sql`](supabase/scripts/sync-challenge-admins.sql) — add all `ADMIN_EMAILS`
4. `npm run verify:supabase`
5. [`diagnose-deployment.sql`](supabase/scripts/diagnose-deployment.sql) — full read-only audit

### Supabase CLI troubleshooting

- `Cannot find project ref` → use `npm run db:push` with `SUPABASE_DB_URL` in `.env.local` (no link needed).
- `Your account does not have the necessary privileges` → ignore `supabase link`; set `SUPABASE_DB_URL` instead and run `npm run db:push`.
- `failed to connect to postgres` → copy the **Session pooler** URI (port 5432) from the dashboard; check region in the hostname matches your project.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

1. Import this repo in Vercel.
2. Set environment variables from `.env.example` (set `NEXT_PUBLIC_SITE_URL=https://challenges.terraserve.org`).
3. Add custom domain `challenges.terraserve.org` in Vercel → Project → Settings → Domains.
4. In your DNS provider for `terraserve.org`, add a **CNAME** record:
   - **Name:** `challenges`
   - **Value:** the target Vercel shows (usually `cname.vercel-dns.com`)
5. After DNS propagates, verify:
   - `https://challenges.terraserve.org/robots.txt`
   - `https://challenges.terraserve.org/sitemap.xml`
6. Deploy Supabase Edge Functions from `supabase/functions/` if using serverless email/review paths.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Supabase Auth, Postgres, Storage, Realtime
- Resend for transactional email
