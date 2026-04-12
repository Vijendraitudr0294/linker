import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2, Wand2, Save, Zap, Upload, X, Globe, LayoutGrid,
  Trash2, Eye, Droplets, CheckCircle2, Palette,
  Sparkles, Sun, Moon, Brush
} from "lucide-react";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ThemePreviewCard from "@/components/dashboard/ThemePreviewCard";
import type { ThemePreset } from "@/data/themes";
import { extractPaletteFromImage, type ExtractedPalette } from "@/lib/colorExtractor";

// ── Gemini Integration ──────────────────────────────────────────────────────
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

const callGemini = async (prompt: string, imageBase64?: string, mimeType?: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  for (const model of GEMINI_MODELS) {
    try {
      const parts: any[] = [{ text: prompt }];
      if (imageBase64 && mimeType) {
        parts.push({ inlineData: { mimeType, data: imageBase64 } });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          })
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn(`Gemini ${model} failed:`, e);
    }
  }
  throw new Error("All Gemini models failed. Check your API key or network.");
};

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
  fontFamily?: string;
  layoutType?: "list" | "grid" | "bento";
  cardStyle?: "classic" | "glass" | "glass-premium" | "neon";
  backgroundImage?: string;
  backgroundOverlay?: string;
  animationClass?: string;
  profileStyleVariant?: "default" | "music";
}

type GalleryTab = "generate" | "gallery" | "admin";

// ── Prompt-only fallback (no image) ──────────────────────────────────────────
function generateLocalTheme(prompt: string): GeneratedTheme {
  const lp = prompt.toLowerCase();
  if (lp.includes("dark") || lp.includes("night") || lp.includes("black"))
    return { name: "Midnight Luxe",    backgroundColor: "#080810", cardColor: "rgba(255,255,255,0.06)", textColor: "#f0f4ff", buttonBg: "#6366f1", buttonText: "#ffffff", buttonStyle: "pill",    fontFamily: "Inter",            cardStyle: "glass-premium" };
  if (lp.includes("pastel") || lp.includes("soft") || lp.includes("pink"))
    return { name: "Soft Aura",        backgroundColor: "#fce7f3", cardColor: "rgba(255,255,255,0.9)", textColor: "#831843", buttonBg: "#ec4899", buttonText: "#ffffff", buttonStyle: "pill",    fontFamily: "Inter",            gradientFrom: "#fce7f3", gradientTo: "#e0f2fe" };
  if (lp.includes("green") || lp.includes("nature") || lp.includes("forest"))
    return { name: "Emerald Grove",    backgroundColor: "#064e3b", cardColor: "rgba(16,185,129,0.12)", textColor: "#d1fae5", buttonBg: "#10b981", buttonText: "#022c22", buttonStyle: "rounded", fontFamily: "Inter" };
  if (lp.includes("minimal") || lp.includes("clean") || lp.includes("white"))
    return { name: "Pristine White",   backgroundColor: "#f8fafc", cardColor: "#ffffff",               textColor: "#0f172a", buttonBg: "#0f172a", buttonText: "#f8fafc", buttonStyle: "square",  fontFamily: "Inter" };
  if (lp.includes("neon") || lp.includes("cyber") || lp.includes("tech"))
    return { name: "Cyber Matrix",     backgroundColor: "#050a14", cardColor: "rgba(0,255,255,0.04)",  textColor: "#00fff5", buttonBg: "#00d4ff", buttonText: "#020a10", buttonStyle: "shadow",  fontFamily: "Space Grotesk",    gradientFrom: "#0ea5e9", gradientTo: "#8b5cf6" };
  if (lp.includes("gold") || lp.includes("luxury") || lp.includes("premium"))
    return { name: "Opulent Gold",     backgroundColor: "#1c1505", cardColor: "rgba(212,175,55,0.08)", textColor: "#f5e6a3", buttonBg: "#d4af37", buttonText: "#1c1505", buttonStyle: "pill",    fontFamily: "Playfair Display" };
  return   { name: "Studio Violet",   backgroundColor: "#1e1b4b", cardColor: "rgba(99,102,241,0.12)", textColor: "#ede9fe", buttonBg: "#7c3aed", buttonText: "#ffffff", buttonStyle: "rounded", fontFamily: "Inter",            gradientFrom: "#312e81", gradientTo: "#6d28d9" };
}

// ── Core: palette → theme (color-only, NO background image) ──────────────────
function buildColorTheme(palette: ExtractedPalette, customName?: string): GeneratedTheme {
  const { style } = palette;

  // If the design has a strong gradient (two very distinct dominant colors), use it
  const useGradient = style.hasGradient && palette.gradient[0] !== palette.gradient[1];

  // Card color already computed by the extractor
  const cardColor = palette.card;

  // Button text: contrast check against button bg
  const buttonTextColor = (() => {
    const hex = palette.primary.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
    return lum > 0.35 ? "#000000" : "#ffffff";
  })();

  const musicLike = style.isMusicUi || (!palette.isDark && style.hasBoldAccent && !style.isMinimal);
  const profileStyleVariant: GeneratedTheme["profileStyleVariant"] = musicLike ? "music" : "default";
  const layoutType: GeneratedTheme["layoutType"] = musicLike ? "list" : "list";
  const cardStyle: GeneratedTheme["cardStyle"] = musicLike ? "classic" : (style.cardStyle as GeneratedTheme["cardStyle"]);
  const buttonStyle: GeneratedTheme["buttonStyle"] = musicLike ? "rounded" : (style.buttonShape as GeneratedTheme["buttonStyle"]);

  return {
    name: customName || palette.name,
    backgroundColor: palette.background,
    cardColor,
    textColor: palette.text,
    buttonBg: palette.primary,
    buttonText: buttonTextColor,
    buttonStyle,
    gradientFrom: useGradient ? palette.gradient[0] : undefined,
    gradientTo:   useGradient ? palette.gradient[1] : undefined,
    fontFamily: "Inter",
    cardStyle,
    layoutType,
    backgroundImage: undefined,   // ← never uses image as background
    backgroundOverlay: undefined,
    profileStyleVariant,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const StylePill = ({ label, active }: { label: string; active: boolean }) => (
  <span className={cn(
    "inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
    active
      ? "bg-black text-white border-black"
      : "bg-black/5 text-black/30 border-black/10"
  )}>
    {label}
  </span>
);

const AIThemeCreator = () => {
  const [activeTab, setActiveTab]           = useState<GalleryTab>("generate");
  const [prompt, setPrompt]                 = useState("");
  const [isExtracting, setIsExtracting]     = useState(false);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedTheme | null>(null);
  const [palette, setPalette]               = useState<ExtractedPalette | null>(null);
  const [imagePreview, setImagePreview]     = useState<string | null>(null);
  const [themeName, setThemeName]           = useState("");
  const [isSaving, setIsSaving]             = useState(false);
  const [galleryThemes, setGalleryThemes]   = useState<ThemePreset[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [isDragging, setIsDragging]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);

  useEffect(() => { fetchPlatformSettings(); }, [fetchPlatformSettings]);
  useEffect(() => {
    if (activeTab === "gallery" || activeTab === "admin") loadGallery();
  }, [activeTab]);

  const previewTheme: ThemePreset | null = generatedTheme ? {
    id: "preview",
    name: themeName || generatedTheme.name,
    backgroundColor: generatedTheme.backgroundColor,
    cardColor: generatedTheme.cardColor,
    textColor: generatedTheme.textColor,
    buttonStyle: generatedTheme.buttonStyle,
    buttonBg: generatedTheme.buttonBg,
    buttonText: generatedTheme.buttonText,
    gradientFrom: generatedTheme.gradientFrom,
    gradientTo: generatedTheme.gradientTo,
    fontFamily: generatedTheme.fontFamily || "Inter",
    layoutMode: generatedTheme.layoutType || "list",
    cardStyle: generatedTheme.cardStyle || "glass",
    profileStyleVariant: generatedTheme.profileStyleVariant,
  } : null;

  const loadLocalThemes = (): ThemePreset[] => {
    try {
      const raw = window.localStorage.getItem("lv:ai-local-themes");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ThemePreset[]) : [];
    } catch {
      return [];
    }
  };

  const saveLocalTheme = (theme: ThemePreset) => {
    try {
      const existing = loadLocalThemes();
      const next = [theme, ...existing.filter((t) => t.id !== theme.id)].slice(0, 30);
      window.localStorage.setItem("lv:ai-local-themes", JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  };

  // ── Gallery ────────────────────────────────────────────────────────────────
  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const { data } = await (supabase as any)
        .from("platform_settings").select("theme_presets").limit(1).single();
      const presets = (data?.theme_presets || []) as ThemePreset[];
      const remote = presets.filter((t: ThemePreset) => t.category === "AI Lab" || t.category === "Community");
      const local = loadLocalThemes();
      setGalleryThemes([...local, ...remote.filter((t) => !local.some((lt) => lt.id === t.id))]);
    } catch { /* silent */ }
    finally { setLoadingGallery(false); }
  };

  const clearImage = () => {
    setImagePreview(null);
    setPalette(null);
    setGeneratedTheme(null);
    setThemeName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleApplyGallery = async (theme: ThemePreset) => {
    await (useAppearanceStore.getState().applyTheme as any)(theme);
    toast.success(`Theme "${theme.name}" applied!`);
  };

  // ── Image processing: Gemini Vision → build theme ──────────────────────────
  const processImage = async (dataUrl: string) => {
    setImagePreview(dataUrl);
    setIsExtracting(true);
    setGeneratedTheme(null);
    setPalette(null);

    try {
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1];
      
      const promptText = prompt.trim() || "Extract design DNA from this image.";
      const systemPrompt = `Analyze the provided image and return ONLY a JSON object (no markdown, no code blocks):
{
  "name": "Creative Theme Name",
  "backgroundColor": "#hex",
  "cardColor": "#hex (contrast with background)",
  "textColor": "#hex (absolute high contrast with cardColor)",
  "buttonBg": "#hex (vibrant accent color)",
  "buttonText": "#hex (absolute high contrast with buttonBg)",
  "buttonStyle": "pill | rounded | square",
  "cardStyle": "glass | glass-premium | classic",
  "layoutType": "list | grid | bento",
  "gradientFrom": "#hex or null",
  "gradientTo": "#hex or null",
  "isDark": boolean
}
Rules:
- Capture the EXACT color palette and vibe.
- ACCESSIBILITY IS CRITICAL: Ensure "textColor" has a contrast ratio of at least 4.5:1 against "cardColor".
- If "cardStyle" is glass (semi-transparent), "textColor" must be clearly readable against both "cardColor" and "backgroundColor".
- NEVER return white text on a light-colored card or background.
- User instructions: ${promptText}`;

      const geminiResult = await callGemini(systemPrompt, base64, mimeType);
      
      const theme: GeneratedTheme = {
        name: geminiResult.name || "AI Extracted",
        backgroundColor: geminiResult.backgroundColor,
        cardColor: geminiResult.cardColor,
        textColor: geminiResult.textColor,
        buttonBg: geminiResult.buttonBg,
        buttonText: geminiResult.buttonText,
        buttonStyle: geminiResult.buttonStyle as any,
        cardStyle: geminiResult.cardStyle as any,
        layoutType: geminiResult.layoutType as any,
        gradientFrom: geminiResult.gradientFrom || undefined,
        gradientTo: geminiResult.gradientTo || undefined,
      };

      setGeneratedTheme(theme);
      setThemeName(theme.name);
      
      const localExtracted = await extractPaletteFromImage(dataUrl).catch(() => null);
      if (localExtracted) setPalette(localExtracted);

      toast.success(`Design DNA cloned: ${theme.name}`);
    } catch (e: any) {
      console.error(e);
      toast.info("Gemini Vision failed. Using local extractor...");
      const extracted = await extractPaletteFromImage(dataUrl);
      setPalette(extracted);
      const theme = buildColorTheme(extracted);
      setGeneratedTheme(theme);
      setThemeName(extracted.name);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith("image/")) { toast.error("Please drop an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) { toast.error("Enter a description first"); return; }
    setIsGenerating(true);
    try {
      const systemPrompt = `Create a matching "Link-in-bio" theme based on this prompt: "${prompt}". 
Return ONLY a JSON object (no markdown, no blocks):
{
  "name": "Theme Name",
  "backgroundColor": "#hex",
  "cardColor": "#hex",
  "textColor": "#hex (high contrast with cardColor)",
  "buttonBg": "#hex",
  "buttonText": "#hex (high contrast with buttonBg)",
  "buttonStyle": "pill | rounded | square",
  "cardStyle": "glass | glass-premium | classic",
  "layoutType": "list | bento",
  "gradientFrom": "#hex or null",
  "gradientTo": "#hex or null"
}
Rules:
- THEME READABILITY IS TOP PRIORITY.
- Ensure all text and fonts are clearly visible. 
- Avoid low-contrast combinations like white text on pastel backgrounds.`;

      const geminiResult = await callGemini(systemPrompt);
      const theme: GeneratedTheme = {
        name: geminiResult.name,
        backgroundColor: geminiResult.backgroundColor,
        cardColor: geminiResult.cardColor,
        textColor: geminiResult.textColor,
        buttonBg: geminiResult.buttonBg,
        buttonText: geminiResult.buttonText,
        buttonStyle: geminiResult.buttonStyle as any,
        cardStyle: geminiResult.cardStyle as any,
        layoutType: geminiResult.layoutType as any,
        gradientFrom: geminiResult.gradientFrom || undefined,
        gradientTo: geminiResult.gradientTo || undefined,
      };

      setGeneratedTheme(theme);
      setThemeName(theme.name);
      toast.success("AI generated your theme!");
    } catch (e: any) {
      const theme = generateLocalTheme(prompt);
      setGeneratedTheme(theme);
      setThemeName(theme.name);
      toast.success("Generated (local fallback)");
    } finally { setIsGenerating(false); }
  };

  const handleApply = async () => {
    if (!generatedTheme) return;
    await (useAppearanceStore.getState().applyTheme as any)({
      id: `ai-${Date.now()}`,
      backgroundColor: generatedTheme.backgroundColor,
      cardColor: generatedTheme.cardColor,
      textColor: generatedTheme.textColor,
      buttonStyle: generatedTheme.buttonStyle,
      buttonBg: generatedTheme.buttonBg,
      buttonText: generatedTheme.buttonText,
      gradientFrom: generatedTheme.gradientFrom,
      gradientTo: generatedTheme.gradientTo,
      fontFamily: generatedTheme.fontFamily,
      layoutMode: generatedTheme.layoutType || "list",
      cardStyle: generatedTheme.cardStyle || "glass",
      backgroundImage: generatedTheme.backgroundImage,
      backgroundOverlay: generatedTheme.backgroundOverlay,
      animationClass: generatedTheme.animationClass,
      profileStyleVariant: generatedTheme.profileStyleVariant,
    });
    toast.success("Theme applied to your profile!");
  };


  const handleSave = async (isPublic = false) => {
    if (!generatedTheme) return;
    setIsSaving(true);
    try {
      const name = themeName.trim() || generatedTheme.name;
      const newTheme: ThemePreset = {
        id: `ai-${Date.now()}`,
        name,
        category: isPublic ? "Community" : "AI Lab",
        isPopular: isPublic,
        backgroundColor: generatedTheme.backgroundColor,
        cardColor:       generatedTheme.cardColor,
        textColor:       generatedTheme.textColor,
        buttonStyle:     generatedTheme.buttonStyle,
        buttonBg:        generatedTheme.buttonBg,
        buttonText:      generatedTheme.buttonText,
        gradientFrom:    generatedTheme.gradientFrom,
        gradientTo:      generatedTheme.gradientTo,
        fontFamily:      generatedTheme.fontFamily,
        layoutMode:      generatedTheme.layoutType || "list",
        cardStyle:       generatedTheme.cardStyle || "classic",
        backgroundImage: undefined, // never store image-based themes
        profileStyleVariant: generatedTheme.profileStyleVariant,
      };
      const { data: ps, error: readError } = await (supabase as any)
        .from("platform_settings").select("theme_presets, id").limit(1).single();
      if (readError) throw readError;
      if (!ps?.id) throw new Error("Missing platform settings row");
      const { error: updateError } = await (supabase as any).from("platform_settings")
        .update({ theme_presets: [newTheme, ...(ps?.theme_presets || [])] })
        .eq("id", ps.id);
      if (updateError) throw updateError;
      await fetchPlatformSettings();
      toast.success(`"${name}" saved!`);
      setThemeName("");
      if (activeTab !== "generate") loadGallery();
    } catch (e: any) {
      const name = themeName.trim() || generatedTheme.name;
      const localTheme: ThemePreset = {
        id: `local-ai-${Date.now()}`,
        name,
        category: "AI Lab",
        isPopular: false,
        backgroundColor: generatedTheme.backgroundColor,
        cardColor: generatedTheme.cardColor,
        textColor: generatedTheme.textColor,
        buttonStyle: generatedTheme.buttonStyle,
        buttonBg: generatedTheme.buttonBg,
        buttonText: generatedTheme.buttonText,
        gradientFrom: generatedTheme.gradientFrom,
        gradientTo: generatedTheme.gradientTo,
        fontFamily: generatedTheme.fontFamily,
        layoutMode: generatedTheme.layoutType || "list",
        cardStyle: generatedTheme.cardStyle || "classic",
        profileStyleVariant: generatedTheme.profileStyleVariant,
      };
      if (saveLocalTheme(localTheme)) {
        setGalleryThemes((prev) => [localTheme, ...prev]);
        toast.success(`"${name}" saved locally`);
      } else {
        toast.error(e.message || "Save failed");
      }
    } finally { setIsSaving(false); }
  };

  const handleDeleteGalleryTheme = async (id: string) => {
    try {
      const { data: ps } = await (supabase as any)
        .from("platform_settings").select("theme_presets, id").limit(1).single();
      await (supabase as any).from("platform_settings")
        .update({ theme_presets: (ps?.theme_presets || []).filter((t: any) => t.id !== id) })
        .eq("id", ps.id);
      await fetchPlatformSettings();
      setGalleryThemes(prev => prev.filter(t => t.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed"); }
  };

  const tabs = [
    { id: "generate" as GalleryTab, label: "Generator", icon: Brush },
    { id: "gallery"  as GalleryTab, label: "Gallery",   icon: LayoutGrid },
    ...(isAdmin ? [{ id: "admin" as GalleryTab, label: "Admin", icon: Globe }] : []),
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Tab strip */}
      <div className="flex items-center gap-2 p-2 bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id ? "bg-black text-white" : "text-black/40 hover:text-black hover:bg-black/5")}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── GENERATOR ─────────────────────────────────────────────────────── */}
      {activeTab === "generate" && (
        <Card className="bruddle-card p-6 md:p-8 bg-white space-y-8">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E0E7FF] border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <Droplets className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Design Clone Studio</h2>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-0.5">
                Upload any UI design — we clone its colors, card style, and button shape as a theme
              </p>
            </div>
          </div>

          {/* ── Drop Zone ── */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
            className={cn(
              "relative border-4 border-dashed rounded-3xl transition-all",
              !imagePreview && "cursor-pointer",
              isDragging ? "border-black bg-[#FDE68A] scale-[1.01]" : "border-black/20 hover:border-black"
            )}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {imagePreview ? (
              <div className="p-5 space-y-5">
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                  {/* Image thumbnail — for reference only, NOT the background */}
                  <div className="relative shrink-0">
                    <div className="w-44 h-60 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                      <img src={imagePreview} alt="Source design" className="w-full h-full object-cover" />
                    </div>
                    <button
                      className="absolute -top-3 -right-3 w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-xl z-10 hover:scale-110 transition-all border-2 border-white/20"
                      onClick={e => { e.stopPropagation(); clearImage(); }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-[8px] font-black uppercase tracking-widest text-black/30 mt-3 text-center">
                      Analysis Reference
                    </p>
                  </div>

                  {/* Analysis panel */}
                  <div className="flex-1 min-w-0 space-y-5">
                    {isExtracting ? (
                      <div className="flex items-center gap-3 py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                        <div>
                          <p className="text-sm font-black text-black">Analyzing design style...</p>
                          <p className="text-[10px] text-black/40 font-medium">Extracting colors, card style, button shape</p>
                        </div>
                      </div>
                    ) : palette ? (
                      <>
                        {/* Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-emerald-500 bg-[#D1FAE5] text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            {palette.allColors.length} colors extracted
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider",
                            palette.isDark ? "border-slate-800 bg-slate-900 text-slate-100" : "border-amber-400 bg-[#FEF9C3] text-amber-900"
                          )}>
                            {palette.isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                            {palette.isDark ? "Dark palette" : "Light palette"}
                          </div>
                        </div>

                        {/* Swatches */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-2">Extracted Colours</p>
                          <div className="flex flex-wrap gap-2">
                            {palette.allColors.map((hex, i) => (
                              <div key={i} className="group/sw relative">
                                <div
                                  className="w-9 h-9 rounded-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-1 transition-transform"
                                  style={{ backgroundColor: hex }}
                                  onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }}
                                />
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black text-black/40 hidden group-hover/sw:block whitespace-nowrap">{hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Detected style tags */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-2">Detected Design Style</p>
                          <div className="flex flex-wrap gap-2">
                            <StylePill label={`${palette.style.buttonShape} buttons`} active />
                            <StylePill label={`${palette.style.cardStyle} cards`}     active />
                            <StylePill label={palette.isDark ? "dark UI"  : "light UI"}  active />
                            <StylePill label={palette.style.isVibrant  ? "vibrant"   : palette.style.isMinimal ? "minimal" : "balanced"} active />
                            {palette.style.hasGradient    && <StylePill label="gradient" active />}
                            {palette.style.hasBoldAccent  && <StylePill label="bold accent" active />}
                            {palette.style.isMonochrome   && <StylePill label="monochrome" active />}
                          </div>
                        </div>

                        {/* Color role mapping */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Background", color: palette.background },
                            { label: "Accent / Button", color: palette.primary },
                            { label: "Gradient End",  color: palette.secondary },
                            { label: "Text",         color: palette.text },
                          ].map(({ label, color }) => (
                            <div key={label} className="flex items-center gap-2 p-2 border-2 border-black/10 rounded-xl">
                              <div className="w-5 h-5 rounded-lg border border-black/20 shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-[9px] font-black uppercase text-black/50 truncate">{label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="p-12 flex flex-col items-center gap-5">
                <div className={cn(
                  "w-24 h-24 rounded-3xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all",
                  isDragging ? "bg-black rotate-6 scale-110" : "bg-[#FDE68A] hover:rotate-3"
                )}>
                  <Upload className={cn("w-10 h-10 transition-colors", isDragging ? "text-white" : "text-black")} />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-black text-lg">Drop any UI design here</p>
                  <p className="text-sm text-black/50 font-medium">Linktree template · Canva design · App screenshot · Moodboard</p>
                  <p className="text-[11px] text-black/30 font-medium">PNG · JPG · WEBP — we clone the color + style, not use it as background</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#D1FAE5] border-2 border-black rounded-xl">
                    <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Colors cloned exactly</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#E0E7FF] border-2 border-black rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900">Card + button style matched</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Text prompt fallback ─────────────────────────────────────── */}
          <div className="space-y-4 pt-4 border-t-2 border-dashed border-black/10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Guiding Prompt (Optional with image)</p>
              {prompt && (
                <button onClick={() => setPrompt("")} className="text-[9px] font-black uppercase text-pink-500 hover:text-pink-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear Prompt
                </button>
              )}
            </div>
            
            <div className="flex gap-3 relative">
              <div className="flex-1 relative">
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Paste HTML/CSS, a Website URL, or describe a vibe: 'Make it look like a minimalist dark-mode crypto dashboard with neon accents'..."
                  className="min-h-[120px] rounded-3xl border-2 border-black/10 focus:border-black bg-black/[0.02] text-sm font-medium resize-none px-5 py-4 transition-all placeholder:text-black/20"
                />
                <div className="absolute right-4 bottom-4 flex gap-2">
                   <button onClick={() => setPrompt("Minimalist brutalist design with high contrast black and yellow")} className="px-2 py-1 bg-white border border-black/10 rounded-lg text-[9px] font-bold text-black/40 hover:text-black transition-colors">Example 1</button>
                   <button onClick={() => setPrompt("Soft organic shapes, earthy clay tones, luxury ceramic aesthetic")} className="px-2 py-1 bg-white border border-black/10 rounded-lg text-[9px] font-bold text-black/40 hover:text-black transition-colors">Example 2</button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  onClick={imagePreview ? () => processImage(imagePreview) : generateFromPrompt}
                  disabled={isGenerating || isExtracting || (!prompt.trim() && !imagePreview)}
                  className="w-32 h-20 rounded-3xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] active:translate-y-0 active:shadow-none transition-all flex-col gap-2"
                >
                  {isGenerating || isExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-400" />}
                  <span>{imagePreview ? "Re-Clone" : "Generate"}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="w-32 h-14 rounded-2xl border-2 border-black font-black uppercase tracking-widest text-[9px] flex items-center gap-2 hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? "Change" : "Attach"}
                </Button>
              </div>
            </div>

            {!imagePreview && (
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Elite Fitness", p: "Dark mode, glass cards, high-contrast, premium fitness" },
                  { label: "Nordic Luxe",  p: "White space, light gray, soft shadows, scandinavian" },
                  { label: "Cyber Punk",   p: "Neon purple and teal, pitch black background, glowing buttons" },
                  { label: "Warm Clay",    p: "Terra cotta, beige, soft organic shapes, ceramic artisan" },
                ].map(ps => (
                  <button key={ps.label} onClick={() => setPrompt(ps.p)}
                    className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all",
                      prompt.includes(ps.label) ? "bg-black text-white border-black" : "bg-white text-black/40 border-black/5 hover:border-black/20 hover:text-black")}>
                    {ps.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Generated theme result ───────────────────────────────────── */}
          <AnimatePresence>
            {generatedTheme && !isExtracting && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="space-y-6 pt-6 border-t-4 border-black"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30">Cloned Theme</p>
                    <h3 className="text-2xl font-black text-black tracking-tight">{generatedTheme.name}</h3>
                    <p className="text-[10px] font-medium text-black/40 mt-0.5">
                      {generatedTheme.cardStyle} cards · {generatedTheme.buttonStyle} buttons
                      {generatedTheme.gradientFrom ? " · gradient bg" : " · solid bg"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {[
                      { hex: generatedTheme.backgroundColor, label: "BG" },
                      { hex: generatedTheme.buttonBg,        label: "Accent" },
                      { hex: generatedTheme.textColor,       label: "Text" },
                    ].map(({ hex, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]" style={{ backgroundColor: hex }} />
                        <span className="text-[8px] font-black uppercase text-black/30">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live preview card */}
                {previewTheme && (
                  <div className="rounded-2xl overflow-hidden border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <ThemePreviewCard theme={previewTheme} selected={false} onSelect={() => {}} />
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleApply}
                    className="w-full h-13 rounded-2xl bg-black text-white font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Apply to My Profile Now
                  </Button>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Name this theme..."
                      value={themeName}
                      onChange={e => setThemeName(e.target.value)}
                      className="h-11 rounded-xl border-2 border-black/10 focus:border-black text-sm font-bold flex-1"
                    />
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}
                      className="h-11 rounded-xl border-2 border-black text-black font-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all shrink-0 px-4">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                    {isAdmin && (
                      <Button onClick={() => handleSave(true)} disabled={isSaving}
                        className="h-11 rounded-xl bg-[#D1FAE5] text-black border-2 border-black font-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all shrink-0 px-4">
                        <Globe className="w-4 h-4 mr-2" /> Publish
                      </Button>
                    )}
                  </div>
                  <p className="text-[9px] font-medium text-black/30 text-center">
                    Save → private AI Lab · Publish → community gallery (Admin only)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* ── GALLERY ────────────────────────────────────────────────────────── */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Community Gallery</h2>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-0.5">AI-generated & published themes</p>
            </div>
            <Badge className="bg-[#E0E7FF] text-black border-2 border-black text-[10px] px-3 h-7 font-black uppercase tracking-widest">
              {galleryThemes.length} Themes
            </Badge>
          </div>
          {loadingGallery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-72 bg-black/5 animate-pulse rounded-[28px] border-4 border-black/10" />)}
            </div>
          ) : galleryThemes.length === 0 ? (
            <Card className="bruddle-card p-16 bg-white flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#FDE68A] border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Palette className="w-9 h-9 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black">No community themes yet</h3>
                <p className="text-sm text-black/40 font-medium mt-1 max-w-xs mx-auto">
                  Upload a design in the Generator tab to clone its style, then publish to share with everyone.
                </p>
              </div>
              <Button onClick={() => setActiveTab("generate")} className="bg-black text-white font-black uppercase tracking-widest rounded-xl h-11 px-6 shadow-[3px_3px_0_0_rgba(0,0,0,0.3)]">
                Cloning Studio
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {galleryThemes.map(theme => (
                <div key={theme.id} className="space-y-2">
                  <ThemePreviewCard theme={theme} selected={false} onSelect={handleApplyGallery} />
                  <Badge className="bg-[#D1FAE5] text-emerald-900 border-2 border-emerald-900 text-[9px] px-2 h-5 font-black uppercase">{theme.category}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN ──────────────────────────────────────────────────────────── */}
      {activeTab === "admin" && isAdmin && (
        <Card className="bruddle-card p-6 md:p-8 bg-white space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE68A] border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">Theme Gallery Admin</h2>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-0.5">Manage all community & AI Lab themes</p>
            </div>
          </div>
          {loadingGallery ? (
            <div className="h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black/30" /></div>
          ) : galleryThemes.length === 0 ? (
            <div className="text-center py-8 text-black/30"><Palette className="w-8 h-8 mx-auto mb-2" /><p className="text-sm font-black uppercase">No gallery themes yet</p></div>
          ) : (
            <div className="space-y-3">
              {galleryThemes.map(theme => (
                <div key={theme.id} className="flex items-center gap-4 p-4 border-2 border-black rounded-2xl hover:bg-black/[0.02] transition-all group">
                  <div className="flex gap-1.5 shrink-0">
                    {[theme.backgroundColor, theme.buttonBg, theme.textColor].map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg border-2 border-black" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black truncate">{theme.name}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30">{theme.category}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="sm" variant="outline"
                      className="h-8 px-3 text-[10px] font-black uppercase border-2 border-black rounded-xl"
                      onClick={() => handleApplyGallery(theme)}>
                      <Eye className="w-3 h-3 mr-1.5" /> Apply
                    </Button>
                    <Button size="sm"
                      className="h-8 px-3 text-[10px] font-black uppercase bg-red-500 text-white border-2 border-red-500 rounded-xl hover:bg-red-600"
                      onClick={() => handleDeleteGalleryTheme(theme.id)}>
                      <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIThemeCreator;
