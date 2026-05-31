"use client";

import { SchoolCollectionModal } from "@/components/auth/SchoolCollectionModal";
import { DashboardSectionHeader } from "@/components/dashboard/DashboardSectionHeader";
import { useDashboardSection } from "@/components/dashboard/DashboardSectionProvider";
import { StatCard } from "@/components/marketing/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { CertificatesSection } from "@/components/dashboard/CertificatesSection";
import { SubmissionsList } from "@/components/dashboard/SubmissionsList";
import SubmitChallengeClient from "@/app/dashboard/submit/SubmitChallengeClient";
import ProfilePageClient from "@/app/dashboard/profile/ProfilePageClient";
import { getNextMilestone } from "@/lib/challenges/constants";
import type {
  Certificate,
  Challenge,
  ChallengeCategory,
  ChallengeSubmission,
  Profile,
} from "@/types/database";
import { format } from "date-fns";

export function DashboardHub({
  profile,
  recentSubmissions,
  allSubmissions,
  challenges,
  certificates,
  badgeCount,
}: {
  profile: Profile | null;
  recentSubmissions: ChallengeSubmission[];
  allSubmissions: ChallengeSubmission[];
  challenges: Challenge[];
  certificates: Certificate[];
  badgeCount: number;
}) {
  const { section, goToSection } = useDashboardSection();

  const hours = Number(profile?.total_verified_hours ?? 0);
  const nextMilestone = getNextMilestone(hours);
  const approvedCount = allSubmissions.filter((s) => s.status === "approved").length;
  const pendingCount = allSubmissions.filter((s) => s.status === "pending").length;

  return (
    <>
      <SchoolCollectionModal />
      <DashboardSectionHeader section={section} />

      {section === "overview" && (
        <div className="space-y-8">
          {hours === 0 && (
            <Card className="border-primary-mid bg-primary-light/40">
              <h2 className="text-lg font-medium">Welcome to HourQuest</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Pick a challenge from the catalog, complete it in your community, then
                submit photo proof to earn verified hours.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/challenges" variant="secondary">
                  Browse challenges
                </Button>
                <Button type="button" onClick={() => goToSection("submit")}>
                  Submit proof
                </Button>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard value={String(hours)} label="Verified hours" />
            <StatCard value={String(approvedCount)} label="Approved" />
            <StatCard value={String(pendingCount)} label="Pending review" />
            <StatCard value={String(profile?.week_streak ?? 0)} label="Week streak" />
          </div>

          {nextMilestone && (
            <Card className="border-primary-mid bg-primary-light/50">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-medium">
                    Next certificate: {nextMilestone} hours
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {(nextMilestone - hours).toFixed(1)} hours to go
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => goToSection("certificates")}
                >
                  View certificates
                </Button>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (hours / nextMilestone) * 100)}%`,
                  }}
                />
              </div>
            </Card>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-medium">Recent submissions</h2>
              {allSubmissions.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => goToSection("submissions")}
                >
                  View all
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <Card className="text-center text-sm text-text-muted">
                  <p>No submissions yet.</p>
                  <Button
                    type="button"
                    className="mt-4"
                    size="sm"
                    onClick={() => goToSection("submit")}
                  >
                    Submit your first challenge
                  </Button>
                </Card>
              ) : (
                recentSubmissions.map((sub) => (
                  <Card
                    key={sub.id}
                    className="flex items-center gap-4 !p-4"
                  >
                    <CategoryIcon
                      category={sub.challenge_category as ChallengeCategory}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {sub.challenge_title}
                      </p>
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

          {badgeCount > 0 && (
            <p className="text-center text-xs text-text-caption">
              {badgeCount} badge{badgeCount === 1 ? "" : "s"} earned — more coming soon
            </p>
          )}
        </div>
      )}

      {section === "submit" && (
        <div className="mx-auto max-w-xl">
          <SubmitChallengeClient initialChallenges={challenges} />
        </div>
      )}

      {section === "submissions" && (
        <SubmissionsList submissions={allSubmissions} />
      )}

      {section === "certificates" && (
        <CertificatesSection profile={profile} certificates={certificates} />
      )}

      {section === "profile" && (
        <ProfilePageClient initialProfile={profile} embedded />
      )}
    </>
  );
}
