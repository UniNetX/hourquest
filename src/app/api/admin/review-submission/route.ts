import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { submissionId, action, rejectionReason } = await request.json();

    const { data, error } = await supabase.rpc("admin_review_submission", {
      p_submission_id: submissionId,
      p_action: action,
      p_rejection_reason: rejectionReason ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: action === "approve" ? "submission_approved" : "submission_rejected",
        submissionId,
        rejectionReason,
      }),
    }).catch(() => {});

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
