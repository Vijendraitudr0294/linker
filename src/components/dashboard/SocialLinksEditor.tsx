import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { SocialIcon, platformOptions } from "@/components/SocialIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SocialPlatform } from "@/stores/linksStore";

export interface SocialLinkConfig {
  platform: string;
  url: string;
}

const SOCIAL_PLATFORMS = platformOptions.filter((p) =>
  ["instagram", "twitter", "youtube", "tiktok", "facebook", "linkedin", "github", "spotify", "twitch", "discord", "snapchat", "pinterest", "whatsapp", "telegram"].includes(p.value)
);

interface SocialLinksEditorProps {
  socialLinks: SocialLinkConfig[];
  onChange: (links: SocialLinkConfig[]) => void;
}

const SocialLinksEditor = ({ socialLinks, onChange }: SocialLinksEditorProps) => {
  const [adding, setAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState<string>("instagram");
  const [newUrl, setNewUrl] = useState("");

  const addLink = () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    onChange([...socialLinks, { platform: newPlatform, url }]);
    setNewUrl("");
    setNewPlatform("instagram");
    setAdding(false);
  };

  const removeLink = (index: number) => {
    onChange(socialLinks.filter((_, i) => i !== index));
  };

  // Filter out already-added platforms
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !socialLinks.some((l) => l.platform === p.value)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-heading font-semibold">Social Media Icons</Label>
        {availablePlatforms.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        These show as circular icons on your public profile. Add your social URLs.
      </p>

      {socialLinks.length > 0 && (
        <div className="space-y-2">
          {socialLinks.map((link, i) => {
            const platformInfo = SOCIAL_PLATFORMS.find((p) => p.value === link.platform);
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <SocialIcon platform={link.platform as SocialPlatform} className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{platformInfo?.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeLink(i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {adding && availablePlatforms.length > 0 && (
        <div className="p-3 border-2 border-primary/30 rounded-lg space-y-2">
          <Select value={newPlatform} onValueChange={setNewPlatform}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePlatforms.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <SocialIcon platform={p.value as SocialPlatform} className="w-4 h-4" />
                    {p.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="https://instagram.com/yourprofile"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-9 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addLink}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewUrl(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {socialLinks.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground italic">No social icons added yet</p>
      )}
    </div>
  );
};

export default SocialLinksEditor;
