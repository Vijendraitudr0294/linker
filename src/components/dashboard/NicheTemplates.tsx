import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  nicheTemplates,
  getTemplatesByCategory,
  type NicheTemplate,
} from "@/data/nicheTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAppearanceStore, type AppearanceSettings } from "@/stores/appearanceStore";
import { useLinksStore } from "@/stores/linksStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  ArrowRight,
  Edit3,
  X,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Loader2,
  Search,
  Eye,
  ImageIcon,
  Heart,
  Expand,
  Wand2,
  Palette,
  Link2,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePreview from "./ProfilePreview";

const FAVORITES_KEY = "linkvertex_template_favorites";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { favorites, toggle };
};

const categoryEmojis: Record<string, string> = {
  Fashion: "👗",
  "Health & Fitness": "💪",
  "Influencer & Creator": "⭐",
  Music: "🎵",
  "Small Business": "🏪",
  Marketing: "📈",
  "Social Media": "📱",
  Sports: "⚽",
  Creative: "🎨",
  Creator: "✍️",
  Travel: "✈️",
  Organization: "❤️",
  Tech: "💻",
  Business: "💼",
  Education: "📚",
  Beauty: "💅",
  "Wedding & Events": "💒",
  Automotive: "🚗",
  Pets: "🐾",
  Food: "👨‍🍳",
  Medical: "🩺",
  Freelance: "✨",
  Luxury: "💎",
  Wellness: "🧘",
  Gaming: "🎮"
};

const categoryPreviewImages: Record<string, string[]> = {
  Wellness: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
  ],
  Creative: [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  ],
  Education: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  ],
  Salon: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80",
  ],
  Beauty: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1498843053639-170ff2122f35?auto=format&fit=crop&w=1200&q=80",
  ],
  "E-commerce": [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
  ],
  Creator: [
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  ],
};

const getTemplatePreviewImage = (template: NicheTemplate, idx: number) => {
  const categoryImages = categoryPreviewImages[template.category];
  if (categoryImages?.length) return categoryImages[idx % categoryImages.length];
  return `https://picsum.photos/seed/${encodeURIComponent(template.id)}/1200/1600`;
};

const CARD_VARIANTS = [
  {
    shell: "rounded-[2.5rem]",
    previewHeight: "h-[14rem]",
    phone: "right-3 bottom-3 w-[52%] h-[88%] rounded-[1.4rem]",
    overlay: "bg-black/25 group-hover:bg-black/10",
    tag: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-300/30",
  },
  {
    shell: "rounded-[2.2rem]",
    previewHeight: "h-[15rem]",
    phone: "left-3 bottom-3 w-[48%] h-[84%] rounded-[1.6rem]",
    overlay: "bg-slate-900/30 group-hover:bg-slate-900/15",
    tag: "bg-cyan-500/15 text-cyan-200 border-cyan-300/30",
  },
  {
    shell: "rounded-[2.8rem]",
    previewHeight: "h-[13rem]",
    phone: "right-6 bottom-2 w-[46%] h-[90%] rounded-[1.8rem]",
    overlay: "bg-amber-900/20 group-hover:bg-amber-900/10",
    tag: "bg-amber-500/15 text-amber-100 border-amber-300/35",
  },
  {
    shell: "rounded-[2.3rem]",
    previewHeight: "h-[14.5rem]",
    phone: "right-2 bottom-4 w-[50%] h-[82%] rounded-[1.3rem]",
    overlay: "bg-indigo-900/25 group-hover:bg-indigo-900/10",
    tag: "bg-indigo-500/15 text-indigo-100 border-indigo-300/35",
  },
];

const getCardVariant = (idx: number) => CARD_VARIANTS[idx % CARD_VARIANTS.length];
const NicheTemplates = () => {
  const { settings, updateSettings } = useAppearanceStore();
  const { addLink } = useLinksStore();
  const { updateProfile, user } = useAuthStore();
  const links = useLinksStore((s) => s.links);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NicheTemplate | null>(null);
  const [customBio, setCustomBio] = useState("");
  const [customLinks, setCustomLinks] = useState<{ title: string; url: string }[]>([]);
  const [generatingBg, setGeneratingBg] = useState(false);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [bgPrompt, setBgPrompt] = useState("");
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [customBgUrl, setCustomBgUrl] = useState<string | undefined>();
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState<"bg" | "avatar" | null>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const [applying, setApplying] = useState<string | null>(null);

  const categories = getTemplatesByCategory();
  const categoryNames = Object.keys(categories);

  const baseTemplates = showFavorites
    ? nicheTemplates.filter((t) => favorites.has(t.id))
    : activeCategory
      ? categories[activeCategory] || []
      : nicheTemplates;

  const displayTemplates = searchQuery
    ? baseTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : baseTemplates;

  const startEditing = (template: NicheTemplate) => {
    setEditingTemplate(template.id);
    setCustomBio(template.suggestedBio);
    setCustomLinks([...template.defaultLinks]);
    setCustomBgUrl(undefined);
    setCustomAvatarUrl(undefined);
    setBgPrompt("");
    setAvatarPrompt("");
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setCustomBio("");
    setCustomLinks([]);
    setCustomBgUrl(undefined);
    setCustomAvatarUrl(undefined);
  };

  const addCustomLink = () => {
    setCustomLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const removeCustomLink = (idx: number) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCustomLink = (idx: number, field: "title" | "url", val: string) => {
    setCustomLinks((prev) =>
      prev.map((link, i) => (i === idx ? { ...link, [field]: val } : link))
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "bg" | "avatar") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 10MB");
      return;
    }
    setUploading(type);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.user_id}/${type}-template-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      if (type === "bg") setCustomBgUrl(urlData.publicUrl);
      else setCustomAvatarUrl(urlData.publicUrl);
      toast.success(`${type === "bg" ? "Background" : "Avatar"} uploaded!`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
      if (type === "bg" && bgFileRef.current) bgFileRef.current.value = "";
      if (type === "avatar" && avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const handleAIGenerate = async (type: "bg" | "avatar") => {
    const prompt = type === "bg" ? bgPrompt : avatarPrompt;
    if (!prompt.trim()) return;
    if (type === "bg") setGeneratingBg(true);
    else setGeneratingAvatar(true);
    try {
      const systemPrompt = type === "bg"
        ? `Generate a beautiful background for a social link-in-bio page: ${prompt}.`
        : `Generate a professional profile picture: ${prompt}.`;
      const { data, error } = await supabase.functions.invoke("generate-background", { body: { prompt: systemPrompt } });
      if (error) throw error;
      if (!data?.image_url) throw new Error("No image");
      const base64 = data.image_url.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const path = `${user!.user_id}/${type}-ai-${Date.now()}.png`;
      await supabase.storage.from("user-uploads").upload(path, bytes, { contentType: "image/png", upsert: true });
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      if (type === "bg") {
        setCustomBgUrl(urlData.publicUrl);
        setBgPrompt("");
      } else {
        setCustomAvatarUrl(urlData.publicUrl);
        setAvatarPrompt("");
      }
      toast.success(`AI ${type} generated!`);
    } catch {
      toast.error("AI failed");
    } finally {
      if (type === "bg") setGeneratingBg(false);
      else setGeneratingAvatar(false);
    }
  };

  const applyTemplate = async (template: NicheTemplate, isEdited = false) => {
    setApplying(template.id);
    try {
      const bgImage = isEdited && customBgUrl ? customBgUrl : template.theme.backgroundImage;
      
      // Update Appearance
      await updateSettings({
        themeId: template.id,
        backgroundColor: template.theme.backgroundColor,
        cardColor: template.theme.cardColor,
        textColor: template.theme.textColor,
        buttonBg: template.theme.buttonBg,
        buttonText: template.theme.buttonText,
        buttonStyle: template.theme.buttonStyle,
        gradientFrom: template.theme.gradientFrom || null,
        gradientTo: template.theme.gradientTo || null,
        backgroundImage: bgImage || null,
        backgroundOverlay: template.theme.backgroundOverlay || null,
        fontFamily: template.theme.fontFamily || "Inter",
        animatedGradient: template.theme.animatedGradient || null,
        animationClass: template.theme.animationClass || null
      });

      // Update Profile Info
      const bio = isEdited ? customBio : template.suggestedBio;
      const avatar = isEdited && customAvatarUrl ? customAvatarUrl : undefined;
      await updateProfile({ bio, ...(avatar ? { avatar_url: avatar } : {}) });

      // Add Links (Template links act as a starting point)
      const linksToAdd = isEdited ? customLinks : template.defaultLinks;
      const filteredLinks = linksToAdd.filter((l) => l.title && l.url);
      
      // We process links sequentially to avoid store conflicts
      for (const link of filteredLinks) {
        await addLink(link.title, link.url);
      }

      toast.success(`${template.name} applied successfully! 🎉`);
      cancelEditing();
      setPreviewTemplate(null);
    } catch (error) {
      toast.error("Failed to apply template. Please try again.");
      console.error(error);
    } finally {
      setApplying(null);
    }
  };

  const getPreviewSettings = (template: NicheTemplate): AppearanceSettings => ({
    themeId: template.id,
    backgroundColor: template.theme.backgroundColor,
    cardColor: template.theme.cardColor,
    textColor: template.theme.textColor,
    buttonBg: template.theme.buttonBg,
    buttonText: template.theme.buttonText,
    buttonStyle: template.theme.buttonStyle,
    gradientFrom: template.theme.gradientFrom,
    gradientTo: template.theme.gradientTo,
    backgroundImage: template.theme.backgroundImage,
    backgroundOverlay: template.theme.backgroundOverlay,
    fontFamily: template.theme.fontFamily ?? "Inter",
    animatedGradient: template.theme.animatedGradient,
    animationClass: template.theme.animationClass,
    showAvatar: true,
  });

  const previewLinks = links.filter((l) => l.enabled).length > 0
    ? links.filter((l) => l.enabled).slice(0, 4).map((l) => ({ id: l.id, title: l.title, platform: l.platform }))
    : [{ id: "1", title: "My Website", platform: "website" }, { id: "2", title: "Instagram", platform: "instagram" }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-6">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/40 blur-[20px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[25px] animate-blob-slow [animation-delay:-5s]" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/30 blur-[22px] animate-blob-slow [animation-delay:-10s]" />
        <div className="absolute bottom-[20%] right-[30%] w-[45%] h-[45%] rounded-full bg-pink-500/35 blur-[22px] animate-blob-slow [animation-delay:-15s]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Template Gallery</h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium">World-top designs for your digital identity.</p>
        </div>
      </div>

      {/* Filters - Added Dropdown for easier selection as requested */}
      <div className="sticky top-0 z-30 space-y-4 py-4 bg-background/80 backdrop-blur-md border-b border-border/10">
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search premium layouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-border/50 bg-card/50"
            />
          </div>

          <div className="w-full sm:w-64">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block ml-1">Category</Label>
            <Select
              value={activeCategory || "all"}
              onValueChange={(val) => {
                setShowFavorites(false);
                setActiveCategory(val === "all" ? null : val);
              }}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border/50 bg-card shadow-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                <SelectItem value="all">🔥 All Templates</SelectItem>
                {categoryNames.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryEmojis[cat] || "📦"} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-3">
            <button
              onClick={() => { setShowFavorites(false); setActiveCategory(null); }}
              className={cn(
                "px-5 h-11 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                !activeCategory && !showFavorites 
                  ? "bg-foreground text-background shadow-lg border-foreground" 
                  : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 shadow-sm"
              )}
            >
              <span className="text-base">🔥</span>
              All Templates
            </button>
            {categoryNames.map(cat => (
              <button
                key={cat}
                onClick={() => { setShowFavorites(false); setActiveCategory(cat); }}
                className={cn(
                  "px-5 h-11 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                  activeCategory === cat 
                    ? "bg-foreground text-background shadow-lg border-foreground" 
                    : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/30 shadow-sm"
                )}
              >
                <span className="text-base">{categoryEmojis[cat] || "📦"}</span>
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayTemplates.map((template, idx) => {
            const isSelected = settings.themeId === template.id;
            const isEditing = editingTemplate === template.id;
            const variant = getCardVariant(idx);
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={cn(
                  variant.shell,
                  "overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 group relative",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                {/* Preview Area */}
                <div className={cn("relative cursor-pointer overflow-hidden", variant.previewHeight)} onClick={() => setPreviewTemplate(template)}>
                  <img
                    src={getTemplatePreviewImage(template, idx)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={`${template.name} preview`}
                    loading="lazy"
                  />
                  <div
                    className={cn("absolute inset-0 opacity-60", template.theme.animationClass)}
                    style={{
                      background: template.theme.gradientFrom
                        ? `linear-gradient(135deg, ${template.theme.gradientFrom}, ${template.theme.gradientTo})`
                        : "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 100%)",
                    }}
                  />
                  <div className={cn("absolute inset-0 transition-colors", variant.overlay)} />

                  {/* Animation indicator */}
                  {template.theme.animationClass && (
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
                      <Badge className={cn("backdrop-blur-md text-[8px] font-black uppercase tracking-tighter", variant.tag)}>
                        {template.theme.animationClass.replace('animate-', '').toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                    {isSelected && <Badge className="bg-emerald-500 text-white uppercase text-[9px] font-black tracking-widest px-3 py-1 border-none shadow-lg shadow-emerald-500/20">Active</Badge>}
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 uppercase text-[9px] font-black tracking-widest px-3 py-1 shadow-2xl">Premium</Badge>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white z-10">
                    <Heart className="w-4 h-4" fill={favorites.has(template.id) ? "white" : "none"} />
                  </button>

                  <div className={cn("absolute pointer-events-none overflow-hidden border border-white/25 shadow-2xl shadow-black/40 bg-background/95", variant.phone)}>
                    <div className="w-full h-[680px] opacity-95 transition-transform duration-1000 group-hover:scale-105 origin-top">
                      <ProfilePreview
                        settings={getPreviewSettings(template)}
                        user={user || { name: "Demo User", bio: template.suggestedBio, avatar_url: "", username: "username" }}
                        links={template.defaultLinks.map((l, i) => ({ id: `demo-${i}`, title: l.title, platform: 'website' }))}
                        showSocialIcons={false}
                        compact={false}
                        noFrame={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm tracking-tight text-foreground">{template.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{template.category}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => startEditing(template)} className="h-8 w-8 rounded-full border border-border/50 hover:bg-primary/10">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      disabled={!!applying}
                      onClick={() => applyTemplate(template)} 
                      className={cn(
                        "flex-1 h-11 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg transition-all", 
                        isSelected ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                      )}
                    >
                      {applying === template.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSelected ? (
                        "Applied"
                      ) : (
                        "Apply Layout"
                      )}
                    </Button>
                    <Button variant="secondary" size="icon" onClick={() => setPreviewTemplate(template)} className="h-11 w-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/40">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Inline Editing Overlay */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute inset-0 z-40 bg-background/95 backdrop-blur-md p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Customize</h4>
                          <p className="text-xl font-black">{template.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-10 w-10 rounded-full border border-border/50">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Your Bio</Label>
                          <Textarea value={customBio} onChange={(e) => setCustomBio(e.target.value)} className="rounded-2xl bg-muted/50 border-border/40 min-h-[80px]" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Visual Assets</Label>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => bgFileRef.current?.click()} className="h-7 px-3 rounded-lg text-[9px] uppercase font-black tracking-widest bg-card">BG Upload</Button>
                              <Button size="sm" variant="outline" onClick={() => avatarFileRef.current?.click()} className="h-7 px-3 rounded-lg text-[9px] uppercase font-black tracking-widest bg-card">Avatar</Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-video rounded-xl bg-muted/50 border border-border/40 overflow-hidden relative">
                              {customBgUrl ? <img src={customBgUrl} className="w-full h-full object-cover" alt="" /> : <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase font-black opacity-30">No BG</div>}
                            </div>
                            <div className="aspect-video rounded-xl bg-muted/50 border border-border/40 overflow-hidden relative">
                              {customAvatarUrl ? <img src={customAvatarUrl} className="w-full h-full object-cover" alt="" /> : <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase font-black opacity-30">No Avatar</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => applyTemplate(template, true)} className="h-14 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 mt-4">Save & Apply</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Hidden file inputs */}
      <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "bg")} />
      <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black/60 backdrop-blur-xl border-white/10 rounded-[3rem] h-[85vh] flex flex-col">
          <DialogTitle className="sr-only">Preview</DialogTitle>
          {previewTemplate && (
            <>
              <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8">
                <div className="w-full h-full transform scale-[0.85] origin-center">
                  <ProfilePreview
                    settings={getPreviewSettings(previewTemplate)}
                    user={user}
                    links={previewLinks}
                  />
                </div>
              </div>
              <div className="p-8 bg-card/60 backdrop-blur-2xl border-t border-white/5 space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{previewTemplate.category}</p>
                  <h3 className="text-2xl font-black">{previewTemplate.name}</h3>
                </div>
                <Button onClick={() => applyTemplate(previewTemplate)} className="w-full h-14 rounded-[1.5rem] bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-[0.2em] shadow-2xl">Use this template</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NicheTemplates;

