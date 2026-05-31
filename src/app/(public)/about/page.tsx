import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import {
  IconCertificate,
  IconDeviceMobile,
  IconMapPin,
  IconShieldCheck,
} from "@tabler/icons-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About — TerraServe Challenges",
  description: "Learn about TerraServe Challenges, verified hours, and our mission.",
  path: "/about",
});

const features = [
  {
    title: "Verified Hours",
    description: "Every hour is reviewed and approved — no fake submissions.",
    Icon: IconShieldCheck,
  },
  {
    title: "College-Ready Certificates",
    description: "Download PDF certificates at 10, 25, 50, and 100 hour milestones.",
    Icon: IconCertificate,
  },
  {
    title: "Hyperlocal Impact",
    description: "Challenges you can complete anywhere in your community.",
    Icon: IconMapPin,
  },
  {
    title: "Also on the App",
    description: "Hours from the TerraServe app count toward the same certificates.",
    Icon: IconDeviceMobile,
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <PageHero
        large
        eyebrow="About"
        title="About TerraServe Challenges"
        subtitle="Real environmental action. Verified volunteer hours. Free for every student."
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-4xl">
          <Card>
            <h2 className="text-lg font-medium">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              TerraServe Challenges helps students turn everyday environmental action
              into verified volunteer hours for college applications. Complete real
              challenges, upload photo proof, and earn certificates you can share
              with admissions officers — completely free.
            </p>
          </Card>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map(({ title, description, Icon }) => (
              <FeatureCard
                key={title}
                title={title}
                description={description}
                icon={<Icon size={24} stroke={1.5} />}
              />
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
