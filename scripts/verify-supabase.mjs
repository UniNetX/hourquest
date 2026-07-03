#!/usr/bin/env node
/**
 * Verify HourQuest Supabase project is set up.
 * Usage: node scripts/verify-supabase.mjs
 */
import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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
loadDotEnv(resolve(ROOT, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("Add them to .env.local (copy from .env.example), then re-run.");
  process.exit(1);
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.log("Project ref:", ref);

async function checkTable(name) {
  const res = await fetch(`${url}/rest/v1/${name}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.text();
  console.log(`${name} table:`, res.ok ? "OK" : body.slice(0, 120));
  return res.ok;
}

async function checkColumn(table, column) {
  const res = await fetch(`${url}/rest/v1/${table}?select=${column}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.text();
  const ok = res.ok && !body.includes("does not exist");
  console.log(`${table}.${column} column:`, ok ? "OK" : "MISSING");
  return ok;
}

async function checkRpc(name, body = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const missing = text.includes("PGRST202");
  console.log(`${name} function:`, missing ? "MISSING" : "OK");
  return !missing;
}

async function checkStorageBucket(bucketId) {
  const res = await fetch(`${url}/storage/v1/bucket/${bucketId}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const ok = res.ok;
  console.log(`storage bucket ${bucketId}:`, ok ? "OK" : "MISSING");
  return ok;
}

const challengesOk = await checkTable("challenges");
const profilesOk = await checkTable("profiles");
const partnerOrgsOk = await checkTable("partner_organizations");
const homepageTestimonialsOk = await checkTable("homepage_testimonials");
const studentStoriesOk = await checkTable("student_stories");
const submissionsOk = await checkTable("challenge_submissions");
const tablesOk =
  challengesOk &&
  profilesOk &&
  partnerOrgsOk &&
  homepageTestimonialsOk &&
  studentStoriesOk &&
  submissionsOk;

const partnerColumnOk = await checkColumn("profiles", "partner_org_id");
const testimonialAvatarColumnOk = await checkColumn(
  "homepage_testimonials",
  "avatar_url",
);

const adminUpsertOk = await checkRpc("admin_upsert_challenge");
const adminPartnersOk = await checkRpc("admin_list_partner_orgs");
const adminTestimonialsOk = await checkRpc("admin_upsert_homepage_testimonial");
const rpcOk = adminUpsertOk && adminPartnersOk && adminTestimonialsOk;

const challengeProofsBucketOk = await checkStorageBucket("challenge-proofs");
const homepagePhotosBucketOk = await checkStorageBucket("homepage-testimonials");
const avatarsBucketOk = await checkStorageBucket("avatars");
const storageOk =
  challengeProofsBucketOk && homepagePhotosBucketOk && avatarsBucketOk;

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
if (adminEmails.length > 0) {
  console.log(
    "ADMIN_EMAILS:",
    adminEmails.join(", "),
    "(ensure each is in challenge_admins via sync-challenge-admins.sql)",
  );
}

const allOk =
  tablesOk &&
  partnerColumnOk &&
  testimonialAvatarColumnOk &&
  rpcOk &&
  storageOk;

if (!allOk) {
  console.error("\nSetup incomplete.\n");

  if (challengesOk && profilesOk && !partnerOrgsOk) {
    console.error(`Your base schema is OK — only partner setup is missing.

npm run db:push failed because SUPABASE_DB_URL is not in .env.local.
Use the SQL Editor instead (one paste):

  supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql

Open Supabase Dashboard → SQL Editor → paste entire file → Run
Then: npm run verify:supabase

Or run these separately (in order):
  1. supabase/scripts/patch-profiles-user-type.sql  (only if you hit error 23514)
  2. supabase/migrations/20260601120000_partner_accounts.sql
  3. supabase/scripts/backfill-broken-partner-profiles.sql
  4. supabase/scripts/sync-challenge-admins.sql
`);
  } else if (!homepageTestimonialsOk || !testimonialAvatarColumnOk || !homepagePhotosBucketOk) {
    console.error(`Homepage testimonials or storage setup is missing.
Run: supabase/migrations/20260702120000_testimonial_avatars_and_storage.sql
Or: npm run db:push (with SUPABASE_DB_URL in .env.local)
`);
  } else if (!adminUpsertOk && partnerOrgsOk) {
    console.error(`Partner tables exist but admin RPCs are missing.
For partner-era projects, apply migrations via npm run db:push — do not use PATCH_MISSING_FUNCTIONS.sql alone.
`);
  } else {
    console.error(`Run in Supabase SQL Editor (in order):
  1. supabase/RUN_IN_SQL_EDITOR.sql (fresh project) OR npm run db:push
  2. supabase/migrations/20260601120000_partner_accounts.sql (if not using APPLY_PARTNER_SETUP_ALL.sql)
  3. supabase/migrations/20260702120000_testimonial_avatars_and_storage.sql
  4. supabase/scripts/backfill-broken-partner-profiles.sql (if needed)
  5. supabase/scripts/sync-challenge-admins.sql
`);
  }

  console.error(
    "Full audit: supabase/scripts/diagnose-deployment.sql in SQL Editor",
  );
  console.error(
    "Tip: add SUPABASE_DB_URL to .env.local to apply all migrations via npm run db:push",
  );
}

if (allOk) {
  console.log("\nAll checks passed.");
  console.log(
    "Optional: run supabase/scripts/diagnose-deployment.sql for a full SQL Editor audit.",
  );
}

process.exit(allOk ? 0 : 1);
