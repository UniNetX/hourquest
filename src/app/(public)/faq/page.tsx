import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "FAQ — TerraServe Challenges",
  description: "Frequently asked questions about TerraServe Challenges and verified volunteer hours.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about TerraServe Challenges."
      />
      <section className="section-y bg-page">
        <div className="section-container">
          <FaqAccordion />
        </div>
      </section>
    </PublicShell>
  );
}
