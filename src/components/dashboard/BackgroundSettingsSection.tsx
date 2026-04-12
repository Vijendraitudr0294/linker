import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ImageIcon, Upload, Loader2, X, Image as ImageIconLucide } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import type { AppearanceSettings } from "@/stores/appearanceStore";
import { cn } from "@/lib/utils";

interface BackgroundSettingsSectionProps {
  settings: AppearanceSettings;
  updateSettings: (data: Partial<AppearanceSettings>) => Promise<void>;
}

const BackgroundSettingsSection = ({ settings, updateSettings }: BackgroundSettingsSectionProps) => {
  const user = useAuthStore((s) => s.user);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Max 5MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user_id}/background-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      await updateSettings({ backgroundImage: publicUrl });
      toast.success("Background image updated!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const overlayOpacity = settings.backgroundOverlay 
    ? parseFloat(settings.backgroundOverlay) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border-2 border-black flex items-center justify-center text-black">
          <ImageIconLucide className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-black text-black tracking-tight uppercase">Background Image</h3>
          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-1">Personalize your page atmosphere.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-24 h-32 rounded-2xl bg-muted border-2 border-black/5 flex items-center justify-center overflow-hidden shrink-0 relative group">
            {settings.backgroundImage ? (
              <>
                <img src={settings.backgroundImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => updateSettings({ backgroundImage: '' })}
                  className="absolute top-1 right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Image URL</Label>
              <Input 
                value={settings.backgroundImage || ''} 
                onChange={(e) => updateSettings({ backgroundImage: e.target.value })}
                placeholder="Paste public image URL..."
                className="h-10 rounded-xl border-2 border-black/10 focus:border-black transition-all text-xs font-bold"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => fileRef.current?.click()} 
                variant="outline" 
                className="rounded-xl h-10 px-6 border-2 border-black text-black font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload
              </Button>
              <input 
                ref={fileRef}
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {settings.backgroundImage && (
          <div className="space-y-4 p-5 rounded-3xl bg-gray-50/50 border-2 border-dashed border-black/10">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] font-black uppercase tracking-widest text-black/60">Overlay Depth</Label>
              <span className="text-[10px] font-black text-black">{Math.round(overlayOpacity)}%</span>
            </div>
            <Slider
              value={[overlayOpacity]}
              max={100}
              step={1}
              onValueChange={([val]) => updateSettings({ backgroundOverlay: (val / 100).toString() })}
              className="py-1"
            />
            <p className="text-[10px] text-muted-foreground italic">Add a dark overlay to make your links pop against the background image.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundSettingsSection;
