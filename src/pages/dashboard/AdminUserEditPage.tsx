import { useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Save, User, Link2, Palette, Loader2, Globe } from "lucide-react";
import type { Json, Tables } from "@/integrations/supabase/types";
import { isSuperAdminUser } from "@/lib/authRoles";

type LinkRow = Tables<"links">;
type ProfileRow = Tables<"profiles">;
type AppearanceRow = Tables<"appearance_settings">;

interface EditableProfile {
  name: string;
  username: string;
  bio: string;
  status: string;
  role: string;
  email: string;
  social_stats: Record<string, string>;
  creator_metrics: Record<string, string>;
}

interface EditableAppearance {
  theme_id: string;
  background_color: string;
  text_color: string;
  button_bg: string;
  button_text: string;
  font_family: string;
}

const parseStringRecord = (value: Json | null): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value as Record<string, Json>).reduce<Record<string, string>>((acc, [key, raw]) => {
    if (typeof raw === "string") acc[key] = raw;
    return acc;
  }, {});
};

const AdminUserEditPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [appearance, setAppearance] = useState<EditableAppearance | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [profileRes, linksRes, appearanceRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("links").select("*").eq("user_id", userId).order("sort_order"),
      supabase.from("appearance_settings").select("*").eq("user_id", userId).single(),
    ]);

    if (profileRes.data) {
      const row: ProfileRow = profileRes.data;
      setProfile({
        name: row.name || "",
        username: row.username || "",
        bio: row.bio || "",
        status: row.status || "active",
        role: row.role || "user",
        email: row.email || "",
        social_stats: parseStringRecord(row.social_stats),
        creator_metrics: parseStringRecord(row.creator_metrics),
      });
    } else {
      setProfile(null);
    }

    if (linksRes.data) {
      setLinks(linksRes.data as LinkRow[]);
    } else {
      setLinks([]);
    }

    if (appearanceRes.data) {
      const row: AppearanceRow = appearanceRes.data;
      setAppearance({
        theme_id: row.theme_id || "",
        background_color: row.background_color || "#ffffff",
        text_color: row.text_color || "#111111",
        button_bg: row.button_bg || "#111111",
        button_text: row.button_text || "#ffffff",
        font_family: row.font_family || "Inter",
      });
    } else {
      setAppearance(null);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void fetchUserData();
    }
  }, [fetchUserData, userId]);

  const saveProfile = async () => {
    if (!profile || !userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        status: profile.status,
        role: profile.role,
        social_stats: profile.social_stats,
        creator_metrics: profile.creator_metrics,
      })
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile saved");
  };

  const toggleLink = async (linkId: string, enabled: boolean) => {
    await supabase.from("links").update({ enabled }).eq("id", linkId);
    setLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, enabled } : link)));
    toast.success(`Link ${enabled ? "enabled" : "disabled"}`);
  };

  const saveAppearance = async () => {
    if (!appearance || !userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("appearance_settings")
      .update({
        theme_id: appearance.theme_id,
        background_color: appearance.background_color,
        text_color: appearance.text_color,
        button_bg: appearance.button_bg,
        button_text: appearance.button_text,
        font_family: appearance.font_family,
      })
      .eq("user_id", userId);
    setSaving(false);
    if (error) toast.error("Failed to save appearance");
    else toast.success("Appearance saved");
  };

  if (!isSuperAdminUser(currentUser)) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-muted-foreground">User not found</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Normalized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/admin")} className="h-10 w-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Edit Creator
              <Badge variant="secondary" className="uppercase text-[10px]">{profile.role}</Badge>
            </h1>
            <p className="text-muted-foreground text-sm">{profile.email} • @{profile.username}</p>
          </div>
        </div>
        <Button onClick={() => window.open(`/p/${profile.username}`, "_blank")} variant="outline" size="sm">
          <Globe className="w-4 h-4 mr-2" /> View Public Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Profile Identity</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Display Name</Label>
                <Input value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Username</Label>
                <Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Biography</Label>
              <Textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">System Role</Label>
                <select
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Account Status</Label>
                <select
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Frozen</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-semibold">Social Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {["ig_followers", "tiktok_followers", "fb_likes", "youtube_subs"].map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{key.replace("_", " ")}</Label>
                    <Input
                      value={profile.social_stats[key] || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          social_stats: { ...profile.social_stats, [key]: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-semibold">Creator Metrics</h3>
              <div className="grid grid-cols-3 gap-3">
                {["engagement_rate", "avg_views", "reach"].map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{key.replace("_", " ")}</Label>
                    <Input
                      value={profile.creator_metrics[key] || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          creator_metrics: { ...profile.creator_metrics, [key]: e.target.value },
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="w-full gap-2">
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Active Links ({links.length})</h2>
          </div>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center italic">No links registered</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold truncate">{link.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <Switch checked={link.enabled} onCheckedChange={(value) => toggleLink(link.id, value)} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {appearance && (
          <Card className="p-6 space-y-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Appearance Controls</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Theme Identifier</Label>
                <Input value={appearance.theme_id} onChange={(e) => setAppearance({ ...appearance, theme_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Background Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={appearance.background_color} onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })} className="w-10 h-10 rounded border" />
                  <Input value={appearance.background_color} onChange={(e) => setAppearance({ ...appearance, background_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Text Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={appearance.text_color} onChange={(e) => setAppearance({ ...appearance, text_color: e.target.value })} className="w-10 h-10 rounded border" />
                  <Input value={appearance.text_color} onChange={(e) => setAppearance({ ...appearance, text_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Button Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={appearance.button_bg} onChange={(e) => setAppearance({ ...appearance, button_bg: e.target.value })} className="w-10 h-10 rounded border" />
                  <Input value={appearance.button_bg} onChange={(e) => setAppearance({ ...appearance, button_bg: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Button Text</Label>
                <div className="flex gap-2">
                  <input type="color" value={appearance.button_text} onChange={(e) => setAppearance({ ...appearance, button_text: e.target.value })} className="w-10 h-10 rounded border" />
                  <Input value={appearance.button_text} onChange={(e) => setAppearance({ ...appearance, button_text: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Primary Font</Label>
                <Input value={appearance.font_family} onChange={(e) => setAppearance({ ...appearance, font_family: e.target.value })} />
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
