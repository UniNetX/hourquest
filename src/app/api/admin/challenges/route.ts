import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { payload } = await request.json();
    const { data, error } = await supabase.rpc("admin_upsert_challenge", {
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
