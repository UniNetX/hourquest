import { redirect } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { NavBar } from "@/components/layout/NavBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getProfileDisplayName } from "@/lib/profile-display";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/signin");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, school_name, user_type, partner_org_id")
    .eq("id", user.id)
    .single();

  if (profile?.user_type === "partner" && profile.partner_org_id) {
    const { data: org } = await supabase
      .from("partner_organizations")
      .select("status")
      .eq("id", profile.partner_org_id)
      .single();

    if (org) {
      const { getPartnerHomePath } = await import("@/lib/partner-routing");
      redirect(getPartnerHomePath(org));
    }
  }

  const navUser = {
    name: getProfileDisplayName(
      profile?.full_name,
      user.email,
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null,
    ),
  };

  return (
    <>
      <AnnouncementBar />
      <NavBar user={navUser} />
      <DashboardShell
        name={navUser.name}
        school={profile?.school_name}
      >
        {children}
      </DashboardShell>
    </>
  );
}
