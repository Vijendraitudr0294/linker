// @ts-nocheck
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
    const { post, platforms, mediaUrls } = await req.json();
    
    // Using the secure Ayrshare Key provided by user
    const AYRSHARE_API_KEY = "BADBA34A-322E445D-B4397EEA-50BBBC32";

    const response = await fetch("https://api.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post,
        platforms, // e.g., ["twitter", "facebook", "instagram"]
        mediaUrls, // e.g. ["https://..."]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ayrshare error:", data);
      return new Response(JSON.stringify({ error: data.message || "Ayrshare API Error" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("socialflow-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Access-Control-Allow-Origin": "*" },
    });
  }
});
