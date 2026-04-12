import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useLinks } from "@/hooks/useLinksApi";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  LayoutTemplate,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Check,
  Search,
  Sparkles,
  Link2,
  ShoppingBag,
  MessageCircle,
  Image,
  Type,
  Minus,
  Video,
  Music,
  MapPin,
  Clock,
  Star,
  Smartphone,
  ChevronRight,
  Palette,
  ExternalLink,
  Copy,
  RefreshCw,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// ═══════════════════════════
// PREBUILT TEMPLATES
// ═══════════════════════════

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string; // gradient or color
  accent: string;
  components: ComponentBlock[];
  themeOverrides: {
    backgroundColor: string;
    textColor: string;
    buttonBg: string;
    buttonText: string;
    buttonStyle: "rounded" | "pill" | "square" | "outline" | "shadow";
    cardColor: string;
    fontFamily: string;
    layoutType: "list" | "grid" | "bento" | "brutalism";
  };
}

interface ComponentBlock {
  id: string;
  type: ComponentType;
  label: string;
  enabled: boolean;
  config?: Record<string, any>;
}

type ComponentType =
  | "header"
  | "links"
  | "shop"
  | "contact"
  | "social-icons"
  | "text-block"
  | "image-banner"
  | "video-embed"
  | "music-player"
  | "location"
  | "divider"
  | "testimonials"
  | "countdown"
  | "featured-product"
  | "app-downloads"
  | "class-schedule"
  | "product-grid-2-col"
  | "newsletter-signup";

const COMPONENT_REGISTRY: {
  type: ComponentType;
  label: string;
  icon: React.ElementType;
  description: string;
  category: "essential" | "content" | "media" | "engagement";
}[] = [
  { type: "header", label: "Profile Header", icon: Type, description: "Name, bio & avatar", category: "essential" },
  { type: "links", label: "Link Buttons", icon: Link2, description: "Your clickable links", category: "essential" },
  { type: "app-downloads", label: "App Downloads", icon: Smartphone, description: "iOS / Android badges", category: "essential" },
  { type: "shop", label: "Product Grid", icon: ShoppingBag, description: "Catalog / shop items", category: "essential" },
  { type: "product-grid-2-col", label: "2-Column Shop", icon: ShoppingBag, description: "Side-by-side products", category: "essential" },
  { type: "class-schedule", label: "Event / Class Schedule", icon: Clock, description: "Dates and ticket links", category: "engagement" },
  { type: "newsletter-signup", label: "Newsletter Form", icon: MessageCircle, description: "Email capture block", category: "engagement" },
  { type: "contact", label: "Contact Form", icon: MessageCircle, description: "Let visitors message you", category: "engagement" },
  { type: "social-icons", label: "Social Strip", icon: Star, description: "Social media icons row", category: "essential" },
  { type: "text-block", label: "Text Block", icon: Type, description: "Custom paragraph / heading", category: "content" },
  { type: "image-banner", label: "Image Banner", icon: Image, description: "Full-width promo image", category: "media" },
  { type: "video-embed", label: "Video Embed", icon: Video, description: "YouTube / Vimeo embed", category: "media" },
  { type: "music-player", label: "Music Player", icon: Music, description: "Spotify / SoundCloud embed", category: "media" },
  { type: "location", label: "Location Map", icon: MapPin, description: "Google Maps embed", category: "content" },
  { type: "divider", label: "Divider", icon: Minus, description: "Visual separator", category: "content" },
  { type: "testimonials", label: "Testimonials", icon: Star, description: "Client / fan reviews", category: "engagement" },
  { type: "countdown", label: "Countdown", icon: Clock, description: "Timer for events / drops", category: "engagement" },
  { type: "featured-product", label: "Featured Item", icon: ShoppingBag, description: "Highlight one product", category: "engagement" },
];

const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const PREBUILT_TEMPLATES: PageTemplate[] = [
  {
    id: "minimal-creator",
    name: "Minimal Creator",
    description: "Clean, minimal layout. Perfect for designers & photographers.",
    category: "Creator",
    preview: "linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)",
    accent: "#000000",
    components: [
      { id: "h1", type: "header", label: "Profile Header", enabled: true },
      { id: "s1", type: "social-icons", label: "Social Strip", enabled: true },
      { id: "l1", type: "links", label: "Link Buttons", enabled: true },
      { id: "d1", type: "divider", label: "Divider", enabled: true },
      { id: "c1", type: "contact", label: "Contact Form", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#fafafa",
      textColor: "#111111",
      buttonBg: "#111111",
      buttonText: "#ffffff",
      buttonStyle: "pill",
      cardColor: "#ffffff",
      fontFamily: "Inter",
      layoutType: "list",
    },
  },
  {
    id: "bold-entrepreneur",
    name: "Bold Entrepreneur",
    description: "High-energy layout with shop front & testimonials.",
    category: "Business",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accent: "#e94560",
    components: [
      { id: "h2", type: "header", label: "Profile Header", enabled: true },
      { id: "fp2", type: "featured-product", label: "Featured Item", enabled: true },
      { id: "sh2", type: "shop", label: "Product Grid", enabled: true },
      { id: "l2", type: "links", label: "Link Buttons", enabled: true },
      { id: "t2", type: "testimonials", label: "Testimonials", enabled: true },
      { id: "c2", type: "contact", label: "Contact Form", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#1a1a2e",
      textColor: "#f8f9fa",
      buttonBg: "#e94560",
      buttonText: "#ffffff",
      buttonStyle: "rounded",
      cardColor: "rgba(255,255,255,0.08)",
      fontFamily: "Space Grotesk",
      layoutType: "grid",
    },
  },
  {
    id: "music-artist",
    name: "Music Artist",
    description: "Dark vibe with music embeds and event countdown.",
    category: "Music",
    preview: "linear-gradient(135deg, #0d0d0d 0%, #1a0033 50%, #330066 100%)",
    accent: "#a855f7",
    components: [
      { id: "h3", type: "header", label: "Profile Header", enabled: true },
      { id: "m3", type: "music-player", label: "Music Player", enabled: true },
      { id: "v3", type: "video-embed", label: "Video Embed", enabled: true },
      { id: "cd3", type: "countdown", label: "Countdown", enabled: true },
      { id: "l3", type: "links", label: "Link Buttons", enabled: true },
      { id: "s3", type: "social-icons", label: "Social Strip", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#0d0d0d",
      textColor: "#f8f9fa",
      buttonBg: "#a855f7",
      buttonText: "#ffffff",
      buttonStyle: "pill",
      cardColor: "rgba(168,85,247,0.1)",
      fontFamily: "Sora",
      layoutType: "list",
    },
  },
  {
    id: "lifestyle-blogger",
    name: "Lifestyle Blogger",
    description: "Warm tones, image-heavy layout with personal flair.",
    category: "Lifestyle",
    preview: "linear-gradient(135deg, #fef3e2 0%, #fcd5ce 50%, #f8a4a4 100%)",
    accent: "#e76f51",
    components: [
      { id: "h4", type: "header", label: "Profile Header", enabled: true },
      { id: "ib4", type: "image-banner", label: "Image Banner", enabled: true },
      { id: "l4", type: "links", label: "Link Buttons", enabled: true },
      { id: "sh4", type: "shop", label: "Product Grid", enabled: true },
      { id: "tb4", type: "text-block", label: "Text Block", enabled: true },
      { id: "s4", type: "social-icons", label: "Social Strip", enabled: true },
      { id: "c4", type: "contact", label: "Contact Form", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#fef3e2",
      textColor: "#2d2d2d",
      buttonBg: "#e76f51",
      buttonText: "#ffffff",
      buttonStyle: "rounded",
      cardColor: "#ffffff",
      fontFamily: "Playfair Display",
      layoutType: "bento",
    },
  },
  {
    id: "tech-founder",
    name: "Tech Founder",
    description: "Modern brutalist style for SaaS & startup founders.",
    category: "Business",
    preview: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
    accent: "#10b981",
    components: [
      { id: "h5", type: "header", label: "Profile Header", enabled: true },
      { id: "l5", type: "links", label: "Link Buttons", enabled: true },
      { id: "fp5", type: "featured-product", label: "Featured Item", enabled: true },
      { id: "t5", type: "testimonials", label: "Testimonials", enabled: true },
      { id: "loc5", type: "location", label: "Location Map", enabled: true },
      { id: "c5", type: "contact", label: "Contact Form", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      buttonBg: "#000000",
      buttonText: "#ffffff",
      buttonStyle: "square",
      cardColor: "#f5f5f5",
      fontFamily: "Space Grotesk",
      layoutType: "brutalism",
    },
  },
  {
    id: "fitness-coach-clone",
    name: "Fitness Coach",
    description: "Exact clone of the dark, sleek fitness template with apps, schedules, and split products.",
    category: "Health",
    preview: "#000000",
    accent: "#ffffff",
    components: [
      { id: "h6", type: "header", label: "Profile Header", enabled: true },
      { id: "s6", type: "social-icons", label: "Social Strip", enabled: true },
      { id: "app6", type: "app-downloads", label: "Download my Fitness App", enabled: true },
      { id: "v6", type: "video-embed", label: "Latest workouts", enabled: true },
      { id: "class6", type: "class-schedule", label: "Next HIIT Classes", enabled: true },
      { id: "prod6", type: "product-grid-2-col", label: "Favourite Supplements", enabled: true },
      { id: "news6", type: "newsletter-signup", label: "Newsletter", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      buttonBg: "#ffffff",
      buttonText: "#000000",
      buttonStyle: "rounded",
      cardColor: "#000000",
      fontFamily: "Inter",
      layoutType: "list",
    },
  },
  {
    id: "real-estate-elite",
    name: "Real Estate Elite",
    description: "Premium property showcase with maps, inquiry forms, and featured listings.",
    category: "Real Estate",
    preview: "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
    accent: "#1e3a8a",
    components: [
      { id: "h7", type: "header", label: "Agent Profile", enabled: true },
      { id: "ib7", type: "image-banner", label: "Featured Property", enabled: true },
      { id: "fp7", type: "featured-product", label: "Hot Listing", enabled: true },
      { id: "sh7", type: "shop", label: "Property Grid", enabled: true },
      { id: "loc7", type: "location", label: "Office Map", enabled: true },
      { id: "c7", type: "contact", label: "Booking Visit", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      buttonBg: "#1e3a8a",
      buttonText: "#ffffff",
      buttonStyle: "rounded",
      cardColor: "#f9fafb",
      fontFamily: "Poppins",
      layoutType: "bento",
    },
  },
  {
    id: "hospitality-pro",
    name: "Hospitality Pro",
    description: "Elegant layout for hotels, rentals, and luxury stays.",
    category: "Hospitality",
    preview: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    accent: "#92400e",
    components: [
      { id: "h8", type: "header", label: "Hotel Profile", enabled: true },
      { id: "ib8", type: "image-banner", label: "Room Showcase", enabled: true },
      { id: "class8", type: "class-schedule", label: "Available Slots", enabled: true },
      { id: "prod8", type: "product-grid-2-col", label: "Room Types", enabled: true },
      { id: "t8", type: "testimonials", label: "Guest Reviews", enabled: true },
      { id: "c8", type: "contact", label: "Reservation Inquiry", enabled: true },
    ],
    themeOverrides: {
      backgroundColor: "#fffcf2",
      textColor: "#403d39",
      buttonBg: "#92400e",
      buttonText: "#ffffff",
      buttonStyle: "pill",
      cardColor: "#ffffff",
      fontFamily: "Lora",
      layoutType: "list",
    },
  },
];

const TEMPLATE_CATEGORIES = ["All", "Creator", "Business", "Music", "Lifestyle", "Health", "Real Estate", "Hospitality"];

// ═══════════════════════════
// PAGE COMPONENT
// ═══════════════════════════

const TemplatesPage = () => {
  const { settings, applyTheme, updateSettings } = useAppearanceStore();
  const user = useAuthStore((s) => s.user);
  const { data: links = [] } = useLinks(user?.user_id);
  const { data: catalogItems = [] } = useCatalogItems(user?.user_id);
  const activeLinks = links.filter((l) => l.enabled);
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pageBlocks, setPageBlocks] = useState<ComponentBlock[]>([
    { id: generateId(), type: "header", label: "Profile Header", enabled: true },
    { id: generateId(), type: "social-icons", label: "Social Strip", enabled: true },
    { id: generateId(), type: "links", label: "Link Buttons", enabled: true },
    { id: generateId(), type: "contact", label: "Contact Form", enabled: true },
  ]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [componentCategory, setComponentCategory] = useState<"all" | "essential" | "content" | "media" | "engagement">("all");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Filtered templates
  const filteredTemplates = PREBUILT_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered components for the library
  const filteredComponents = COMPONENT_REGISTRY.filter((c) => {
    if (componentCategory === "all") return true;
    return c.category === componentCategory;
  });

  // Apply a prebuilt template
  const applyTemplate = async (template: PageTemplate) => {
    setIsSyncing(true);
    try {
      setPageBlocks(template.components.map((c) => ({ ...c, id: generateId() })));
      await applyTheme({
        id: template.id,
        backgroundColor: template.themeOverrides.backgroundColor,
        textColor: template.themeOverrides.textColor,
        buttonBg: template.themeOverrides.buttonBg,
        buttonText: template.themeOverrides.buttonText,
        buttonStyle: template.themeOverrides.buttonStyle,
        cardColor: template.themeOverrides.cardColor,
        fontFamily: template.themeOverrides.fontFamily,
        layoutMode: template.themeOverrides.layoutType as any,
        backgroundImage: "", 
        backgroundOverlay: "", 
        gradientFrom: template.preview.startsWith("linear") ? undefined : "",
        gradientTo: template.preview.startsWith("linear") ? undefined : "",
      });
      toast.success(`"${template.name}" applied!`, {
        description: "Your page layout and theme have been updated.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add a component block
  const addComponent = (type: ComponentType) => {
    const reg = COMPONENT_REGISTRY.find((c) => c.type === type);
    if (!reg) return;
    setPageBlocks((prev) => [
      ...prev,
      { id: generateId(), type, label: reg.label, enabled: true },
    ]);
    toast.success(`${reg.label} added to your page`);
  };

  // Remove a component block
  const removeBlock = (blockId: string) => {
    setPageBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Toggle block enabled
  const toggleBlock = (blockId: string) => {
    setPageBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b))
    );
  };

  // Drag & drop reorder
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(fromIndex) || fromIndex === toIndex) {
      setDragOverIndex(null);
      return;
    }
    setPageBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDragOverIndex(null);
  };

  const profileUrl = user ? `${window.location.origin}/p/${user.username}` : "";

  return (
    <div className="space-y-8 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        .bruddle-card { border: 2px solid #000; border-radius: 28px; box-shadow: 8px 8px 0 0 rgba(0,0,0,1); }
      `}</style>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          <header className="px-1 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] border-2 border-black flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-black tracking-tight">Templates</h1>
                <p className="text-sm font-medium text-black/40">
                  Pick a prebuilt design or build your own with drag & drop.
                </p>
              </div>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white p-2 rounded-[24px] mb-8 overflow-x-auto no-scrollbar scrollbar-hide flex w-full lg:w-fit border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {[
                { id: "templates", label: "Prebuilt" },
                { id: "builder", label: "Page Builder" },
                { id: "components", label: "Components" },
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

            {/* ═══ PREBUILT TEMPLATES ═══ */}
            <TabsContent value="templates" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                  <Input
                    placeholder="Search templates..."
                    className="pl-10 h-12 rounded-xl bg-white border-2 border-black/10 focus:border-black transition-all text-xs font-bold text-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "secondary"}
                      size="sm"
                      className="rounded-full h-9 px-5 text-[11px] font-bold whitespace-nowrap"
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-[28px] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-white transition-all hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                  >
                    {/* Preview Gradient */}
                    <div
                      className="h-40 w-full relative overflow-hidden"
                      style={{ background: template.preview }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-sm">
                        <Button
                          onClick={() => applyTemplate(template)}
                          disabled={isSyncing}
                          className="bg-white text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                          {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                          Apply Template
                        </Button>
                      </div>
                      {/* Blocks mini icons */}
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {template.components.slice(0, 5).map((c) => {
                          const reg = COMPONENT_REGISTRY.find((r) => r.type === c.type);
                          const Icon = reg?.icon || LayoutTemplate;
                          return (
                            <div
                              key={c.id}
                              className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                          );
                        })}
                        {template.components.length > 5 && (
                          <div className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center text-[8px] font-black text-white">
                            +{template.components.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-black text-black">{template.name}</h3>
                        <Badge className="bg-black/5 text-black/60 border-black/10 text-[9px] font-bold uppercase tracking-wider shrink-0">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-black/50 font-medium mb-4">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: template.themeOverrides.backgroundColor }} />
                          <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: template.themeOverrides.buttonBg }} />
                          <div className="w-5 h-5 rounded-full border-2 border-black" style={{ backgroundColor: template.themeOverrides.textColor }} />
                        </div>
                        <span className="text-[10px] font-bold text-black/30 ml-auto">{template.components.length} blocks</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* ═══ PAGE BUILDER (Drag & Drop) ═══ */}
            <TabsContent value="builder" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="bruddle-card p-6 md:p-8 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] border-2 border-black flex items-center justify-center">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black tracking-tight uppercase">Page Layout</h3>
                      <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Drag blocks to reorder. Toggle visibility.</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-2 border-black text-xs font-bold"
                    onClick={() => setActiveTab("components")}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Block
                  </Button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {pageBlocks.map((block, index) => {
                      const reg = COMPONENT_REGISTRY.find((c) => c.type === block.type);
                      const Icon = reg?.icon || LayoutTemplate;
                      return (
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, index)}
                          onDragOver={(e: any) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e: any) => handleDrop(e, index)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing group",
                            block.enabled
                              ? "border-black bg-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                              : "border-black/20 bg-black/5 opacity-60",
                            dragOverIndex === index && "border-dashed border-emerald-500 bg-emerald-50"
                          )}
                        >
                          <div className="text-black/30 group-hover:text-black transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className={cn(
                            "w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0",
                            block.enabled ? "bg-[#E0E7FF]" : "bg-black/10"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-black truncate">{block.label}</p>
                            <p className="text-[10px] text-black/40 font-medium">{reg?.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleBlock(block.id)}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                                block.enabled
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                  : "border-black/20 bg-black/5 text-black/30"
                              )}
                            >
                              {block.enabled ? <Eye className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => removeBlock(block.id)}
                              className="w-8 h-8 rounded-lg border-2 border-red-200 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {pageBlocks.length === 0 && (
                    <div className="text-center py-16 text-black/30">
                      <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="font-black text-sm uppercase tracking-widest">No blocks yet</p>
                      <p className="text-xs mt-2">Go to Components tab to add building blocks.</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* ═══ COMPONENT LIBRARY ═══ */}
            <TabsContent value="components" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 overflow-x-auto mb-6 pb-2 hide-scrollbar">
                {(["all", "essential", "content", "media", "engagement"] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={componentCategory === cat ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full h-9 px-5 text-[11px] font-bold whitespace-nowrap capitalize"
                    onClick={() => setComponentCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComponents.map((comp) => {
                  const alreadyAdded = pageBlocks.some((b) => b.type === comp.type);
                  return (
                    <motion.div
                      key={comp.type}
                      whileHover={{ y: -2 }}
                      className={cn(
                        "relative p-5 rounded-2xl border-2 transition-all group",
                        alreadyAdded
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-black/10 bg-white hover:border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0",
                          alreadyAdded ? "border-emerald-400 bg-emerald-100" : "border-black bg-[#E0E7FF]"
                        )}>
                          <comp.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-black">{comp.label}</h4>
                          <p className="text-[10px] text-black/40 font-medium mt-0.5">{comp.description}</p>
                          <Badge className="mt-2 bg-black/5 text-black/40 text-[8px] font-bold uppercase tracking-wider">
                            {comp.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addComponent(comp.type)}
                        disabled={alreadyAdded}
                        className={cn(
                          "mt-4 w-full rounded-xl text-xs font-bold transition-all",
                          alreadyAdded
                            ? "bg-emerald-100 text-emerald-600 border-emerald-300 cursor-default"
                            : "bg-black text-white hover:bg-black/80 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                        )}
                      >
                        {alreadyAdded ? (
                          <><Check className="w-3.5 h-3.5 mr-1" /> Added</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5 mr-1" /> Add to Page</>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Sidebar */}
        <div className="hidden lg:block w-[380px] shrink-0">
          <div className="fixed top-24 right-10 w-[380px] z-30 h-[calc(100vh-8rem)]">
            <Card className="h-full p-6 bg-[#E0F2FE] flex flex-col items-center justify-start relative overflow-hidden rounded-[28px] border-2 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                <Smartphone size={160} strokeWidth={1} />
              </div>
              <div className="relative z-10 flex flex-col h-full w-full">
                <div className="flex items-center gap-2 mb-4 w-full justify-between">
                  <span className="text-xl font-black text-black uppercase tracking-tight">Preview</span>
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
                    className="h-10 rounded-xl bg-white border-2 border-black text-black text-[11px] uppercase tracking-widest font-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    asChild
                  >
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> View
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 rounded-xl bg-white border-2 border-black text-black text-[11px] uppercase tracking-widest font-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    onClick={() => {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                </div>

                <motion.div
                  key={settings.themeId || "default"}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1 w-full rounded-[2.4rem] border-2 border-black overflow-hidden bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative"
                >
                  <ProfilePreview
                    settings={settings}
                    user={user}
                    links={activeLinks.map((l) => ({ id: l.id, title: l.title, platform: l.platform || "website" }))}
                    catalogItems={catalogItems.filter((i) => i.enabled)}
                    compact={false}
                  />
                </motion.div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Preview FAB */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-[100] lg:hidden"
          >
            <Button
              className="w-full h-14 rounded-2xl bg-black text-white font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-6 border-2 border-black"
              onClick={() => setShowMobilePreview(true)}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4" />
                <span>Preview Page</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Preview Sheet */}
      <AnimatePresence>
        {isMobile && showMobilePreview && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] lg:hidden bg-white"
          >
            <div className="flex flex-col h-full relative">
              <div className="p-4 border-b-2 border-black flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest">Preview</h3>
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10" onClick={() => setShowMobilePreview(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ProfilePreview
                  settings={settings}
                  user={user}
                  links={activeLinks.map((l) => ({ id: l.id, title: l.title, platform: l.platform || "website" }))}
                  catalogItems={catalogItems.filter((i) => i.enabled)}
                  noFrame={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplatesPage;
