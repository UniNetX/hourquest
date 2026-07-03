import {
  IconCertificate,
  IconDeviceMobile,
  IconMapPin,
  IconShieldCheck,
} from "@tabler/icons-react";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";

const features = [
  {
    tag: "Trust",
    title: "Verified Hours",
    description:
      "Every hour is reviewed and approved — no fake submissions.",
    Icon: IconShieldCheck,
  },
  {
    tag: "Credentials",
    title: "College-Ready Certificates",
    description:
      "Download PDF certificates at 10, 25, 50, and 100 hour milestones.",
    Icon: IconCertificate,
  },
  {
    tag: "Local",
    title: "Hyperlocal Impact",
    description: "Challenges you can complete anywhere in your community.",
    Icon: IconMapPin,
  },
  {
    tag: "Platform",
    title: "Also on the App",
    description:
      "Hours from the TerraServe app count toward the same certificates.",
    Icon: IconDeviceMobile,
  },
];

export function Differentiators() {
  return (
    <section className="section-y bg-page">
      <div className="section-container">
        <SectionHeader
          eyebrow="Why HourQuest"
          title="What Makes Us Different"
          subtitle="Real environmental and health service with credentials admissions officers trust."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ tag, title, description, Icon }) => (
            <FeatureCard
              key={title}
              tag={tag}
              title={title}
              description={description}
              icon={<Icon size={22} stroke={1.5} />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
