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
  const applyTheme = useAppearanceStore((s) => s.applyTheme);
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
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border-4 border-black bg-white px-8 py-7 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-black border-t-[#34D399]" />
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/70">Preparing workspace</p>
        </div>
        <Button 
          variant="ghost" 
          className="mt-6 rounded-xl border-2 border-black bg-white font-black uppercase tracking-[0.12em] text-black hover:bg-[#D1FAE5]"
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
    <div className="min-h-screen lg:h-[100dvh] overflow-y-auto lg:overflow-hidden bg-[#F3F4F6] text-black">
      <div className="mx-auto min-h-screen lg:h-full max-w-[1280px] px-3 py-2 md:px-4 md:py-3">
        <div className="space-y-3 lg:min-h-0 flex flex-col">
          <div className="bruddle-card bg-white p-4 md:p-5">
            <div className="grid gap-4 lg:grid-cols-[60%_30%] lg:justify-between lg:items-center">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#D1FAE5] px-4 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Setup Flow
                </div>
                <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight uppercase">Identity Setup</h1>
                <p className="mt-1 text-sm font-bold text-black/60">Build your public page in 4 simple steps.</p>
              </div>
              <div className="rounded-2xl border-4 border-black bg-[#F3F4F6] p-4">
                <div className="flex items-end justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/40">Step</p>
                  <p className="text-2xl md:text-3xl font-black">{step + 1}<span className="text-black/30">/4</span></p>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl border-2 border-black bg-white p-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="h-2.5 rounded-full border border-black bg-black/10">
                      <div className="h-full rounded-full bg-[#34D399] transition-all duration-500" style={{ width: index <= step ? "100%" : "0%" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card className="bruddle-card bg-white p-4 md:p-5 lg:flex-1 lg:min-h-0 flex flex-col">
            <div className="min-h-0 flex-1 lg:overflow-y-auto pr-1 space-y-6">
            {step === 0 && (
              <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[30%_60%] lg:justify-between lg:gap-4 lg:items-start">
                <div className="lg:pt-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Step 1</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">What do you want to build?</h2>
                  <p className="text-sm font-bold text-black/60">Choose one goal to start.</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory">
                  {goalCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setGoal(card.id)}
                      className={cn(
                        "shrink-0 snap-start w-[88%] sm:w-[70%] lg:w-[calc(50%-0.5rem)] rounded-2xl border-4 border-black bg-white p-5 text-left shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all",
                        goal === card.id ? "bg-[#D1FAE5]" : "hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br border-2 border-black", card.accent)}>
                          <card.icon className="h-5 w-5 text-white" />
                        </div>
                        {goal === card.id && (
                          <div className="h-7 w-7 rounded-full border-2 border-black bg-black text-white flex items-center justify-center">
                            <BadgeCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <h3 className="mt-4 text-base font-black">{card.title}</h3>
                      <p className="mt-1 text-sm font-bold text-black/60">{card.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Step 2</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Add your basic details</h2>
                  <p className="text-sm font-bold text-black/60">This is what visitors will see first.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-black/50">Display Name</Label>
                      <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name or brand" className="h-14 rounded-xl border-4 border-black bg-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-black/50">Short Bio</Label>
                      <Textarea value={bio} onChange={(event) => setBio(event.target.value.slice(0, 160))} placeholder="Tell people what you do." rows={4} className="rounded-xl border-4 border-black bg-white font-bold" />
                      <div className="text-right text-[11px] font-black text-black/40">{bio.length}/160</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border-4 border-black bg-[#F3F4F6] p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-black bg-[#D1FAE5] flex items-center justify-center">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em]">Main Social Link</p>
                    </div>
                    <Select value={socialPlatform} onValueChange={(value) => setSocialPlatform(value as SocialPlatform)}>
                      <SelectTrigger className="h-12 rounded-xl border-4 border-black bg-white font-bold">
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
                    <Input value={socialUrl} onChange={(event) => setSocialUrl(event.target.value)} placeholder="https://your-link.com" className="h-12 rounded-xl border-4 border-black bg-white font-bold" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Step 3</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Pick your starting theme</h2>
                  <p className="text-sm font-bold text-black/60">You can change this later.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featuredThemes.map((theme) => (
                    <ThemePreviewCard key={theme.id} theme={theme} selected={selectedThemeId === theme.id} onSelect={(picked) => setSelectedThemeId(picked.id)} />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Step 4</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ready to launch</h2>
                  <p className="text-sm font-bold text-black/60">Here is a quick summary.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border-4 border-black bg-[#F3F4F6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/40">Goal</p>
                    <p className="mt-2 text-lg font-black">{goalCards.find((card) => card.id === goal)?.title}</p>
                  </div>
                  <div className="rounded-2xl border-4 border-black bg-[#F3F4F6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/40">Theme</p>
                    <p className="mt-2 text-lg font-black">{selectedTheme?.name || "Default"}</p>
                  </div>
                  <div className="rounded-2xl border-4 border-black bg-[#F3F4F6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/40">First Link</p>
                    <p className="mt-2 text-lg font-black">{socialUrl ? starterTitles[goal] : "Set later"}</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="mt-8 border-t-4 border-black pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" className="h-12 rounded-xl border-2 border-black bg-white font-black uppercase tracking-widest hover:bg-[#F3F4F6]" onClick={step === 0 ? () => navigate("/dashboard") : previousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {step === 0 ? "Skip" : "Back"}
              </Button>
              {step < 3 ? (
                <Button type="button" className="h-12 px-8 rounded-xl border-4 border-black bg-black text-white font-black uppercase tracking-widest hover:bg-black/90" onClick={nextStep}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" className="h-12 px-8 rounded-xl border-4 border-black bg-[#34D399] text-black font-black uppercase tracking-widest hover:bg-[#10B981]" onClick={finishOnboarding} disabled={saving}>
                  {saving ? "Saving..." : "Go to Dashboard"}
                  {!saving && <Wand2 className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
