import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { sendChallengeEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { orgId, action, rejectionReason } = await request.json();

    const { data, error } = await supabase.rpc("admin_review_partner_org", {
      p_org_id: orgId,
      p_action: action,
      p_rejection_reason: rejectionReason ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const service = await createServiceClient();
    if (service && data?.owner_user_id) {
      const { data: authUser } = await service.auth.admin.getUserById(
        data.owner_user_id,
      );
      const email = authUser.user?.email;
      if (email) {
        if (action === "approve") {
          await sendChallengeEmail({
            to: email,
            type: "partner_approved",
            data: { orgName: data.name },
          }).catch(() => {});
        } else if (action === "reject") {
          await sendChallengeEmail({
            to: email,
            type: "partner_rejected",
            data: {
              orgName: data.name,
              rejectionReason: rejectionReason ?? "",
            },
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
