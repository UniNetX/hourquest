import { SectionHeader } from "@/components/marketing/SectionHeader";
import { StatCard } from "@/components/marketing/StatCard";

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export function ImpactStats({
  stats,
}: {
  stats: { hours: number; students: number; challenges: number; partners: number };
}) {
  return (
    <section className="section-alt section-y">
      <div className="section-container">
        <SectionHeader
          eyebrow="Our impact"
          title="Impact by the Numbers"
          subtitle="Students across the country are turning environmental and medical action into verified volunteer hours."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value={formatCount(stats.hours)}
            label="Hours Verified"
            description="Reviewed and approved for college applications"
          />
          <StatCard
            value={formatCount(stats.students)}
            label="Students"
            description="Earning verified hours on HourQuest"
          />
          <StatCard
            value={formatCount(stats.challenges)}
            label="Challenges"
            description="Environmental and medical actions you can complete anywhere"
          />
          <StatCard
            value={formatCount(stats.partners)}
            label="Confirmed Partners"
            description="Organizations approved and featured on HourQuest"
          />
        </div>
      </div>
    </section>
  );
}
