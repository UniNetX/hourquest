import { PublicShell } from "@/components/layout/PublicShell";
import { CtaBand } from "@/components/marketing/CtaBand";
import { DualCtaPanel } from "@/components/marketing/DualCtaPanel";
import { Marquee } from "@/components/marketing/Marquee";
import { ChallengeCategoriesSection } from "@/components/home/ChallengeCategoriesSection";
import { Differentiators } from "@/components/home/Differentiators";
import { FeaturedChallengesSection } from "@/components/home/FeaturedChallengesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ImpactStats } from "@/components/home/ImpactStats";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/database";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title:
    "TerraServe Challenges — Earn Verified Volunteer Hours for College Applications",
  description:
    "Complete environmental challenges, upload photo proof, and earn verified volunteer hours with college-ready certificates.",
});

async function getHomeData() {
  const supabase = await createClient();
  const empty = {
    featured: [] as Challenge[],
    stats: { hours: 0, students: 0, challenges: 30 },
    leaderboard: [],
    stories: [],
    schools: [] as string[],
    user: null,
  };

  if (!supabase) {
    return empty;
  }

  const [challengesRes, statsRes, leaderboardRes, storiesRes, userRes, schoolsRes] =
    await Promise.all([
      supabase
        .from("challenges")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      Promise.all([
        supabase.from("profiles").select("total_verified_hours"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("challenges").select("id", { count: "exact", head: true }),
      ]),
      supabase.from("individual_leaderboard_all_time").select("*").limit(3),
      supabase
        .from("student_stories")
        .select("*, profiles(full_name, school_name)")
        .eq("approved", true)
        .order("submitted_at", { ascending: false })
        .limit(6),
      supabase.auth.getUser(),
      supabase
        .from("profiles")
        .select("school_name")
        .not("school_name", "is", null)
        .limit(50),
    ]);

  const hours =
    (statsRes[0].data as { total_verified_hours: number }[] | null)?.reduce(
      (sum, p) => sum + Number(p.total_verified_hours || 0),
      0,
    ) ?? 0;

  const allChallenges = (challengesRes.data ?? []) as Challenge[];
  const featured = allChallenges
    .filter((c) => ["easy", "medium", "hard"].includes(c.difficulty))
    .reduce((acc, c) => {
      if (!acc.find((x) => x.difficulty === c.difficulty)) acc.push(c);
      return acc;
    }, [] as Challenge[])
    .slice(0, 3);

  const schoolNames = [
    ...new Set(
      (schoolsRes.data ?? [])
        .map((p) => p.school_name?.trim())
        .filter((s): s is string => Boolean(s)),
    ),
  ].slice(0, 30);

  return {
    featured: featured ?? [],
    stats: {
      hours: Math.floor(hours),
      students: statsRes[1].count ?? 0,
      challenges: statsRes[2].count ?? 30,
    },
    leaderboard: leaderboardRes.data ?? [],
    stories: storiesRes.data ?? [],
    schools: schoolNames,
    user: userRes.data.user,
  };
}

export default async function HomePage() {
  const { featured, stats, leaderboard, stories, schools, user } =
    await getHomeData();
  const startHref = (id: string) =>
    user
      ? `/dashboard/submit?challengeId=${id}`
      : `/signin?next=${encodeURIComponent(`/dashboard/submit?challengeId=${id}`)}`;

  return (
    <PublicShell>
      <HomeHero stats={stats} />
      {schools.length > 0 && <Marquee items={schools} />}
      <ImpactStats stats={stats} />
      <HowItWorks />
      <ChallengeCategoriesSection />
      <FeaturedChallengesSection challenges={featured} startHref={startHref} />
      <DualCtaPanel
        title="How Can We Help You?"
        subtitle="Whether you want to earn hours or bring TerraServe to your school, we have a path for you."
        left={{
          title: "Start Earning Hours",
          description:
            "Pick a challenge, complete real environmental action, and earn verified volunteer hours for college applications.",
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
            "Bring TerraServe Challenges to your school or organization and help students earn verified environmental service hours.",
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
            subtitle="See who's leading the way in verified environmental action."
          />
          <LeaderboardPreview initialData={leaderboard} />
        </div>
      </section>
      {stories.length > 0 && (
        <section className="section-alt section-y">
          <div className="section-container">
            <SectionHeader
              eyebrow="Stories"
              title="What Students Are Saying"
              subtitle="Hear from students who have earned verified hours with TerraServe."
            />
            <ReviewCarousel stories={stories as never[]} />
          </div>
        </section>
      )}
      <CtaBand
        title="Ready to Get Started?"
        subtitle="Join students earning verified volunteer hours through real environmental action."
        primaryLabel="Start a Challenge"
        primaryHref="/challenges"
        secondaryLabel="Create Free Account"
        secondaryHref="/signup"
      />
    </PublicShell>
  );
}
