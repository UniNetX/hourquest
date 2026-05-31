import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HomeHero({ submitHref }: { submitHref?: string }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden="true">
        <Image
          src="/images/hero-community.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__inner section-container">
        <div className="hero__text">
          <h1 id="hero-title" className="font-display">
            Complete Volunteer Challenges.
            <br className="hidden sm:block" />
            Earn Verified Hours.
          </h1>
        </div>
      </div>
      <div className="hero__actions-bar section-container">
        <div className="hero__actions">
          <Button href="/challenges" variant="cta" size="lg" className="w-full sm:w-auto">
            Start a Challenge
          </Button>
          {submitHref && (
            <Button href={submitHref} variant="outlineWhite" size="lg" className="w-full sm:w-auto">
              Submit
            </Button>
          )}
          <Button href="/leaderboard" variant="outlineWhite" size="lg" className="w-full sm:w-auto">
            View Leaderboard
          </Button>
        </div>
      </div>
      <div className="hero__caption section-container">
        <div className="flex flex-col items-start justify-start text-left">
          <p className="hero__caption-hint">HourQuest</p>
          <h2 className="hero__caption-title font-display">
            Real action. Verified hours.
          </h2>
        </div>
      </div>
    </section>
  );
}
