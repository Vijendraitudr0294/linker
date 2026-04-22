import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, BadgeCheck, Wand2, Globe2, Store, Mic2, Briefcase, Link2, Zap } from "lucide-react";
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
    <div className="min-h-screen lg:h-screen overflow-hidden bg-[#0A0A0B] text-white flex flex-col font-sans relative">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Navigation / Progress */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0_0_rgba(255,255,255,0.1)] rotate-[-3deg]">
              <Zap className="h-8 w-8 text-black fill-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none">Identity <span className="text-emerald-400 italic">Forge</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Biotra Protocol v1.4.0</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Synchronization Phase</span>
                <span className="text-xs font-black text-emerald-400">{step + 1} / 4</span>
             </div>
             <div className="h-3 w-full bg-white/5 border-2 border-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / 4) * 100}%` }}
                  className="h-full bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[1000px] h-full flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {step === 0 && (
                <div className="flex-1 flex flex-col gap-8">
                  <div className="text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-emerald-400/10 border border-emerald-400/30 rounded-lg text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">Tactical Selection</div>
                    <h2 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter leading-[0.85] mb-4 italic">Choose Your <br /> Origin Story.</h2>
                    <p className="text-lg font-bold text-white/40 uppercase max-w-xl">Every legend starts with a core purpose. Select the path that defines your digital presence.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-stretch max-h-[500px]">
                    {goalCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setGoal(card.id)}
                        className={cn(
                          "group relative flex flex-col h-full rounded-[32px] border-4 transition-all overflow-hidden p-6 text-left",
                          goal === card.id 
                            ? "bg-white border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-start justify-between relative z-10 w-full mb-auto">
                          <div className={cn(
                            "inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 shadow-xl transition-transform group-hover:scale-110", 
                            goal === card.id ? "bg-black border-black/10" : "bg-white border-white/10",
                            card.accent.replace('from-', '').replace('via-', '').replace('to-', '')
                          )}>
                            <card.icon className={cn("h-6 w-6", goal === card.id ? "text-white" : "text-black")} />
                          </div>
                          {goal === card.id && (
                            <motion.div layoutId="check" className="h-8 w-8 rounded-full bg-emerald-400 flex items-center justify-center">
                              <BadgeCheck className="h-5 w-5 text-black" />
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="relative z-10 mt-8">
                          <h3 className={cn(
                            "text-xl font-[1000] uppercase tracking-tighter leading-tight",
                            goal === card.id ? "text-black" : "text-white"
                          )}>{card.title}</h3>
                          <p className={cn(
                            "mt-3 text-xs font-bold leading-relaxed",
                            goal === card.id ? "text-black/60" : "text-white/40"
                          )}>{card.description}</p>
                        </div>

                        {/* Visual accent for unselected cards */}
                        {goal !== card.id && (
                          <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br transition-opacity", card.accent)} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-none mb-4 italic text-emerald-400">The Essentials.</h2>
                    <p className="text-lg font-bold text-white/40 uppercase">Define your identity. This is the soul of your Biotra page.</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 mt-4">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Digital Pseudonym</Label>
                        <Input 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)} 
                          placeholder="Your Name (e.g., Alex Rivers)" 
                          className="h-16 rounded-2xl border-4 border-white/10 bg-white/5 text-xl font-bold focus:border-emerald-400 transition-all placeholder:text-white/10" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Bio-Manifesto</Label>
                        <Textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value.slice(0, 160))} 
                          placeholder="What is your mission?" 
                          rows={4} 
                          className="rounded-2xl border-4 border-white/10 bg-white/5 text-lg font-bold focus:border-emerald-400 transition-all placeholder:text-white/10" 
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 border-4 border-white/10 rounded-[32px] p-8 flex flex-col gap-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400 mb-2">
                           <Globe2 className="h-4 w-4" /> Primary Sync Node
                        </h4>
                        <p className="text-xs font-bold text-white/30 uppercase">Choose your most active social vessel.</p>
                      </div>
                      
                      <Select value={socialPlatform} onValueChange={(v) => setSocialPlatform(v as SocialPlatform)}>
                        <SelectTrigger className="h-14 rounded-xl border-2 border-white/10 bg-black/40 text-lg font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-white">
                          {platformOptions
                            .filter((p) => ["instagram", "youtube", "tiktok", "facebook", "twitter", "linkedin", "website"].includes(p.value))
                            .map((p) => (
                              <SelectItem key={p.value} value={p.value} className="focus:bg-emerald-400 focus:text-black font-bold uppercase">
                                {p.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        value={socialUrl} 
                        onChange={(e) => setSocialUrl(e.target.value)} 
                        placeholder="Paste your URL here..." 
                        className="h-14 rounded-xl border-2 border-white/10 bg-black/40 font-bold focus:border-emerald-400 transition-all placeholder:text-white/10" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex-1 flex flex-col gap-8">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-none mb-4 italic text-fuchsia-400">Visual Aura.</h2>
                    <p className="text-lg font-bold text-white/40 uppercase">Select the aesthetic that resonates with your brand.</p>
                  </div>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-4">
                    {featuredThemes.map((theme) => (
                      <div key={theme.id} className="group relative">
                        <ThemePreviewCard 
                          theme={theme} 
                          selected={selectedThemeId === theme.id} 
                          onSelect={(p) => setSelectedThemeId(p.id)} 
                          compact={true} 
                        />
                        {selectedThemeId === theme.id && (
                          <div className="absolute -inset-1 border-4 border-fuchsia-500 rounded-[28px] pointer-events-none animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 text-center max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 blur-[80px] opacity-20 animate-pulse" />
                    <div className="relative h-32 w-32 bg-emerald-400 border-8 border-black rounded-[40px] flex items-center justify-center shadow-[16px_16px_0_0_rgba(255,255,255,0.1)] rotate-[-6deg]">
                      <Sparkles className="h-16 w-16 text-black fill-black" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-5xl md:text-7xl font-[1000] uppercase tracking-tighter leading-[0.8] mb-6 italic">Ready to <br /> <span className="text-emerald-400 underline decoration-black underline-offset-8">Manifest.</span></h2>
                    <p className="text-xl font-bold text-white/40 uppercase">Your digital vessel is armed and ready.</p>
                  </div>

                  <div className="w-full grid grid-cols-3 border-4 border-white/10 rounded-[32px] overflow-hidden bg-white/5">
                    <div className="p-6 border-r-4 border-white/10">
                       <p className="text-[10px] font-black uppercase text-white/30 mb-1">Archetype</p>
                       <p className="font-bold text-emerald-400 uppercase">{goalCards.find(c => c.id === goal)?.title}</p>
                    </div>
                    <div className="p-6 border-r-4 border-white/10">
                       <p className="text-[10px] font-black uppercase text-white/30 mb-1">Aura</p>
                       <p className="font-bold text-fuchsia-400 uppercase">{selectedTheme?.name}</p>
                    </div>
                    <div className="p-6">
                       <p className="text-[10px] font-black uppercase text-white/30 mb-1">Sync Ready</p>
                       <p className="font-bold text-white uppercase">{socialUrl ? "Enabled" : "Manual"}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation */}
          <div className="relative z-10 pt-12 pb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
             <Button 
               variant="ghost" 
               className="h-16 px-10 rounded-2xl border-4 border-white/10 bg-transparent text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all w-full sm:w-auto"
               onClick={step === 0 ? () => navigate("/dashboard") : previousStep}
             >
               <ArrowLeft className="mr-3 h-6 w-6" />
               {step === 0 ? "Bypass" : "Recalibrate"}
             </Button>

             <Button 
               className={cn(
                 "h-16 px-16 rounded-2xl border-4 border-black text-black font-[1000] uppercase tracking-[0.2em] shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto",
                 step === 3 ? "bg-emerald-400" : "bg-white"
               )}
               onClick={step < 3 ? nextStep : finishOnboarding}
               disabled={saving}
             >
               {saving ? "Launching..." : step === 3 ? "Initialize Dashboard" : "Sync Forward"}
               {!saving && (step === 3 ? <Wand2 className="ml-3 h-6 w-6" /> : <ArrowRight className="ml-3 h-6 w-6" />)}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
