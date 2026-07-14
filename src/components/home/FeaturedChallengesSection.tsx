import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { Challenge } from "@/types/database";

export function FeaturedChallengesSection({
  challenges,
  startHref,
}: {
  challenges: Challenge[];
  startHref: (id: string) => string;
}) {
  if (challenges.length === 0) return null;

  return (
    <section className="section-alt section-y">
      <div className="section-container">
        <SectionHeader
          eyebrow="Featured"
          title="Featured Challenges"
          subtitle="Environmental and medical challenges to get started — one pick from each track."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={startHref(challenge.id)}
              className="block h-full no-underline"
            >
              <article className="pillar-card h-full">
                <span className="pillar-card__tag capitalize">
                  {challenge.difficulty}
                </span>
                <h3 className="font-display">{challenge.title}</h3>
                <p className="pillar-card__body">{challenge.description}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-primary-dark">
                    {challenge.hours_earned} hrs
                  </span>
                  <span className="pillar-card__link">See challenge →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
