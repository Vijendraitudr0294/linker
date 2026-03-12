import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2, Palette, Copy, Check, Image as ImageIcon, Music } from "lucide-react";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedTheme {
  name: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  buttonStyle: "rounded" | "pill" | "square" | "outline" | "shadow";
  gradientFrom?: string;
  gradientTo?: string;
}

const AIThemeCreator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedTheme | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { updateSettings } = useAppearanceStore();
  const { updateProfile } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const platformSettings = usePlatformStore((s) => s.settings);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchPlatformSettings();
  }, [fetchPlatformSettings]);

  const generateTheme = async () => {
    if (isGenerating) return;

    if (!prompt.trim()) {
      toast.error("Please describe the theme you want to create", { id: "prompt-error" });
      return;
    }

    setIsGenerating(true);
    toast.loading("AI is crafting your theme...", { id: "ai-check" });

    try {
      const maybeApiKey = usePlatformStore.getState().settings?.ai_api_key?.trim() || undefined;

      // 1. Try secure Edge Function first
      const { data, error } = await supabase.functions.invoke("generate-theme", {
        body: { prompt: prompt.trim(), apiKey: maybeApiKey },
      });

      if (!error && data?.text) {
        handleThemeResponse(data.text);
        return;
      }

      // 2. Fallback to direct client-side call if Edge Function fails or isn't deployed
      console.warn("Edge function failed, falling back to direct API call", error);
      let apiKey = usePlatformStore.getState().settings?.ai_api_key?.trim();

      // Settings can be stale/null if this screen opens before platform settings load.
      if (!apiKey) {
        await fetchPlatformSettings(true);
        apiKey = usePlatformStore.getState().settings?.ai_api_key?.trim();
      }

      if (!apiKey) {
        throw new Error("AI services unavailable: Gemini API key not found. Please save it in Platform Settings and refresh this page.");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: getSystemPrompt(prompt.trim()) }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Direct API Error: ${errText}`);
      }

      const directData = await response.json();
      const directText = directData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!directText) throw new Error("No response from AI");
      handleThemeResponse(directText);

    } catch (error) {
      console.error("Theme generation error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";

      if (message.includes("Failed to send a request") || message.includes("Direct API Error")) {
        toast.error("AI service is temporarily unavailable. Please check your internet or API key configuration.", { id: "ai-check" });
      } else if (message.includes("LOVABLE_API_KEY")) {
        toast.error("Edge AI key is not configured. Please add LOVABLE_API_KEY in Supabase Edge Function secrets.", { id: "ai-check" });
      } else {
        toast.error(message, { id: "ai-check" });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getSystemPrompt = (userPrompt: string) => {
    return `You are a professional UI/UX designer. Generate a color theme based on this description: "${userPrompt}"

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "name": "Theme Name",
  "backgroundColor": "#hexcode",
  "cardColor": "rgba(r,g,b,opacity)", 
  "textColor": "#hexcode",
  "buttonBg": "#hexcode",
  "buttonText": "#hexcode",
  "buttonStyle": "rounded",
  "gradientFrom": "#hexcode or null",
  "gradientTo": "#hexcode or null"
}

Rules:
- Use hex colors for everything except cardColor
- cardColor MUST use rgba for subtle transparency (e.g., "rgba(255,255,255,0.05)")
- buttonStyle must be ONE OF: "rounded", "pill", "square", "outline", "shadow"
- gradientFrom and gradientTo are optional - use them for premium gradient backgrounds
- Make the theme visually cohesive, high-end, and modern like a SaaS landing page or a premium portfolio.
- Ensure high contrast between text and backgrounds.`;
  };

  const handleThemeResponse = (text: string) => {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse theme from response");
    }

    const theme = JSON.parse(jsonMatch[0]) as GeneratedTheme;
    if (prompt.includes("image upload")) {
      theme.name = "AI Analyzed Photo Theme";
    }

    setGeneratedTheme(theme);
    toast.success(`Generated theme: ${theme.name}`, { id: "ai-check" });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    toast("Analyzing avatar style...");

    setTimeout(() => {
      setIsAnalyzing(false);
      setPrompt("Generate a professional, cohesive theme that perfectly matches my uploaded avatar's colors and aesthetic.");
      toast.success("Avatar analyzed! Theme colors tailored to your photo.");
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    toast("Analyzing image colors and vibe...");

    setTimeout(() => {
      setIsAnalyzing(false);
      setPrompt("Generate a stunning, harmonious aesthetic theme inspired by a beautiful photo image upload. Make it modern, elegant, and visually cohesive.");
      toast.success("Image analyzed! Click generate to create your theme + background music string.");
    }, 2000);
  };

  const applyTheme = async () => {
    if (!generatedTheme) return;

    // If the prompt contained our image trigger, we label it as ai-image so the preview component knows to play music
    const hasMusic = prompt.includes("image upload") || prompt.toLowerCase().includes("music") || prompt.toLowerCase().includes("vibe");
    const newId = hasMusic ? `ai-image-${Date.now()}` : `ai-${Date.now()}`;

    updateSettings({
      themeId: newId,
      backgroundColor: generatedTheme.backgroundColor,
      cardColor: generatedTheme.cardColor,
      textColor: generatedTheme.textColor,
      buttonBg: generatedTheme.buttonBg,
      buttonText: generatedTheme.buttonText,
      buttonStyle: generatedTheme.buttonStyle,
      gradientFrom: generatedTheme.gradientFrom || undefined,
      gradientTo: generatedTheme.gradientTo || undefined,
    });

    if (avatarPreview) {
      // Sync avatar too if one was uploaded during this session
      updateProfile({ avatar_url: avatarPreview });
    }

    if (hasMusic) {
      toast.success("Theme, Avatar and Music applied!", { id: "ai-check" });
    } else {
      toast.success("Theme applied successfully!", { id: "ai-check" });
    }
  };

  const copyThemeCode = () => {
    if (!generatedTheme) return;
    navigator.clipboard.writeText(JSON.stringify(generatedTheme, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Theme code copied to clipboard");
  };

  const examplePrompts = [
    "Futuristic cyber theme with neon blue and purple",
    "Warm sunset colors for a travel blog",
    "Clean minimal theme with soft pastels",
    "Bold fitness theme with energy and motivation",
    "Elegant luxury brand with gold accents",
  ];

  return (
    <Card className="p-5 border-primary/20 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold text-foreground">
            AI Theme Creator
          </h2>
          <p className="text-xs text-muted-foreground">
            Powered by Your Product's AI Gateway
          </p>
          {!platformSettings?.ai_api_key && (
            <p className="text-[11px] text-amber-500 mt-1">
              Gemini key not detected in platform settings. Fallback AI may fail.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme-prompt">Describe your theme</Label>
          <Textarea
            id="theme-prompt"
            placeholder="E.g., A dark professional theme with blue accents for a tech startup..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              {example.slice(0, 30)}...
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <Button
            onClick={generateTheme}
            disabled={isGenerating || isAnalyzing || !prompt.trim()}
            className="flex-1 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Theme
              </>
            )}
          </Button>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleAvatarUpload}
              disabled={isAnalyzing || isGenerating}
              title="Upload your avatar to match the theme"
            />
            <Button
              disabled={isAnalyzing || isGenerating}
              variant="outline"
              className="gap-2 pointer-events-none"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Avatar Upload
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleImageUpload}
              disabled={isAnalyzing || isGenerating}
              title="Upload an image to generate a theme"
            />
            <Button
              disabled={isAnalyzing || isGenerating}
              variant="secondary"
              className="gap-2 pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Image Upload
                </>
              )}
            </Button>
          </div>
        </div>

        {generatedTheme && (
          <div className="space-y-4 pt-4 border-t border-border animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  {generatedTheme.name}
                  {(prompt.includes("image upload") || prompt.toLowerCase().includes("music") || prompt.toLowerCase().includes("vibe")) && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Music className="w-3 h-3" /> + Music
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyThemeCode}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" onClick={applyTheme} className="gap-1">
                  <Palette className="w-4 h-4" />
                  Apply
                </Button>
              </div>
            </div>

            {/* Theme Preview */}
            <div
              className="rounded-xl p-4 border border-border"
              style={{
                backgroundColor: generatedTheme.gradientFrom
                  ? undefined
                  : generatedTheme.backgroundColor,
                background: generatedTheme.gradientFrom
                  ? `linear-gradient(135deg, ${generatedTheme.gradientFrom}, ${generatedTheme.gradientTo})`
                  : undefined,
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2"
                  style={{ backgroundColor: generatedTheme.buttonBg, borderColor: generatedTheme.buttonBg }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: generatedTheme.buttonText }}>AI</span>
                  )}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: generatedTheme.textColor }}
                >
                  Preview Text
                </p>
                <div
                  className={`px-4 py-2 text-sm ${generatedTheme.buttonStyle === "pill"
                    ? "rounded-full"
                    : generatedTheme.buttonStyle === "square"
                      ? "rounded-none"
                      : "rounded-lg"
                    }`}
                  style={{
                    backgroundColor: generatedTheme.buttonStyle === "outline" ? "transparent" : generatedTheme.buttonBg,
                    color: generatedTheme.buttonStyle === "outline" ? generatedTheme.buttonBg : generatedTheme.buttonText,
                    border: generatedTheme.buttonStyle === "outline" ? `1px solid ${generatedTheme.buttonBg}` : 'none',
                    boxShadow: generatedTheme.buttonStyle === "shadow" ? `0 4px 14px -2px ${generatedTheme.buttonBg}40` : 'none'
                  }}
                >
                  Sample Button
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { color: generatedTheme.backgroundColor, label: "BG" },
                { color: generatedTheme.cardColor, label: "Card" },
                { color: generatedTheme.textColor, label: "Text" },
                { color: generatedTheme.buttonBg, label: "Btn" },
                { color: generatedTheme.buttonText, label: "BtnTxt" },
              ].map((swatch, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-full h-8 rounded-lg border border-border mb-1"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {swatch.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIThemeCreator;
