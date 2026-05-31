import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HomeHero({
  stats,
}: {
  stats: { hours: number; students: number; challenges: number };
}) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden="true">
        <Image
          src="/images/hero-environment.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_38%]"
        />
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__inner section-container">
        <div className="hero__text">
          <h1 id="hero-title" className="font-display">
            Complete Environmental Challenges.
            <br className="hidden sm:block" />
            Earn Verified Volunteer Hours.
          </h1>
          <p className="hero__lede">
            Upload photo proof of real environmental action and earn verified
            volunteer hours for college applications — completely free for every
            student.
          </p>
          <div className="hero__actions">
            <Button href="/challenges" variant="primary" size="lg">
              Start a Challenge
            </Button>
            <Button href="/leaderboard" variant="outlineWhite" size="lg">
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
      <div className="hero__caption section-container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="hero__caption-hint">TerraServe</p>
            <h2 className="hero__caption-title font-display">
              Real action. Verified hours.
            </h2>
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-0 rounded border border-white/20 bg-black/25 backdrop-blur-sm">
            {[
              [`${stats.hours}+`, "Hours Verified"],
              [`${stats.students}+`, "Students"],
              [`${stats.challenges}+`, "Challenges"],
            ].map(([num, label], i) => (
              <div
                key={label}
                className={`px-5 py-3 md:px-6 ${i > 0 ? "border-l border-white/20" : ""}`}
              >
                <div className="text-xl font-semibold text-white md:text-2xl">
                  {num}
                </div>
                <div className="text-xs text-white/75">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
