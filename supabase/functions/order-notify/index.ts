// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { sendEmail } from "../_shared/resend.ts";
import { getPublicSiteUrl } from "../_shared/site-url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, status_update } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderError } = await supabase
      .from("catalog_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: item } = await supabase
      .from("catalog_items")
      .select("title, price, price_label, item_type")
      .eq("id", order.item_id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("user_id", order.profile_user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = getPublicSiteUrl();

    const itemTitle = item?.title || "Unknown Item";
    const priceStr = item?.price ? `$${item.price}` : item?.price_label || "N/A";

    const isStatusUpdate = !!status_update;
    const itemType = item?.item_type || "physical";
    const isBookingType = itemType === "service" || itemType === "car" || itemType === "boat";
    const typeTerm = isBookingType ? "Booking" : "Order";
    const actionTerm = isBookingType ? "booked" : "ordered";

    let finalResendData: Record<string, unknown> | null = null;
    let finalResendOk = true;

    if (isStatusUpdate) {
      const subject = `${typeTerm} Update: ${itemTitle} is now ${order.status || "pending"}`;
      const toEmail = order.customer_email;
      const status = order.status || "pending";

      const statusColors: Record<string, string> = {
        pending: "#FFC107",
        confirmed: "#4CAF50",
        completed: "#2196F3",
        cancelled: "#F44336",
      };
      const mainColor = statusColors[status] || "#111";

      const dashboardRow = siteUrl
        ? `<tr><td style="color: #888; padding-top: 8px;">Dashboard</td><td style="text-align: right; padding-top: 8px;"><a href="${siteUrl}/dashboard" style="color: ${mainColor}; font-weight: 700; text-decoration: none;">Open dashboard</a></td></tr>`
        : "";

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; border: 1px solid #eee; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 4px 12px; background: ${mainColor}15; color: ${mainColor}; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
              ${status}
            </div>
            <h1 style="color: #111; margin: 16px 0 8px 0; font-size: 24px; font-weight: 800;">${typeTerm} Updated</h1>
            <p style="color: #666; font-size: 15px;">Your ${itemType} ${typeTerm.toLowerCase()} has been updated.</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 12px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="color: #888; padding-bottom: 8px;">Item</td><td style="text-align: right; font-weight: 700; padding-bottom: 8px;">${itemTitle}</td></tr>
              <tr><td style="color: #888; padding-bottom: 8px;">Quantity</td><td style="text-align: right; font-weight: 700; padding-bottom: 8px;">${order.quantity}</td></tr>
              <tr><td style="color: #888; padding-bottom: 8px;">Total</td><td style="text-align: right; font-weight: 700; padding-bottom: 8px;">${priceStr}</td></tr>
              <tr><td style="color: #888;">Order ID</td><td style="text-align: right; font-weight: 700; font-family: monospace;">#LV-${order.id.slice(0, 8).toUpperCase()}</td></tr>
              ${dashboardRow}
            </table>
          </div>
          <div style="text-align: center;">
            <p style="font-size: 12px; color: #999;">Thank you for using Biotra</p>
          </div>
        </div>
      `;

      const { data, error } = await sendEmail({
        from: "Biotra <updates@resend.dev>",
        to: [toEmail],
        subject,
        html,
      });

      finalResendOk = !error;
      finalResendData = error
        ? ({ error } as Record<string, unknown>)
        : ((data as Record<string, unknown>) ?? null);
    } else {
      const ownerSubject = `New ${typeTerm}: ${itemTitle} from ${order.customer_name}`;
      const ownerCta = siteUrl
        ? `<p style="margin-top: 16px;"><a href="${siteUrl}/dashboard/orders" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Open orders dashboard</a></p>`
        : "";

      const ownerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
          <h2 style="color: #111; margin-bottom: 4px;">New ${typeTerm} Received</h2>
          <p style="color: #666; font-size: 14px; margin-top: 0;">Someone just ${actionTerm} an item on your profile!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <table style="width: 100%; font-size: 14px; color: #333;">
            <tr><td style="padding: 6px 0; color: #888;">Item</td><td style="padding: 6px 0; font-weight: 600;">${itemTitle}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Price</td><td style="padding: 6px 0; font-weight: 600;">${priceStr}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Customer</td><td style="padding: 6px 0;">${order.customer_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Email</td><td style="padding: 6px 0;"><a href="mailto:${order.customer_email}" style="color: #6366f1;">${order.customer_email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Phone</td><td style="padding: 6px 0;">${order.customer_phone || "N/A"}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Notes</td><td style="padding: 6px 0;">${order.notes || "None"}</td></tr>
          </table>
          ${ownerCta}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Order ID: ${order.id}<br/>Date: ${new Date(order.created_at || Date.now()).toLocaleString()}</p>
        </div>
      `;

      const { error: ownerError } = await sendEmail({
        from: "Biotra Orders <orders@resend.dev>",
        to: [profile.email],
        subject: ownerSubject,
        html: ownerHtml,
      });

      if (ownerError) {
        console.error("Resend owner email error:", ownerError);
        return new Response(JSON.stringify({ error: "Failed to send owner email", details: ownerError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const customerSubject = `Confirmation: Your ${typeTerm} for ${itemTitle}`;
      const customerCta = siteUrl
        ? `<p style="text-align:center;margin-top:18px;"><a href="${siteUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Open Biotra</a></p>`
        : "";

      const customerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; border: 1px solid #eee; border-radius: 16px;">
          <h2 style="color: #111; text-align: center;">Thanks for your ${typeTerm.toLowerCase()}!</h2>
          <p style="color: #666; text-align: center;">We've received your request for <strong>${itemTitle}</strong>. The owner has been notified.</p>
          <div style="background: #fdfdfd; padding: 24px; border-radius: 12px; margin: 30px 0; border: 1px solid #eee;">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #888; padding-bottom: 10px;">Item</td><td style="text-align: right; font-weight: 700;">${itemTitle}</td></tr>
              <tr><td style="color: #888; padding-bottom: 10px;">Quantity</td><td style="text-align: right; font-weight: 700;">${order.quantity}</td></tr>
              <tr><td style="color: #888; padding-bottom: 10px;">Amount Paid</td><td style="text-align: right; font-weight: 700;">${priceStr}</td></tr>
              <tr><td style="color: #888;">Status</td><td style="text-align: right; color: #FFC107; font-weight: 800;">PENDING</td></tr>
            </table>
          </div>
          ${customerCta}
          <p style="text-align: center; font-size: 12px; color: #999;">Order ID: #LV-${order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      `;

      const { data, error } = await sendEmail({
        from: "Biotra <onboarding@resend.dev>",
        to: [order.customer_email],
        subject: customerSubject,
        html: customerHtml,
      });

      finalResendOk = !error;
      finalResendData = error
        ? ({ error } as Record<string, unknown>)
        : ((data as Record<string, unknown>) ?? null);
    }

    if (!finalResendOk) {
      console.error("Resend error:", finalResendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: finalResendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailId = typeof finalResendData?.id === "string" ? finalResendData.id : null;

    return new Response(
      JSON.stringify({
        success: true,
        notified: profile.email,
        email_id: emailId,
        order_summary: {
          item: itemTitle,
          customer: order.customer_name,
          price: priceStr,
        },
      }),
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

