"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { getCategoryMeta } from "@/lib/challenges/constants";
import { createClient } from "@/lib/supabase/client";
import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeSubmission,
} from "@/types/database";

export type SubmissionForReview = ChallengeSubmission & {
  profiles?: { full_name: string; school_name: string | null } | null;
  challenges?: {
    description: string;
    proof_instructions: string | null;
    difficulty: ChallengeDifficulty;
    hours_earned: number;
    points: number;
  } | null;
};

export function AdminSubmissionReviewCard({
  submission,
  onApprove,
  onReject,
}: {
  submission: SubmissionForReview;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(
    (submission.photo_paths?.length ?? 0) > 0,
  );

  const studentName = submission.profiles?.full_name?.trim() || "Unknown student";
  const school = submission.profiles?.school_name?.trim();
  const category = submission.challenge_category as ChallengeCategory;
  const categoryMeta = getCategoryMeta(category);
  const challenge = submission.challenges;

  useEffect(() => {
    const paths = submission.photo_paths ?? [];
    if (paths.length === 0) {
      setPhotosLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPhotos() {
      setPhotosLoading(true);
      try {
        const supabase = createClient();
        const urls = await Promise.all(
          paths.map(async (path) => {
            const { data, error } = await supabase.storage
              .from("challenge-proofs")
              .createSignedUrl(path, 3600);
            if (error || !data?.signedUrl) return null;
            return data.signedUrl;
          }),
        );
        if (!cancelled) {
          setPhotoUrls(urls.filter((url): url is string => Boolean(url)));
        }
      } catch {
        if (!cancelled) setPhotoUrls([]);
      } finally {
        if (!cancelled) setPhotosLoading(false);
      }
    }

    void loadPhotos();

    return () => {
      cancelled = true;
    };
  }, [submission.photo_paths]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <CategoryIcon category={category} />
          <div className="min-w-0">
            <p className="text-base font-semibold text-text">{submission.challenge_title}</p>
            <p className="mt-1 text-sm text-text-muted">
              <span className="font-medium text-text">{studentName}</span>
              {school ? ` · ${school}` : ""}
            </p>
            <p className="mt-1 text-xs text-text-caption">
              {categoryMeta.label} · Completed{" "}
              {format(new Date(submission.date_completed), "MMM d, yyyy")} · Submitted{" "}
              {format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
            {challenge && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={challenge.difficulty} compact />
                <span className="text-xs text-text-caption">
                  {challenge.hours_earned} hrs · {challenge.points} pts if approved
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button className="px-3 py-1.5 text-sm" onClick={() => onApprove(submission.id)}>
            Approve
          </Button>
          <Button
            variant="danger"
            className="px-3 py-1.5 text-sm"
            onClick={() => onReject(submission.id)}
          >
            Reject
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {challenge?.description && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
              Challenge description
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>
        )}

        {challenge?.proof_instructions && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
              Proof instructions
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
              {challenge.proof_instructions}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
            Student notes
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
            {submission.description?.trim() || "No additional notes provided."}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
            Photo proof ({submission.photo_paths?.length ?? 0})
          </p>
          {photosLoading ? (
            <p className="mt-2 text-sm text-text-muted">Loading photos…</p>
          ) : photoUrls.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No photos available to display.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photoUrls.map((url, index) => (
                <a
                  key={`${submission.id}-photo-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-border bg-page"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Proof photo ${index + 1} for ${submission.challenge_title}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    Open full size
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
