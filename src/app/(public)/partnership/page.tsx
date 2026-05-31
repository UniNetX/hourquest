import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminEmails } from "@/lib/admin";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Partnership — HourQuest",
  description: "Partner with HourQuest for schools, organizations, and colleges.",
  path: "/partnership",
});

const cards = [
  {
    title: "For Schools & Teachers",
    description:
      "Bring verified environmental and health service hours to your students with a free, turnkey platform.",
    cta: "Apply for School Access",
    subject: "School Access",
  },
  {
    title: "For Organizations",
    description:
      "Partner with HourQuest to connect students with meaningful environmental and medical volunteer opportunities.",
    cta: "Become a Partner Organization",
    subject: "Organization Partnership",
  },
  {
    title: "For Colleges & Universities",
    description:
      "Recognize HourQuest verified hours and certificates as part of your admissions process.",
    cta: "Contact Us",
    subject: "College Partnership",
  },
];

function partnershipMailto(subject: string, adminEmail: string) {
  return `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}`;
}

export default function PartnershipPage() {
  const adminEmail = getAdminEmails()[0] ?? "";

  return (
    <PublicShell>
      <PageHero
        variant="photo"
        imageSrc="/images/hero-environment.jpg"
        eyebrow="Partnership"
        title="Partner With Us"
        subtitle="Work with HourQuest to empower the next generation of student volunteers."
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-2xl space-y-6">
          {cards.map((card) => (
            <Card key={card.title}>
              <h2 className="text-lg font-medium">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {card.description}
              </p>
              <Button
                href={
                  adminEmail
                    ? partnershipMailto(card.subject, adminEmail)
                    : undefined
                }
                className="mt-5"
                disabled={!adminEmail}
              >
                {card.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
