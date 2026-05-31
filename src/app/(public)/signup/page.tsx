import { PublicShell } from "@/components/layout/PublicShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign Up — TerraServe Challenges",
  description: "Create a free TerraServe Challenges account and start earning verified volunteer hours.",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <PublicShell>
      <SignUpForm />
    </PublicShell>
  );
}
