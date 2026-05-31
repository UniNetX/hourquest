import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { track, category, orderedIds } = await request.json();
    const { error } = await supabase.rpc("admin_reorder_challenges", {
      p_track: track ?? "environmental",
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
