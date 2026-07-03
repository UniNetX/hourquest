#!/usr/bin/env node
/**
 * Apply partner DB setup when migrations cannot be pushed via CLI.
 * Checks remote state and syncs challenge_admins via service role when possible.
 *
 * Usage: node scripts/apply-partner-setup.mjs
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

async function checkTable(name, key) {
  const res = await fetch(`${url}/rest/v1/${name}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.ok;
}

async function checkRpc(name, key) {
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const text = await res.text();
  return !text.includes("PGRST202");
}

async function syncChallengeAdmins() {
  if (!serviceKey) {
    console.log("SUPABASE_SERVICE_ROLE_KEY not set — skip challenge_admins sync");
    return false;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    console.log("ADMIN_EMAILS not set — skip challenge_admins sync");
    return false;
  }

  let synced = false;
  for (const email of adminEmails) {
    const res = await fetch(`${url}/rest/v1/challenge_admins`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({ email }),
    });
    if (res.ok || res.status === 409) {
      console.log(`challenge_admins: ${email} OK`);
      synced = true;
    } else {
      const body = await res.text();
      console.warn(`challenge_admins: ${email} failed (${res.status}): ${body.slice(0, 120)}`);
    }
  }
  return synced;
}

const partnerTableOk = await checkTable("partner_organizations", anonKey);
const partnerOrgIdOk = await (async () => {
  const res = await fetch(`${url}/rest/v1/profiles?select=partner_org_id&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  const text = await res.text();
  return !text.includes("partner_org_id does not exist");
})();
const listRpcOk = await checkRpc("admin_list_partner_orgs", anonKey);

console.log("Partner setup status:");
console.log("  partner_organizations table:", partnerTableOk ? "OK" : "MISSING");
console.log("  profiles.partner_org_id column:", partnerOrgIdOk ? "OK" : "MISSING");
console.log("  admin_list_partner_orgs RPC:", listRpcOk ? "OK" : "MISSING");

await syncChallengeAdmins();

if (!partnerTableOk || !partnerOrgIdOk || !listRpcOk) {
  console.error(`
Partner migration is NOT applied. Run in Supabase SQL Editor:

  supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql   (one paste — recommended)

Or step-by-step:
  1. supabase/migrations/20260601120000_partner_accounts.sql
  2. supabase/scripts/backfill-broken-partner-profiles.sql
  3. supabase/scripts/sync-challenge-admins.sql

Or add SUPABASE_DB_URL to .env.local and run: npm run db:push
Or set SUPABASE_DB_PASSWORD and run: npm run db:apply-all
`);
  process.exit(1);
}

console.log(`
Partner infrastructure is present.
If a specific user still cannot sign in, run:
  supabase/scripts/backfill-broken-partner-profiles.sql
`);
