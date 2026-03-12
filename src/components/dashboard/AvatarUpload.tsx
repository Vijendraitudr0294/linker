import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Trash2, Upload, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AvatarUpload = () => {
  const { user, updateProfile } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const path = `${user.user_id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: publicUrl });
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAvatar = () => {
    updateProfile({ avatar_url: "" });
    toast.success("Avatar removed");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-1" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {user.avatar_url && (
            <Button size="sm" variant="ghost" onClick={removeAvatar}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG. Max 10MB. Stored in cloud.</p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
};

export default AvatarUpload;
