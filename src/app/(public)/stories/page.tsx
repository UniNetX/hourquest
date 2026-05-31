import { PublicShell } from "@/components/layout/PublicShell";
import { PageHero } from "@/components/layout/PageHero";
import { StoriesPageClient } from "@/components/stories/StoriesPageClient";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Student Stories — HourQuest",
  description: "Read reviews from students who earned verified volunteer hours with HourQuest.",
  path: "/stories",
});

export default async function StoriesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <PublicShell>
        <PageHero
          eyebrow="Stories"
          title="Student Stories"
          subtitle="Real reviews from students earning verified environmental and medical volunteer hours."
        />
        <StoriesPageClient stories={[]} canReview={false} />
      </PublicShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stories } = await supabase
    .from("student_stories")
    .select("*")
    .eq("approved", true)
    .order("submitted_at", { ascending: false });

  const enriched = await Promise.all(
    (stories ?? []).map(async (story) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, school_name")
        .eq("id", story.user_id)
        .single();
      return {
        ...story,
        authorName: profile?.full_name,
        authorSchool: profile?.school_name,
      };
    }),
  );

  let canReview = false;
  if (user) {
    const { count } = await supabase
      .from("challenge_submissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "approved");
    canReview = (count ?? 0) > 0;
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Stories"
        title="Student Stories"
        subtitle="Real reviews from students earning verified environmental and medical volunteer hours."
      />
      <StoriesPageClient stories={enriched} canReview={canReview} />
    </PublicShell>
  );
}
