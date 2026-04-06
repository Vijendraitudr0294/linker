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
  const [activeTab, setActiveTab] = useState("industry-niche");
  const [lastThemeAppliedAt, setLastThemeAppliedAt] = useState<string | null>(null);

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
    await applyTheme(theme as any);
    toast.success(`Theme set to ${theme.name}`);
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
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Style Studio • Live</span>
             </div>
             <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight studio-title text-foreground selection:bg-primary selection:text-white">
               Style your <span className="text-primary italic font-semibold">Studio.</span>
             </h1>
             <p className="text-sm md:text-base text-muted-foreground/70 font-medium tracking-tight max-w-[450px]">
               Refine your brand's visual identity with precise, real-time controls.
             </p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 h-auto p-1 border border-white/5 w-full max-w-fit justify-start rounded-xl mb-8 flex overflow-x-auto no-scrollbar backdrop-blur-xl">
              {[
                { id: "industry-niche", label: "Niche" },
                { id: "themes", label: "Presets" },
                { id: "custom", label: "Personalize" },
                { id: "animations", label: "Motion" },
                { id: "ai-creator", label: "Neural Lab" }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-lg border-none px-5 py-2 text-[11px] font-bold text-foreground/40 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300"
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
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                  <Input 
                    placeholder="Search styles..." 
                    className="pl-9 h-10 rounded-xl bg-white/[0.02] border-white/5 focus:border-primary/50 transition-all text-[13px] font-medium"
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
               <Card className="p-5 md:p-7 bg-card border-white/5 rounded-2xl airbnb-shadow space-y-10">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Layout className="w-3.5 h-3.5" />
                       </div>
                       <div>
                          <h3 className="text-base font-bold">Structure</h3>
                          <p className="text-[10px] text-muted-foreground font-medium">How your content is architecturalized.</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {[{ id: 'list', icon: '☰', label: 'List' }, { id: 'grid', icon: '田', label: 'Grid' }, { id: 'bento', icon: '🍱', label: 'Bento' }].map(l => (
                          <button 
                            key={l.id} 
                            onClick={() => updateSettings({ layoutType: l.id as any })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group",
                              settings.layoutType === l.id ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.01] hover:border-white/10"
                            )}
                          >
                            <span className="text-xl transition-transform group-hover:scale-105 duration-300">{l.icon}</span>
                            <span className="text-[11px] font-bold tracking-tight">{l.label}</span>
                          </button>
                       ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Palette className="w-3.5 h-3.5" />
                       </div>
                       <div>
                          <h3 className="text-base font-bold">Aesthetics</h3>
                          <p className="text-[10px] text-muted-foreground font-medium">Define your colors and atmosphere.</p>
                       </div>
                    </div>
                    <ColorPickerSection settings={settings} updateSettings={updateSettings} />
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Zap className="w-3.5 h-3.5" />
                       </div>
                       <div>
                          <h3 className="text-base font-bold">Interactions</h3>
                          <p className="text-[10px] text-muted-foreground font-medium">How visitors feel your brand.</p>
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
               <Card className="p-5 md:p-7 bg-card border-white/5 rounded-2xl airbnb-shadow">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                     </div>
                     <div>
                        <h3 className="text-base font-bold">Motion</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Subtle animations for a premium feel.</p>
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
            <Card className="h-full p-3 bg-white/[0.01] border-white/10 rounded-3xl relative overflow-hidden airbnb-shadow backdrop-blur-3xl flex flex-col border ring-1 ring-white/10">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="grid grid-cols-2 gap-3 mb-3 px-1">
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-9 rounded-xl text-[12px] font-bold hover:bg-primary hover:text-white transition-all duration-300" 
                        asChild
                     >
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="w-3.5 h-3.5 mr-2" />
                           View
                        </a>
                     </Button>
                     <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-9 rounded-xl text-[12px] font-bold hover:bg-primary hover:text-white transition-all duration-300" 
                        onClick={copyProfileLink}
                     >
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Copy
                     </Button>
                  </div>

                  <div className="flex-1 w-full rounded-[2rem] border border-white/10 overflow-hidden bg-black/40 shadow-inner relative ring-1 ring-white/5">
                    <ProfilePreview 
                      settings={settings} 
                      user={user} 
                      links={activeLinks.map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                      catalogItems={catalogItems.filter(i => i.enabled)}
                      compact={false}
                    />
                  </div>
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
