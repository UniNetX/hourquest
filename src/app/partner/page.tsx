import { redirect } from "next/navigation";
import { PartnerDashboard } from "@/components/partner/PartnerDashboard";
import { getPartnerSession } from "@/lib/partner";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Partner Portal — HourQuest",
  description: "Manage partnership volunteer challenges for your organization.",
  path: "/partner",
  noIndex: true,
});

export default async function PartnerPage() {
  const session = await getPartnerSession();
  if (!session) redirect("/signin?next=/partner");

  if (session.org.status === "pending") redirect("/partner/pending");
  if (session.org.status === "rejected") redirect("/partner/rejected");

  const { data: challenges } = await session.supabase
    .from("challenges")
    .select("*")
    .eq("partner_org_id", session.org.id)
    .eq("track", "partnership")
    .order("category")
    .order("sort_order");

  return (
    <PartnerDashboard org={session.org} initialChallenges={challenges ?? []} />
  );
}
