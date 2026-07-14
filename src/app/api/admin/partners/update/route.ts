import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = await request.json();

    const { id, name, description, website, logoUrl } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("admin_update_partner_org", {
      p_id: id,
      p_payload: {
        name: String(name).trim(),
        description: description != null ? String(description).trim() : undefined,
        website: website != null ? String(website).trim() : undefined,
        logo_url: logoUrl ?? undefined,
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
