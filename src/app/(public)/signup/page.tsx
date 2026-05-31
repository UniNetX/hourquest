import { Suspense } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import {
  SignUpForm,
  type SignUpAccountType,
} from "@/components/auth/SignUpForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign Up — HourQuest",
  description: "Create a free HourQuest student or partner account.",
  path: "/signup",
});

function SignUpContent({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const defaultAccountType: SignUpAccountType =
    searchParams.type === "partner" ? "partner" : "student";

  return <SignUpForm defaultAccountType={defaultAccountType} />;
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return (
    <PublicShell>
      <Suspense>
        <SignUpPageInner searchParams={searchParams} />
      </Suspense>
    </PublicShell>
  );
}

async function SignUpPageInner({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  return <SignUpContent searchParams={params} />;
}
