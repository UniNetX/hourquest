import { PublicShell } from "@/components/layout/PublicShell";
import { CtaBand } from "@/components/marketing/CtaBand";
import { DualCtaPanel } from "@/components/marketing/DualCtaPanel";
import { Differentiators } from "@/components/home/Differentiators";
import { FeaturedChallengesSection } from "@/components/home/FeaturedChallengesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TerraServeAppSection } from "@/components/home/TerraServeAppSection";
import { ImpactStats } from "@/components/home/ImpactStats";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { dashboardSubmitHref } from "@/lib/dashboard-nav";
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/database";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title:
    "HourQuest — Earn Verified Volunteer Hours for College Applications",
  description:
    "Complete environmental and medical volunteer challenges, upload photo proof, and earn verified hours with college-ready certificates.",
});

async function getHomeData() {
  const supabase = await createClient();
  const empty = {
    featured: [] as Challenge[],
    stats: { hours: 0, students: 0, challenges: 0 },
    leaderboard: [],
    testimonials: [],
    user: null,
  };

  if (!supabase) {
    return empty;
  }

  const [challengesRes, statsRes, leaderboardRes, userRes] = await Promise.all([
    supabase
      .from("challenges")
      .select("*")
      .eq("active", true)
      .order("sort_order"),
    Promise.all([
      supabase.from("profiles").select("total_verified_hours"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("challenges")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]),
    supabase.from("individual_leaderboard_all_time").select("*").limit(3),
    supabase.auth.getUser(),
  ]);

  const testimonialsRes = await supabase
    .from("homepage_testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(3);

  const hours =
    (statsRes[0].data as { total_verified_hours: number }[] | null)?.reduce(
      (sum, p) => sum + Number(p.total_verified_hours || 0),
      0,
    ) ?? 0;

  const allChallenges = (challengesRes.data ?? []) as Challenge[];
  const trackOf = (c: Challenge) => c.track ?? "environmental";
  const featured: Challenge[] = [];
  for (const track of ["environmental", "medical"] as const) {
    const pick = allChallenges.find(
      (c) => trackOf(c) === track && c.difficulty === "easy",
    );
    if (pick) featured.push(pick);
  }
  if (featured.length < 3) {
    for (const c of allChallenges) {
      if (featured.length >= 3) break;
      if (!featured.find((f) => f.id === c.id)) featured.push(c);
    }
  }

  return {
    featured: featured ?? [],
    stats: {
      hours: Math.floor(hours),
      students: statsRes[1].count ?? 0,
      challenges: statsRes[2].count ?? 0,
    },
    leaderboard: leaderboardRes.data ?? [],
    testimonials: testimonialsRes.data ?? [],
    user: userRes.data.user,
  };
}

export default async function HomePage() {
  const { featured, stats, leaderboard, testimonials, user } = await getHomeData();
  const startHref = (id: string) =>
    user
      ? dashboardSubmitHref(id)
      : `/signin?next=${encodeURIComponent(dashboardSubmitHref(id))}`;

  return (
    <PublicShell>
      <HomeHero />
      <ImpactStats stats={stats} />
      <HowItWorks />
      <TerraServeAppSection />
      <FeaturedChallengesSection challenges={featured} startHref={startHref} />
      <DualCtaPanel
        title="How Can We Help You?"
        subtitle="Whether you want to earn hours or bring HourQuest to your school, we have a path for you."
        left={{
          title: "Start Earning Hours",
          description:
            "Pick environmental or medical challenges, complete real service in your community, and earn verified volunteer hours for college applications.",
          bullets: [
            "Completely free",
            "Photo proof review",
            "College-ready certificates",
            "Do challenges anywhere",
          ],
          ctaLabel: "Browse Challenges",
          ctaHref: "/challenges",
        }}
        right={{
          title: "Partner With Us",
          description:
            "Bring HourQuest to your school or organization and help students earn verified environmental and health service hours.",
          bullets: [
            "School & club partnerships",
            "Bulk student onboarding",
            "Impact reporting",
          ],
          ctaLabel: "Partner With Us",
          ctaHref: "/partnership",
        }}
      />
      <Differentiators />
      <section className="section-y bg-page">
        <div className="section-container">
          <SectionHeader
            eyebrow="Leaderboard"
            title="Top Students"
            subtitle="See who's leading the way in verified environmental and medical service."
          />
          <LeaderboardPreview initialData={leaderboard} />
        </div>
      </section>
      <section className="section-alt section-y">
        <div className="section-container">
          <SectionHeader
            eyebrow="Testimonials"
            title="What Students Are Saying"
            subtitle="Hear from students earning verified environmental and medical service hours with HourQuest."
          />
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>
      <CtaBand
        title="Ready to Get Started?"
        subtitle="Join students earning verified volunteer hours through real environmental and health service."
        primaryLabel="Start a Challenge"
        primaryHref="/challenges"
        secondaryLabel="Create Free Account"
        secondaryHref="/signup"
      />
    </PublicShell>
  );
}
