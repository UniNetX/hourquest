import { PublicShell } from "@/components/layout/PublicShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Forgot Password — TerraServe Challenges",
  description: "Reset your TerraServe Challenges password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <PublicShell>
      <ForgotPasswordForm />
    </PublicShell>
  );
}
