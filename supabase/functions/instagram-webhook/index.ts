// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // 1. Handle Webhook Verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Replace with your actual verify token from Meta dashboard
    const VERIFY_TOKEN = Deno.env.get("INSTAGRAM_VERIFY_TOKEN") || "biotra_dm_verify";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // 2. Handle Webhook Events (POST)
  if (req.method === "POST") {
    const body = await req.json();
    console.log("IG Webhook Event:", JSON.stringify(body, null, 2));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Logic: 
    // 1. Parse 'body.entry[0].changes' for 'comments' or 'messages'
    // 2. Find the Instagram account ID and map to Biotra user_id
    // 3. Check for matching keywords in 'automation_flows' table
    // 4. Trigger reply via Instagram Graph API

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "comments") {
             const { from, text, id: commentId } = change.value;
             console.log(`Comment from ${from.username}: ${text}`);

             // 1. Find user by ig_id
             // 2. Check keyword triggers
             // 3. Reply
          }
        }
      }
    }

    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  return new Response(null, { headers: corsHeaders });
});
