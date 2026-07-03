import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    if (body.action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
      const { error } = await supabase.rpc("admin_delete_homepage_testimonial", {
        p_id: id,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    const { id, comment, rating, displayName, displaySchool, sortOrder, avatarUrl } =
      body;
    if (!comment?.trim() || !displayName?.trim()) {
      return NextResponse.json(
        { error: "Quote and display name are required" },
        { status: 400 },
      );
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("admin_upsert_homepage_testimonial", {
      p_payload: {
        id: id ?? "",
        comment: String(comment).trim(),
        rating: parsedRating,
        display_name: String(displayName).trim(),
        display_school: String(displaySchool ?? "").trim(),
        sort_order: Number(sortOrder) || 0,
        avatar_url: avatarUrl ?? "",
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
