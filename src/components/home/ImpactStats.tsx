import { SectionHeader } from "@/components/marketing/SectionHeader";
import { StatCard } from "@/components/marketing/StatCard";
import { displayImpactStats } from "@/lib/challenges/constants";

export function ImpactStats({
  stats,
}: {
  stats: { hours: number; students: number; challenges: number };
}) {
  const display = displayImpactStats(stats);

  return (
    <section className="section-alt section-y">
      <div className="section-container">
        <SectionHeader
          eyebrow="Our impact"
          title="Impact by the Numbers"
          subtitle="Students across the country are turning environmental and medical action into verified volunteer hours."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            value={`${display.hours}+`}
            label="Hours Verified"
            description="Reviewed and approved for college applications"
          />
          <StatCard
            value={`${display.students}+`}
            label="Students"
            description="Earning verified hours on HourQuest"
          />
          <StatCard
            value={`${display.challenges}+`}
            label="Challenges"
            description="Environmental and medical actions you can complete anywhere"
          />
        </div>
      </div>
    </section>
  );
}
