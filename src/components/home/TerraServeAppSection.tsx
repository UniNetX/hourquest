import Image from "next/image";
import { SectionHeader } from "@/components/marketing/SectionHeader";

export function TerraServeAppSection() {
  return (
    <section className="section-y bg-surface border-y border-border" aria-labelledby="terraserve-app-heading">
      <div className="section-container">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Image
            src="/images/terraserve-app-logo.png"
            alt="TerraServe app icon"
            width={88}
            height={88}
            className="mb-6 rounded-[22px] shadow-card"
          />
          <SectionHeader
            align="center"
            title="TerraServe for iOS"
            subtitle="The TerraServe mobile app helps you discover local volunteer events, check in with GPS, and track service in your community — alongside the challenges you complete on HourQuest."
          />
          <p id="terraserve-app-heading" className="sr-only">
            TerraServe for iOS
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            Hours logged through TerraServe count toward the same verified certificates
            you earn here. Use HourQuest for photo-based environmental and medical
            challenges; use TerraServe when you want hyperlocal org listings and
            event check-ins on your phone.
          </p>
        </div>
      </div>
    </section>
  );
}
