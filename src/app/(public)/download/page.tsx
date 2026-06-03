import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Download TerraServe — HourQuest",
  description:
    "Download TerraServe for iOS to discover local volunteer events, check in with GPS, and track verified service hours alongside HourQuest.",
  path: "/download",
});

const features = [
  {
    title: "Local volunteer discovery",
    description:
      "Browse organizations and events near you, filtered by location and interests.",
  },
  {
    title: "GPS check-in",
    description:
      "Confirm attendance at in-person volunteer events with location verification.",
  },
  {
    title: "Verified organizations",
    description: "Trusted local orgs and hyperlocal volunteer opportunities.",
  },
  {
    title: "Shared verified hours",
    description:
      "Service tracked in TerraServe rolls into the same milestone certificates you earn on HourQuest.",
  },
];

export default function DownloadPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Mobile app"
        title="Download TerraServe"
        subtitle="The iOS app for local volunteer events, GPS check-in, and verified service hours — alongside HourQuest challenges."
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-4xl space-y-8">
          <Card className="site-surface-primary flex flex-col gap-6 border-0 p-8 md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                TerraServe for iOS
              </h2>
              <p className="text-muted-on-primary mt-3 text-sm leading-relaxed">
                TerraServe connects students with hyperlocal volunteer
                organizations, event listings, and GPS check-in. Hours logged
                through TerraServe count toward the same verified certificates
                you earn on HourQuest.
              </p>
              <div className="mt-6">
                <Button href="#" variant="outlineWhite">
                  Download on the App Store
                </Button>
              </div>
            </div>
            <Image
              src="/images/terraserve-app-logo.png"
              alt="TerraServe app icon"
              width={176}
              height={176}
              className="mx-auto shrink-0 rounded-[26px] shadow-card-hover"
            />
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ title, description }) => (
              <Card key={title}>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
