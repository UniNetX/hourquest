import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import type { Challenge } from "@/types/database";

export function ChallengeCard({
  challenge,
  startHref,
  preview,
}: {
  challenge: Challenge;
  startHref: string;
  preview?: boolean;
}) {
  return (
    <article className="pillar-card flex h-full flex-col">
      <DifficultyBadge difficulty={challenge.difficulty} compact />
      <h3 className="mt-3 font-display">{challenge.title}</h3>
      <p className="line-clamp-3 flex-1">{challenge.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs font-semibold text-primary-dark">
          {challenge.hours_earned} hrs
        </span>
        {preview ? (
          <span
            className="cursor-not-allowed text-sm text-text-caption"
            title="Preview only"
          >
            Start
          </span>
        ) : (
          <Button href={startHref} variant="primary" size="sm">
            Start
          </Button>
        )}
      </div>
    </article>
  );
}
