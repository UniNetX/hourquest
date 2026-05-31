import { redirect } from "next/navigation";

export default async function SubmitChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ challengeId?: string }>;
}) {
  const params = await searchParams;
  const qs = params.challengeId
    ? `?challengeId=${encodeURIComponent(params.challengeId)}`
    : "";
  redirect(`/dashboard${qs}#submit`);
}
