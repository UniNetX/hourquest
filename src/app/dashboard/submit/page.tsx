import { Suspense } from "react";
import SubmitChallengeClient from "./SubmitChallengeClient";

export default function SubmitChallengePage() {
  return (
    <Suspense>
      <SubmitChallengeClient />
    </Suspense>
  );
}
