# HourQuest Web

Next.js web app for [challenges.terraserve.org](https://challenges.terraserve.org) — environmental and medical volunteer challenges with verified hours and certificates.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase + admin email values.
2. Apply the database schema — open **SQL Editor** in Supabase and run the entire contents of [`supabase/RUN_IN_SQL_EDITOR.sql`](supabase/RUN_IN_SQL_EDITOR.sql). Then verify: `node scripts/verify-supabase.mjs`
3. Add your admin email to `challenge_admins` (included in RUN_IN_SQL_EDITOR.sql as `markustang08@gmail.com`).
4. Configure Supabase Auth email templates for password reset (Auth → Email).

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
