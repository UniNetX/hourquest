import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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

  return (
    <DashboardShell
      name={profile?.full_name || "Student"}
      school={profile?.school_name}
    >
      {children}
    </DashboardShell>
  );
}
