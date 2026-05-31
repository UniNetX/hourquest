import { Resend } from "resend";
import { SITE_URL } from "@/lib/seo";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type EmailType =
  | "submission_approved"
  | "submission_rejected"
  | "certificate_unlocked"
  | "welcome"
  | "admin_new_submission";

export async function sendChallengeEmail({
  to,
  type,
  data,
}: {
  to: string;
  type: EmailType;
  data: Record<string, string | number | undefined>;
}) {
  if (!resend) {
    console.log(`[email stub] ${type} -> ${to}`, data);
    return;
  }

  const templates: Record<EmailType, { subject: string; html: string }> = {
    submission_approved: {
      subject: "Your hours have been verified!",
      html: `<p>Hi ${data.studentName},</p><p>Your submission for <strong>${data.challengeTitle}</strong> was approved. You earned <strong>${data.hoursEarned}</strong> hours.</p><p>New total: ${data.totalHours} hours.</p><p><a href="${SITE_URL}/dashboard/certificates">View certificates</a></p>`,
    },
    submission_rejected: {
      subject: "Feedback on your TerraServe submission",
      html: `<p>Your submission for <strong>${data.challengeTitle}</strong> needs improvement.</p><p>Reason: ${data.rejectionReason}</p><p><a href="${SITE_URL}/dashboard/submit">Resubmit</a></p>`,
    },
    certificate_unlocked: {
      subject: `You've earned your ${data.milestone} Hour Certificate!`,
      html: `<p>Congratulations! You've unlocked your ${data.milestone} hour certificate.</p><p><a href="${SITE_URL}/dashboard/certificates">Download your certificate</a></p>`,
    },
    welcome: {
      subject: "Welcome to TerraServe Challenges!",
      html: `<p>Welcome to TerraServe Challenges!</p><p><a href="${SITE_URL}/challenges">Browse challenges</a> to start earning verified hours.</p>`,
    },
    admin_new_submission: {
      subject: "New challenge submission pending review",
      html: `<p>A new submission is waiting for review: <strong>${data.challengeTitle}</strong></p><p><a href="${SITE_URL}/admin">Review in admin</a></p>`,
    },
  };

  const template = templates[type];
  await resend.emails.send({
    from: "TerraServe Challenges <notifications@terraserve.org>",
    to,
    subject: template.subject,
    html: template.html,
  });
}
