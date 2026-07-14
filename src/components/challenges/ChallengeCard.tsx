import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ProofInstructions } from "@/components/challenges/ProofInstructions";
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
  const org = challenge.partner_organization;

  return (
    <article className="pillar-card flex h-full flex-col">
      {org && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-caption">
          {org.logo_url ? (
            <span className="inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={org.logo_url}
                alt=""
                className="h-5 w-5 rounded-full object-cover"
              />
              {org.name}
            </span>
          ) : (
            org.name
          )}
        </p>
      )}
      <DifficultyBadge difficulty={challenge.difficulty} compact />
      <h3 className="mt-3 font-display">{challenge.title}</h3>
      <div className="min-h-0 flex-1">
        <p className="pillar-card__body">{challenge.description}</p>
      </div>
      {challenge.proof_instructions && (
        <ProofInstructions text={challenge.proof_instructions} compact />
      )}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
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
