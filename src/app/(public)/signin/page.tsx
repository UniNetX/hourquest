import { PublicShell } from "@/components/layout/PublicShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign In — HourQuest",
  description: "Sign in to HourQuest to submit proof and earn verified volunteer hours.",
  path: "/signin",
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <PublicShell>
      <SignInForm next={params.next} />
    </PublicShell>
  );
}
