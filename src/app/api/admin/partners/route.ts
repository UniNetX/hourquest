import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { loadPartnerOrganizationsForAdmin } from "@/lib/partner-admin";

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await loadPartnerOrganizationsForAdmin();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
