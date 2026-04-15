import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useLinks } from "@/hooks/useLinksApi";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { usePlatformStore } from "@/stores/platformStore";
import { getThemeCategoriesFromSettings, getThemePresetsFromSettings, type ThemePreset, type ThemeCategory } from "@/data/themes";
import { Check, Search, ChevronDown, ChevronUp, Palette, Sparkles, Layout, Smartphone, X, ExternalLink, Share2, Copy, Bell, Type, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NicheTemplates from "@/components/dashboard/NicheTemplates";
import AIThemeCreator from "@/components/dashboard/AIThemeCreator";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import ColorPickerSection from "@/components/dashboard/ColorPickerSection";
import ButtonStylePicker from "@/components/dashboard/ButtonStylePicker";
import ShareProfile from "@/components/dashboard/ShareProfile";
import BackgroundImageUpload from "@/components/dashboard/BackgroundImageUpload";
import AnimationSelector from "@/components/dashboard/AnimationSelector";
import ThemePreviewCard from "@/components/dashboard/ThemePreviewCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Plus Jakarta Sans", label: "Jakarta" },
  { value: "Playfair Display", label: "Playfair" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Outfit", label: "Outfit" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Sora", label: "Sora" },
  { value: "Crimson Pro", label: "Crimson" },
  { value: "Georgia", label: "Georgia" },
  { value: "monospace", label: "Mono" },
];

const AppearancePage = () => {
  const { settings, applyTheme, updateSettings, fetchSettings } = useAppearanceStore();
  const user = useAuthStore((s) => s.user);
  const { data: links = [] } = useLinks(user?.user_id);
  const { data: catalogItems = [] } = useCatalogItems(user?.user_id);
  const activeLinks = links.filter((l) => l.enabled);
  const isMobile = useIsMobile();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState("themes");
  const [lastThemeAppliedAt, setLastThemeAppliedAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
       fetchSettings(user.user_id);
    }
  }, [fetchSettings, user?.user_id]);

  useEffect(() => {
    if (!platformInitialized) {
       fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | null>(null);

  const resolvedThemePresets = useMemo(() => getThemePresetsFromSettings(platformSettings), [platformSettings]);
  const resolvedThemeCategories = useMemo(() => getThemeCategoriesFromSettings(platformSettings), [platformSettings]);

  const visibleThemes = useMemo(() => {
    let themes = resolvedThemePresets;
    if (searchQuery) {
      themes = themes.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (activeCategory) {
      themes = themes.filter((t) => t.category === activeCategory);
    }
    return themes;
  }, [resolvedThemePresets, searchQuery, activeCategory]);

  const selectedTheme = useMemo(
    () => resolvedThemePresets.find((theme) => theme.id === settings.themeId) || null,
    [resolvedThemePresets, settings.themeId]
  );

  const handleSelectTheme = async (theme: ThemePreset) => {
    setIsSyncing(true);
    setLastThemeAppliedAt(new Date().toISOString());
    try {
      await applyTheme(theme as any);
      toast.success(`✓ ${theme.name} applied`, { description: "Your public profile is now live with this theme." });
    } finally {
      setIsSyncing(false);
    }
  };

  const profileUrl = user ? `${window.location.origin}/p/${user.username}` : "";
  const copyProfileLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied!");
  };

  return (
    <div className="space-y-8 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        .airbnb-shadow { box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04); }
        .studio-title { font-family: 'Outfit', sans-serif; }
      `}</style>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* The Creative Canvas */}
        <div className="flex-1 min-w-0 space-y-8">
          <header className="px-1 space-y-2.5">
             <h1 className="text-3xl font-black text-black tracking-tight mb-1">
               Design Your Page
             </h1>
             <p className="text-sm font-medium text-black/40">
               Change colors, layout, and style in real time.
             </p>
          </header>

          {/* Mobile Single View Mirror */}
          <div className="lg:hidden w-full mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
             <Card className="bruddle-card-blue p-4 bg-[#E0F2FE] flex flex-col items-center justify-start relative overflow-hidden rounded-[24px] border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between w-full mb-3 px-1">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-white border-2 border-black flex items-center justify-center">
                         <Smartphone className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Mirror</span>
                   </div>
                   <Badge className={cn(
                     "border-2 border-black rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest transition-colors",
                     isSyncing ? "bg-[#FDE68A] text-black animate-pulse" : "bg-white/40 text-black"
                   )}>
                     {isSyncing ? "Syncing" : "Instant"}
                   </Badge>
                </div>
                <div className="w-full h-[220px] rounded-[1.8rem] border-2 border-black overflow-hidden bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] relative">
                   <ProfilePreview 
                      settings={settings} 
                      user={user} 
                      links={activeLinks.map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                      catalogItems={catalogItems.filter(i => i.enabled)}
                      compact={true}
                      noFrame={true}
                   />
                </div>
             </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white p-2 rounded-[24px] mb-8 overflow-x-auto no-scrollbar scrollbar-hide flex w-full lg:w-fit border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {[
                { id: "industry-niche", label: "Niche" },
                { id: "themes", label: "Presets" },
                { id: "custom", label: "Customize" },
                { id: "animations", label: "Animation" },
                { id: "ai-creator", label: "AI Theme" }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-widest text-black/60 data-[state=active]:bg-black data-[state=active]:text-white transition-all whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="industry-niche" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
               <NicheTemplates />
            </TabsContent>
            <TabsContent value="themes" className="mt-0 outline-none space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                  <Input 
                    placeholder="Search styles..." 
                    className="pl-10 h-12 rounded-xl bg-white border-2 border-black/10 focus:border-black transition-all text-xs font-bold text-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {!searchQuery && (
                  <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                    <Button 
                      variant={!activeCategory ? "default" : "secondary"} 
                      size="sm" 
                      className="rounded-full h-9 px-5 text-[11px] font-bold" 
                      onClick={() => setActiveCategory(null)}
                    >
                      All Presets
                    </Button>
                    {resolvedThemeCategories.map(cat => (
                      <Button 
                        key={cat.id} 
                        variant={activeCategory === cat.id ? "default" : "secondary"} 
                        size="sm" 
                        className="rounded-full h-9 px-5 text-[11px] font-bold whitespace-nowrap"
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleThemes.map((theme) => (
                  <ThemePreviewCard
                    key={theme.id}
                    theme={theme}
                    selected={settings.themeId === theme.id}
                    onSelect={handleSelectTheme}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
               <Card className="bruddle-card p-6 md:p-8 space-y-10 bg-white">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] border-2 border-black flex items-center justify-center text-black">
                          <Layout className="w-4 h-4" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-black tracking-tight uppercase">Structure</h3>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-1">Choose how your links are arranged.</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {[
                         { id: 'list', icon: '☰', label: 'List', activeBg: 'bg-[#D1FAE5]' }, 
                         { id: 'grid', icon: '田', label: 'Grid', activeBg: 'bg-[#E0E7FF]' }, 
                         { id: 'bento', icon: '🍱', label: 'Bento', activeBg: 'bg-[#FEF08A]' },
                         { id: 'brutalism', icon: '⚡', label: 'Brutalism', activeBg: 'bg-pink-300' }
                       ].map(l => (
                          <button 
                            key={l.id} 
                            onClick={() => updateSettings({ layoutType: l.id as any })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all group",
                              settings.layoutType === l.id ? `border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${l.activeBg}` : "border-black/10 bg-gray-50 hover:border-black/30 text-black/60"
                            )}
                          >
                            <span className="text-2xl transition-transform group-hover:scale-110 duration-300 text-black">{l.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-black mt-2">{l.label}</span>
                          </button>
                       ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 pt-6 border-t-2 border-black/5">
                       <div className="w-8 h-8 rounded-lg bg-[#FDE68A] border-2 border-black flex items-center justify-center text-black">
                          <Palette className="w-4 h-4" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-black tracking-tight uppercase">Colors</h3>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-1">Define your colors and atmosphere.</p>
                       </div>
                    </div>
                    <ColorPickerSection settings={settings} updateSettings={updateSettings} />
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3 pt-6 border-t-2 border-black/5">
                       <div className="w-8 h-8 rounded-lg bg-[#FBCFE8] border-2 border-black flex items-center justify-center text-black">
                          <Zap className="w-4 h-4" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-black tracking-tight uppercase">Buttons</h3>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-1">Pick button look and feel.</p>
                       </div>
                    </div>
                    <ButtonStylePicker
                      currentStyle={settings.buttonStyle}
                      onSelect={(style) => updateSettings({ buttonStyle: style })}
                      buttonBg={settings.buttonBg}
                      buttonText={settings.buttonText}
                    />
                  </section>
               </Card>
            </TabsContent>

            <TabsContent value="animations" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
               <Card className="bruddle-card p-6 md:p-8 bg-white">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] border-2 border-black flex items-center justify-center text-black">
                        <Sparkles className="w-4 h-4" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-black tracking-tight uppercase">Motion</h3>
                        <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mt-1">Subtle animations for a premium feel.</p>
                     </div>
                  </div>
                  <AnimationSelector
                    currentAnimation={settings.animationClass}
                    onSelect={(ani) => updateSettings({ animationClass: ani })}
                  />
               </Card>
            </TabsContent>

            <TabsContent value="ai-creator" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
              <AIThemeCreator />
            </TabsContent>
          </Tabs>
        </div>

        {/* The Live Preview: Elite Mirror */}
        <div className="hidden lg:block w-[380px] shrink-0">
          <div className="fixed top-24 right-10 w-[380px] z-30 h-[calc(100vh-8rem)]">
            <Card className="bruddle-card-blue h-full p-6 bg-[#E0F2FE] flex flex-col items-center justify-start relative overflow-hidden shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                  <Smartphone size={160} strokeWidth={1} />
               </div>
               <div className="relative z-10 flex flex-col h-full w-full">
                  <div className="flex items-center gap-2 mb-4 w-full justify-between">
                    <span className="text-xl font-black text-black uppercase tracking-tight">Live Mirror</span>
                    <Badge className={cn(
                      "border-2 border-black rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest transition-colors",
                      isSyncing ? "bg-[#FDE68A] text-black animate-pulse" : "bg-white/40 text-black"
                    )}>
                      {isSyncing ? "Syncing..." : "Live"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 w-full px-1">
                     <Button 
                        size="sm" 
                        disabled={isSyncing}
                        className="h-10 rounded-xl bg-white border-2 border-black text-black text-[11px] uppercase tracking-widest font-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-wait" 
                        asChild
                     >
                        <a href={isSyncing ? undefined : profileUrl} target="_blank" rel="noopener noreferrer">
                           {isSyncing ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />}
                           {isSyncing ? "Wait..." : "View"}
                        </a>
                     </Button>
                     <Button 
                        size="sm" 
                        className="h-10 rounded-xl bg-white border-2 border-black text-black text-[11px] uppercase tracking-widest font-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]" 
                        onClick={copyProfileLink}
                     >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                     </Button>
                  </div>

                  <motion.div
                    key={lastThemeAppliedAt || "default"}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex-1 w-full rounded-[2.4rem] border-2 border-black overflow-hidden bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative"
                  >
                    <ProfilePreview 
                      settings={settings} 
                      user={user} 
                      links={activeLinks.map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                      catalogItems={catalogItems.filter(i => i.enabled)}
                      compact={false}
                    />
                  </motion.div>
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Mobile Preview Drawer Toggle */}
      <AnimatePresence>
        {isMobile && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-[100] lg:hidden"
          >
             <Button 
               className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-6 border border-white/20 backdrop-blur-md"
               onClick={() => setShowMobilePreview(true)}
             >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                   </div>
                   <span>Live Preview</span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                   <span className="text-[10px] uppercase">Tap to expand</span>
                   <ChevronUp className="w-4 h-4" />
                </div>
             </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Mobile Preview Sheet */}
      <AnimatePresence>
        {isMobile && showMobilePreview && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] lg:hidden bg-background"
          >
             <div className="flex flex-col h-full bg-background relative">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm">Real-time Preview</h3>
                   </div>
                   <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" onClick={() => setShowMobilePreview(false)}>
                      <X className="w-5 h-5" />
                   </Button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                   <ProfilePreview 
                      settings={settings} 
                      user={user} 
                      links={activeLinks.map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                      catalogItems={catalogItems.filter(i => i.enabled)}
                      noFrame={true}
                   />
                </div>
                <div className="p-6 border-t border-white/5 bg-background flex gap-3">
                   <Button variant="outline" className="flex-1 h-12 rounded-2xl text-xs font-bold border-white/10" asChild>
                      <a href={profileUrl} target="_blank" rel="noopener noreferrer">Visit Site</a>
                   </Button>
                   <Button className="flex-1 h-12 rounded-2xl text-xs font-bold bg-primary text-white" onClick={copyProfileLink}>
                      Copy URL
                   </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppearancePage;
