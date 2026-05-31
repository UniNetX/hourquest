import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendChallengeEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createServiceClient();

  if (body.type === "submission_approved" || body.type === "submission_rejected") {
    const { data: submission } = await supabase
      .from("challenge_submissions")
      .select("*")
      .eq("id", body.submissionId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [{ data: profile }, { data: authUser }] = await Promise.all([
      supabase.from("profiles").select("full_name, total_verified_hours").eq("id", submission.user_id).single(),
      supabase.auth.admin.getUserById(submission.user_id),
    ]);

    if (!authUser.user?.email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    await sendChallengeEmail({
      to: authUser.user.email,
      type: body.type,
      data: {
        studentName: profile?.full_name,
        challengeTitle: submission.challenge_title,
        hoursEarned: submission.hours_awarded ?? undefined,
        totalHours: profile?.total_verified_hours,
        rejectionReason: body.rejectionReason,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
