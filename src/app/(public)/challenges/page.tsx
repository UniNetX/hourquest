import { Suspense } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { ChallengeCatalog } from "@/components/challenges/ChallengeCatalog";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Volunteer Challenges — HourQuest",
  description:
    "Browse environmental and medical volunteer challenges and earn verified hours.",
  path: "/challenges",
});

export default async function ChallengesPage() {
  const supabase = await createClient();
  const [{ data: challenges }, userResult] = await Promise.all([
    supabase
      ? supabase
          .from("challenges")
          .select(
            "*, partner_organization:partner_organizations(id, name, logo_url, description)",
          )
          .eq("active", true)
          .order("track")
          .order("category")
          .order("sort_order")
      : Promise.resolve({ data: [] }),
    supabase
      ? supabase.auth.getUser()
      : Promise.resolve({ data: { user: null } }),
  ]);
  const user = userResult.data.user;

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
