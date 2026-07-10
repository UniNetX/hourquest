import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** @deprecated Prefer isChallengesAdmin — ADMIN_EMAILS is only for email notifications. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export async function isChallengesAdmin(
  supabase: SupabaseServerClient,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_challenges_admin");
  if (error) return false;
  return Boolean(data);
}

export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isChallengesAdmin(supabase))) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}
