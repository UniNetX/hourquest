import { PublicShell } from "@/components/layout/PublicShell";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Leaderboard — HourQuest",
  description: "See top students and schools by verified volunteer hours.",
  path: "/leaderboard",
});

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const [individualRes, schoolsRes] = supabase
    ? await Promise.all([
        supabase.from("individual_leaderboard_all_time").select("*").limit(50),
        supabase
          .from("school_leaderboard")
          .select("*")
          .order("total_hours", { ascending: false })
          .order("school_name", { ascending: true })
          .limit(50),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <PublicShell>
      <LeaderboardView
        initialIndividual={individualRes.data ?? []}
        initialSchools={schoolsRes.data ?? []}
      />
    </PublicShell>
  );
}
