#!/usr/bin/env node
/**
 * Apply SQL migrations when Supabase CLI link/db:push is unavailable.
 * Requires SUPABASE_DB_URL or SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: npm run db:apply-all
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { dirname, resolve, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

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

let connectionString = dbUrlFromEnv;
if (!connectionString) {
  if (!password) {
    console.error(`
Missing database credentials.

Add to .env.local (Supabase Dashboard → Project Settings → Database):

  SUPABASE_DB_PASSWORD=your-database-password

Or the full session pooler URL:

  SUPABASE_DB_URL=postgresql://postgres.${PROJECT_REF}:YOUR_PASSWORD@aws-0-${region}.pooler.supabase.com:5432/postgres

Then run: npm run db:apply-all

Or paste into Supabase SQL Editor:
  supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql
`);
    process.exit(1);
  }
  connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

const SQL_FILES = [
  "supabase/scripts/APPLY_PARTNER_MINIMAL.sql",
  "supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql",
  "supabase/migrations/20260602120000_homepage_testimonials.sql",
  "supabase/migrations/20260603120000_homepage_testimonials_table.sql",
  "supabase/migrations/20260627120000_fix_school_leaderboard.sql",
  "supabase/migrations/20260702120000_testimonial_avatars_and_storage.sql",
];

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

console.log("Connecting to Supabase Postgres...");

try {
  await client.connect();
  console.log("Connected. Applying SQL files...\n");

  for (const relPath of SQL_FILES) {
    const absPath = resolve(ROOT, relPath);
    if (!existsSync(absPath)) {
      console.warn(`Skip (not found): ${relPath}`);
      continue;
    }
    const sql = readFileSync(absPath, "utf8");
    console.log(`Running ${relPath}...`);
    await client.query(sql);
    console.log(`  OK\n`);
  }

  console.log("All SQL applied successfully.");
  console.log("Next: npm run verify:supabase");
} catch (err) {
  console.error("\nSQL apply failed:", err.message);
  console.error(`
If connection failed, check SUPABASE_DB_PASSWORD and SUPABASE_DB_REGION in .env.local.

If a statement failed mid-file, you can paste the failing file into Supabase SQL Editor instead.
`);
  process.exit(1);
} finally {
  await client.end();
}
