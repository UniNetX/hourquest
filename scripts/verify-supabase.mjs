#!/usr/bin/env node
/**
 * Verify TerraServe Challenges Supabase project is set up.
 * Usage: node scripts/verify-supabase.mjs
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.log("Project ref:", ref);

async function checkTable(name) {
  const res = await fetch(`${url}/rest/v1/${name}?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.text();
  console.log(`${name} table:`, res.ok ? "OK" : body);
  return res.ok;
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
  console.log(
    `${name} function:`,
    missing ? "MISSING — run supabase/PATCH_MISSING_FUNCTIONS.sql" : "OK",
  );
  return !missing;
}

const tablesOk =
  (await checkTable("challenges")) && (await checkTable("profiles"));
const rpcOk = await checkRpc("admin_upsert_challenge");

if (!rpcOk) {
  console.error(
    "\nAdmin functions are missing. Open Supabase SQL Editor and run:",
    "supabase/PATCH_MISSING_FUNCTIONS.sql",
  );
}

process.exit(tablesOk && rpcOk ? 0 : 1);
