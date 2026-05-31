import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/admin";
import { sendChallengeEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgName } = await request.json();

  for (const email of getAdminEmails()) {
    await sendChallengeEmail({
      to: email,
      type: "admin_new_partner_signup",
      data: { orgName: orgName ?? "Partner organization" },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
