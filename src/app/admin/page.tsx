import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin — HourQuest",
  description: "Admin dashboard",
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/signin");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }

  const [
    usersRes,
    profilesRes,
    pendingRes,
    submissionsRes,
    submissionsData,
    challengesData,
    storiesData,
    homepageTestimonialsData,
    usersData,
    partnersData,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("total_verified_hours"),
    supabase
      .from("challenge_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("challenge_submissions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("challenge_submissions")
      .select("*")
      .order("submitted_at", { ascending: false }),
    supabase.from("challenges").select("*").order("category").order("sort_order"),
    supabase
      .from("student_stories")
      .select("*, profiles(full_name, school_name)")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("homepage_testimonials")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, school_name, total_verified_hours, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.rpc("admin_list_partner_orgs", { p_status: null }),
  ]);

  const hours =
    profilesRes.data?.reduce(
      (sum, p) => sum + Number(p.total_verified_hours || 0),
      0,
    ) ?? 0;

  return (
    <AdminDashboard
      initialStats={{
        users: usersRes.count ?? 0,
        hours: Math.floor(hours),
        pending: pendingRes.count ?? 0,
        submissions: submissionsRes.count ?? 0,
      }}
      initialSubmissions={submissionsData.data ?? []}
      initialChallenges={challengesData.data ?? []}
      initialStories={storiesData.data ?? []}
      initialHomepageTestimonials={homepageTestimonialsData.data ?? []}
      initialUsers={usersData.data ?? []}
      initialPartners={partnersData.data ?? []}
    />
  );
}
