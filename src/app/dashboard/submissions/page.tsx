import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmissionsList } from "@/components/dashboard/SubmissionsList";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My Submissions — TerraServe Challenges",
  description: "Track your challenge submission status.",
  path: "/dashboard/submissions",
  noIndex: true,
});

export default async function SubmissionsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/signin");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: submissions } = await supabase
    .from("challenge_submissions")
    .select("*")
    .eq("user_id", user!.id)
    .order("submitted_at", { ascending: false });

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">My Submissions</h2>
      <SubmissionsList submissions={submissions ?? []} />
    </div>
  );
}
