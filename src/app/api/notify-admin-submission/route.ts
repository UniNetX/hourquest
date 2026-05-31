import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/admin";
import { sendChallengeEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await request.json();
  const { data: submission } = await supabase
    .from("challenge_submissions")
    .select("*, profiles(full_name)")
    .eq("id", submissionId)
    .single();

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const email of getAdminEmails()) {
    await sendChallengeEmail({
      to: email,
      type: "admin_new_submission",
      data: {
        challengeTitle: submission.challenge_title,
        submissionId,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
