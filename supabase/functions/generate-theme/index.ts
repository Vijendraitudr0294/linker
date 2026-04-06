// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { prompt, apiKey } = await req.json();
        if (!prompt || typeof prompt !== "string") {
            return new Response(JSON.stringify({ error: "Invalid prompt" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || (typeof apiKey === "string" ? apiKey.trim() : "");
        const promptText = `You are a professional UI/UX designer. Generate a color theme based on this description: "${prompt}"

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "Theme Name",
  "backgroundColor": "#hexcode",
  "cardColor": "#hexcode", 
  "textColor": "#hexcode",
  "buttonBg": "#hexcode",
  "buttonText": "#hexcode",
  "buttonStyle": "rounded",
  "gradientFrom": "#hexcode or null",
  "gradientTo": "#hexcode or null"
}

Rules:
- Use hex colors only
- Ensure good contrast between text and backgrounds
- buttonStyle must be "rounded", "pill", or "square"
- gradientFrom and gradientTo are optional - use them for gradient backgrounds
- Make the theme visually cohesive and modern`;
        let text: string | undefined;

        if (LOVABLE_API_KEY) {
            const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${LOVABLE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-1.5-flash",
                    messages: [{ role: "user", content: promptText }],
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("AI gateway error:", response.status, errText);
            } else {
                const data = await response.json();
                text = data.choices?.[0]?.message?.content;
            }
        }

        // Fallback: direct Gemini API when LOVABLE_API_KEY is not available (or gateway fails)
        if (!text) {
            if (!GEMINI_API_KEY) {
                throw new Error("No AI key configured. Set GEMINI_API_KEY (Edge secret) or provide Gemini key from Platform Settings.");
            }

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptText }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
                    }),
                }
            );

            if (!geminiRes.ok) {
                if (geminiRes.status === 429) {
                    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
                        status: 429,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    });
                }
                const errText = await geminiRes.text();
                console.error("Gemini API error:", geminiRes.status, errText);
                throw new Error(`Gemini API error: ${geminiRes.status}`);
            }

            const geminiData = await geminiRes.json();
            text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        if (!text) {
            throw new Error("No response from AI");
        }

        return new Response(JSON.stringify({ text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err: any) {
        console.error("generate-theme error:", err);
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

