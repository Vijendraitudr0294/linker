import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useLinksStore } from "@/stores/linksStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { User, AtSign, FileText, Save, AlertCircle, IndianRupee, Smartphone, X, Users2, Zap } from "lucide-react";
import NotificationPreferences from "@/components/dashboard/NotificationPreferences";
import { profileSchema } from "@/lib/validation";
import AvatarUpload from "@/components/dashboard/AvatarUpload";
import EmojiPicker from "@/components/dashboard/EmojiPicker";
import SocialLinksEditor, { type SocialLinkConfig } from "@/components/dashboard/SocialLinksEditor";
import ProfilePreview from "@/components/dashboard/ProfilePreview";

const BIO_MAX = 160;
const SETTINGS_DRAFT_PREFIX = "linkvertex_settings_draft_";

type SettingsDraft = {
  name: string;
  username: string;
  bio: string;
  upiId: string;
  socialLinks: SocialLinkConfig[];
  socialStats: {
    ig_followers: string;
    fb_likes: string;
    tiktok_followers: string;
    youtube_subs: string;
  };
  creatorMetrics: {
    engagement_rate: string;
    avg_views: string;
    reach: string;
  };
};

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
  const settings = useAppearanceStore((s) => s.settings);
  const links = useLinksStore((s) => s.links);
  const activeLinks = links.filter((l) => l.enabled);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [upiId, setUpiId] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkConfig[]>([]);
  const [socialStats, setSocialStats] = useState({
    ig_followers: "",
    fb_likes: "",
    tiktok_followers: "",
    youtube_subs: "",
  });
  const [creatorMetrics, setCreatorMetrics] = useState({
    engagement_rate: "",
    avg_views: "",
    reach: "",
  });
  const [errors, setErrors] = useState<{ name?: string; username?: string; bio?: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) {
      const draftKey = `${SETTINGS_DRAFT_PREFIX}${user.user_id}`;
      const raw = localStorage.getItem(draftKey);

      if (raw) {
        try {
          const draft = JSON.parse(raw) as SettingsDraft;
          setName(draft.name ?? user.name);
          setUsername(draft.username ?? user.username);
          setBio(draft.bio ?? user.bio);
          setUpiId(draft.upiId ?? (user.upi_id || ""));
          setSocialLinks(draft.socialLinks ?? (user.social_links || []));
          setSocialStats(draft.socialStats ?? {
            ig_followers: user.social_stats?.ig_followers || "",
            fb_likes: user.social_stats?.fb_likes || "",
            tiktok_followers: user.social_stats?.tiktok_followers || "",
            youtube_subs: user.social_stats?.youtube_subs || "",
          });
          setCreatorMetrics(draft.creatorMetrics ?? {
            engagement_rate: user.creator_metrics?.engagement_rate || "",
            avg_views: user.creator_metrics?.avg_views || "",
            reach: user.creator_metrics?.reach || "",
          });
          return;
        } catch {
          localStorage.removeItem(draftKey);
        }
      }

      setName(user.name);
      setUsername(user.username);
      setBio(user.bio);
      setUpiId(user.upi_id || "");
      setSocialLinks(user.social_links || []);
      setSocialStats({
        ig_followers: user.social_stats?.ig_followers || "",
        fb_likes: user.social_stats?.fb_likes || "",
        tiktok_followers: user.social_stats?.tiktok_followers || "",
        youtube_subs: user.social_stats?.youtube_subs || "",
      });
      setCreatorMetrics({
        engagement_rate: user.creator_metrics?.engagement_rate || "",
        avg_views: user.creator_metrics?.avg_views || "",
        reach: user.creator_metrics?.reach || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const draftKey = `${SETTINGS_DRAFT_PREFIX}${user.user_id}`;
    const draft: SettingsDraft = {
      name,
      username,
      bio,
      upiId,
      socialLinks,
      socialStats,
      creatorMetrics,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [user, name, username, bio, upiId, socialLinks, socialStats, creatorMetrics]);

  const insertEmoji = (emoji: string) => {
    const textarea = bioRef.current;
    if (!textarea) {
      if (bio.length + emoji.length <= BIO_MAX) setBio(bio + emoji);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBio = bio.slice(0, start) + emoji + bio.slice(end);
    if (newBio.length <= BIO_MAX) {
      setBio(newBio);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
  };

  const handleSave = async () => {
    const result = profileSchema.safeParse({ name, username, bio });
    if (!result.success) {
      const fieldErrors: { name?: string; username?: string; bio?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        upi_id: upiId.trim(),
        social_links: socialLinks,
        social_stats: socialStats,
        creator_metrics: creatorMetrics,
      });
      localStorage.removeItem(`${SETTINGS_DRAFT_PREFIX}${user.user_id}`);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  if (!user) return null;

  const bioLength = bio.length;
  const bioPercentage = (bioLength / BIO_MAX) * 100;

  const previewLinks = activeLinks.length > 0
    ? activeLinks.map((l) => ({ id: l.id, title: l.title, platform: l.platform }))
    : [{ id: "1", title: "My Website", platform: "website" as const }, { id: "2", title: "Social Media", platform: "website" as const }];

  const previewUser = { 
    name, 
    username, 
    avatar_url: user.avatar_url, 
    social_links: socialLinks,
    social_stats: socialStats 
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
      {/* Main form */}
      <div className="flex-1 space-y-4 md:space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Edit your profile information</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="xl:hidden gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">{showPreview ? "Hide" : "Preview"}</span>
          </Button>
        </div>

        <Card className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <Label className="text-sm md:text-base font-heading font-semibold mb-3 block">Profile Photo</Label>
            <AvatarUpload />
          </div>

          <div className="border-t border-border pt-4 md:pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                Display Name
              </Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                placeholder="Your display name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <AtSign className="w-4 h-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="yourusername"
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.username}
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                  Your public profile: {window.location.origin}/p/{username || "username"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Bio
                </Label>
                <EmojiPicker onSelect={insertEmoji} />
              </div>
              <Textarea
                ref={bioRef}
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX) {
                    setBio(e.target.value);
                    setErrors((prev) => ({ ...prev, bio: undefined }));
                  }
                }}
                placeholder="Tell visitors about yourself... ✨"
                rows={3}
                maxLength={BIO_MAX}
                className={errors.bio ? "border-destructive" : ""}
              />
              <div className="flex items-center justify-between">
                {errors.bio ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.bio}
                  </p>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${bioPercentage}%`,
                        backgroundColor: bioPercentage > 90 ? "hsl(var(--destructive))" : bioPercentage > 70 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <span className={`text-xs ${bioPercentage > 90 ? "text-destructive" : "text-muted-foreground"}`}>
                    {bioLength}/{BIO_MAX}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* UPI Payment Settings */}
        <Card className="p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-base md:text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              Payment Settings
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Add your UPI ID so customers can pay you directly via QR code
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              UPI ID
            </Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi or 9876543210@paytm"
            />
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Shows a UPI payment QR code on your catalog items.
            </p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await updateProfile({ upi_id: upiId.trim() });
                toast.success("Payment settings saved!");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save payment settings");
              }
            }}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" /> Save Payment Settings
          </Button>
        </Card>

        {/* Creator Stats Settings */}
        <Card className="p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-base md:text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Users2 className="w-5 h-5 text-primary" />
              Creator Stats
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Show off your social media reach with premium chips on your profile
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Instagram Followers</Label>
              <Input
                value={socialStats.ig_followers}
                onChange={(e) => setSocialStats(s => ({ ...s, ig_followers: e.target.value }))}
                placeholder="e.g. 1.2M or 15K"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">TikTok Followers</Label>
              <Input
                value={socialStats.tiktok_followers}
                onChange={(e) => setSocialStats(s => ({ ...s, tiktok_followers: e.target.value }))}
                placeholder="e.g. 2.4M"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Facebook Likes</Label>
              <Input
                value={socialStats.fb_likes}
                onChange={(e) => setSocialStats(s => ({ ...s, fb_likes: e.target.value }))}
                placeholder="e.g. 850K"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">YouTube Subscribers</Label>
              <Input
                value={socialStats.youtube_subs}
                onChange={(e) => setSocialStats(s => ({ ...s, youtube_subs: e.target.value }))}
                placeholder="e.g. 1.1M"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await updateProfile({ social_stats: socialStats });
                toast.success("Social stats updated!");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save social stats");
              }
            }}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" /> Save Stats
          </Button>
        </Card>

        {/* Social Media Icons */}
        <Card className="p-4 md:p-6">
          <SocialLinksEditor socialLinks={socialLinks} onChange={setSocialLinks} />
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await updateProfile({ social_links: socialLinks });
                  toast.success("Social icons updated!");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to save social icons");
                }
              }}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" /> Save Social Icons
            </Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <NotificationPreferences />

        {/* Creator Metrics Settings */}
        <Card className="p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-base md:text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Engagement Metrics
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Add your engagement rate and average views to attract more bookings
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Engagement Rate</Label>
              <Input
                value={creatorMetrics.engagement_rate}
                onChange={(e) => setCreatorMetrics(s => ({ ...s, engagement_rate: e.target.value }))}
                placeholder="e.g. 5.2%"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Avg. Views</Label>
              <Input
                value={creatorMetrics.avg_views}
                onChange={(e) => setCreatorMetrics(s => ({ ...s, avg_views: e.target.value }))}
                placeholder="e.g. 100K"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Monthly Reach</Label>
              <Input
                value={creatorMetrics.reach}
                onChange={(e) => setCreatorMetrics(s => ({ ...s, reach: e.target.value }))}
                placeholder="e.g. 1.5M"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await updateProfile({ creator_metrics: creatorMetrics });
                toast.success("Metrics updated!");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to save metrics");
              }
            }}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" /> Save Metrics
          </Button>
        </Card>

        {/* Account Info */}
        <Card className="p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-base md:text-lg font-heading font-semibold text-foreground">Account Info</h2>
            <p className="text-muted-foreground text-xs md:text-sm">Your account details</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border gap-2">
              <span className="text-muted-foreground shrink-0">Email</span>
              <span className="text-foreground truncate text-right">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Role</span>
              <span className={`font-medium ${user.role === "admin" ? "text-primary" : "text-foreground"}`}>
                {user.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live mobile preview - desktop sidebar */}
      <div className="hidden xl:block w-80 shrink-0 self-start sticky top-6 z-30">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <Label className="text-base font-heading font-semibold">Live Preview</Label>
          </div>
          <ProfilePreview
            settings={settings}
            user={previewUser}
            links={previewLinks}
            creatorMetrics={creatorMetrics}
          />
        </div>
      </div>

      {/* Mobile/tablet preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-background/95 xl:hidden flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-12 right-0 h-10 w-10"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <ProfilePreview
              settings={settings}
              user={previewUser}
              links={previewLinks}
              creatorMetrics={creatorMetrics}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
