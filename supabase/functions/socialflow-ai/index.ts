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
    const { prompt, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert Social Media AI Caption Writer for the Socialflow platform. 
Your task is to generate highly engaging, platform-optimized captions based on user ideas.

Guidelines:
1. Provide ONLY the caption text.
2. Include appropriate emojis and spacing for readability.
3. Suggest 3-5 high-performing hashtags at the bottom.
4. Keep the tone enthusiastic, professional, and readable.
5. If the type is 'Instagram', focus on visual storytelling and aesthetics.
6. If the type is 'LinkedIn', focus on professional growth, industry tips, and networking value.

Generate a caption for this idea: ${prompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: `AI error: ${status}` }), {
        status: status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const caption = data.choices[0].message.content;

    return new Response(JSON.stringify({ caption }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("socialflow-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Access-Type": "application/json" },
    });
  }
});
