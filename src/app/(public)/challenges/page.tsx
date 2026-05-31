import { Suspense } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { ChallengeCatalog } from "@/components/challenges/ChallengeCatalog";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Environmental Volunteer Challenges — TerraServe Challenges",
  description: "Browse 30+ environmental volunteer challenges and earn verified hours.",
  path: "/challenges",
});

export default async function ChallengesPage() {
  const supabase = await createClient();
  const [{ data: challenges }, { data: { user } }] = await Promise.all([
    supabase
      .from("challenges")
      .select("*")
      .eq("active", true)
      .order("category")
      .order("sort_order"),
    supabase.auth.getUser(),
  ]);

  return (
    <PublicShell>
      <Suspense>
        <ChallengeCatalog
          initialChallenges={challenges ?? []}
          isLoggedIn={!!user}
        />
      </Suspense>
    </PublicShell>
  );
}
