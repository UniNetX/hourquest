import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getPartnerSession } from "@/lib/partner";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Application Not Approved — HourQuest Partner",
  description: "Your partner application was not approved.",
  path: "/partner/rejected",
  noIndex: true,
});

export default async function PartnerRejectedPage() {
  const session = await getPartnerSession();
  if (!session) redirect("/signin?next=/partner/rejected");

  if (session.org.status === "approved") redirect("/partner");
  if (session.org.status === "pending") redirect("/partner/pending");

  return (
    <div className="section-container py-12">
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-xl text-primary-dark">Application not approved</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          We weren&apos;t able to approve {session.org.name} as a partner at this time.
        </p>
        {session.org.rejection_reason && (
          <p className="mt-4 rounded-sm border border-border bg-surface px-4 py-3 text-left text-sm text-text-muted">
            <span className="font-medium text-text">Reason: </span>
            {session.org.rejection_reason}
          </p>
        )}
        <p className="mt-4 text-xs text-text-caption">
          Reach out via the{" "}
          <a href="/partnership" className="text-primary hover:underline">
            partnership page
          </a>{" "}
          if you have questions.
        </p>
      </Card>
    </div>
  );
}
