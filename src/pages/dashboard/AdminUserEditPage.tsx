import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Link2, Palette, Loader2 } from "lucide-react";

const AdminUserEditPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [appearance, setAppearance] = useState<any>(null);

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    const [profileRes, linksRes, appearanceRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId!).single(),
      supabase.from("links").select("*").eq("user_id", userId!).order("sort_order"),
      (supabase.from("appearance_settings") as any).select("*").eq("user_id", userId!).single(),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (linksRes.data) setLinks(linksRes.data);
    if (appearanceRes.data) setAppearance(appearanceRes.data);
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      status: profile.status,
      role: profile.role,
    }).eq("user_id", userId!);
    setSaving(false);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved");
  };

  const toggleLink = async (linkId: string, enabled: boolean) => {
    await supabase.from("links").update({ enabled }).eq("id", linkId);
    setLinks((prev) => prev.map((l) => l.id === linkId ? { ...l, enabled } : l));
    toast.success(`Link ${enabled ? "enabled" : "disabled"}`);
  };

  const saveAppearance = async () => {
    if (!appearance) return;
    setSaving(true);
    const { error } = await (supabase.from("appearance_settings") as any)
      .update({
        theme_id: appearance.theme_id,
        background_color: appearance.background_color,
        text_color: appearance.text_color,
        button_bg: appearance.button_bg,
        button_text: appearance.button_text,
        font_family: appearance.font_family,
      })
      .eq("user_id", userId!);
    setSaving(false);
    if (error) toast.error("Failed to save appearance");
    else toast.success("Appearance saved");
  };

  if (!currentUser || currentUser.role !== "superadmin") return <Navigate to="/dashboard" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">User not found</div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin")} className="rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">
            Edit User: {profile.name || profile.username}
          </h1>
          <p className="text-xs text-muted-foreground">{profile.email} · @{profile.username}</p>
        </div>
        <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="ml-auto">
          {profile.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="p-5 space-y-4">
          <Label className="text-base font-heading font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Details
          </Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Username</Label>
                <Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <select
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <select
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Label className="text-xs font-black uppercase tracking-widest block mb-3">Social Stats</Label>
              <div className="grid grid-cols-2 gap-3">
                {['ig_followers', 'tiktok_followers', 'fb_likes', 'youtube_subs'].map(key => (
                  <div key={key}>
                    <Label className="text-[10px] uppercase">{key.replace('_', ' ')}</Label>
                    <Input 
                      value={profile.social_stats?.[key] || ""} 
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        social_stats: { ...(profile.social_stats || {}), [key]: e.target.value } 
                      })} 
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Label className="text-xs font-black uppercase tracking-widest block mb-3">Creator Metrics</Label>
              <div className="grid grid-cols-3 gap-3">
                {['engagement_rate', 'avg_views', 'reach'].map(key => (
                  <div key={key}>
                    <Label className="text-[10px] uppercase">{key.replace('_', ' ')}</Label>
                    <Input 
                      value={profile.creator_metrics?.[key] || ""} 
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        creator_metrics: { ...(profile.creator_metrics || {}), [key]: e.target.value } 
                      })} 
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="w-full gap-2 mt-4">
            <Save className="w-4 h-4" /> Save Master Profile
          </Button>
        </Card>

        {/* Links */}
        <Card className="p-5 space-y-4">
          <Label className="text-base font-heading font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Links ({links.length})
          </Label>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No links yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Switch checked={link.enabled} onCheckedChange={(v) => toggleLink(link.id, v)} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Appearance */}
        {appearance && (
          <Card className="p-5 space-y-4 lg:col-span-2">
            <Label className="text-base font-heading font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" /> Appearance
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Theme ID</Label>
                <Input value={appearance.theme_id} onChange={(e) => setAppearance({ ...appearance, theme_id: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={appearance.background_color} onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })} className="w-9 h-9 rounded border cursor-pointer" />
                  <Input value={appearance.background_color} onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Text Color</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={appearance.text_color} onChange={(e) => setAppearance({ ...appearance, text_color: e.target.value })} className="w-9 h-9 rounded border cursor-pointer" />
                  <Input value={appearance.text_color} onChange={(e) => setAppearance({ ...appearance, text_color: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Button BG</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={appearance.button_bg} onChange={(e) => setAppearance({ ...appearance, button_bg: e.target.value })} className="w-9 h-9 rounded border cursor-pointer" />
                  <Input value={appearance.button_bg} onChange={(e) => setAppearance({ ...appearance, button_bg: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Button Text</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={appearance.button_text} onChange={(e) => setAppearance({ ...appearance, button_text: e.target.value })} className="w-9 h-9 rounded border cursor-pointer" />
                  <Input value={appearance.button_text} onChange={(e) => setAppearance({ ...appearance, button_text: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Font Family</Label>
                <Input value={appearance.font_family} onChange={(e) => setAppearance({ ...appearance, font_family: e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button onClick={saveAppearance} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> Save Appearance
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminUserEditPage;
