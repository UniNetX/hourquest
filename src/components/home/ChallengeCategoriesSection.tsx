import { PillarCard } from "@/components/marketing/PillarCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  CHALLENGE_TRACKS,
  getCategoriesForTrack,
} from "@/lib/challenges/constants";

export function ChallengeCategoriesSection() {
  return (
    <section className="section-y bg-page">
      <div className="section-container">
        <SectionHeader
          eyebrow="Browse"
          title="Challenge Categories"
          subtitle="Find environmental and medical actions that match your interests and location."
        />
        <div className="flex flex-col gap-12">
          {CHALLENGE_TRACKS.map((track) => (
            <div key={track.id}>
              <h3 className="mb-4 font-display text-xl font-semibold text-primary-dark">
                {track.label}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getCategoriesForTrack(track.id).map((cat) => (
                  <PillarCard
                    key={cat.id}
                    tag="Category"
                    title={cat.label}
                    description={`Explore ${cat.label.toLowerCase()} challenges and start earning verified hours.`}
                    href={`/challenges?track=${track.id}&category=${cat.id}`}
                    linkLabel="Browse category →"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
