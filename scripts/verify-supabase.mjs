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

const res = await fetch(`${url}/rest/v1/challenges?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const body = await res.text();
console.log("challenges table:", res.ok ? "OK" : body);

const res2 = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const body2 = await res2.text();
console.log("profiles table:", res2.ok ? "OK" : body2);

process.exit(res.ok && res2.ok ? 0 : 1);
