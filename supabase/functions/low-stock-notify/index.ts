import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/resend.ts";
import { getPublicSiteUrl } from "../_shared/site-url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOW_STOCK_THRESHOLD = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const siteUrl = getPublicSiteUrl();

    const { data: lowStockItems, error } = await supabase
      .from("catalog_items")
      .select("id, title, stock_quantity, user_id")
      .eq("track_inventory", true)
      .lte("stock_quantity", LOW_STOCK_THRESHOLD);

    if (error) throw error;
    if (!lowStockItems || lowStockItems.length === 0) {
      return new Response(JSON.stringify({ message: "No low stock items" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const byUser = new Map<string, typeof lowStockItems>();
    for (const item of lowStockItems) {
      const list = byUser.get(item.user_id) || [];
      list.push(item);
      byUser.set(item.user_id, list);
    }

    const userIds = [...byUser.keys()];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, email, name")
      .in("user_id", userIds);

    if (!profiles) {
      return new Response(JSON.stringify({ message: "No profiles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const profile of profiles) {
      if (!profile.email) continue;

      const items = byUser.get(profile.user_id);
      if (!items || items.length === 0) continue;

      const itemRows = items
        .map(
          (i) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;color:${
              (i.stock_quantity ?? 0) <= 0 ? "#ef4444" : "#f59e0b"
            }">${i.stock_quantity ?? 0}</td></tr>`
        )
        .join("");

      const manageInventory = siteUrl
        ? `<p style="margin-top:16px"><a href="${siteUrl}/dashboard/catalog" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">Manage inventory</a></p>`
        : "";

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1e293b;margin-bottom:4px">Low Stock Alert</h2>
          <p style="color:#64748b;margin-bottom:20px">Hi ${profile.name || "there"}, the following items need restocking:</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
            <thead><tr style="background:#f8fafc">
              <th style="padding:10px 12px;text-align:left;color:#475569;font-size:13px">Item</th>
              <th style="padding:10px 12px;text-align:center;color:#475569;font-size:13px">Stock</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          ${manageInventory}
          <p style="color:#94a3b8;font-size:12px;margin-top:20px">Manage your inventory at your LinkVertex dashboard.</p>
        </div>
      `;

      const { error: sendError } = await sendEmail({
        from: "LinkVertex <onboarding@resend.dev>",
        to: [profile.email],
        subject: `Low Stock Alert: ${items.length} item${items.length > 1 ? "s" : ""} need restocking`,
        html,
      });

      if (!sendError) {
        sentCount++;
      } else {
        console.error(`Low-stock email failed for ${profile.email}:`, sendError);
      }
    }

    return new Response(JSON.stringify({ message: `Sent ${sentCount} notification(s)` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
