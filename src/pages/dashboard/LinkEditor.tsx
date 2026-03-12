import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ExternalLink, Pencil, Check, X, Copy, AlertCircle, Sparkles, Link2, MousePointerClick, Eye, Rocket, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLinksStore, type LinkItem, type SocialPlatform } from "@/stores/linksStore";
import { SocialIcon, platformOptions } from "@/components/SocialIcon";
import { useEffect, useMemo, useState } from "react";
import { linkSchema, normalizeUrl } from "@/lib/validation";
import ShareProfile from "@/components/dashboard/ShareProfile";
import ProfilePreview from "@/components/dashboard/ProfilePreview";

import { useAuthStore } from "@/stores/authStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone } from "lucide-react";
import LinksToolbar from "@/components/dashboard/links/LinksToolbar";
import TemplatePicker from "@/components/dashboard/links/TemplatePicker";
import { buildTemplateUrl, getLinkTemplateCategories, inferPlatformFromTag } from "@/lib/linkTemplates";

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
    icon: Rocket,
    title: "Share your page",
    description: "Copy your unique link and share it on your social media bios!",
  },
];


const LinkEditor = () => {
  const { links, addLink, updateLink, deleteLink: removeLink, toggleLink, reorderLinks } = useLinksStore();
  
  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    reorderLinks(newLinks);
  };
  const user = useAuthStore((s) => s.user);
  const { settings } = useAppearanceStore();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const isMobile = useIsMobile();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>("website");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("website");
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
    return "https://example.com";
  };

  const getUrlHint = (platform: SocialPlatform) => {
    if (platform === "video-embed") return "Supports YouTube, Vimeo, and iframe embed code.";
    if (platform === "website-embed") return "Paste a website URL or an iframe embed snippet.";
    if (platform === "google-maps") return "Use a Google Maps share link or embed URL.";
    return "";
  };
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
    addLink(newTitle.trim(), normalizedUrl, newPlatform);
    closeAddForm();
    toast.success("Link added!");
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
    removeLink(id);
    toast.success("Link removed");
  };

  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditPlatform(link.platform || "website");
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
    updateLink(editingId, { title: editTitle.trim(), url: normalizedUrl, platform: editPlatform });
    setEditErrors({});
    setEditingId(null);
    toast.success("Link updated");
  };

  // Shared preview panel
  const previewPanel = (
    <ProfilePreview
      settings={settings}
      user={user}
      links={links.filter(l => l.enabled).map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
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
          {/* Share Profile Card */}
          <ShareProfile />

          {/* Tutorial / How it works */}
          <AnimatePresence>
            {showTutorial && links.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="font-heading font-bold text-foreground text-lg">Getting Started</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground text-xs"
                        onClick={() => setShowTutorial(false)}
                      >
                        Dismiss
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tutorialSteps.map((step, i) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50 hover:border-accent/30 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <step.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            className="flex items-center justify-between px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h1 className="text-2xl font-heading font-black text-foreground tracking-tight flex items-center gap-2">
                <Link2 className="w-6 h-6 text-primary" />
                My Links
              </h1>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider opacity-60">
                Manage your profile links
              </p>
            </div>
            <Button
              onClick={openAddForm}
              className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold px-6"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Link
            </Button>
          </motion.div>

          {/* Link Filters */}
          {links.length > 0 && (
            <LinksToolbar
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
                <Card className="p-5 space-y-4 border-2 border-primary/30 shadow-xl bg-card rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <p className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">New Connection</p>
                  </div>

                  <div className="inline-flex rounded-xl border border-border/60 bg-background/40 p-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setAddMode("template")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        addMode === "template" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Use Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode("custom")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        addMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Custom Link
                    </button>
                  </div>

                  {addMode === "template" ? (
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
                  ) : (
                    <p className="text-xs text-muted-foreground rounded-xl border border-border/50 bg-background/40 p-3">
                      Custom mode lets you add any title and URL directly.
                    </p>
                  )}

                  {(addMode === "custom" || selectedTemplate || !isMobile) ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Platform</Label>
                        <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as SocialPlatform)}>
                          <SelectTrigger className="rounded-xl h-11 border-border/50">
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
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Title</Label>
                        <Input
                          placeholder="e.g. Follow my journey"
                          value={newTitle}
                          onChange={(e) => {
                            setNewTitle(e.target.value);
                            setErrors((prev) => ({ ...prev, title: undefined }));
                          }}
                          className={`rounded-xl h-11 border-border/50 ${errors.title ? "border-destructive/50 bg-destructive/5" : ""}`}
                        />
                        {errors.title && (
                          <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-tight opacity-70">{getUrlFieldLabel(newPlatform)}</Label>
                        <Input
                          placeholder={getUrlPlaceholder(newPlatform)}
                          value={newUrl}
                          onChange={(e) => {
                            setNewUrl(e.target.value);
                            setErrors((prev) => ({ ...prev, url: undefined }));
                          }}
                          className={`rounded-xl h-11 border-border/50 ${errors.url ? "border-destructive/50 bg-destructive/5" : ""}`}
                        />
                        {errors.url ? (
                          <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.url}
                          </p>
                        ) : (
                          getUrlHint(newPlatform) && <p className="text-[11px] text-muted-foreground">{getUrlHint(newPlatform)}</p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={validateAndAdd} className="rounded-xl flex-1 bg-primary hover:bg-primary/90 font-bold h-11">
                          <Check className="w-4 h-4 mr-1.5" /> Save Link
                        </Button>
                        <Button variant="ghost" className="rounded-xl px-6 h-11 font-bold" onClick={closeAddForm}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-xs text-muted-foreground">
                      Select a feature template to continue.
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links List */}
          {isFilteredView && (
            <p className="text-xs text-muted-foreground px-1">Reordering is disabled while filters are active. Clear filters to reorder your full list.</p>
          )}
          <div className="space-y-3">
            {visibleLinks.map(({ link, index }, renderIndex) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: renderIndex * 0.03 }}
              >
                <Card className={`p-4 flex items-center gap-4 transition-all hover:shadow-xl hover:border-primary/20 rounded-2xl ${!link.enabled ? "opacity-40 grayscale" : ""}`}>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button 
                      size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/10"
                      onClick={() => moveLink(index, 'up')}
                      disabled={isFilteredView || index === 0}
                    >
                      <Rocket className="w-3 h-3 -rotate-45" />
                    </Button>
                    <Button 
                      size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/10"
                      onClick={() => moveLink(index, 'down')}
                      disabled={isFilteredView || index === links.length - 1}
                    >
                      <Rocket className="w-3 h-3 rotate-135" />
                    </Button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                    <SocialIcon platform={link.platform || "website"} className="w-6 h-6 text-primary" />
                  </div>
                  {editingId === link.id ? (
                    <div className="flex-1 space-y-2">
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
                      <Input
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value);
                          setEditErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                        className={`h-9 text-sm rounded-xl border-border/50 ${editErrors.title ? "border-destructive/50 bg-destructive/5" : ""}`}
                      />
                      <Input
                        value={editUrl}
                        onChange={(e) => {
                          setEditUrl(e.target.value);
                          setEditErrors((prev) => ({ ...prev, url: undefined }));
                        }}
                        placeholder={getUrlPlaceholder(editPlatform)}
                        className={`h-9 text-sm rounded-xl border-border/50 ${editErrors.url ? "border-destructive/50 bg-destructive/5" : ""}`}
                      />
                      {editErrors.url && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {editErrors.url}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="rounded-lg h-9 flex-1 font-bold">
                          <Check className="w-3 h-3 mr-1.5" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="rounded-lg h-9 font-bold">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm tracking-tight">{link.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate opacity-60 font-medium">{link.url}</p>
                    </div>
                  )}
                  {editingId !== link.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" onClick={() => startEdit(link)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" onClick={() => copyLinkUrl(link.url)} title="Copy URL">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" onClick={() => window.open(link.url, "_blank")} title="Open">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(link.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="ml-1 pl-2 border-l border-border/50">
                        <button
                          onClick={() => toggleLink(link.id)}
                          className={`w-10 h-5 rounded-full transition-all duration-300 ${link.enabled ? "bg-primary shadow-sm shadow-primary/20" : "bg-muted"} relative overflow-hidden`}
                          title={link.enabled ? "Disable" : "Enable"}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${link.enabled ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
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
              <Card className="p-12 text-center border-dashed border-2 border-border/50 bg-card/30 rounded-[2rem]">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                  <Link2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-heading font-black text-foreground text-xl mb-2 tracking-tight">Your stage is empty</h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-[280px] mx-auto font-medium leading-relaxed">
                  Every big creator started with a single link. Time to add yours!
                </p>
                <Button
                  onClick={openAddForm}
                  className="rounded-xl bg-primary hover:bg-primary/90 font-bold px-6 h-11"
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
              className="flex items-center justify-center gap-8 py-6 rounded-2xl bg-card border border-border/50 shadow-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-foreground">{links.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-primary">{links.filter(l => l.enabled).length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active</span>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-accent">{links.reduce((sum, l) => sum + (l.clicks || 0), 0)}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clicks</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Sticky Preview - always visible on desktop */}
        <div className="hidden lg:block w-[400px] shrink-0 self-start sticky top-6 z-30">
          <div className="bg-card border border-border/40 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group/sidebar">
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

              {/* Action buttons integrated */}
              <div className="relative flex items-center gap-3">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl h-12 bg-card hover:bg-muted border border-border/50 text-foreground text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" /> View Page
                </a>
                <Button
                  onClick={copyProfileLink}
                  className="flex-1 gap-2 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] border-none"
                >
                  <Copy className="w-4 h-4" /> Share Link
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
    </div>
  );
};

export default LinkEditor;






