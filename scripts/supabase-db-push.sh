#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="zfexfatuhcqmwozouwtk"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Install the Supabase CLI: https://supabase.com/docs/guides/cli"
  exit 1
fi

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  cat <<EOF
Missing SUPABASE_DB_PASSWORD.

1. Open Supabase Dashboard → Project Settings → Database
2. Copy the database password for project ${PROJECT_REF}
3. Run:

   export SUPABASE_DB_PASSWORD='your-db-password'
   npm run db:push

Or paste supabase/migrations/20260627120000_fix_school_leaderboard.sql into the SQL Editor.
EOF
  exit 1
fi

supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
supabase db push
