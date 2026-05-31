import { NextResponse } from "next/server";
import { requireApprovedPartner } from "@/lib/partner";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireApprovedPartner();
    const { category, orderedIds } = await request.json();
    const { error } = await supabase.rpc("partner_reorder_challenges", {
      p_category: category,
      p_ordered_ids: orderedIds,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
