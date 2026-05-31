import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { storyId, approved } = await request.json();
    const { data, error } = await supabase.rpc("admin_moderate_story", {
      p_story_id: storyId,
      p_approved: approved,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
