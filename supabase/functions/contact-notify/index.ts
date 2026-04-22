import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { sendEmail } from "../_shared/resend.ts";
import { getPublicSiteUrl } from "../_shared/site-url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_user_id, sender_name, sender_email, message } = await req.json();

    if (!profile_user_id || !sender_name || !sender_email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const siteUrl = getPublicSiteUrl();

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("user_id", profile_user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeMessage = String(message).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const replyCta = siteUrl
      ? `<p style="margin-top:16px"><a href="${siteUrl}/dashboard/messages" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Open dashboard</a></p>`
      : "";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 14px;">
        <h2 style="margin: 0 0 8px; color: #111827;">New Contact Message</h2>
        <p style="margin: 0 0 18px; color: #6b7280;">You received a new message from your profile contact form.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 18px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 130px;">From</td>
            <td style="padding: 6px 0; font-weight: 600; color: #111827;">${sender_name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Email</td>
            <td style="padding: 6px 0;"><a href="mailto:${sender_email}" style="color: #2563eb; text-decoration: none;">${sender_email}</a></td>
          </tr>
        </table>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; color: #111827; white-space: pre-wrap;">${safeMessage}</div>
        ${replyCta}
      </div>
    `;

    const { data, error } = await sendEmail({
      from: "Biotra <onboarding@resend.dev>",
      to: [profile.email],
      subject: `New message from ${sender_name}`,
      html,
      replyTo: sender_email,
    });

    if (error) {
      console.error("Resend contact email error:", error);
      return new Response(JSON.stringify({ error: "Failed to send contact email", details: error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, notified: profile.email, email_id: data?.id ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

