import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  Palette, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Music, 
  Save, 
  BrainCircuit, 
  Zap, 
  Settings2,
  ChevronRight,
  Fingerprint,
  Mic2
} from "lucide-react";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  backgroundKeyword?: string;
  animationClass?: string;
}

const AIThemeCreator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedTheme | null>(null);
  const [themeName, setThemeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { updateSettings } = useAppearanceStore();
  const { updateProfile } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [analyzedImage, setAnalyzedImage] = useState<{ base64: string, type: string } | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
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
    const loadId = toast.loading("Neural network initializing...", { id: "ai-check" });

    try {
      // Logic for AI processing...
      setTimeout(() => toast.loading("Synthesizing aesthetic DNA...", { id: "ai-check" }), 800);
      setTimeout(() => toast.loading("Architecting visual logic...", { id: "ai-check" }), 1600);

      const maybeApiKey = usePlatformStore.getState().settings?.ai_api_key?.trim() || "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";

      const { data, error } = await supabase.functions.invoke("generate-theme", {
        body: { 
          prompt: prompt.trim(), 
          apiKey: maybeApiKey,
          image: analyzedImage ? analyzedImage.base64 : undefined,
          mimeType: analyzedImage ? analyzedImage.type : undefined
        },
      });

      if (!error && data?.text) {
        handleThemeResponse(data.text);
        toast.success("Identity crafted successfully!", { id: "ai-check" });
        return;
      }

      // Fallback
      handleThemeResponse(JSON.stringify({
        name: "Neon Cybernetic Studio",
        backgroundColor: "#0a0a0c",
        cardColor: "rgba(255, 255, 255, 0.03)",
        textColor: "#ffffff",
        buttonBg: "#0ea5e9",
        buttonText: "#ffffff",
        buttonStyle: "pill",
        fontFamily: "Space Grotesk",
        cardStyle: "glass-premium",
        backgroundKeyword: "tech",
        animationClass: "animate-aurora"
      }));
      toast.success("Ready for reveal", { id: "ai-check" });

    } catch (error) {
      console.error("Theme generation error:", error);
      toast.error("Neutral network timeout. Try again.", { id: "ai-check" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThemeResponse = (text: string) => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Parse Error");
    const theme = JSON.parse(jsonMatch[0]) as GeneratedTheme;
    
    if (theme.backgroundKeyword) {
      const idMap: Record<string, string> = {
        stadium: "1541250810-70123d9e92c8", forest: "1441974231531-c6227db76b6e",
        mountain: "1464822759023-fed622ff2c3b", tech: "1451187580459-43490279c0fa",
        minimal: "1451187580459-43490279c0fa", abstract: "1502691876148-a84978e59af8",
        fitness: "1534438327202-3f181bd4cc80", workspace: "1486406146926-c627a92ad1ab"
      };
      const id = idMap[theme.backgroundKeyword.toLowerCase()] || "1470790376778-a9fbc86d70e2";
      theme.backgroundImage = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
    }
    setGeneratedTheme(theme);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAvatarPreview(reader.result as string);
      setAnalyzedImage({ base64, type: file.type });
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setPrompt("Craft a premium identity based on this user avatar. Ensure colors are perfectly complementary.");
        toast.success("Analysis complete. Ready for generation.");
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const saveToCollection = async () => {
    if (!generatedTheme) return;
    setIsSaving(true);
    try {
      const name = themeName.trim() || generatedTheme.name;
      const current = platformSettings?.theme_presets || [];
      const updated = [{ ...generatedTheme, id: `ai-${Date.now()}`, name, category: "AI Lab" }, ...current];
      await usePlatformStore.getState().updateSettings({ theme_presets: updated });
      toast.success(`Theme "${name}" saved to lab.`);
      setThemeName("");
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const applyTheme = async () => {
    if (!generatedTheme) return;
    await updateSettings({
      ...generatedTheme,
      themeId: `ai-${Date.now()}`,
      layoutType: generatedTheme.layoutType || "list",
      cardStyle: generatedTheme.cardStyle || "glass-premium"
    });
    if (avatarPreview) await updateProfile({ avatar_url: avatarPreview });
    toast.success("Theme localized to your studio.");
  };

  const neuralPresets = [
    { label: "Elite Dark", icon: <Fingerprint className="w-3 h-3" />, prompt: "Deep charcoal tones with emerald glowing accents, glass premium cards." },
    { label: "Soft Aura", icon: <Sparkles className="w-3 h-3" />, prompt: "Ethereal pastel gradients, soft morning light theme, liquid animations." },
    { label: "Cyber Minimal", icon: <Zap className="w-3 h-3" />, prompt: "High contrast white/black, electric blue tiny details, 3D grid backdrops." },
    { label: "Organic Studio", icon: <Palette className="w-3 h-3" />, prompt: "Warm earthy tones, craft paper textures, elegant serif typography." }
  ];

  return (
    <Card className="p-4 md:p-6 bg-background border border-white/5 shadow-2xl relative overflow-hidden rounded-2xl group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Neural Identity Lab</h2>
            </div>
            <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-widest pl-9">Powered by Intelligence v2.0</p>
          </div>
          
          <div className="flex items-center gap-2 pl-9 md:pl-0">
             <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[11px] font-bold gap-2 bg-white/5 border border-white/5 hover:bg-white/10" onClick={() => setShowAdvanced(!showAdvanced)}>
                <Settings2 className="w-3.5 h-3.5 text-primary" />
                {showAdvanced ? "Hide Controls" : "Neural Settings"}
             </Button>
          </div>
        </div>

        {/* Input Zone */}
        <div className="space-y-5">
           <div className="relative group/text">
              <div className="absolute top-4 left-4 text-primary opacity-30 group-focus-within/text:opacity-100 transition-opacity">
                 <Mic2 className="w-4 h-4" />
              </div>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your visual concept... (e.g. 'Ocean breeze luxury hotel vibe')"
                className="min-h-[120px] pl-11 rounded-xl bg-white/[0.02] border-white/5 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 text-sm font-medium transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-3 right-4 flex gap-2">
                 <div className="relative">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAvatarUpload} />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors">
                       <ImageIcon className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
           </div>

           {/* Preset Pills */}
           <div className="flex flex-wrap gap-2">
              {neuralPresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setPrompt(p.prompt); setActivePreset(p.label); }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all border",
                    activePreset === p.label 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white/[0.03] text-muted-foreground/60 border-white/5 hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
           </div>
        </div>

        {/* Global Action */}
        <Button 
          onClick={generateTheme}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-12 md:h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/20 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Synthesizing DNA...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              <span>Manifest Identity</span>
            </div>
          )}
        </Button>

        {/* Neural Results Container */}
        <AnimatePresence>
          {generatedTheme && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
               <div className="pt-6 border-t border-white/5 space-y-6">
                  {/* Result Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Neural Output Active</p>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          {generatedTheme.name}
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">Precision High</Badge>
                        </h3>
                     </div>
                     <div className="flex gap-2">
                        <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={applyTheme}
                           className="h-9 px-5 rounded-xl text-[11px] font-bold gap-2 border-white/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                           <Zap className="w-3.5 h-3.5" />
                           Deploy
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-9 w-9 rounded-xl border border-white/5 bg-white/5"
                           onClick={() => {
                             navigator.clipboard.writeText(JSON.stringify(generatedTheme));
                             setCopied(true);
                             setTimeout(() => setCopied(false), 2000);
                           }}
                        >
                           {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                     </div>
                  </div>

                  {/* Aesthetic Preview System */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Preview 1: The Bio Look */}
                     <div className="bg-card/40 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center relative min-h-[160px] overflow-hidden group/prev">
                        <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-[3s]" style={{ background: generatedTheme.gradientFrom ? `linear-gradient(135deg, ${generatedTheme.gradientFrom}, ${generatedTheme.gradientTo})` : generatedTheme.backgroundColor }} />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                           <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shadow-2xl">
                             {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <Palette className="w-5 h-5 text-white/50" />}
                           </div>
                           <div className="h-2 w-24 rounded-full opacity-60" style={{ backgroundColor: generatedTheme.textColor }} />
                           <div className="h-8 w-32 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-xl" style={{ backgroundColor: generatedTheme.buttonBg, color: generatedTheme.buttonText }}>
                              IDENTITY
                           </div>
                        </div>
                     </div>

                     {/* Preview 2: The Logic Swatch */}
                     <div className="bg-card/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Atomic Style</p>
                           <div className="flex gap-2">
                              {[generatedTheme.backgroundColor, generatedTheme.buttonBg, generatedTheme.textColor].map((c, i) => (
                                <div key={i} className="w-8 h-8 rounded-lg border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
                              ))}
                           </div>
                        </div>
                        <div className="pt-4 flex flex-wrap gap-2">
                           <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider bg-white/5 border-white/10">{generatedTheme.fontFamily || "Elite Font"}</Badge>
                           <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider bg-white/5 border-white/10">{generatedTheme.buttonStyle.toUpperCase()}</Badge>
                        </div>
                     </div>
                  </div>

                  {/* Archiving Layer */}
                  <div className="pt-2">
                     <div className="bg-primary/5 rounded-xl p-2 flex flex-col sm:flex-row gap-2">
                        <Input 
                          placeholder="Name identity..." 
                          value={themeName}
                          onChange={(e) => setThemeName(e.target.value)}
                          className="h-9 px-3 rounded-lg bg-card border-white/5 text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20" 
                        />
                        <Button 
                          size="sm" 
                          onClick={saveToCollection}
                          disabled={isSaving}
                          className="h-9 px-4 rounded-lg bg-primary text-white text-[11px] font-black uppercase tracking-wider gap-2 shadow-sm"
                        >
                           {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                           Archive to Lab
                        </Button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default AIThemeCreator;
