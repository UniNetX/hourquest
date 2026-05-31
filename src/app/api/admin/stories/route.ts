import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    if (body.action === "update") {
      const { storyId, comment, rating, showOnHomepage, homepageSortOrder, displayName, displaySchool } =
        body;

      if (!storyId || !comment?.trim()) {
        return NextResponse.json({ error: "Story id and comment are required" }, { status: 400 });
      }

      const parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
      }

      const { data, error } = await supabase.rpc("admin_update_story", {
        p_story_id: storyId,
        p_comment: String(comment).trim(),
        p_rating: parsedRating,
        p_show_on_homepage: Boolean(showOnHomepage),
        p_homepage_sort_order: Number(homepageSortOrder) || 0,
        p_display_name: displayName ?? "",
        p_display_school: displaySchool ?? "",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data });
    }

    const { storyId, approved } = body;
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
