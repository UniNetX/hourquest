import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "TerraServe iOS App — HourQuest",
  description:
    "Learn about the TerraServe iOS app for local volunteer events and GPS check-in alongside HourQuest challenges.",
  path: "/terraserve-app",
});

const highlights = [
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
    title: "Shared verified hours",
    description:
      "Service tracked in TerraServe rolls into the same milestone certificates you earn on HourQuest.",
  },
  {
    title: "Works with HourQuest",
    description:
      "Complete web challenges here; use TerraServe when you want on-the-go local opportunities.",
  },
];

export default function TerraServeAppPage() {
  return (
    <PublicShell>
      <section className="section-y bg-page">
        <div className="section-container max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/terraserve-app-logo.png"
              alt="TerraServe app icon"
              width={120}
              height={120}
              className="rounded-[26px] shadow-card-hover"
              priority
            />
            <h1 className="font-display mt-8 text-3xl font-semibold tracking-tight text-primary-dark sm:text-4xl">
              TerraServe for iOS
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              TerraServe is the mobile app for HourQuest. It connects students
              with hyperlocal volunteer organizations, event listings, and GPS
              check-in — while HourQuest focuses on verified environmental and
              medical challenges with photo proof on the web.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <Card key={item.title}>
                <h2 className="text-base font-semibold text-primary-dark">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <h2 className="text-lg font-semibold text-primary-dark">
              One account, one impact record
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Whether you complete a beach cleanup challenge on HourQuest or check
              in at a food bank through TerraServe, your verified hours build toward
              the same profile and certificate milestones. TerraServe is built for
              discovery and attendance on iOS; HourQuest is built for structured
              challenges and proof review in the browser.
            </p>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
