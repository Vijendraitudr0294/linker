import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, BadgeCheck, Wand2, Globe2, Store, Mic2, Briefcase, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useLinks, useLinkMutations } from "@/hooks/useLinksApi";
import { type SocialPlatform } from "@/types/links";
import { usePlatformStore } from "@/stores/platformStore";
import { normalizeUrl } from "@/lib/validation";
import { getThemePresetsFromSettings, type ThemePreset } from "@/data/themes";
import { platformOptions } from "@/components/SocialIcon";
import ThemePreviewCard from "@/components/dashboard/ThemePreviewCard";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { markOnboardingComplete } from "@/lib/onboarding";
import { urlSchema } from "@/lib/validation";

const goalCards = [
  {
    id: "creator",
    title: "Creator Studio",
    description: "Grow your audience, collect leads, and publish your best content fast.",
    icon: Mic2,
    accent: "from-fuchsia-500 via-rose-500 to-orange-400",
  },
  {
    id: "business",
    title: "Business Front Door",
    description: "Turn your page into a cleaner storefront for services, products, and bookings.",
    icon: Briefcase,
    accent: "from-cyan-500 via-sky-500 to-indigo-500",
  },
  {
    id: "shop",
    title: "Mini Store",
    description: "Launch a commerce-ready page with product cards, links, and checkout actions.",
    icon: Store,
    accent: "from-emerald-500 via-lime-500 to-amber-400",
  },
  {
    id: "personal",
    title: "Personal Hub",
    description: "Share your profile, socials, newsletter, and favorite links in one place.",
    icon: Globe2,
    accent: "from-violet-500 via-purple-500 to-pink-500",
  },
] as const;

const starterTitles: Record<string, string> = {
  creator: "Watch my latest work",
  business: "Book a call",
  shop: "Browse the collection",
  personal: "Start here",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { settings, applyTheme } = useAppearanceStore();
  const { data: links = [] } = useLinks(user?.user_id);
  const { addLink } = useLinkMutations(user?.user_id);
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState<(typeof goalCards)[number]["id"]>("creator");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("instagram");
  const [socialUrl, setSocialUrl] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  useEffect(() => {
    if (!platformInitialized) {
      void fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  useEffect(() => {
    if (!user) return;

    setDisplayName(user.name || "");
    setBio(user.bio || "");
    const firstSocial = user.social_links?.[0];
    if (firstSocial?.platform) setSocialPlatform(firstSocial.platform as SocialPlatform);
    if (firstSocial?.url) setSocialUrl(firstSocial.url);
  }, [navigate, user]);

  const featuredThemes = useMemo(() => {
    const presets = getThemePresetsFromSettings(platformSettings);
    const priorities = ["Liquid Sunset", "Constellation Dusk", "Pop Cobalt", "Neon Horizon 3D", "Midnight Grid", "Paper Light"];
    const picked = priorities
      .map((name) => presets.find((theme) => theme.name === name))
      .filter((theme): theme is ThemePreset => Boolean(theme));
    return picked.length > 0 ? picked : presets.slice(0, 6);
  }, [platformSettings]);

  useEffect(() => {
    if (!selectedThemeId && featuredThemes[0]) {
      setSelectedThemeId(featuredThemes[0].id);
    }
  }, [featuredThemes, selectedThemeId]);

  const selectedTheme =
    featuredThemes.find((theme) => theme.id === selectedThemeId) ||
    featuredThemes[0] ||
    null;

  const previewSettings = selectedTheme
    ? {
        ...settings,
        themeId: selectedTheme.id,
        backgroundColor: selectedTheme.backgroundColor,
        cardColor: selectedTheme.cardColor,
        textColor: selectedTheme.textColor,
        buttonStyle: selectedTheme.buttonStyle,
        buttonBg: selectedTheme.buttonBg,
        buttonText: selectedTheme.buttonText,
        gradientFrom: selectedTheme.gradientFrom,
        gradientTo: selectedTheme.gradientTo,
        backgroundImage: selectedTheme.backgroundImage,
        backgroundOverlay: selectedTheme.backgroundOverlay,
        animatedGradient: selectedTheme.animatedGradient,
        animationClass: selectedTheme.animationClass,
        fontFamily: selectedTheme.fontFamily || settings.fontFamily,
      }
    : settings;

  const previewUser = {
    name: displayName || user?.name || "Your Name",
    username: user?.username || "username",
    bio: bio || "Add your main message, social proof, or call to action here.",
    avatar_url: user?.avatar_url,
    social_links: socialUrl ? [{ platform: socialPlatform, url: socialUrl }] : [],
  };

  const nextStep = () => {
    if (step === 1) {
      if (!displayName.trim()) {
        toast.error("Add a display name to continue.");
        return;
      }
      if (!bio.trim()) {
        toast.error("Add a short intro so visitors know what you do.");
        return;
      }
      if (socialUrl.trim()) {
        const { success } = urlSchema.safeParse(socialUrl);
        if (!success) {
          toast.error("Enter a valid social URL.");
          return;
        }
      }
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const finishOnboarding = async () => {
    if (!user) return;
    setSaving(true);

    // Wraps any promise with a timeout — returns null on timeout or error (non-blocking)
    function withTimeout(promise: Promise<unknown>, ms = 8000): Promise<unknown> {
      return Promise.race([
        promise.catch(() => null),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
      ]);
    }

    try {
      const normalizedSocialUrl = socialUrl.trim() ? normalizeUrl(socialUrl) : "";
      const existingSocialLinks = user.social_links || [];
      const mergedSocialLinks = normalizedSocialUrl
        ? [
            ...existingSocialLinks.filter((link) => link.platform !== socialPlatform),
            { platform: socialPlatform, url: normalizedSocialUrl },
          ]
        : existingSocialLinks;

      const promises: Promise<unknown>[] = [];

      // 1. Apply theme
      if (selectedTheme) {
        promises.push(withTimeout(applyTheme(selectedTheme)));
      }

      // 2. Update profile
      promises.push(
        withTimeout(
          updateProfile({
            name: displayName.trim() || user.name,
            bio: bio.trim(),
            social_links: mergedSocialLinks,
          })
        )
      );

      // 3. Add starter link
      const hasExistingStarterLink = normalizedSocialUrl
        ? links.some((link) => link.url === normalizedSocialUrl)
        : true;

      if (normalizedSocialUrl && !hasExistingStarterLink) {
        promises.push(withTimeout(addLink.mutateAsync({ title: starterTitles[goal], url: normalizedSocialUrl, platform: socialPlatform })));
      }

      // Execute all operations in parallel to save time
      await Promise.all(promises);
    } catch (error) {
      console.error("Onboarding submission error:", error);
      // Unexpected error — still proceed to dashboard as we mark onboarding complete anyway
    } finally {
      // Brief delay to allow DB propagation for the public view
      await new Promise(r => setTimeout(r, 600));

      // Always complete: mark done and navigate regardless of exact save status
      markOnboardingComplete(user.user_id);
      toast.success("Your page starter kit is ready.");
      navigate("/dashboard", { replace: true });
      setSaving(false);
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-[#070b16] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin mb-4" />
        <p className="text-white/60 font-medium">Preparing your workspace...</p>
        <Button 
          variant="ghost" 
          className="mt-8 text-white/40 hover:text-white"
          onClick={() => {
            useAuthStore.getState().logout();
            navigate("/login");
          }}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1D1D1F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .gradient-blur-1 { background: radial-gradient(circle, #D1FAE5 0%, transparent 70%); }
        .gradient-blur-2 { background: radial-gradient(circle, #DBEAFE 0%, transparent 70%); }
      `}</style>
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] gradient-blur-1 opacity-40 -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] gradient-blur-2 opacity-30 translate-y-1/3 -translate-x-1/3" />
      </div>
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:px-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4 p-8 rounded-[40px] bg-white border border-black/5 shadow-2xl shadow-black/[0.02]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                <Sparkles className="h-3.5 w-3.5" />
                Launch Flow
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight flex items-baseline gap-3 text-black">
                Identity <span className="font-script text-primary text-2xl lowercase opacity-80">wizard</span>
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] font-medium text-black/50">
                Let's calibrate your first public identity node.
              </p>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Step Progress</p>
              <p className="text-3xl font-black text-black">{step + 1}<span className="text-black/20">/4</span></p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-black/5 p-1 rounded-full mb-8">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-2 rounded-full relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-primary/20"
                />
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-in-out relative z-10"
                  style={{ width: index <= step ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>

          <Card className="rounded-[42px] border-black/5 bg-white p-8 text-black shadow-2xl shadow-black/[0.03] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              {step === 0 && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Positioning</p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black">What are you building first?</h2>
                    <p className="text-[14px] font-medium text-black/40">
                      Pick the direction that matches your primary public signal.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {goalCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setGoal(card.id)}
                        className={cn(
                          "group relative rounded-[28px] border p-6 text-left transition-all duration-500",
                          goal === card.id
                            ? "border-emerald-500/30 bg-emerald-500/[0.03] shadow-xl shadow-emerald-500/5 scale-[1.02]"
                            : "border-black/5 bg-white hover:border-black/10 hover:bg-black/[0.01]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-500 group-hover:rotate-3", card.accent)}>
                            <card.icon className="h-6 w-6 text-white" />
                          </div>
                          {goal === card.id && (
                            <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                              <BadgeCheck className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <h3 className="mt-5 text-[17px] font-black text-black tracking-tight">{card.title}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-black/50 font-medium">{card.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Identity</p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black">What's your public name?</h2>
                    <p className="text-[14px] font-medium text-black/40">
                      Add the minimum info your audience needs for verification.
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Display Name</Label>
                        <Input
                          value={displayName}
                          onChange={(event) => setDisplayName(event.target.value)}
                          placeholder="Your brand or creator name"
                          className="h-14 rounded-2xl border-black/5 bg-black/[0.02] text-black placeholder:text-black/20 focus:bg-white transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Short Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(event) => setBio(event.target.value.slice(0, 160))}
                          placeholder="What should visitors know in the first 3 seconds?"
                          rows={4}
                          className="rounded-2xl border-black/5 bg-black/[0.02] text-black placeholder:text-black/20 focus:bg-white transition-all font-medium leading-relaxed"
                        />
                        <div className="flex justify-end">
                          <span className="text-[10px] font-black text-black/20">{bio.length}/160</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-[32px] border border-black/5 bg-black/5 p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Link2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60">Primary Social</p>
                        </div>

                        <div className="space-y-4">
                          <Select value={socialPlatform} onValueChange={(value) => setSocialPlatform(value as SocialPlatform)}>
                            <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-white text-black font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {platformOptions
                                .filter((platform) => ["instagram", "youtube", "tiktok", "facebook", "twitter", "linkedin", "website"].includes(platform.value))
                                .map((platform) => (
                                  <SelectItem key={platform.value} value={platform.value}>
                                    {platform.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Input
                            value={socialUrl}
                            onChange={(event) => setSocialUrl(event.target.value)}
                            placeholder="https://instagram.com/yourname"
                            className="h-14 rounded-2xl border-black/5 bg-white text-black placeholder:text-black/20 font-bold"
                          />
                        </div>
                      </div>

                      <div className="rounded-[32px] border border-emerald-500/10 bg-emerald-500/[0.03] p-6">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 mb-4">Wizard Insight</p>
                        <ul className="space-y-3 text-[13px] font-medium text-emerald-900/70">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            We calibrate your public intro
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Primary social icon syncs to header
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            One starter link block is generated
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Visual Direction</p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black">Pick a starting theme.</h2>
                    <p className="text-[14px] font-medium text-black/40">
                      Curated presets with a distinct point of view.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {featuredThemes.map((theme) => (
                      <ThemePreviewCard
                        key={theme.id}
                        theme={theme}
                        selected={selectedThemeId === theme.id}
                        onSelect={(picked) => setSelectedThemeId(picked.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Ready</p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-black">Calibration complete.</h2>
                    <p className="text-[14px] font-medium text-black/40">
                      Your identity node is primed and ready to launch.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-black/5 bg-black/[0.02] p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Direction</p>
                      <p className="mt-2 text-lg font-black text-black">{goalCards.find((card) => card.id === goal)?.title}</p>
                    </div>
                    <div className="rounded-[24px] border border-black/5 bg-black/[0.02] p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Theme</p>
                      <p className="mt-2 text-lg font-black text-black">{selectedTheme?.name || "Liquid Sunset"}</p>
                    </div>
                    <div className="rounded-[24px] border border-black/5 bg-black/[0.02] p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Initial Block</p>
                      <p className="mt-2 text-lg font-black text-black">{socialUrl ? starterTitles[goal] : "Setup later"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 flex flex-col gap-4 border-t border-black/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 px-6 justify-start rounded-2xl text-black/40 hover:bg-black/5 hover:text-black font-bold text-[13px] uppercase tracking-widest"
                  onClick={step === 0 ? () => navigate("/dashboard") : previousStep}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {step === 0 ? "Skip Process" : "Previous Step"}
                </Button>

                {step < 3 ? (
                  <Button type="button" className="h-12 px-10 rounded-2xl bg-[#111111] text-white hover:bg-black/80 font-bold text-[13px] uppercase tracking-widest shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={nextStep}>
                    Continue Flow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" className="h-14 px-12 rounded-2xl bg-primary text-white hover:opacity-95 font-bold text-[13px] uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={finishOnboarding} disabled={saving}>
                    {saving ? "Deploying..." : "Launch Platform"}
                    {!saving && <Wand2 className="ml-2 h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
                <p className="mt-0.5 text-[12px] text-slate-300">Syncs as you answer.</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
                Syncing
              </div>
            </div>

            <ProfilePreview
              settings={previewSettings}
              user={previewUser}
              links={
                socialUrl
                  ? [{ id: "starter-social", title: starterTitles[goal], platform: socialPlatform }]
                  : [{ id: "starter", title: "Add your first link", platform: "website" }]
              }
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
