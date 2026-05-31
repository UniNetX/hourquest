import { SectionHeader } from "@/components/marketing/SectionHeader";
import { StatCard } from "@/components/marketing/StatCard";

export function ImpactStats({
  stats,
}: {
  stats: { hours: number; students: number; challenges: number };
}) {
  return (
    <section className="section-alt section-y">
      <div className="section-container">
        <SectionHeader
          eyebrow="Our impact"
          title="Impact by the Numbers"
          subtitle="Students across the country are turning everyday environmental action into verified volunteer hours."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            value={`${stats.hours}+`}
            label="Hours Verified"
            description="Reviewed and approved for college applications"
          />
          <StatCard
            value={`${stats.students}+`}
            label="Students"
            description="Earning verified hours on TerraServe"
          />
          <StatCard
            value={`${stats.challenges}+`}
            label="Challenges"
            description="Environmental actions you can complete anywhere"
          />
        </div>
      </div>
    </section>
  );
}
