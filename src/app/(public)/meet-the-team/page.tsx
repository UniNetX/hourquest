import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Meet the Team — HourQuest",
  description: "Meet the co-founders behind HourQuest.",
  path: "/meet-the-team",
});

const founders = [
  {
    name: "Mark Tang",
    role: "Co-Founder",
    initials: "MT",
  },
  {
    name: "Sricharan Karthigeyan",
    role: "Co-Founder",
    initials: "SK",
  },
];

export default function MeetTheTeamPage() {
  return (
    <PublicShell>
      <PageHero
        large
        eyebrow="About"
        title="Meet the Team"
        subtitle="The people building HourQuest to help students earn verified volunteer hours."
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {founders.map((founder) => (
              <Card key={founder.name} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-xl font-semibold text-primary-dark">
                  {founder.initials}
                </div>
                <h2 className="mt-5 font-display text-lg font-semibold text-text">
                  {founder.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-primary">
                  {founder.role}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
