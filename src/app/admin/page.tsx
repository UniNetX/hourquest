import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isChallengesAdmin } from "@/lib/admin";
import {
  getSupabaseProjectRef,
  loadPartnerOrganizationsForAdmin,
  partnerSetupErrorMessage,
} from "@/lib/partner-admin";
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

  if (!user || !(await isChallengesAdmin(supabase))) {
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
    partnersResult,
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
      .select(
        "*, profiles(full_name, school_name), challenges(description, proof_instructions, difficulty, hours_earned, points)",
      )
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
    loadPartnerOrganizationsForAdmin(),
  ]);

  const hours =
    profilesRes.data?.reduce(
      (sum, p) => sum + Number(p.total_verified_hours || 0),
      0,
    ) ?? 0;

  const projectRef = getSupabaseProjectRef();

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
      initialPartners={partnersResult.data}
      initialPartnersError={partnerSetupErrorMessage(partnersResult.error, projectRef)}
      supabaseProjectRef={projectRef}
    />
  );
}
