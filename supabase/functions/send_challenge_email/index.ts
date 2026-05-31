// Supabase Edge Function: send_challenge_email

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const { to, subject, html } = await req.json();
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!resendKey) {
    return new Response(JSON.stringify({ stub: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TerraServe Challenges <notifications@terraserve.org>",
      to,
      subject,
      html,
    }),
  });

  return new Response(JSON.stringify({ ok: res.ok }), {
    headers: { "Content-Type": "application/json" },
  });
});
