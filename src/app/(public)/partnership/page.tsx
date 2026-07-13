import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { PartnerShowcase } from "@/components/partnership/PartnerShowcase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminEmails } from "@/lib/admin";
import { createMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { PartnerOrganization } from "@/types/database";

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

async function loadApprovedPartners(): Promise<
  Pick<PartnerOrganization, "id" | "name" | "description" | "website" | "logo_url">[]
> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("partner_organizations")
    .select("id, name, description, website, logo_url")
    .eq("status", "approved")
    .order("name");

  return data ?? [];
}

export default async function PartnershipPage() {
  const adminEmail = getAdminEmails()[0] ?? "";
  const partners = await loadApprovedPartners();

  return (
    <PublicShell>
      <PageHero
        variant="photo"
        imageSrc="/images/hero-environment.jpg"
        eyebrow="Partnership"
        title="Partner With Us"
        subtitle="Work with HourQuest to empower the next generation of student volunteers."
      />
      <PartnerShowcase partners={partners} />
      <section className="section-y bg-page">
        <div className="section-container max-w-2xl space-y-6">
          {cards.map((card) => (
            <Card key={card.title}>
              <h2 className="text-lg font-medium">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {card.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {card.title === "For Organizations" && (
                  <Button href="/signup?type=partner" variant="primary">
                    Create partner account
                  </Button>
                )}
                <Button
                  href={
                    adminEmail
                      ? partnershipMailto(card.subject, adminEmail)
                      : undefined
                  }
                  variant={card.title === "For Organizations" ? "secondary" : "primary"}
                  disabled={!adminEmail}
                >
                  {card.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
