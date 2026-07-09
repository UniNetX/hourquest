import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Meet the Team — HourQuest",
  description: "Meet the team behind HourQuest.",
  path: "/meet-the-team",
});

type TeamMember = {
  name: string;
  role: string;
  initials: string;
};

const coFounders: TeamMember[] = [
  { name: "Mark Tang", role: "Co-Founder", initials: "MT" },
  { name: "Sricharan Karthigeyan", role: "Co-Founder", initials: "SK" },
];

const vicePresidents: TeamMember[] = [
  { name: "Somanch Hippalgaonkar", role: "Vice President", initials: "SH" },
];

const officers: TeamMember[] = [
  { name: "Abhi Varre", role: "Officer", initials: "AV" },
  { name: "Janav Mistry", role: "Officer", initials: "JM" },
  { name: "Sanjeev Sundar", role: "Officer", initials: "SS" },
  { name: "Rutvik Garige", role: "Officer", initials: "RG" },
];

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-xl font-semibold text-primary-dark">
        {member.initials}
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold text-text">
        {member.name}
      </h2>
      <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
    </Card>
  );
}

function TeamSection({
  title,
  members,
  columns = 2,
}: {
  title: string;
  members: TeamMember[];
  columns?: 1 | 2 | 4;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-text">{title}</h2>
      <div
        className={cn(
          "mt-5 grid gap-6",
          columns === 1 && "max-w-sm",
          columns === 2 && "sm:grid-cols-2",
          columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {members.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}

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
        <div className="section-container max-w-4xl space-y-12">
          <TeamSection title="Co-Founders" members={coFounders} columns={2} />
          <TeamSection
            title="Vice Presidents"
            members={vicePresidents}
            columns={2}
          />
          <TeamSection title="Officers" members={officers} columns={4} />
        </div>
      </section>
    </PublicShell>
  );
}
