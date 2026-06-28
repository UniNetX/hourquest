#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PROJECT_REF = "zfexfatuhcqmwozouwtk";

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(resolve(ROOT, ".env.local"));

const dbUrlFromEnv = process.env.SUPABASE_DB_URL?.trim();
const password = process.env.SUPABASE_DB_PASSWORD?.trim();
const region = process.env.SUPABASE_DB_REGION?.trim() || "us-east-1";

let dbUrl = dbUrlFromEnv;
if (!dbUrl) {
  if (!password) {
    console.error(`
Missing database credentials.

Add one of these to .env.local (recommended — copy from Supabase Dashboard):

  SUPABASE_DB_URL=postgresql://postgres.${PROJECT_REF}:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

Dashboard → Project Settings → Database → Connection string → Session pooler (port 5432)

Or set SUPABASE_DB_PASSWORD (and SUPABASE_DB_REGION if not us-east-1), then run:

  npm run db:push

No supabase login or project link is required.

Or paste migration SQL into Supabase SQL Editor:
  supabase/migrations/
`);
    process.exit(1);
  }
  dbUrl = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

console.log("Pushing migrations via direct database URL (skips supabase link)...");

const result = spawnSync("supabase", ["db", "push", "--db-url", dbUrl], {
  cwd: ROOT,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
