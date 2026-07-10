import { NextResponse } from "next/server";
import { requireApprovedPartner } from "@/lib/partner";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireApprovedPartner();
    const { payload } = await request.json();
    const { data, error } = await supabase.rpc("partner_upsert_challenge", {
      p_payload: payload,
    });
    if (error) {
      const msg = error.message ?? "Failed to save challenge.";
      const friendly = msg.includes("challenges_partner_org_track_check")
        ? "Could not save challenge: your partner organization is not linked correctly. Sign out and back in, or contact support."
        : msg.includes("No partner organization")
          ? "Your account is not linked to a partner organization. Contact support."
          : msg;
      return NextResponse.json({ error: friendly }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
