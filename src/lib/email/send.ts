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
  | "admin_new_submission"
  | "admin_new_partner_signup"
  | "partner_approved"
  | "partner_rejected";

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
      subject: "Feedback on your HourQuest submission",
      html: `<p>Your submission for <strong>${data.challengeTitle}</strong> needs improvement.</p><p>Reason: ${data.rejectionReason}</p><p><a href="${SITE_URL}/dashboard/submit">Resubmit</a></p>`,
    },
    certificate_unlocked: {
      subject: `You've earned your ${data.milestone} Hour Certificate!`,
      html: `<p>Congratulations! You've unlocked your ${data.milestone} hour certificate.</p><p><a href="${SITE_URL}/dashboard/certificates">Download your certificate</a></p>`,
    },
    welcome: {
      subject: "Welcome to HourQuest!",
      html: `<p>Welcome to HourQuest!</p><p><a href="${SITE_URL}/challenges">Browse challenges</a> to start earning verified hours.</p>`,
    },
    admin_new_submission: {
      subject: "New challenge submission pending review",
      html: `<p>A new submission is waiting for review: <strong>${data.challengeTitle}</strong></p><p><a href="${SITE_URL}/admin">Review in admin</a></p>`,
    },
    admin_new_partner_signup: {
      subject: "New partner application pending review",
      html: `<p><strong>${data.orgName}</strong> applied for a partner account.</p><p><a href="${SITE_URL}/admin">Review in admin</a></p>`,
    },
    partner_approved: {
      subject: "Your HourQuest partner account is approved",
      html: `<p>Great news — <strong>${data.orgName}</strong> is approved. You can now post partnership challenges.</p><p><a href="${SITE_URL}/partner">Open partner portal</a></p>`,
    },
    partner_rejected: {
      subject: "Update on your HourQuest partner application",
      html: `<p>We weren&apos;t able to approve <strong>${data.orgName}</strong> at this time.</p>${data.rejectionReason ? `<p>Reason: ${data.rejectionReason}</p>` : ""}<p><a href="${SITE_URL}/partnership">Contact us</a></p>`,
    },
  };

  const template = templates[type];
  await resend.emails.send({
    from: "HourQuest <notifications@terraserve.org>",
    to,
    subject: template.subject,
    html: template.html,
  });
}
