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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
