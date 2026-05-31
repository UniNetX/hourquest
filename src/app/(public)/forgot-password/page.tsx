import { PublicShell } from "@/components/layout/PublicShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Forgot Password — HourQuest",
  description: "Reset your HourQuest password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <ForgotPasswordForm />
    </PublicShell>
  );
}
