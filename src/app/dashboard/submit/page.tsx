import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubmitChallengeClient from "./SubmitChallengeClient";

export default async function SubmitChallengePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/signin");

  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("sort_order");

  return (
    <Suspense>
      <SubmitChallengeClient initialChallenges={challenges ?? []} />
    </Suspense>
  );
}
