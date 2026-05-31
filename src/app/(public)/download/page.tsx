import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Download App — HourQuest",
  description: "Download the HourQuest mobile app for local volunteer opportunities and GPS check-in.",
  path: "/download",
});

const features = [
  ["Hyperlocal Filter", "Find volunteer events near your ZIP code."],
  ["GPS Check-In", "Verify attendance at event locations."],
  ["Verified Organizations", "Trusted local orgs and opportunities."],
  ["Same Certificates", "Hours count toward shared milestone certificates."],
];

export default function DownloadPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Mobile app"
        title="Download the HourQuest App"
        subtitle="Volunteer locally and earn verified hours toward the same certificates."
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-4xl space-y-8">
          <Card className="site-surface-primary flex flex-col gap-6 border-0 p-8 md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                HourQuest for iOS & Android
              </h2>
              <p className="text-muted-on-primary mt-3 text-sm leading-relaxed">
                Discover volunteer opportunities, check in at events, and track verified
                service hours — all counting toward your HourQuest certificates.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="#" variant="outlineWhite">
                  App Store
                </Button>
                <Button href="#" variant="outlineWhite">
                  Google Play
                </Button>
              </div>
            </div>
            <div
              className="mx-auto h-56 w-44 shrink-0 rounded-2xl border border-white/20 bg-white/10"
              aria-hidden
            />
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(([title, desc]) => (
              <Card key={title}>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
