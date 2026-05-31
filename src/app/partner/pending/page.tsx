import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getPartnerSession } from "@/lib/partner";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Application Pending — HourQuest Partner",
  description: "Your partner application is under review.",
  path: "/partner/pending",
  noIndex: true,
});

export default async function PartnerPendingPage() {
  const session = await getPartnerSession();
  if (!session) redirect("/signin?next=/partner/pending");

  if (session.org.status === "approved") redirect("/partner");
  if (session.org.status === "rejected") redirect("/partner/rejected");

  return (
    <div className="section-container py-12">
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-xl text-primary-dark">Application under review</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Thanks for signing up, {session.org.name}. Our team is reviewing your partner
          application. You&apos;ll be able to post partnership challenges once approved.
        </p>
        <p className="mt-4 text-xs text-text-caption">
          Questions? Contact us via the{" "}
          <a href="/partnership" className="text-primary hover:underline">
            partnership page
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
