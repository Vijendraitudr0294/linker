import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { Upload, Trash2, Link2, Sparkles, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const BackgroundImageUpload = () => {
  const user = useAuthStore((s) => s.user);
  const { settings, updateSettings } = useAppearanceStore();
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.user_id}/bg-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      await updateSettings({
        backgroundImage: urlData.publicUrl,
        backgroundOverlay: "rgba(0,0,0,0.4)",
        themeId: "custom-photo",
        animatedGradient: undefined,
        animationClass: undefined,
      });
      toast.success("Background image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-background", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      if (!data?.image_url) throw new Error("No image returned");

      // Upload the generated base64 image to storage
      const base64 = data.image_url.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const path = `${user.user_id}/bg-ai-${Date.now()}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("user-uploads")
        .upload(path, bytes, { contentType: "image/png", upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      await updateSettings({
        backgroundImage: urlData.publicUrl,
        backgroundOverlay: "rgba(0,0,0,0.4)",
        themeId: "ai-generated",
        animatedGradient: undefined,
        animationClass: undefined,
      });
      toast.success("AI background generated!");
      setPrompt("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const removeBackground = () => {
    updateSettings({ backgroundImage: undefined, backgroundOverlay: undefined });
    toast.success("Background removed");
  };

  return (
    <Card className="p-4 space-y-4">
      <Label className="text-base font-heading font-semibold flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> Background Image
      </Label>

      {/* Current background preview */}
      {settings.backgroundImage && (
        <div className="relative rounded-lg overflow-hidden h-32">
          <img src={settings.backgroundImage} alt="Background" className="w-full h-full object-cover" />
          {settings.backgroundOverlay && (
            <div className="absolute inset-0" style={{ backgroundColor: settings.backgroundOverlay }} />
          )}
          <button
            onClick={removeBackground}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1">
          {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* URL input */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Link2 className="w-3 h-3" /> Or paste image URL
        </Label>
        <Input
          placeholder="https://images.unsplash.com/..."
          value={settings.backgroundImage?.startsWith("http") && !settings.backgroundImage.includes("supabase") ? settings.backgroundImage : ""}
          onChange={(e) => {
            const url = e.target.value;
            if (url) {
              updateSettings({
                backgroundImage: url,
                backgroundOverlay: "rgba(0,0,0,0.4)",
                themeId: "custom-photo",
                animatedGradient: undefined,
                animationClass: undefined,
              });
            }
          }}
          className="h-8 text-xs"
        />
      </div>

      {/* AI Generation */}
      <div className="space-y-2 border-t border-border pt-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> AI Background Generator
        </Label>
        <p className="text-[10px] text-muted-foreground">Describe the background you want and AI will create it</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. sunset over mountains, neon city lights..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-9 text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button size="sm" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Overlay control */}
      {settings.backgroundImage && (
        <div className="space-y-2 border-t border-border pt-3">
          <Label className="text-sm text-muted-foreground">Overlay Darkness</Label>
          <Slider
            min={0}
            max={90}
            step={5}
            defaultValue={[
              settings.backgroundOverlay
                ? Math.round(parseFloat(settings.backgroundOverlay.split(",")[3] || "0.4") * 100)
                : 40,
            ]}
            onValueChange={([val]) => {
              updateSettings({ backgroundOverlay: `rgba(0,0,0,${val / 100})` });
            }}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Light</span>
            <span>Dark</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BackgroundImageUpload;
