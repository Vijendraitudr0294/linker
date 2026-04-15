import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  Copy, 
  AlertCircle, 
  Link2, 
  MousePointerClick, 
  Eye, 
  Zap, 
  Loader2,
  Smartphone,
  CheckCircle2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLinks, useLinkMutations } from "@/hooks/useLinksApi";
import { type LinkItem, type SocialPlatform } from "@/types/links";
import { SocialIcon, platformOptions } from "@/components/SocialIcon";
import { useEffect, useMemo, useState } from "react";
import { linkSchema, normalizeUrl } from "@/lib/validation";
import ShareProfile from "@/components/dashboard/ShareProfile";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useIsMobile } from "@/hooks/use-mobile";
import LinksToolbar from "@/components/dashboard/links/LinksToolbar";
import TemplatePicker from "@/components/dashboard/links/TemplatePicker";
import { buildTemplateUrl, getLinkTemplateCategories, inferPlatformFromTag } from "@/lib/linkTemplates";
import AddBlockButton from "@/components/dashboard/blocks/AddBlockButton";
import { useNavigate, useSearchParams } from "react-router-dom";

const tutorialSteps = [
  {
    icon: Plus,
    title: "Add your links",
    description: "Click 'Add Link' to add your social profiles, website, or any URL you want to share.",
  },
  {
    icon: MousePointerClick,
    title: "Order your links",
    description: "Use the up and down arrows to arrange your links in the perfect order.",
  },
  {
    icon: Eye,
    title: "Toggle visibility",
    description: "Use the toggle switch to show or hide links without deleting them.",
  },
  {
    icon: Zap,
    title: "Share your page",
    description: "Copy your unique link and share it on your social media bios!",
  },
];

const getSuggestedLinkTitle = (platform: SocialPlatform) => {
  switch (platform) {
    case "instagram":
      return "Follow on Instagram";
    case "youtube":
      return "Watch on YouTube";
    case "tiktok":
      return "Open TikTok";
    case "facebook":
      return "Visit Facebook";
    case "linkedin":
      return "Connect on LinkedIn";
    case "twitter":
      return "Follow on X";
    case "whatsapp":
      return "Chat on WhatsApp";
    case "telegram":
      return "Message on Telegram";
    case "email":
      return "Send Email";
    default:
      return "Open Link";
  }
};
const LinkEditor = () => {
  const user = useAuthStore((s) => s.user);
  const { data: links = [], isLoading: loading } = useLinks(user?.user_id);
  const { data: catalogItems = [] } = useCatalogItems(user?.user_id);
  const { addLink, updateLink, deleteLink, toggleLink, reorderLinks } = useLinkMutations(user?.user_id);
  const { settings } = useAppearanceStore();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const isMobile = useIsMobile();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>("website");
  const [editLayout, setEditLayout] = useState<string>("default");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("website");
  const [newLayout, setNewLayout] = useState<string>("default");
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Thumbnail detector for card view
  const getThumbnail = (url: string, platform: string) => {
    const p = platform.split('|')[0];
    
    if (p === 'youtube') {
      const match = url.match(/(?:v=|vi\/|youtu\.be\/|embed\/)([^?&"'>]+)/);
      if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    
    if (p === 'spotify') {
      // Spotify doesn't have a simple public thumbnail URL by ID alone without API
      // But we can try to use a placeholder or some known pattern if available
      return "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop";
    }

    if (p === 'instagram') {
      return "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop";
    }

    if (p === 'apple-music') {
       return "https://images.unsplash.com/photo-1543674892-7d64d45df18b?w=400&h=400&fit=crop";
    }

    if (p === 'tiktok') {
      return "https://images.unsplash.com/photo-1596720426673-e47ec429252c?w=400&h=400&fit=crop";
    }

    // Default based on platform or generic
    return `https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=400&fit=crop&q=80`;
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    reorderLinks.mutateAsync(newLinks);
  };

  const handleAddBlockSelect = (type: string) => {
    if (type === 'product') {
      navigate('/dashboard/catalog?add=true');
      return;
    }
    
    // Set presets for the link form based on type
    if (type === 'video') {
      setNewTitle("New Video");
      setNewLayout("video");
      setNewPlatform("youtube");
    } else if (type === 'article') {
      setNewTitle("New Article");
      setNewLayout("article");
      setNewPlatform("website");
    } else if (type === 'music') {
      setNewTitle("My Track");
      setNewLayout("default");
      setNewPlatform("spotify");
    } else if (type === 'tip-jar') {
      setNewTitle("Support My Work");
      setNewLayout("default");
      setNewPlatform("tip-jar");
    } else if (type === 'app') {
      setNewTitle("Download My App");
      setNewLayout("default");
      setNewPlatform("appstore");
    } else {
      setNewTitle("");
      setNewLayout("default");
      setNewPlatform("website");
    }
    
    setShowAdd(true);
  };
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const [editErrors, setEditErrors] = useState<{ title?: string; url?: string }>({});
  const [showTutorial, setShowTutorial] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [visibleCount, setVisibleCount] = useState(40);
  const [templateCategoryId, setTemplateCategoryId] = useState<string>("none");
  const [templateId, setTemplateId] = useState<string>("none");
  const [addMode, setAddMode] = useState<"template" | "custom">("template");
  const [templateSearch, setTemplateSearch] = useState("");

  const profileUrl = user ? `${window.location.origin}/p/${user.username}` : "";

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((link) => {
      const key = link.platform || "website";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links
      .map((link, index) => ({ link, index }))
      .filter(({ link }) => {
        const matchesSearch =
          searchQuery.trim().length === 0 ||
          link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = platformFilter === "all" || (link.platform || "website") === platformFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && link.enabled) ||
          (statusFilter === "disabled" && !link.enabled);
        return matchesSearch && matchesPlatform && matchesStatus;
      });
  }, [links, searchQuery, platformFilter, statusFilter]);

  useEffect(() => {
    if (!platformInitialized) {
      void fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  useEffect(() => {
    const shouldOpen = searchParams.get("add") === "true";
    if (!shouldOpen) return;

    const platformParam = (searchParams.get("platform") || "website") as SocialPlatform;
    const titleParam = searchParams.get("title") || getSuggestedLinkTitle(platformParam);
    const urlParam = searchParams.get("url") || "";
    const layoutParam = searchParams.get("layout") || "default";

    setNewPlatform(platformParam);
    setNewTitle(titleParam);
    setNewUrl(urlParam);
    setNewLayout(layoutParam);
    setShowAdd(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setVisibleCount(40);
  }, [searchQuery, platformFilter, statusFilter]);

  const visibleLinks = filteredLinks.slice(0, visibleCount);
  const hasMoreFiltered = filteredLinks.length > visibleCount;
  const isFilteredView = searchQuery.trim().length > 0 || platformFilter !== "all" || statusFilter !== "all";

  const templateCategories = useMemo(() => getLinkTemplateCategories(platformSettings), [platformSettings]);

  const selectedTemplateCategory = useMemo(
    () => templateCategories.find((category) => category.id === templateCategoryId),
    [templateCategories, templateCategoryId]
  );

  const selectedTemplate = useMemo(
    () => selectedTemplateCategory?.templates.find((template) => template.id === templateId),
    [selectedTemplateCategory, templateId]
  );

  const isEmbedInputPlatform = (platform: SocialPlatform) =>
    platform === "video-embed" || platform === "website-embed";

  const getUrlFieldLabel = (platform: SocialPlatform) =>
    isEmbedInputPlatform(platform) ? "URL / Embed Code" : "URL";

  const getUrlPlaceholder = (platform: SocialPlatform) => {
    if (platform === "video-embed") return "YouTube/Vimeo URL or <iframe ...></iframe>";
    if (platform === "website-embed") return "Website URL or <iframe ...></iframe>";
    if (platform === "google-maps") return "Google Maps share URL or embed URL";
    if (platform === "email") return "mailto:you@example.com";
    if (platform === "spotify") return "https://open.spotify.com/track/...";
    if (platform === "apple-music") return "https://music.apple.com/...";
    if (platform === "soundcloud") return "https://soundcloud.com/...";
    if (platform === "calendly") return "https://calendly.com/your-name";
    if (platform === "tip-jar") return "Enter PayPal/Venmo username or link";
    return "https://example.com";
  };

  const getUrlHint = (platform: SocialPlatform) => {
    if (platform === "video-embed") return "Supports YouTube, Vimeo, and iframe embed code.";
    if (platform === "website-embed") return "Paste a website URL or an iframe embed snippet.";
    if (platform === "google-maps") return "Use a Google Maps share link or embed URL.";
    if (platform === "spotify" || platform === "apple-music") return "Renders an interactive mini-player.";
    if (platform === "tip-jar") return "Automatically detects PayPal, Venmo, and CashApp.";
    return "";
  };

  const creationPreviewTitle = newTitle.trim() || getSuggestedLinkTitle(newPlatform);
  const creationPreviewUrl = newUrl.trim() || getUrlPlaceholder(newPlatform);
  const handleTemplateCategoryChange = (value: string) => {
    setTemplateCategoryId(value);
    setTemplateId("none");
    setTemplateSearch("");
  };

  const handleTemplateSelect = (value: string) => {
    setTemplateId(value);
    if (value === "none") return;
    const template = selectedTemplateCategory?.templates.find((item) => item.id === value);
    if (!template) return;

    const templatePlatform = template.platform || inferPlatformFromTag(template.tag);
    setNewPlatform(templatePlatform);
    setNewTitle(template.title);
    setNewUrl(buildTemplateUrl(template.tag, templatePlatform));
    setErrors((prev) => ({ ...prev, title: undefined, url: undefined }));
  };

  const clearTemplateSelection = () => {
    setTemplateId("none");
    setTemplateSearch("");
  };

  const resetAddForm = () => {
    setNewTitle("");
    setNewUrl("");
    setNewPlatform("website");
    setNewLayout("default");
    setTemplateCategoryId("none");
    setTemplateId("none");
    setAddMode("template");
    setTemplateSearch("");
    setErrors({});
  };

  const openAddForm = () => {
    resetAddForm();
    setShowAdd(true);
  };

  const closeAddForm = () => {
    resetAddForm();
    setShowAdd(false);
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const validateAndAdd = () => {
    const result = linkSchema.safeParse({ title: newTitle, url: newUrl });
    if (!result.success) {
      const fieldErrors: { title?: string; url?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "title") fieldErrors.title = issue.message;
        if (issue.path[0] === "url") fieldErrors.url = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const normalizedUrl = normalizeUrl(newUrl);
    const normalizedResult = linkSchema.safeParse({ title: newTitle, url: normalizedUrl });
    if (!normalizedResult.success) {
      setErrors({ url: "Please enter a valid URL or iframe embed code" });
      return;
    }

    setErrors({});
    const combinedPlatform = `${newPlatform}|${newLayout}` as SocialPlatform;
    setSaving(true);
    void addLink.mutateAsync({ title: newTitle.trim(), url: normalizedUrl, platform: combinedPlatform }).then(() => {
      setSaving(false);
      closeAddForm();
      toast.success("Link added!");
    });
  };

  const copyLinkUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = (id: string) => {
    deleteLink.mutateAsync(id).then(() => {
      toast.success("Link removed");
    });
  };

  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    const parts = (link.platform || "website").split("|");
    setEditPlatform(parts[0] as SocialPlatform);
    setEditLayout(parts[1] || "default");
    setEditErrors({});
  };

  const saveEdit = () => {
    if (!editingId) return;

    const result = linkSchema.safeParse({ title: editTitle, url: editUrl });
    if (!result.success) {
      const fieldErrors: { title?: string; url?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "title") fieldErrors.title = issue.message;
        if (issue.path[0] === "url") fieldErrors.url = issue.message;
      });
      setEditErrors(fieldErrors);
      toast.error(fieldErrors.url || fieldErrors.title || "Please fix validation errors");
      return;
    }

    const normalizedUrl = normalizeUrl(editUrl);
    const normalizedResult = linkSchema.safeParse({ title: editTitle, url: normalizedUrl });
    if (!normalizedResult.success) {
      setEditErrors({ url: "Please enter a valid URL or iframe embed code" });
      toast.error("Please enter a valid URL or iframe embed code");
      return;
    }

    const combinedPlatform = `${editPlatform}|${editLayout}` as SocialPlatform;
    setSaving(true);
    void updateLink.mutateAsync({ id: editingId, data: { title: editTitle.trim(), url: normalizedUrl, platform: combinedPlatform } }).then(() => {
      setSaving(false);
      setEditErrors({});
      setEditingId(null);
      toast.success("Link updated");
    });
  };

  // Shared preview panel
  const previewPanel = (
    <ProfilePreview
      settings={settings}
      user={user}
      links={links.filter(l => l.enabled).map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website', url: l.url }))}
      catalogItems={catalogItems.filter(i => i.enabled)}
      compact
    />
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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Link Management */}
        <div className="flex-1 w-full space-y-6">
          <ShareProfile />

          {/* New Integrated Block Setup */}
          <div className="mt-4">
            <AddBlockButton onSelect={handleAddBlockSelect} />
          </div>

          <motion.div
            className="flex flex-col mb-8 px-1 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
             <h1 className="text-3xl font-black text-black tracking-tight mb-1">Identity Nodes</h1>
             <p className="text-sm font-medium text-black/40">Manage your active profile links.</p>
          </motion.div>

          {/* Link Filters */}
          {links.length > 0 && (
            <LinksToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              linksCount={links.length}
              visibleCount={visibleLinks.length}
              filteredCount={filteredLinks.length}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              platformFilter={platformFilter}
              platformCounts={platformCounts}
              onSearchQueryChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onPlatformFilterChange={setPlatformFilter}
              onClearFilters={() => {
                setSearchQuery("");
                setPlatformFilter("all");
                setStatusFilter("all");
              }}
            />
          )}

          {/* Add Link Form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card className="bruddle-card-green p-8 space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-black">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-black text-lg uppercase tracking-tight">New Block</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)} className="rounded-2xl bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAddMode("template")}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        addMode === "template"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border/60 bg-background/40"
                      }`}
                    >
                      <p className="text-base font-black">Guided Setup</p>
                      <p className="text-xs text-muted-foreground">Pick a platform template</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode("custom")}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        addMode === "custom"
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border/60 bg-background/40"
                      }`}
                    >
                      <p className="text-base font-black">Direct URL</p>
                      <p className="text-xs text-muted-foreground">Paste any destination URL</p>
                    </button>
                  </div>

                  {addMode === "template" && (
                    <TemplatePicker
                      categories={templateCategories}
                      templateCategoryId={templateCategoryId}
                      templateId={templateId}
                      templateSearch={templateSearch}
                      selectedTemplateCategory={selectedTemplateCategory}
                      selectedTemplate={selectedTemplate}
                      onCategoryChange={handleTemplateCategoryChange}
                      onTemplateSelect={handleTemplateSelect}
                      onTemplateSearchChange={setTemplateSearch}
                      onTemplateClear={clearTemplateSelection}
                    />
                  )}

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase opacity-70">Platform</Label>
                      <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as SocialPlatform)}>
                        <SelectTrigger className="rounded-xl h-11 border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {platformOptions.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase opacity-70">Display Style</Label>
                      <Select value={newLayout} onValueChange={(v) => setNewLayout(v)}>
                        <SelectTrigger className="rounded-xl h-11 border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Button</SelectItem>
                          <SelectItem value="video">Video Card</SelectItem>
                          <SelectItem value="article">Article Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase opacity-70">Block Title</Label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl h-11" placeholder="Enter title" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase opacity-70">Destination URL or Embed Code</Label>
                      <textarea
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex min-h-[60px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border/50"
                        placeholder="https://... OR <iframe>...</iframe>"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={validateAndAdd} disabled={saving} className="rounded-xl flex-1 bg-primary font-bold h-11">
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Block"}
                      </Button>
                      <Button variant="ghost" disabled={saving} className="rounded-xl px-6 h-11 font-bold" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links List */}
          {isFilteredView && (
            <p className="text-xs text-muted-foreground px-1">Reordering is disabled while filters are active. Clear filters to reorder your full list.</p>
          )}
          <div className={cn(
            viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
          )}>
            {visibleLinks.map(({ link, index }, renderIndex) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: renderIndex * 0.035 }}
              >
                {viewMode === "card" && editingId !== link.id ? (
                  // CARD VIEW
                  <Card className={cn(
                    "bruddle-card overflow-hidden group hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 border-4 border-black",
                    !link.enabled && "opacity-60 grayscale"
                  )}>
                    <div className="relative aspect-video overflow-hidden border-b-4 border-black">
                      <img 
                        src={getThumbnail(link.url, link.platform || "")} 
                        alt={link.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                         <Button 
                           onClick={() => startEdit(link)}
                           className="bg-white border-2 border-black rounded-xl font-black text-[10px] uppercase text-black hover:bg-black hover:text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none translate-y-2 group-hover:translate-y-0 transition-all"
                         >
                            Edit Node
                         </Button>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Switch 
                           checked={link.enabled} 
                           onCheckedChange={() => toggleLink.mutate({ id: link.id, enabled: !link.enabled })}
                           className="data-[state=checked]:bg-emerald-400 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                         />
                      </div>
                    </div>
                    <div className="p-5 flex items-start justify-between gap-4">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <SocialIcon platform={(link.platform || "").split('|')[0] as SocialPlatform} className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">{(link.platform || "").split('|')[0]}</span>
                          </div>
                          <h3 className="text-lg font-black text-black truncate">{link.title}</h3>
                          <p className="text-[11px] font-bold text-black/30 truncate mt-1">{link.url}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                          <Button 
                            variant="ghost" size="icon" className="w-9 h-9 border-2 border-black rounded-xl hover:bg-emerald-100"
                            onClick={() => copyLinkUrl(link.url)}
                          >
                             <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="w-9 h-9 border-2 border-black rounded-xl hover:bg-red-100"
                            onClick={() => handleDelete(link.id)}
                          >
                             <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                  </Card>
                ) : (
                  // LIST VIEW (The default logic)
                  <Card className={cn(
                    "bruddle-card p-5 flex items-center gap-5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden",
                    !link.enabled && "opacity-60 grayscale-[0.5]"
                  )}>
                    
                    {/* Reorder Controls */}
                    <div className="flex flex-col gap-1 shrink-0 z-10 scale-90">
                      <Button 
                        size="icon" variant="ghost" className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                        onClick={() => moveLink(index, 'up')}
                        disabled={isFilteredView || index === 0}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        size="icon" variant="ghost" className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                        onClick={() => moveLink(index, 'down')}
                        disabled={isFilteredView || index === links.length - 1}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Icon Area */}
                    <div className="relative shrink-0 z-10">
                      <div className="w-12 h-12 rounded-xl bg-[#1d1d1f] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                        <SocialIcon 
                          platform={(link.platform || "").split("|")[0] as SocialPlatform} 
                          className={cn("w-6 h-6", link.enabled ? "text-primary" : "text-muted-foreground/40")} 
                        />
                      </div>
                    </div>
                    {editingId === link.id ? (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={editPlatform} onValueChange={(v) => setEditPlatform(v as SocialPlatform)}>
                          <SelectTrigger className="h-9 rounded-xl border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((p) => (
                              <SelectItem key={p.value} value={p.value} className="rounded-lg">
                                <div className="flex items-center gap-2">
                                  <SocialIcon platform={p.value} className="w-4 h-4" />
                                  {p.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                          </Select>
                          <Select value={editLayout} onValueChange={(v) => setEditLayout(v)}>
                            <SelectTrigger className="h-9 rounded-xl border-border/50">
                              <SelectValue placeholder="Display Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default" className="rounded-lg">Default Button</SelectItem>
                              <SelectItem value="video" className="rounded-lg">Video Card</SelectItem>
                              <SelectItem value="article" className="rounded-lg">Article Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-semibold opacity-40">Block Title</Label>
                          <Input
                            value={editTitle}
                            disabled={saving}
                            onChange={(e) => {
                              setEditTitle(e.target.value);
                              setEditErrors((prev) => ({ ...prev, title: undefined }));
                            }}
                            className={`h-9 text-sm rounded-xl border-border/50 ${editErrors.title ? "border-destructive/50 bg-destructive/5" : ""}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-semibold opacity-40">Destination URL or Embed Code</Label>
                          <textarea
                            value={editUrl}
                            disabled={saving}
                            onChange={(e) => {
                              setEditUrl(e.target.value);
                              setEditErrors((prev) => ({ ...prev, url: undefined }));
                            }}
                            placeholder={getUrlPlaceholder(editPlatform)}
                            className="flex min-h-[60px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border/50"
                          />
                        </div>
                        {editErrors.url && (
                          <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {editErrors.url}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} disabled={saving} className="rounded-lg h-9 flex-1 font-bold">
                            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />} 
                            {saving ? "Saving" : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={saving} className="rounded-lg h-9 font-bold">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 z-10 space-y-1">
                        <h3 className="text-[17px] font-black tracking-tight text-foreground truncate group-hover:text-primary transition-colors">{link.title}</h3>
                        <p className="text-[12px] font-medium text-muted-foreground/50 truncate max-w-[300px]">{link.url}</p>
                        {link.layout && link.layout !== 'default' && (
                          <Badge variant="outline" className="mt-1.5 text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-muted-foreground/40 px-2 py-0">
                            {link.layout} BLOCK
                          </Badge>
                        )}
                      </div>
                    )}

                    {editingId !== link.id && (
                      <div className="flex items-center gap-3 shrink-0 z-10">
                        <div className="hidden md:flex flex-col items-end gap-1.5 mr-2">
                           <span className="text-[10px] font-black tracking-tighter text-muted-foreground/30 uppercase leading-none">Visibility</span>
                           <Switch 
                             checked={link.enabled} 
                             onCheckedChange={() => toggleLink.mutate({ id: link.id, enabled: !link.enabled })}
                             className="data-[state=checked]:bg-primary shadow-lg shadow-primary/10 h-5 w-9 scale-90 origin-right"
                           />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button 
                            size="icon" variant="ghost" 
                            className="h-10 w-10 rounded-xl hover:bg-white/5 hover:text-foreground transition-all active:scale-90" 
                            onClick={() => startEdit(link)} 
                            title="Edit Block"
                          >
                            <Pencil className="w-4.5 h-4.5 opacity-60 group-hover:opacity-100" />
                          </Button>
                          <Button 
                            size="icon" variant="ghost" 
                            className="h-10 w-10 rounded-xl hover:bg-white/5 hover:text-foreground transition-all active:scale-90" 
                            onClick={() => copyLinkUrl(link.url)} 
                            title="Copy Link Address"
                          >
                            <Copy className="w-4.5 h-4.5 opacity-60 group-hover:opacity-100" />
                          </Button>
                          <Button 
                            size="icon" variant="ghost" 
                            className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90" 
                            onClick={() => handleDelete(link.id)} 
                            title="Delete Block"
                          >
                            <Trash2 className="w-4.5 h-4.5 opacity-60 group-hover:opacity-100" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          {links.length > 0 && filteredLinks.length === 0 && (
            <Card className="p-10 text-center rounded-2xl border-dashed border-border/60">
              <p className="text-sm font-semibold text-foreground">No links match this filter</p>
              <p className="text-xs text-muted-foreground mt-1">Try another search, status, or platform category.</p>
            </Card>
          )}

          {hasMoreFiltered && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                className="rounded-xl px-6"
                onClick={() => setVisibleCount((prev) => prev + 40)}
              >
                Load More ({filteredLinks.length - visibleCount} remaining)
              </Button>
            </div>
          )}

          {/* Empty State */}
          {links.length === 0 && !showAdd && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bruddle-card-yellow p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Link2 className="w-10 h-10 text-black" />
                </div>
                <h3 className="font-black text-black text-2xl mb-2 tracking-tight">Your stage is empty</h3>
                <p className="text-black/60 text-sm mb-8 max-w-[280px] mx-auto font-medium leading-relaxed">
                  Every big creator started with a single link. Time to add yours!
                </p>
                <Button
                  onClick={openAddForm}
                  className="rounded-2xl bg-black hover:bg-black/90 text-white font-black px-8 h-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)] uppercase tracking-widest text-[10px]"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Link
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Stats Bar */}
          {links.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bruddle-card p-8 flex items-center justify-around font-bruddle"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-black">{links.length}</span>
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-1">Total</span>
              </div>
              <div className="w-0.5 h-12 bg-black/10" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-black">{links.filter(l => l.enabled).length}</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Active</span>
              </div>
              <div className="w-0.5 h-12 bg-black/10" />
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-black">{links.reduce((sum, l) => sum + (l.clicks || 0), 0)}</span>
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mt-1">Clicks</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Single Preview View */}
        <div className="hidden lg:block w-[320px] 2xl:w-[360px] shrink-0 self-start sticky top-6 z-30 font-bruddle">
          <div className="bruddle-card-blue p-8 relative overflow-hidden group/sidebar">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-all">
                <Smartphone size={120} strokeWidth={1} />
            </div>

            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-black uppercase tracking-tight">Preview</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-4 py-2 bg-white border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  onClick={() => window.location.assign("/dashboard/appearance")}
                >
                  Edit
                </Button>
              </div>

              <div className="relative group/preview flex flex-col gap-6">
                <div className="rounded-[2.4rem] border-2 border-black overflow-hidden bg-white shadow-2xl relative z-10 scale-95 origin-top">
                  {previewPanel}
                </div>

                <div className="relative flex items-center gap-3 w-full">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl h-12 bg-white hover:bg-black border-2 border-black text-black hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  >
                    View Site
                  </a>
                  <Button
                    onClick={copyProfileLink}
                    className="flex-1 gap-2 rounded-2xl h-12 bg-black hover:bg-black/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  >
                    Copy URL
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
            className="fixed inset-0 z-50 bg-background/95 lg:hidden flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <div className="w-full max-w-sm relative flex flex-col items-center gap-4">
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">Preview</p>
                    <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl text-[11px] font-bold border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => {
                      window.location.assign("/dashboard/appearance");
                    }}
                  >
                    Design Studio
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-10 w-10 bg-card hover:bg-muted"
                    onClick={() => setShowMobilePreview(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="w-full max-w-[320px] mx-auto aspect-[9/18.5] relative rounded-[2rem] border-4 border-black overflow-hidden bg-white shadow-xl shadow-black/20">
                {previewPanel}
              </div>

              <div className="flex flex-col w-full gap-3 pb-6">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl h-14 bg-card border border-border text-foreground text-[11px] font-bold shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" /> Open Live Site
                </a>
                <Button
                  onClick={() => { copyProfileLink(); setShowMobilePreview(false); }}
                  className="gap-2 rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold shadow-xl shadow-primary/20"
                >
                  <Copy className="w-4 h-4" /> Copy My URL
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default LinkEditor;
