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
import { useLinksStore } from "@/stores/linksStore";
import { useCatalogStore } from "@/stores/catalogStore";
import { usePlatformStore } from "@/stores/platformStore";
import { getThemeCategoriesFromSettings, getThemePresetsFromSettings, type ThemePreset, type ThemeCategory } from "@/data/themes";
import { Check, Search, ChevronDown, ChevronUp, Palette, Sparkles, Layout, Smartphone, X, ExternalLink, Share2, Copy, Bell, Type, Zap } from "lucide-react";
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

const getThemesByCategory = (presets: ThemePreset[], category: ThemeCategory) => presets.filter((t) => t.category === category);

const AppearancePage = () => {
  const { settings, applyTheme, updateSettings, fetchSettings } = useAppearanceStore();
  const user = useAuthStore((s) => s.user);
  const { links, fetchLinks } = useLinksStore();
  const { items: catalogItems, fetchItems } = useCatalogStore();
  const activeLinks = links.filter((l) => l.enabled);
  const isMobile = useIsMobile();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      fetchItems(user.user_id);
      fetchSettings(user.user_id);
      fetchLinks(user.user_id);
    }
  }, [fetchItems, fetchLinks, fetchSettings, user]);

  useEffect(() => {
    if (!platformInitialized) {
      void fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | null>(null);

  const resolvedThemePresets = useMemo(() => getThemePresetsFromSettings(platformSettings), [platformSettings]);
  const resolvedThemeCategories = useMemo(() => getThemeCategoriesFromSettings(platformSettings), [platformSettings]);

  const filteredThemes = searchQuery
    ? resolvedThemePresets.filter((t) =>
      [
        t.name,
        t.category,
        t.backgroundStyle,
        t.cardStyle,
        t.fontPair,
        t.motionEngine,
        t.animationPreset,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : null;

  const handleSelectTheme = (theme: ThemePreset) => {
    applyTheme(theme);
    toast.success(`Theme set to ${theme.name}`);
  };

  const previewLinks = activeLinks.map((l) => ({ id: l.id, title: l.title, platform: l.platform }));

  const ThemeCard = ({ theme }: { theme: ThemePreset }) => {
    const isSelected = settings.themeId === theme.id;
    const hasAnimated = !!theme.animatedGradient || !!theme.animationClass;
    return (
      <motion.button
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelectTheme(theme)}
        className={cn(
          "relative p-3 rounded-2xl border-2 transition-all text-left group overflow-hidden",
          isSelected
            ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-4 ring-primary/5"
            : "border-border/40 bg-card/60 hover:border-primary/40 hover:bg-card/80 shadow-sm"
        )}
      >
        <div
          className={cn(
            "w-full aspect-[4/5] rounded-xl mb-4 flex flex-col items-center justify-center overflow-hidden relative shadow-inner",
            hasAnimated && theme.animationClass
          )}
          style={{
            backgroundColor: hasAnimated ? undefined : theme.backgroundColor,
            background: hasAnimated ? theme.animatedGradient : undefined,
          }}
        >
          {theme.backgroundImage && (
            <>
              <img src={theme.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              {theme.backgroundOverlay && (
                <div className="absolute inset-0" style={{ backgroundColor: theme.backgroundOverlay }} />
              )}
            </>
          )}
          {theme.animationClass === "fm-fade" && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%)" }}
            />
          )}
          {theme.animationClass === "fm-slide-up" && (
            <motion.div
              className="absolute inset-x-0 bottom-0 h-20 opacity-30"
              style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.35))" }}
              animate={{ y: [16, -16, 16] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {theme.animationClass === "fm-pulse-glow" && (
            <motion.div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 50% 20%, rgba(34,211,238,0.25), transparent 60%)" }}
              animate={{ scale: [1, 1.03, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {theme.animationClass === "fm-float" && (
            <motion.div
              className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-400/25 blur-2xl"
              animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {theme.animationClass === "fm-parallax" && (
            <motion.div
              className="absolute inset-0 opacity-25"
              style={{ background: "linear-gradient(120deg, rgba(59,130,246,0.5), transparent 45%, rgba(168,85,247,0.35))" }}
              animate={{ x: [-8, 8, -8] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Mini Mockup UI */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 gap-3 scale-[1.15] transition-all duration-500 group-hover:scale-125">
            <div className="w-14 h-14 rounded-full border-2 border-white/20 mb-2 shadow-lg group-hover:shadow-primary/20" style={{ backgroundColor: theme.buttonBg }} />
            <div className="w-3/4 h-2.5 rounded-full opacity-60 shadow-sm" style={{ backgroundColor: theme.buttonBg }} />
            <div className="w-1/2 h-2.5 rounded-full opacity-40 shadow-sm" style={{ backgroundColor: theme.buttonBg }} />
            <div className="w-full h-4 rounded-lg mt-4 shadow-md bg-white/10 backdrop-blur-sm border border-white/5 flex items-center justify-center p-1">
               <div className="w-full h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 py-1 mt-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-foreground truncate">{theme.name}</p>
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse" />}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center min-h-[16px]">
            {theme.backgroundImage && <Badge variant="secondary" className="text-[8px] font-bold h-4 px-1.5 border-none bg-primary/10 text-primary uppercase tracking-tight">Photo</Badge>}
            {theme.animationClass && <Badge variant="secondary" className="text-[8px] font-bold h-4 px-1.5 border-none bg-purple-500/10 text-purple-500 uppercase tracking-tight">Motion</Badge>}
            {theme.gradientFrom && <Badge variant="secondary" className="text-[8px] font-bold h-4 px-1.5 border-none bg-blue-500/10 text-blue-500 uppercase tracking-tight">Grad</Badge>}
            {theme.animationPreset && <Badge variant="secondary" className="text-[8px] font-bold h-4 px-1.5 border-none bg-emerald-500/10 text-emerald-500 uppercase tracking-tight">{theme.animationPreset.replace("-", " ")}</Badge>}
            {theme.motionEngine && <Badge variant="secondary" className="text-[8px] font-bold h-4 px-1.5 border-none bg-orange-500/10 text-orange-500 uppercase tracking-tight">{theme.motionEngine}</Badge>}
          </div>
        </div>

        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg z-20"
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />
          </motion.div>
        )}
      </motion.button>
    );
  };

  const profileUrl = user ? `${window.location.origin}/p/${user.username}` : "";

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  /* Shared preview component */
  const previewPanel = (
    <ProfilePreview settings={settings} user={user} links={previewLinks} catalogItems={catalogItems.filter(i => i.enabled)} compact />
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1200px] mx-auto pb-10">
      <div className="lg:hidden flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-10 px-4 rounded-xl border-border/50 bg-card/50 backdrop-blur-md"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
        >
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="font-bold">Preview</span>
        </Button>
      </div>

      {/* Main 2-column layout: controls + sticky preview */}
      <div className="flex gap-6">
        {/* Left: all controls */}
        <div className="flex-1 min-w-0 flex flex-col gap-8 pt-4">
          <ShareProfile />

          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b border-border/40 rounded-none mb-8 gap-6 sticky top-0 z-40 backdrop-blur-md overflow-x-auto">
              <TabsTrigger value="themes" className="rounded-none py-3 px-0 font-semibold text-[15px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground transition-none border-b-2 border-transparent">
                Themes
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-none py-3 px-0 font-semibold text-[15px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground transition-none border-b-2 border-transparent">
                Templates
              </TabsTrigger>
              <TabsTrigger value="animations" className="rounded-none py-3 px-0 font-semibold text-[15px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground transition-none border-b-2 border-transparent">
                Animations
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-none py-3 px-0 font-semibold text-[15px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground transition-none border-b-2 border-transparent">
                Custom
              </TabsTrigger>
              <TabsTrigger value="ai-creator" className="rounded-none py-3 px-0 font-semibold text-[15px] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground text-muted-foreground transition-none border-b-2 border-transparent">
                AI Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="animate-fade-in outline-none">
              <div className="space-y-2">
                {/* Header & Search Row */}
                <div className="flex flex-col gap-8 mb-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">
                          All Themes
                        </h2>
                        <p className="text-[13px] text-muted-foreground mt-1.5 font-medium">World-class aesthetics for your brand.</p>
                      </div>
                    </div>

                    {/* Enhanced Search */}
                    <div className="relative w-full sm:w-80 shrink-0 group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Search premium themes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 rounded-2xl bg-card border-border/40 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Redesigned Filter Chips Row */}
                  {!filteredThemes && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Browse Categories</Label>
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{resolvedThemePresets.length} Themes available</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar items-center -mx-1 px-1">
                        <button
                          onClick={() => setActiveCategory(null)}
                          className={cn(
                            "px-6 h-12 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border flex items-center gap-2.5",
                            !activeCategory
                              ? "bg-foreground text-background shadow-xl shadow-foreground/10 border-foreground scale-[1.02]"
                              : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 shadow-sm"
                          )}
                        >
                          <span className="text-lg">🔥</span>
                          All Layouts
                        </button>
                        {resolvedThemeCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                              "px-6 h-12 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border flex items-center gap-2.5",
                              activeCategory === cat.id
                                ? "bg-foreground text-background shadow-xl shadow-foreground/10 border-foreground scale-[1.02]"
                                : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 shadow-sm"
                            )}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {filteredThemes && (
                  <Card className="p-6 border-primary/20 bg-primary/5 backdrop-blur-md rounded-2xl mb-8">
                    <Label className="text-sm font-black text-primary uppercase tracking-widest mb-4 block">
                      Search Results ({filteredThemes.length})
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredThemes.map((theme) => (
                        <ThemeCard key={theme.id} theme={theme} />
                      ))}
                    </div>
                    {filteredThemes.length === 0 && (
                      <div className="py-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                          <Search className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm font-bold">No themes match your search.</p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Themes Grid */}
                {!filteredThemes && (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {(!activeCategory ? resolvedThemePresets : getThemesByCategory(resolvedThemePresets, activeCategory)).map((theme) => (
                        <motion.div
                          key={theme.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          layout
                        >
                          <ThemeCard theme={theme} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="animate-fade-in focus-visible:outline-none">
              <div className="space-y-8">
                {/* Theme Designer Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-[22px] font-bold tracking-tight text-foreground">Theme Designer</h2>
                      <p className="text-[13px] text-muted-foreground mt-0.5">Customize every pixel of your brand identity.</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/40 hover:bg-muted"
                    onClick={() => {
                      const currentTheme = resolvedThemePresets.find(t => t.id === settings.themeId);
                      if (currentTheme) {
                        applyTheme(currentTheme);
                        toast.success("Reset to theme defaults");
                      }
                    }}
                  >
                    Reset Defaults
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Visual Style Layout */}
                  <Card className="p-0 overflow-hidden border-border/40 bg-card/30 backdrop-blur-md rounded-[32px] shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {/* Left: Buttons & Typography */}
                      <div className="p-8 border-b md:border-b-0 md:border-r border-border/20 space-y-10">
                        <section className="space-y-6">
                          <div className="flex items-center gap-2">
                            <Layout className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Button Engineering</h3>
                          </div>
                          <ButtonStylePicker
                            currentStyle={settings.buttonStyle}
                            onSelect={(style) => updateSettings({ buttonStyle: style })}
                            buttonBg={settings.buttonBg}
                            buttonText={settings.buttonText}
                          />
                        </section>

                        <section className="space-y-6">
                          <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Typography</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {fonts.map((f) => (
                              <button
                                key={f.value}
                                onClick={() => updateSettings({ fontFamily: f.value })}
                                className={cn(
                                  "p-4 rounded-2xl text-left transition-all flex flex-col items-start gap-1 justify-center h-16 border-2",
                                  settings.fontFamily === f.value
                                    ? "border-primary bg-primary/5 shadow-inner"
                                    : "border-border/20 hover:border-primary/20 hover:bg-muted/50 bg-card/40"
                                )}
                                style={{ fontFamily: f.value }}
                              >
                                <span className="text-[13px] font-bold text-foreground truncate w-full leading-none">{f.label}</span>
                                <span className="text-[10px] text-muted-foreground opacity-60 leading-none">The quick brown fox</span>
                              </button>
                            ))}
                          </div>
                        </section>
                      </div>

                      {/* Right: Colors & Backgrounds */}
                      <div className="p-8 space-y-10 bg-muted/10">
                        <section className="space-y-6">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Identity Colors</h3>
                          </div>
                          <ColorPickerSection settings={settings} updateSettings={updateSettings} />
                        </section>

                        <section className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-primary" />
                              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Canvas Display</h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avatar</Label>
                              <Switch
                                checked={settings.showAvatar}
                                onCheckedChange={(v) => updateSettings({ showAvatar: v })}
                                className="scale-75"
                              />
                            </div>
                          </div>
                          <BackgroundImageUpload />
                        </section>

                        <section className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Layout className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Tab Labels</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shop Tab</Label>
                              <Input
                                value={settings.shopTabLabel || "Shop"}
                                onChange={(e) => updateSettings({ shopTabLabel: e.target.value.slice(0, 20) })}
                                placeholder="Shop"
                                className="h-10 rounded-xl border-border/40"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Links Tab</Label>
                              <Input
                                value={settings.linksTabLabel || "Links"}
                                onChange={(e) => updateSettings({ linksTabLabel: e.target.value.slice(0, 20) })}
                                placeholder="Links"
                                className="h-10 rounded-xl border-border/40"
                              />
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">You can rename top tabs like Shop, News, Videos, Reports, etc.</p>
                        </section>

                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="animate-fade-in">
              <NicheTemplates />
            </TabsContent>

            <TabsContent value="animations" className="animate-fade-in outline-none">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none">
                      Atmospheric Animations
                    </h2>
                    <p className="text-[13px] text-muted-foreground mt-1.5 font-medium">Fine-tune the mood with lightweight motion effects.</p>
                  </div>
                </div>
                <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-md rounded-[32px]">
                   <AnimationSelector
                      currentAnimation={settings.animationClass}
                      onSelect={(ani) => updateSettings({ animationClass: ani })}
                    />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-creator" className="animate-fade-in">
              <AIThemeCreator />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: sticky preview — always visible on desktop */}
        <div className="hidden lg:block w-[420px] shrink-0 self-start sticky top-6 z-30">
          <div className="bg-card/30 border border-border/40 rounded-[32px] p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group/sidebar">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover/sidebar:rotate-6 transition-transform">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-[11px] font-black tracking-[0.2em] uppercase text-foreground">Live App View</Label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Real-time Syncing</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[9px] font-black text-primary/80 lowercase">link.bio/{user?.username}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="relative group/preview flex flex-col gap-8">
                <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity duration-1000" />
                <div className="relative transform scale-[1.02] origin-top transition-all duration-700 ease-out">
                  {previewPanel}
                </div>

                {/* Action buttons - prominent and borderless */}
                <div className="relative flex items-center gap-3 mt-4 px-2 pb-10">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl h-12 bg-card/80 hover:bg-card border border-border/50 text-foreground text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm backdrop-blur-md"
                  >
                    <ExternalLink className="w-4 h-4" /> View Site
                  </a>
                  <Button
                    onClick={copyProfileLink}
                    className="flex-1 gap-2 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] border-none"
                  >
                    <Copy className="w-4 h-4" /> Copy URL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <div className="w-full max-w-sm relative flex flex-col items-center gap-8">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="text-sm font-black uppercase tracking-widest">Mobile Preview</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 bg-card hover:bg-muted"
                  onClick={() => setShowMobilePreview(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-full">
                {previewPanel}
              </div>

              <div className="flex flex-col w-full gap-3 pb-10">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl h-14 bg-card border border-border text-foreground text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" /> Open Live Site
                </a>
                <Button
                  onClick={() => { copyProfileLink(); setShowMobilePreview(false); }}
                  className="gap-2 rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  <Copy className="w-4 h-4" /> Copy My URL
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default AppearancePage;





