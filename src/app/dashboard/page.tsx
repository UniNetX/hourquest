import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardHub } from "@/components/dashboard/DashboardHub";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dashboard — HourQuest",
  description: "Your HourQuest dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/signin");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [
    { data: profile },
    { data: submissions },
    { data: challenges },
    { data: certificates },
    { count: badgeCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("challenge_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("challenges")
      .select("*")
      .eq("active", true)
      .order("track")
      .order("category")
      .order("sort_order"),
    supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("milestone"),
    supabase
      .from("badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const allSubmissions = submissions ?? [];
  const recentSubmissions = allSubmissions.slice(0, 3);

  return (
    <Suspense>
      <DashboardHub
        profile={profile}
        recentSubmissions={recentSubmissions}
        allSubmissions={allSubmissions}
        challenges={challenges ?? []}
        certificates={certificates ?? []}
        badgeCount={badgeCount ?? 0}
      />
    </Suspense>
  );
}
