import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { StatCard } from "@/components/marketing/StatCard";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const profile = supabase
    ? (
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single()
      ).data
    : null;

  return createMetadata({
    title: `${profile?.full_name ?? "Student"} — HourQuest Profile`,
    description: "Verified HourQuest member profile.",
    path: `/profile/${userId}`,
  });
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile || !profile.is_public) notFound();

  const { count: badgeCount } = await supabase
    .from("badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return (
    <PublicShell>
      <PageHero
        eyebrow="Profile"
        title={profile.full_name}
        subtitle={profile.school_name ?? undefined}
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-xl">
          <Card className="mb-6 flex items-center gap-4 bg-primary text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-medium">
              {profile.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-medium">{profile.full_name}</p>
              {profile.school_name && (
                <p className="text-sm text-white/75">{profile.school_name}</p>
              )}
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              value={String(profile.total_verified_hours)}
              label="Verified Hours"
            />
            <StatCard value={String(profile.week_streak)} label="Week Streak" />
            <StatCard value={String(badgeCount ?? 0)} label="Badges" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
