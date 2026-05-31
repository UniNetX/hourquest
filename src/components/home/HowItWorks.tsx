import { SectionHeader } from "@/components/marketing/SectionHeader";
import { StepCard } from "@/components/marketing/StepCard";

const steps = [
  {
    step: "1",
    title: "Pick a Challenge",
    description: "Browse categories and choose an action that fits your schedule.",
  },
  {
    step: "2",
    title: "Complete It",
    description: "Complete the challenge in your community — environmental action, health education, and more.",
  },
  {
    step: "3",
    title: "Upload Proof",
    description: "Submit a photo showing you completed the challenge.",
  },
  {
    step: "4",
    title: "Earn Hours",
    description: "Get verified hours and certificates for college applications.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-y bg-page">
      <div className="section-container">
        <SectionHeader
          eyebrow="How it works"
          title="Getting Started Is Simple"
          subtitle="Four steps from challenge to verified volunteer hours."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <StepCard key={s.step} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
