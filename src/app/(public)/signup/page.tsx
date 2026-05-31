import { PublicShell } from "@/components/layout/PublicShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign Up — HourQuest",
  description: "Create a free HourQuest account and start earning verified volunteer hours.",
  path: "/signup",
});

export default function SignUpPage() {
  return (
    <PublicShell>
      <SignUpForm />
    </PublicShell>
  );
}
