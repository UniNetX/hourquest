import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { challengeId } = await request.json();
    const { error } = await supabase.rpc("admin_delete_challenge", {
      p_challenge_id: challengeId,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
