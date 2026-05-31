import { createClient } from "@/lib/supabase/server";
import { SchoolCollectionModal } from "@/components/auth/SchoolCollectionModal";
import { StatCard } from "@/components/marketing/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { getNextMilestone } from "@/lib/challenges/constants";
import type { ChallengeCategory } from "@/types/database";
import { createMetadata } from "@/lib/seo";
import { format } from "date-fns";

export const metadata = createMetadata({
  title: "Dashboard — TerraServe Challenges",
  description: "Your TerraServe Challenges dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: submissions }, { count: badgeCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase
        .from("challenge_submissions")
        .select("*")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false })
        .limit(3),
      supabase
        .from("badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  const approvedCount =
    submissions?.filter((s) => s.status === "approved").length ?? 0;
  const hours = Number(profile?.total_verified_hours ?? 0);
  const nextMilestone = getNextMilestone(hours);

  return (
    <>
      <SchoolCollectionModal />
      <div className="space-y-8">
        {hours === 0 && (
          <Card className="border-primary-mid bg-primary-light/40">
            <h2 className="text-lg font-medium">Welcome to TerraServe Challenges!</h2>
            <p className="mt-2 text-sm text-text-muted">
              Complete your first challenge to start earning verified hours.
            </p>
            <Button href="/challenges" className="mt-4">
              Start a Challenge
            </Button>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value={String(hours)} label="Verified Hours" />
          <StatCard value={String(approvedCount)} label="Challenges Done" />
          <StatCard value={String(profile?.week_streak ?? 0)} label="Week Streak" />
          <StatCard value={String(badgeCount ?? 0)} label="Badges Earned" />
        </div>

        {nextMilestone && (
          <Card className="border-primary-mid bg-primary-light/50">
            <h3 className="text-base font-medium">
              Progress to {nextMilestone} Hour Certificate
            </h3>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (hours / nextMilestone) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-text-muted">
              {(nextMilestone - hours).toFixed(1)} hours remaining
            </p>
          </Card>
        )}

        <div>
          <h2 className="mb-4 text-lg font-medium">Recent Submissions</h2>
          <div className="space-y-3">
            {(submissions ?? []).length === 0 ? (
              <Card className="text-sm text-text-muted">No submissions yet.</Card>
            ) : (
              submissions?.map((sub) => (
                <Card key={sub.id} className="flex items-center gap-4">
                  <CategoryIcon
                    category={sub.challenge_category as ChallengeCategory}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{sub.challenge_title}</p>
                    <p className="text-xs text-text-caption">
                      {format(new Date(sub.submitted_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
