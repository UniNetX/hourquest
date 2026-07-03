import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPartnerHomePath } from "@/lib/partner-routing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type, partner_org_id")
            .eq("id", user.id)
            .single();

          if (profile?.user_type === "partner" && profile.partner_org_id) {
            const { data: org } = await supabase
              .from("partner_organizations")
              .select("status")
              .eq("id", profile.partner_org_id)
              .single();

            if (org) {
              const destination = next.startsWith("/partner")
                ? next
                : getPartnerHomePath(org);
              redirect(destination);
            }
          }
        }

        redirect(next);
      }
    }
  }

  redirect("/signin?error=auth");
}
