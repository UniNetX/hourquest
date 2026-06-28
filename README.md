# HourQuest Web

Next.js web app for [challenges.terraserve.org](https://challenges.terraserve.org) — environmental and medical volunteer challenges with verified hours and certificates.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + admin email values.
2. Apply the database schema — either:
   - **CLI:** add your database connection string to `.env.local`, then:
     ```bash
     # Dashboard → Settings → Database → Session pooler (port 5432)
     # Add to .env.local: SUPABASE_DB_URL=postgresql://postgres.zfexfatuhcqmwozouwtk:...
     npm run db:push
     ```
     No `supabase login` or `supabase link` required — only the database password.
   - **SQL Editor:** run [`supabase/RUN_IN_SQL_EDITOR.sql`](supabase/RUN_IN_SQL_EDITOR.sql) for a fresh project, or run individual files under `supabase/migrations/` for updates.
3. Verify: `node scripts/verify-supabase.mjs`
4. Add your admin email to `challenge_admins` (included in RUN_IN_SQL_EDITOR.sql as `markustang08@gmail.com`).
5. Configure Supabase Auth email templates for password reset (Auth → Email).

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
2. Set environment variables from `.env.example`.
3. Add custom domain `challenges.terraserve.org`.
4. Deploy Supabase Edge Functions from `supabase/functions/` if using serverless email/review paths.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Supabase Auth, Postgres, Storage, Realtime
- Resend for transactional email
