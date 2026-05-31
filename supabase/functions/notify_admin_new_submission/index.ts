// Supabase Edge Function: notify_admin_new_submission

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { submissionId } = await req.json();
  const { data: submission } = await supabase
    .from("challenge_submissions")
    .select("challenge_title")
    .eq("id", submissionId)
    .single();

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmails = (Deno.env.get("ADMIN_EMAILS") ?? "").split(",");

  if (resendKey && submission) {
    for (const email of adminEmails) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TerraServe Challenges <notifications@terraserve.org>",
          to: email.trim(),
          subject: "New challenge submission pending review",
          html: `<p>New submission: <strong>${submission.challenge_title}</strong></p>`,
        }),
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
