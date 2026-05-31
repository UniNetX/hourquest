import { PillarCard } from "@/components/marketing/PillarCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CHALLENGE_CATEGORIES } from "@/lib/challenges/constants";

export function ChallengeCategoriesSection() {
  return (
    <section className="section-y bg-page">
      <div className="section-container">
        <SectionHeader
          eyebrow="Browse"
          title="Challenge Categories"
          subtitle="Find environmental actions that match your interests and location."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGE_CATEGORIES.map((cat) => (
            <PillarCard
              key={cat.id}
              tag="Category"
              title={cat.label}
              description={`Explore ${cat.label.toLowerCase()} challenges and start earning verified hours.`}
              href={`/challenges?category=${cat.id}`}
              linkLabel="Browse category →"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
