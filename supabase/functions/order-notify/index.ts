// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

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

    // Fetch order details
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

    // Fetch item details
    const { data: item } = await supabase
      .from("catalog_items")
      .select("title, price, price_label, item_type")
      .eq("id", order.item_id)
      .single();

    // Fetch profile owner's email
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

    const itemTitle = item?.title || "Unknown Item";
    const priceStr = item?.price ? `$${item.price}` : item?.price_label || "N/A";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isStatusUpdate = !!status_update;
    const itemType = item?.item_type || "physical";
    const status = order.status || "pending";
    const typeTerm = (itemType === 'service' || itemType === 'car' || itemType === 'boat') ? 'Booking' : 'Order';
    const actionTerm = (itemType === 'service' || itemType === 'car' || itemType === 'boat') ? 'booked' : 'ordered';

    let finalResendData: Record<string, unknown> | null = null;
    let finalResendOk = true;

    if (isStatusUpdate) {
      // Notify customer about status change
      const subject = `${typeTerm} Update: ${itemTitle} is now ${status}`;
      const toEmail = order.customer_email;
      
      const statusColors: Record<string, string> = {
        pending: '#FFC107',
        confirmed: '#4CAF50',
        completed: '#2196F3',
        cancelled: '#F44336'
      };
      const mainColor = statusColors[status] || '#111';

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
            </table>
          </div>
          <div style="text-align: center;">
            <p style="font-size: 12px; color: #999;">Thank you for using LinkVertex</p>
          </div>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "LinkVertex <updates@resend.dev>", to: [toEmail], subject, html }),
      });
      finalResendOk = res.ok;
      const payload = await res.json();
      finalResendData = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    } else {
      // NEW BOOKING: Notify BOTH owner and customer
      
      // 1. Notify OWNER
      const ownerSubject = `New ${typeTerm}: ${itemTitle} from ${order.customer_name}`;
      const ownerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
          <h2 style="color: #111; margin-bottom: 4px;">🛒 New ${typeTerm} Received</h2>
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
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Order ID: ${order.id}<br/>Date: ${new Date(order.created_at || Date.now()).toLocaleString()}</p>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "LinkVertex Orders <orders@resend.dev>", to: [profile.email], subject: ownerSubject, html: ownerHtml }),
      });

      // 2. Notify CUSTOMER
      const customerSubject = `Confirmation: Your ${typeTerm} for ${itemTitle}`;
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
          <p style="text-align: center; font-size: 12px; color: #999;">Order ID: #LV-${order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "LinkVertex <onboarding@resend.dev>", to: [order.customer_email], subject: customerSubject, html: customerHtml }),
      });
      finalResendOk = res.ok;
      const payload = await res.json();
      finalResendData = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
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
