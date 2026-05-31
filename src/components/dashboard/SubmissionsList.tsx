"use client";

import { useMemo, useState } from "react";
import { useDashboardSection } from "@/components/dashboard/DashboardSectionProvider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { cn } from "@/lib/utils";
import type { ChallengeSubmission, ChallengeCategory, SubmissionStatus } from "@/types/database";
import { format } from "date-fns";

const pillBtn =
  "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function SubmissionsList({
  submissions,
}: {
  submissions: ChallengeSubmission[];
}) {
  const { goToSection } = useDashboardSection();
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");

  const counts = useMemo(
    () => ({
      all: submissions.length,
      pending: submissions.filter((s) => s.status === "pending").length,
      approved: submissions.filter((s) => s.status === "approved").length,
      rejected: submissions.filter((s) => s.status === "rejected").length,
    }),
    [submissions],
  );

  const filtered =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter submissions">
        {(["all", "pending", "approved", "rejected"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              pillBtn,
              filter === key
                ? "bg-primary text-white"
                : "border border-border bg-surface text-text-muted hover:text-text",
            )}
          >
            {key} ({counts[key]})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((sub) => (
          <Card key={sub.id}>
            <div className="flex items-start gap-4">
              <CategoryIcon category={sub.challenge_category as ChallengeCategory} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{sub.challenge_title}</p>
                  <StatusBadge status={sub.status} />
                </div>
                <p className="text-xs text-text-caption">
                  Submitted {format(new Date(sub.submitted_at), "MMM d, yyyy")}
                </p>
                {sub.status === "rejected" && sub.rejection_reason && (
                  <p className="mt-2 text-xs italic text-text-muted">
                    {sub.rejection_reason}
                  </p>
                )}
                {sub.status === "rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      goToSection("submit", { challengeId: sub.challenge_id })
                    }
                    className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Resubmit
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
