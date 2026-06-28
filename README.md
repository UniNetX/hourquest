# HourQuest Web

Next.js web app for [challenges.terraserve.org](https://challenges.terraserve.org) — environmental and medical volunteer challenges with verified hours and certificates.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + admin email values.
2. Apply the database schema — either:
   - **CLI (recommended):** log into the Supabase account that owns project `zfexfatuhcqmwozouwtk`, then:
     ```bash
     supabase login
     export SUPABASE_DB_PASSWORD='your-database-password'  # Dashboard → Settings → Database
     npm run db:push
     ```
   - **SQL Editor:** run [`supabase/RUN_IN_SQL_EDITOR.sql`](supabase/RUN_IN_SQL_EDITOR.sql) for a fresh project, or run individual files under `supabase/migrations/` for updates.
3. Verify: `node scripts/verify-supabase.mjs`
4. Add your admin email to `challenge_admins` (included in RUN_IN_SQL_EDITOR.sql as `markustang08@gmail.com`).
5. Configure Supabase Auth email templates for password reset (Auth → Email).

### Supabase CLI troubleshooting

- `Cannot find project ref` → run `supabase init` (already done in this repo) then `npm run db:link` or `npm run db:push`.
- `Your account does not have the necessary privileges` → `supabase login` with the account that owns the HourQuest project (`zfexfatuhcqmwozouwtk`), not a different Supabase account.
- `IPv6 is not supported` → complete `supabase link` with your database password; the CLI stores an IPv4 pooler URL automatically.

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
