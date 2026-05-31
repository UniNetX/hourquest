import { IconLock } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CERTIFICATE_MILESTONES, getNextMilestone } from "@/lib/challenges/constants";
import { createMetadata } from "@/lib/seo";
import { format } from "date-fns";

export const metadata = createMetadata({
  title: "My Certificates — TerraServe Challenges",
  description: "Download your verified volunteer hour certificates.",
  path: "/dashboard/certificates",
  noIndex: true,
});

export default async function CertificatesPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user!.id)
      .order("milestone"),
  ]);

  const hours = Number(profile?.total_verified_hours ?? 0);
  const nextMilestone = getNextMilestone(hours);
  const earnedMilestones = new Set(certificates?.map((c) => c.milestone) ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h2 className="text-lg font-medium">My Certificates</h2>

      <Card className="bg-primary text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 text-xl font-medium">
            {hours}
          </div>
          <div className="flex-1">
            <p className="text-base font-medium">Verified Hours</p>
            {nextMilestone && (
              <>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-white transition-all"
                    style={{
                      width: `${Math.min(100, (hours / nextMilestone) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/75">
                  {(nextMilestone - hours).toFixed(1)} hrs to {nextMilestone} hr certificate
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      <section>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-text-muted">
          Earned
        </h3>
        <div className="space-y-3">
          {(certificates ?? []).map((cert) => (
            <Card key={cert.id}>
              <p className="text-base font-medium">{cert.milestone} Hour Certificate</p>
              <p className="text-xs text-text-caption">
                Earned {format(new Date(cert.created_at), "MMM d, yyyy")}
              </p>
              {cert.pdf_url && (
                <Button href={cert.pdf_url} className="mt-4" variant="secondary">
                  Download PDF
                </Button>
              )}
            </Card>
          ))}
          {certificates?.length === 0 && (
            <Card className="text-sm text-text-muted">
              Complete more challenges to unlock certificates.
            </Card>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-text-muted">
          Locked
        </h3>
        <div className="space-y-3">
          {CERTIFICATE_MILESTONES.filter((m) => !earnedMilestones.has(m)).map(
            (milestone) => (
              <Card key={milestone} className="opacity-60">
                <div className="flex items-center gap-2">
                  <IconLock size={18} className="text-text-muted" />
                  <p className="text-base font-medium">{milestone} Hour Certificate</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (hours / milestone) * 100)}%`,
                    }}
                  />
                </div>
              </Card>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
