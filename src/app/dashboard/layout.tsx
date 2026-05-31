import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, school_name")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      name={profile?.full_name || "Student"}
      school={profile?.school_name}
    >
      {children}
    </DashboardShell>
  );
}
