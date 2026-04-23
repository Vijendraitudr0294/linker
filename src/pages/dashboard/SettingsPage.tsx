import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useLinks } from "@/hooks/useLinksApi";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, AtSign, FileText, Save, AlertCircle, IndianRupee, Smartphone, X, Users2, Zap, Palette, ChevronDown, ChevronUp, Sparkles, ExternalLink, Copy } from "lucide-react";
import NotificationPreferences from "@/components/dashboard/NotificationPreferences";
import { profileSchema } from "@/lib/validation";
import AvatarUpload from "@/components/dashboard/AvatarUpload";
import EmojiPicker from "@/components/dashboard/EmojiPicker";
import SocialLinksEditor, { type SocialLinkConfig } from "@/components/dashboard/SocialLinksEditor";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import ShareProfile from "@/components/dashboard/ShareProfile";
import ThemePreviewCard from "@/components/dashboard/ThemePreviewCard";
import MailingListIntegrations from "@/components/dashboard/MailingListIntegrations";
import { getThemePresetsFromSettings, type ThemePreset } from "@/data/themes";
import { isAdminRole } from "@/lib/authRoles";
import { cn } from "@/lib/utils";

const BIO_MAX = 160;
const SETTINGS_SECTION_LINKS = [
  { label: "Profile", id: "public-persona" },
  { label: "Revenue", id: "revenue-stream" },
  { label: "Social", id: "connective-matrix" },
  { label: "Mailing List Integrations", id: "mailing-list-integrations" },
] as const;

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { settings, applyTheme } = useAppearanceStore();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const { data: links = [] } = useLinks(user?.user_id);
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
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("public-persona");
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!platformInitialized) {
      void fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  useEffect(() => {
    if (user) {

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
    const sectionIds = SETTINGS_SECTION_LINKS.map((item) => item.id);
    const onScroll = () => {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 180) current = id;
      }
      setActiveSection((prev) => (prev === current ? prev : current));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


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
    const normalizedUsername = username.trim().toLowerCase();

    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        upi_id: upiId.trim(),
        social_links: socialLinks,
        social_stats: socialStats,
        creator_metrics: creatorMetrics,
      });

      if (normalizedUsername !== user.username) {
        try {
          await updateProfile({ username: normalizedUsername });
          toast.success("Profile updated successfully!");
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update username";
          if (message.toLowerCase().includes("username") && message.toLowerCase().includes("taken")) {
            setErrors((prev) => ({
              ...prev,
              username: "Username already taken. Profile updated, but username was not changed.",
            }));
            toast.error("Profile updated, but this username is already taken.");
            return;
          }
          throw err;
        }
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    }
  };

  const quickThemes = useMemo(() => {
    const presets = getThemePresetsFromSettings(platformSettings);
    const featured = presets.filter((theme) => theme.isPopular);
    return (featured.length > 0 ? featured : presets).slice(0, 4);
  }, [platformSettings]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const bioLength = bio.length;
  const bioPercentage = (bioLength / BIO_MAX) * 100;

  const handleQuickThemeSelect = async (theme: ThemePreset) => {
    await applyTheme(theme);
    toast.success(`Theme set to ${theme.name}`);
  };
  const previewLinks = activeLinks.map((l) => ({ id: l.id, title: l.title, platform: l.platform }));

  const previewUser = { 
    name, 
    username,
    bio,
    avatar_url: user.avatar_url, 
    social_links: socialLinks,
    social_stats: socialStats 
  };
  const profileUrl = `${window.location.origin}/p/${username || user.username}`;

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-10 bg-[#F0F2F5] min-h-screen text-[#1D1D1F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .gradient-blur-1 { background: radial-gradient(circle, #D1FAE5 0%, transparent 70%); }
        .gradient-blur-2 { background: radial-gradient(circle, #DBEAFE 0%, transparent 70%); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] gradient-blur-1 opacity-40 -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] gradient-blur-2 opacity-30 translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-4 p-6 md:p-12 rounded-[32px] md:rounded-[48px] bg-white border border-black/5 shadow-2xl shadow-black/[0.04] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-6">
            <User className="w-3.5 h-3.5" />
            Profile Settings
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight flex items-baseline gap-3 md:gap-4 text-black leading-[0.9]">
            Identity <span className="font-script text-primary text-3xl md:text-4xl lowercase opacity-90">studio</span>
          </h1>
          <p className="mt-8 max-w-2xl text-[16px] font-medium text-black/30 leading-relaxed uppercase tracking-widest text-[11px]">
            Manage your profile • <span className="text-black font-black">Everything in one place</span>
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-4">
           <Button
              variant="outline"
              className="rounded-full h-16 px-10 border-black/10 bg-white hover:bg-black/5 transition-all text-[11px] font-medium text-sm shadow-xl flex items-center gap-3"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Smartphone className="w-5 h-5" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button 
               className="rounded-full bg-primary text-primary-foreground hover:bg-black/90 px-8 md:px-12 py-6 md:py-8 h-14 md:h-16 text-[10px] md:text-[11px] font-medium text-sm shadow-2xl transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3"
               onClick={handleSave}
            >
              <Save className="w-6 h-6" />
              Save Changes
            </Button>
        </div>
      </div>

      {/* Mobile Single View Mirror */}
      <div className="lg:hidden w-full mb-10 animate-in fade-in slide-in-from-top-4 duration-700 px-1">
         <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 bg-[#E0F2FE] flex flex-col items-center justify-start relative overflow-hidden rounded-[24px] border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between w-full mb-3 px-1">
               <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white border border-gray-200 flex items-center justify-center text-black">
                     <Smartphone className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-medium text-sm text-black">Live View</span>
               </div>
               <Badge className="bg-white/40 text-black border border-gray-200 rounded-full px-2 py-0.5 text-[8px] font-medium text-sm">
                 Live
               </Badge>
            </div>
            <div className="w-full h-[220px] rounded-[1.8rem] border border-gray-200 overflow-hidden bg-white shadow-sm relative">
               <ProfilePreview 
                  settings={settings} 
                  user={previewUser} 
                  links={previewLinks}
                  catalogItems={catalogItems.filter(i => i.enabled)}
                  compact={true}
                  noFrame={true}
               />
            </div>
         </Card>
      </div>

      <Card className="sticky top-4 z-20 p-4 md:p-5 rounded-[24px] border border-gray-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {SETTINGS_SECTION_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "rounded-full border border-gray-200 px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-colors",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-black hover:bg-black hover:text-white"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </Card>

      <div id="mailing-list-integrations" className="scroll-mt-32">
        <MailingListIntegrations userId={user.user_id} />
      </div>

      <ShareProfile />

      {/* Main Orchestration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          {/* Transition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card className="p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] group hover:shadow-primary/10 transition-all duration-700 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-[100px] -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-10 flex flex-col gap-8">
                  <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
                       Setup Wizard
                    </h2>
                    <p className="text-black/40 text-[15px] font-medium mt-3 leading-relaxed">
                      Re-initialize your identity parameters and onboarding sequence.
                    </p>
                  </div>
                    <Button onClick={() => navigate("/welcome")} className="w-fit rounded-full bg-primary text-primary-foreground px-10 py-7 h-14 text-[10px] font-medium text-sm shadow-2xl transition-all hover:scale-[1.05]">
                    Open Wizard
                  </Button>
               </div>
            </Card>

            <Card className="p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] group hover:shadow-emerald-500/10 transition-all duration-700 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-bl-[100px] -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-10 flex flex-col gap-8">
                  <div className="w-16 h-16 rounded-[24px] bg-emerald-500/5 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Palette className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-black">Design Settings</h2>
                    <p className="text-black/40 text-[15px] font-medium mt-3 leading-relaxed">
                      Refine your visual signature, themes, and global presence.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/dashboard/links?tab=styles")} className="w-fit rounded-full bg-emerald-600 text-white px-10 py-7 h-14 text-[10px] font-medium text-sm shadow-2xl transition-all hover:scale-[1.05]">
                    Open Visual Studio
                  </Button>
               </div>
            </Card>
          </div>

          {/* Primary Persona Node */}
          <Card id="public-persona" className="scroll-mt-28 p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-white shadow-2xl shadow-black/[0.04] space-y-8 md:space-y-12">
            <div className="flex items-center gap-4 pb-8 border-b border-black/5">
              <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Public Profile</h2>
                <p className="text-[15px] font-medium text-black/40">Visible to global network nodes</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-16 items-start">
                <div className="relative group shrink-0">
                   <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-400 to-blue-400 rounded-[44px] blur-xl opacity-20 group-hover:opacity-60 transition duration-700" />
                   <div className="relative">
                      <AvatarUpload user={user} onUpdate={(url) => updateProfile({ avatar_url: url })} />
                   </div>
                </div>
                <div className="flex-1 space-y-10 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-black/30 ml-2">Display Name</Label>
                       <div className="relative">
                          <User className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                          <Input
                            className="h-20 rounded-[32px] border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all pl-20 pr-8 text-[17px] shadow-inner focus:shadow-2xl"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Your Name"
                          />
                       </div>
                       {errors.name && <p className="text-xs text-rose-500 font-black px-6 uppercase tracking-wider">{errors.name}</p>}
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-black/30 ml-2">Unique Alias</Label>
                       <div className="relative">
                          <AtSign className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                          <Input
                             className="h-20 rounded-[32px] border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all pl-20 pr-8 text-[17px] shadow-inner focus:shadow-2xl"
                             value={username}
                             onChange={(e) => {
                               setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                               if (errors.username) setErrors({ ...errors, username: undefined });
                             }}
                             placeholder="username"
                          />
                       </div>
                       {errors.username && <p className="text-xs text-rose-500 font-black px-6 uppercase tracking-wider">{errors.username}</p>}
                       {!errors.username && (
                         <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.15em] px-6">
                           path: /p/{username || "..."}
                         </p>
                       )}
                    </div>
                  </div>

                  <div className="space-y-5">
                     <div className="flex items-center justify-between px-2">
                        <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-black/30">Short Bio</Label>
                        <span className={cn(
                          "text-[10px] font-medium text-sm px-3 py-1 rounded-full",
                          bio.length >= BIO_MAX ? "bg-rose-500 text-white" : "bg-black/5 text-black/40"
                        )}>
                          {bio.length} / {BIO_MAX}
                        </span>
                     </div>
                     <div className="relative">
                        <Textarea
                          ref={bioRef}
                          className="min-h-[200px] rounded-[48px] border-black/5 bg-black/[0.02] text-black font-medium focus:bg-white transition-all p-10 resize-none leading-relaxed text-[17px] shadow-inner"
                          value={bio}
                          onChange={(e) => {
                            if (e.target.value.length <= BIO_MAX) {
                              setBio(e.target.value);
                              if (errors.bio) setErrors({ ...errors, bio: undefined });
                            }
                          }}
                          placeholder="Inject your essence into the network..."
                        />
                        <div className="absolute right-8 bottom-8">
                           <EmojiPicker onSelect={insertEmoji} />
                        </div>
                     </div>
                     {errors.bio && <p className="text-xs text-rose-500 font-black px-6 uppercase tracking-wider">{errors.bio}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-10 flex border-t border-black/5">
               <Button onClick={handleSave} className="rounded-full bg-primary text-primary-foreground px-12 py-8 h-16 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-4">
                  <Save className="w-6 h-6" />
                  Save Profile
               </Button>
            </div>
          </Card>

          {/* Revenue Node */}
          <Card id="revenue-stream" className="scroll-mt-28 p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-white shadow-2xl shadow-black/[0.04] space-y-8 md:space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                <IndianRupee className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Payment Settings</h2>
                <p className="text-[15px] font-medium text-black/40">Set how people can pay you.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
               <div className="md:col-span-8 space-y-4">
                 <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-black/30 ml-2">UPI Gateway Identifier</Label>
                 <Input
                   className="h-20 rounded-[32px] border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-8 text-[17px] shadow-inner"
                   value={upiId}
                   onChange={(e) => setUpiId(e.target.value)}
                   placeholder="yourname@upi or digital@merchant"
                 />
               </div>
               <div className="md:col-span-4">
                 <Button
                   className="w-full h-20 rounded-[32px] bg-emerald-600 text-white px-10 font-black uppercase tracking-[0.15em] text-[12px] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:scale-[1.05]"
                   onClick={async () => {
                     try {
                       await updateProfile({ upi_id: upiId.trim() });
                       toast.success("Revenue identity established!");
                     } catch (err) {
                       toast.error("Deployment failed");
                     }
                   }}
                 >
                    Save UPI
                 </Button>
               </div>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50">
               <p className="text-[13px] font-medium text-emerald-800 leading-relaxed">
                  Activating this node initiates a secure QR matrix for all catalog assets. Customers can pay you directly with zero platform interception.
               </p>
            </div>
          </Card>

          {/* Social Links */}
          <Card id="connective-matrix" className="scroll-mt-28 p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-white shadow-2xl shadow-black/[0.04] space-y-8 md:space-y-12">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-600">
                  <AtSign className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Social Links</h2>
                  <p className="text-[15px] font-medium text-black/40">Add all your social profiles and websites.</p>
                </div>
             </div>
             
             <div className="p-10 rounded-[40px] border border-black/5 bg-black/[0.01]">
                <SocialLinksEditor socialLinks={socialLinks} onChange={setSocialLinks} />
             </div>
             
             <div className="pt-10 flex border-t border-black/5">
                <Button
                  className="rounded-full bg-primary text-primary-foreground px-12 py-8 h-16 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05]"
                  onClick={async () => {
                    try {
                      await updateProfile({ social_links: socialLinks });
                      toast.success("Global matrix live!");
                    } catch (err) {
                      toast.error("Matrix failure");
                    }
                  }}
                >
                  <Save className="w-6 h-6 mr-4" /> Sync Matrix
                </Button>
             </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-black/5 bg-black/[0.02] shadow-none space-y-8 md:space-y-10 group overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-[100px] translate-y-32 translate-x-32" />
            
            <button
              type="button"
              onClick={() => setShowAdvancedProfile((current) => !current)}
              className="flex w-full items-start justify-between gap-10 text-left relative z-10"
            >
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                  Advanced Cluster
                </h2>
                <p className="text-black/30 text-[16px] font-medium mt-3 leading-relaxed max-lg:max-w-lg">
                  Social proof metrics, secure notification nodes, and system-level account parameters.
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border border-black/10 bg-white flex items-center justify-center text-black shadow-2xl transition-all group-hover:scale-110 active:scale-90 shrink-0">
                {showAdvancedProfile ? <ChevronUp className="w-7 h-7" /> : <ChevronDown className="w-7 h-7" />}
              </div>
            </button>

            {showAdvancedProfile && (
              <div className="space-y-12 border-t border-black/5 pt-12 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
                {/* Proof of Reach */}
                <div className="space-y-10 p-12 rounded-[48px] bg-white border border-black/5 shadow-2xl shadow-black/[0.04] group/stats">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/5 flex items-center justify-center text-purple-600 group-hover/stats:scale-110 transition-transform">
                      <Users2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-black">Proof of Reach</h3>
                      <p className="text-[15px] font-medium text-black/40">Verified authority metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {["ig_followers", "tiktok_followers", "fb_likes", "youtube_subs"].map((field) => (
                      <div key={field} className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 ml-2">
                          {field.replace(/_/g, " ")}
                        </Label>
                        <Input
                          className="h-16 rounded-[28px] border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-8 text-[16px] shadow-inner"
                          value={socialStats[field as keyof typeof socialStats]}
                          onChange={(e) => setSocialStats(s => ({ ...s, [field]: e.target.value }))}
                          placeholder="e.g. 1.2M or 50K+"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="h-16 rounded-full bg-primary text-primary-foreground px-12 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-2xl"
                    onClick={async () => {
                      try {
                        await updateProfile({ social_stats: socialStats });
                        toast.success("Identity authority broadcasted!");
                      } catch (err) {
                        toast.error("Transmission error");
                      }
                    }}
                  >
                    Broadcast Stats
                  </Button>
                </div>

                <NotificationPreferences />

                {/* Engagement Grid */}
                <div className="space-y-10 p-12 rounded-[48px] bg-white border border-black/5 shadow-2xl shadow-black/[0.04] group/metrics">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-600 group-hover/metrics:scale-110 transition-transform">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-black">Engagement Node</h3>
                      <p className="text-[15px] font-medium text-black/40">Real-time interaction analytics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {["engagement_rate", "avg_views", "reach"].map((field) => (
                      <div key={field} className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 ml-2">
                          {field.replace(/_/g, " ")}
                        </Label>
                        <Input
                          className="h-16 rounded-[28px] border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-8 text-[16px] shadow-inner"
                          value={creatorMetrics[field as keyof typeof creatorMetrics]}
                          onChange={(e) => setCreatorMetrics(s => ({ ...s, [field]: e.target.value }))}
                          placeholder="e.g. 5.2%"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    className="h-16 rounded-full bg-primary text-primary-foreground px-12 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] shadow-2xl"
                    onClick={async () => {
                      try {
                        await updateProfile({ creator_metrics: creatorMetrics });
                        toast.success("Heatmap updated!");
                      } catch (err) {
                        toast.error("System error");
                      }
                    }}
                  >
                    Heatmap Update
                  </Button>
                </div>

                {/* Identity Metadata */}
                <div className="p-12 rounded-[48px] bg-white border border-black/5 shadow-2xl shadow-black/[0.04] space-y-10">
                  <div>
                    <h3 className="text-2xl font-black text-black">Identity Metadata</h3>
                    <p className="text-[15px] font-medium text-black/40">System-level node parameters</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-[16px]">
                    <div className="flex justify-between items-center p-8 rounded-[32px] bg-black/[0.02] border border-black/5">
                      <span className="font-black text-black/40 uppercase tracking-[0.25em] text-[11px]">Primary Email Node</span>
                      <span className="font-black text-black text-[17px]">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-8 rounded-[32px] bg-black/[0.02] border border-black/5">
                      <span className="font-black text-black/40 uppercase tracking-[0.25em] text-[11px]">Access Authorization</span>
                      <span className={cn("font-black px-6 py-2 rounded-full text-[11px] uppercase tracking-widest", isAdminRole(user.role) ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-black/10 text-black")}>
                        {isAdminRole(user.role) ? "Master Authority" : "Verified User"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-8 rounded-[32px] bg-black/[0.02] border border-black/5">
                      <span className="font-black text-black/40 uppercase tracking-[0.25em] text-[11px]">Node Lifecycle Start</span>
                      <span className="font-black text-black text-[17px]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Sticky Orbit Preview */}
        <div className="hidden lg:block lg:col-span-4 shrink-0 self-start sticky top-12 z-30">
          <div className="bg-white border border-black/5 rounded-[48px] p-10 shadow-2xl shadow-black/[0.06] relative overflow-hidden h-[calc(100vh-140px)] flex flex-col group/preview-sidebar">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Live Preview</p>
                  <p className="text-[17px] font-black truncate text-black mt-1 tracking-tight">@{username || user.username}</p>
                </div>
                <Button
                   type="button"
                   variant="outline"
                   className="h-10 px-6 rounded-full text-[10px] font-medium text-sm border-black/10 hover:bg-black text-black bg-white hover:text-white transition-all shadow-lg"
                   onClick={() => navigate("/dashboard/appearance")}
                 >
                   Visual Style
                 </Button>
              </div>

              <div className="relative group/orbit flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar scrollbar-hide rounded-[32px] bg-black/[0.01] p-6 border border-black/5 shadow-inner">
                <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover/orbit:opacity-100 transition-opacity duration-1000" />
                <div className="relative transform origin-top transition-all duration-1000 ease-apple-ease flex-1 hover:scale-[1.03]">
                  <ProfilePreview
                    settings={settings}
                    user={{...user, name, username, bio, social_links: socialLinks, social_stats: socialStats}}
                    links={previewLinks}
                    creatorMetrics={creatorMetrics}
                    compact
                  />
                </div>
              </div>

              <div className="relative pt-10 mt-8 border-t border-black/5 flex flex-col gap-4">
                 <div className="flex items-center gap-4">
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-3 rounded-3xl h-16 bg-black/[0.03] hover:bg-black/5 text-black text-[11px] font-medium text-sm transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <ExternalLink className="w-5 h-5 opacity-40" /> View Node
                    </a>
                    <Button
                      onClick={copyProfileLink}
                      className="flex-1 gap-3 rounded-3xl h-16 bg-primary text-primary-foreground text-[11px] font-medium text-sm transition-all shadow-2xl hover:shadow-black/30 hover:scale-[1.05] active:scale-95 border-none"
                    >
                      <Copy className="w-5 h-5" /> Copy URI
                    </Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Visual Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-[#F0F2F5]/98 lg:hidden flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-3xl">
          <div className="relative w-full max-w-sm flex flex-col gap-10">
            <div className="w-full flex items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-16 h-16 rounded-[24px] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Visual Node</p>
                  <p className="text-[18px] font-black text-black/30 truncate tracking-tight">@{username || user.username}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 rounded-full bg-white shadow-2xl hover:bg-black hover:text-white transition-all active:scale-90"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-7 h-7" />
              </Button>
            </div>

            <div className="bg-white rounded-[56px] p-8 shadow-2xl shadow-black/10 overflow-hidden border border-black/5">
               <ProfilePreview
                 settings={settings}
                 user={{...user, name, username, bio, social_links: socialLinks, social_stats: socialStats}}
                 links={previewLinks}
                 creatorMetrics={creatorMetrics}
                 compact
               />
            </div>

            <div className="flex flex-col w-full gap-5">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-4 rounded-3xl h-20 bg-white border border-black/5 text-black text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl flex-1"
              >
                <ExternalLink className="w-6 h-6" /> Open Node
              </a>
              <Button
                onClick={() => {
                  void copyProfileLink();
                  setShowPreview(false);
                }}
                className="gap-4 rounded-3xl h-20 bg-primary text-primary-foreground text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl flex-1"
              >
                <Copy className="w-6 h-6" /> Copy URI
              </Button>
            </div>
            
            <Button
               variant="ghost" 
               className="text-[11px] font-black uppercase tracking-[0.25em] text-black/40 hover:text-primary transition-colors py-4"
               onClick={() => {
                 navigate("/dashboard/links?tab=styles");
                 setShowPreview(false);
               }}
            >
               Refine Aesthetic in Visual Style
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;


