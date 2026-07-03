export const SUPABASE_PROJECT_REF = "zfexfatuhcqmwozouwtk";

export function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? SUPABASE_PROJECT_REF;
}

export function partnerSetupErrorMessage(
  error: { message?: string } | null,
  projectRef = getSupabaseProjectRef(),
): string | null {
  if (!error?.message) return null;
  const msg = error.message.toLowerCase();

  if (
    msg.includes("pgrst202") ||
    msg.includes("admin_list_partner_orgs") ||
    msg.includes("partner_organizations") ||
    msg.includes("pgrst205")
  ) {
    return [
      `Partner tables are missing on Supabase project "${projectRef}".`,
      "The app .env.local points to this project — confirm the SQL Editor is open on the same one.",
      `1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`,
      "2. Paste and run: supabase/scripts/APPLY_PARTNER_MINIMAL.sql (small file — verify last row shows partner_organizations)",
      "3. Then run: supabase/scripts/APPLY_PARTNER_SETUP_ALL.sql",
      "4. Run: npm run verify:supabase",
      `Or set a real SUPABASE_DB_PASSWORD in .env.local and run: npm run db:apply-all`,
    ].join(" ");
  }

  if (msg.includes("forbidden") || msg.includes("42501")) {
    return "Your email is not in challenge_admins. Run supabase/scripts/sync-challenge-admins.sql (or npm run apply-partner-setup).";
  }

  return error.message;
}
