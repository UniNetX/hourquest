import { createClient } from "@/lib/supabase/server";
import type { PartnerOrganization, Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export type PartnerSession = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  user: User;
  profile: Profile;
  org: PartnerOrganization;
};

export { getPartnerHomePath } from "@/lib/partner-routing";

export async function getPartnerSession(): Promise<PartnerSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.partner_org_id) return null;

  const { data: org } = await supabase
    .from("partner_organizations")
    .select("*")
    .eq("id", profile.partner_org_id)
    .single();

  if (!org) return null;

  return { supabase, user, profile: profile as Profile, org: org as PartnerOrganization };
}

export async function requirePartnerUser() {
  const session = await getPartnerSession();
  if (!session || session.profile.user_type !== "partner") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireApprovedPartner() {
  const session = await requirePartnerUser();
  if (session.org.status !== "approved") {
    throw new Error("Forbidden");
  }
  return session;
}
