import { useState, useRef } from "react";
import { type CatalogItem, type ItemType, type ItemVariant } from "@/stores/catalogStore";
import { joinCatalogCategory, parseCatalogCategory } from "@/lib/catalogCategory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Upload, Trash2, Check, ExternalLink, ImageIcon, Tags, Music, QrCode, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

type CatalogMediaInput = { type: "image" | "video"; url: string };
type ItemTypeOption = { value: string; label: string; icon: any };

const EMPTY_ITEM_TYPE_VALUE = "__lv_item_type_empty__";
const EMPTY_CATEGORY_VALUE = "__lv_category_empty__";
const EMPTY_SUBCATEGORY_VALUE = "__lv_subcategory_empty__";

const SELLABLE_ITEM_TYPE_KEYS = new Set(["physical", "food", "service", "digital", "boat", "car"]);
const CONTENT_ITEM_TYPE_KEYS = new Set(["video", "article", "music", "post", "reel", "blog", "social", "qr", "map"]);

const isHttpUrl = (value: string): boolean => {
  if (!value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isVideoUrl = (value: string): boolean => isHttpUrl(value.trim());
const normalizeValue = (value: string): string => value.trim().toLowerCase();
const isSellableItemType = (value: string) => SELLABLE_ITEM_TYPE_KEYS.has(normalizeValue(value));

const getMediaThumbnail = (url: string) => {
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // YouTube
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch?.[1]) {
    return { 
      url: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      type: "video" as const,
      platform: "youtube",
      kind: "video" as ItemType
    };
  }

  // Spotify
  if (cleanUrl.includes("spotify.com")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      type: "music" as const,
      platform: "spotify",
      kind: "music" as ItemType
    };
  }

  // Apple Music
  if (cleanUrl.includes("music.apple.com")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Music_logo.svg",
      type: "music" as const,
      platform: "apple",
      kind: "music" as ItemType
    };
  }

  // Google Maps
  if (cleanUrl.includes("google.com/maps") || cleanUrl.includes("goo.gl/maps")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg",
      type: "image" as const,
      platform: "google-maps",
      kind: "map" as ItemType
    };
  }

  // SoundCloud
  if (cleanUrl.includes("soundcloud.com")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Antu_soundcloud.svg",
      type: "music" as const,
      platform: "soundcloud",
      kind: "music" as ItemType
    };
  }

  // Vimeo
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch?.[1]) {
    return { 
      url: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      type: "video" as const,
      platform: "vimeo",
      kind: "video" as ItemType
    };
  }

  // Google Play Store
  if (cleanUrl.includes("play.google.com/store/apps")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg",
      type: "image" as const,
      platform: "playstore",
      kind: "digital" as ItemType
    };
  }

  // Apple App Store
  if (cleanUrl.includes("apps.apple.com")) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg",
      type: "image" as const,
      platform: "appstore",
      kind: "digital" as ItemType
    };
  }

  return null;
};

interface CatalogFormProps {
  initialData?: CatalogItem;
  itemTypeOptions: ItemTypeOption[];
  categoryOptions: string[];
  subcategoryOptions: string[];
  onCancel: () => void;
  onSave: (payload: any, isEdit: boolean) => Promise<void>;
  saving: boolean;
}

export function CatalogFormModal({
  initialData,
  itemTypeOptions,
  categoryOptions,
  subcategoryOptions,
  onCancel,
  onSave,
  saving,
}: CatalogFormProps) {
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [galleryUploadingIndex, setGalleryUploadingIndex] = useState<number | null>(null);

  const defaultFormState = {
    title: "",
    description: "",
    price: "",
    price_label: "",
    image_url: "",
    category: "",
    subcategory: "",
    item_type: "physical",
    external_url: "",
    allow_order_form: false,
    tags: "",
    variants: [] as ItemVariant[],
    media: [] as CatalogMediaInput[],
    track_inventory: false,
    stock_quantity: "",
    duration: "",
    schedule: "",
    location: "",
    display_mode: "minimal" as "minimal" | "full",
    metadata: {} as Record<string, any>,
  };

  const [form, setForm] = useState(() => {
    if (initialData) {
      const parsedCategory = parseCatalogCategory(initialData.category);
      return {
        ...defaultFormState,
        title: initialData.title,
        description: initialData.description,
        price: initialData.price?.toString() || "",
        price_label: initialData.price_label,
        image_url: initialData.image_url,
        category: parsedCategory.primary,
        subcategory: parsedCategory.subcategory,
        item_type: initialData.item_type,
        external_url: initialData.external_url,
        allow_order_form: initialData.allow_order_form,
        tags: initialData.tags.join(", "),
        variants: initialData.variants || [],
        media: initialData.media || [],
        track_inventory: initialData.track_inventory,
        stock_quantity: initialData.stock_quantity?.toString() || "",
        duration: initialData.duration || "",
        schedule: initialData.schedule || "",
        location: initialData.location || "",
        display_mode: initialData.display_mode || "minimal",
        metadata: initialData.metadata || {},
      };
    }
    return defaultFormState;
  });

  const uploadToBucket = async (file: File, prefix: string) => {
    if (!user) throw new Error("User not found");

    const extension = file.name.split(".").pop() || "jpg";
    const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "-");
    const path = `${user.user_id}/${safePrefix}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("user-uploads").upload(path, file, { upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from("user-uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToBucket(file, "catalog-cover");
      setForm((current) => ({ ...current, image_url: imageUrl }));
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mediaIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB");
      return;
    }

    setGalleryUploadingIndex(mediaIndex);
    try {
      const imageUrl = await uploadToBucket(file, `catalog-media-${mediaIndex}`);
      setForm((current) => {
        const updated = [...current.media];
        updated[mediaIndex] = { type: "image", url: imageUrl };
        return { ...current, media: updated };
      });
      toast.success("Gallery image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Gallery upload failed");
    } finally {
      setGalleryUploadingIndex(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (title.length > 100) {
      toast.error("Title must be less than 100 characters");
      return;
    }

    const itemType = form.item_type.trim();
    if (!itemType || itemType === EMPTY_ITEM_TYPE_VALUE) {
      toast.error("Please select an item type");
      return;
    }

    if (form.price && (Number.isNaN(Number(form.price)) || Number(form.price) < 0)) {
      toast.error("Price must be a non-negative number");
      return;
    }

    if (form.track_inventory && form.stock_quantity && (Number.isNaN(Number(form.stock_quantity)) || Number(form.stock_quantity) < 0)) {
      toast.error("Stock quantity must be a non-negative number");
      return;
    }

    const externalUrl = form.external_url.trim();
    if (externalUrl && !isHttpUrl(externalUrl)) {
      toast.error("External link must be a valid URL (https://...)");
      return;
    }

    const coverImageUrl = form.image_url.trim();
    if (coverImageUrl && !isHttpUrl(coverImageUrl)) {
      toast.error("Cover image URL must be valid (https://...)");
      return;
    }

    const sanitizedMedia = form.media
      .map((entry) => ({ type: entry.type, url: entry.url.trim() }))
      .filter((entry) => entry.url.length > 0);

    for (const media of sanitizedMedia) {
      if (!isHttpUrl(media.url)) {
        toast.error("Gallery URLs must start with http:// or https://");
        return;
      }
      if (media.type === "video" && !isVideoUrl(media.url)) {
        toast.error("Video supports YouTube/Vimeo/video URLs only");
        return;
      }
    }

    const activeCategory = form.category === "__lv_other__" ? ((form as any).category_custom || "").trim() : form.category;
    const activeSubcategory = form.subcategory === "__lv_other__" ? ((form as any).subcategory_custom || "").trim() : form.subcategory;
    const category = joinCatalogCategory(activeCategory, activeSubcategory);

    const payload = {
      title,
      description: form.description.trim(),
      price: form.price ? Number(form.price) : null,
      price_label: form.price_label.trim(),
      image_url: coverImageUrl,
      category,
      item_type: itemType as ItemType,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      external_url: externalUrl,
      allow_order_form: form.allow_order_form,
      variants: form.variants.filter((variant) => variant.label.trim() && variant.options.length > 0),
      media: sanitizedMedia,
      track_inventory: form.track_inventory,
      stock_quantity: form.track_inventory && form.stock_quantity ? Math.max(0, Math.floor(Number(form.stock_quantity))) : null,
      enabled: true,
      duration: form.duration.trim(),
      schedule: form.schedule.trim(),
      location: form.location.trim(),
      display_mode: form.display_mode,
      metadata: form.metadata,
    };

    await onSave(payload, !!initialData);
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
      <Card className="p-5 space-y-4 border-primary/30 border-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Item Type</Label>
            <Select
              value={form.item_type || EMPTY_ITEM_TYPE_VALUE}
              onValueChange={(value) => {
                const nextItemType = value === EMPTY_ITEM_TYPE_VALUE ? "" : value;
                setForm((current) => ({ ...current, item_type: nextItemType }));
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select item type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_ITEM_TYPE_VALUE}>Select item type</SelectItem>
                {itemTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" /> {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category || EMPTY_CATEGORY_VALUE}
              onValueChange={(value) => {
                const nextCategory = value === EMPTY_CATEGORY_VALUE ? "" : value;
                setForm((current) => ({ ...current, category: nextCategory, subcategory: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_CATEGORY_VALUE}>Select category</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="__lv_other__">Other (Add New)</SelectItem>
              </SelectContent>
            </Select>
            {form.category === "__lv_other__" && (
              <Input
                placeholder="Type custom category name..."
                value={(form as any).category_custom || ""}
                onChange={(e) => setForm((c) => ({ ...c, category_custom: e.target.value }))}
                className="mt-1"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Subcategory (optional)</Label>
            <Select
              value={form.subcategory || EMPTY_SUBCATEGORY_VALUE}
              onValueChange={(value) => {
                const nextSubcategory = value === EMPTY_SUBCATEGORY_VALUE ? "" : value;
                setForm((current) => ({ ...current, subcategory: nextSubcategory }));
              }}
              disabled={!form.category.trim()}
            >
              <SelectTrigger>
                <SelectValue placeholder="No subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_SUBCATEGORY_VALUE}>No subcategory</SelectItem>
                {subcategoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="__lv_other__">Other (Add New)</SelectItem>
              </SelectContent>
            </Select>
            {form.subcategory === "__lv_other__" && (
              <Input
                placeholder="Type custom subcategory name..."
                value={(form as any).subcategory_custom || ""}
                onChange={(e) => setForm((c) => ({ ...c, subcategory_custom: e.target.value }))}
                className="mt-1"
              />
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Item types and categories are synced globally. Adding custom ones expands your local catalog views cleanly.
        </p>

        <div className="space-y-2">
          <Label>Title *</Label>
          <input placeholder="Item name" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Describe this item..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
        </div>

        {isSellableItemType(form.item_type) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Price 
                <span className="text-[10px] font-normal opacity-60">(Set to 0 for Free)</span>
              </Label>
              <Input type="number" min="0" step="0.01" placeholder="29.99" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Price Label (optional)</Label>
              <Input placeholder="e.g. /month, Starting at, Free" value={form.price_label} onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))} />
            </div>
          </div>
        )}

        {(form.item_type === "service" || form.item_type === "food") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="space-y-2">
              <Label className="text-xs">⏱ Duration</Label>
              <Input placeholder="e.g. 60 min, 1 hour, 30 min" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">📅 Schedule / Timing</Label>
              <Input placeholder="e.g. Mon-Fri 9am-5pm" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">📍 Location</Label>
              <Input placeholder="e.g. Studio A, Online, Table 5" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input placeholder="e.g. Vegan, Bestseller, New" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image</Label>
          <div className="flex gap-2 items-center">
            {(form.image_url || getMediaThumbnail(form.image_url)?.url) && (
              <img 
                src={getMediaThumbnail(form.image_url)?.url || form.image_url} 
                alt="" 
                className={cn(
                  "w-16 h-16 rounded-lg object-cover border border-border bg-muted p-1",
                  getMediaThumbnail(form.image_url)?.type === "music" && "p-2 opacity-50"
                )} 
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              Upload
            </Button>
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 relative">
              <Input 
                placeholder="Paste Image, Youtube, or Spotify Link..." 
                value={form.image_url} 
                onChange={(e) => {
                  const val = e.target.value;
                  const meta = getMediaThumbnail(val);
                  
                  if (meta) {
                    setForm(f => ({ 
                      ...f, 
                      image_url: meta.url,
                      // If it's music, auto-switch type
                      item_type: meta.type === "music" ? "music" : f.item_type
                    }));
                    toast.success(`${meta.platform} image caught!`);
                  } else {
                    const detected = getMediaThumbnail(val);
                    if (detected) {
                      setForm(f => ({ 
                         ...f, 
                         image_url: detected.url,
                         item_type: detected.kind || f.item_type,
                         display_mode: "full"
                      }));
                      toast.success(`Detected ${detected.platform}!`);
                    } else {
                      setForm(f => ({ ...f, image_url: val }));
                    }
                  }
                }} 
                className="h-9 text-xs" 
              />
              {getMediaThumbnail(form.image_url) && (
                 <div className="absolute right-2 top-1.5 flex items-center gap-1 opacity-60">
                    <Check className="w-3 h-3 text-primary" />
                    <span className="text-[8px] font-black uppercase text-primary">Caught</span>
                 </div>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {isSellableItemType(form.item_type) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> 
                {CONTENT_ITEM_TYPE_KEYS.has(normalizeValue(form.item_type)) ? "View / Read Link" : "External Buy Link"}
              </Label>
              <Input placeholder="https://..." value={form.external_url} onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.allow_order_form} onCheckedChange={(v) => setForm((f) => ({ ...f, allow_order_form: v }))} />
              <div>
                <Label className="text-sm">Enable Order Form</Label>
                <p className="text-[10px] text-muted-foreground">Visitors can submit orders directly</p>
              </div>
            </div>
          </div>
        )}
        {!isSellableItemType(form.item_type) && CONTENT_ITEM_TYPE_KEYS.has(normalizeValue(form.item_type)) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" /> 
                {form.item_type === "article" ? "Read Full Article Link" : "Content URL (Music, YouTube, etc.)"}
              </Label>
              <Input 
                placeholder="https://..." 
                value={form.external_url} 
                onChange={(e) => {
                   const val = e.target.value;
                   const detected = getMediaThumbnail(val);
                   setForm(f => ({ 
                     ...f, 
                     external_url: val,
                     item_type: detected?.kind || f.item_type,
                     display_mode: detected ? "full" : f.display_mode
                   }));
                   if (detected) toast.success(`Smart-detected ${detected.platform} content!`);
                }} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
               <div className="flex items-center gap-3 flex-1">
                 <Switch 
                   checked={form.display_mode === "full"} 
                   onCheckedChange={(v) => setForm(f => ({ ...f, display_mode: v ? "full" : "minimal" }))} 
                 />
                 <div>
                    <Label className="text-sm font-bold flex items-center gap-2">
                      {form.display_mode === "full" ? "Full Embedded View" : "Minimal Link Mode"}
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      {form.display_mode === "full" 
                        ? "Show the embedded player, map, or QR code directly." 
                        : "Show a clean card with a thumbnail that opens the link."}
                    </p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {isSellableItemType(form.item_type) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={form.track_inventory} onCheckedChange={(v) => setForm((f) => ({ ...f, track_inventory: v }))} />
              <div>
                <Label className="text-sm">Track Inventory</Label>
                <p className="text-[10px] text-muted-foreground">Limit orders based on stock</p>
              </div>
            </div>
            {form.track_inventory && (
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" min="0" placeholder="e.g. 50" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} />
              </div>
            )}
          </div>
        )}

        {isSellableItemType(form.item_type) && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Tags className="w-4 h-4" /> Variants (Size, Color, etc.)</Label>
            {form.variants.map((v, vi) => (
              <div key={vi} className="flex gap-2 items-start">
                <Input
                  placeholder="Label (e.g. Size)"
                  value={v.label}
                  onChange={(e) => {
                    const updated = [...form.variants];
                    updated[vi] = { ...updated[vi], label: e.target.value };
                    setForm((f) => ({ ...f, variants: updated }));
                  }}
                  className="w-32 h-9 text-xs"
                />
                <Input
                  placeholder="Options (comma separated, e.g. S, M, L, XL)"
                  value={v.options.join(", ")}
                  onChange={(e) => {
                    const updated = [...form.variants];
                    updated[vi] = { ...updated[vi], options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) };
                    setForm((f) => ({ ...f, variants: updated }));
                  }}
                  className="flex-1 h-9 text-xs"
                />
                <Button
                  size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== vi) }))}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              size="sm" variant="outline" className="text-xs"
              onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, { label: "", options: [] }] }))}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Variant
            </Button>
            <p className="text-[10px] text-muted-foreground">Add options like Size (S, M, L) or Color (Red, Blue, Black)</p>
          </div>
        )}

        <div className="space-y-4 p-5 rounded-2xl bg-muted/30 border border-primary/10 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-sm font-bold tracking-tight">
                <ImageIcon className="w-4 h-4 text-primary" /> Visual Gallery
              </Label>
              <p className="text-[10px] text-muted-foreground">Images support upload + URL. Video supports URL only (YouTube, Vimeo, mp4).</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl border-primary/20 hover:bg-primary/5 text-xs"
              onClick={() => setForm((current) => ({ ...current, media: [...current.media, { type: "image", url: "" }] }))}
              disabled={form.media.length >= 10}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Media
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence initial={false}>
              {form.media.map((m, mi) => (
                <motion.div
                  key={mi}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-2 bg-card p-3 rounded-xl border border-border/50 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <div className="shrink-0">
                      <Select
                        value={m.type}
                        onValueChange={(v) => {
                          const updated = [...form.media];
                          updated[mi] = { ...updated[mi], type: v as "image" | "video" };
                          setForm((current) => ({ ...current, media: updated }));
                        }}
                      >
                        <SelectTrigger className="w-24 h-9 rounded-lg text-xs border-border/40 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder={m.type === "image" ? "Image URL (direct link)" : "Video URL (YouTube, Vimeo, or mp4)"}
                        value={m.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...form.media];
                          updated[mi] = { ...updated[mi], url: val };
                          
                          const meta = getMediaThumbnail(val);
                          
                          // Auto-detect thumbnail and type
                          if (meta) {
                            if (meta.type === "video" && !form.image_url) {
                              setForm(curr => ({ ...curr, image_url: meta.url, media: updated }));
                              toast.info("Auto-set video thumbnail as cover");
                            } else if (meta.type === "music") {
                              setForm(curr => ({ ...curr, item_type: "music", media: updated }));
                              toast.info(`Detected ${meta.platform} link`);
                            } else {
                              setForm(current => ({ ...current, media: updated }));
                            }
                          } else {
                            setForm((current) => ({ ...current, media: updated }));
                          }
                        }}
                        className="h-9 rounded-lg text-xs border-border/40 focus-visible:ring-primary/20"
                      />
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground flex-1">
                          {m.type === "video" ? "Video uses URL only. Paste YouTube/Vimeo/mp4 URL." : "Use upload or paste direct image URL."}
                        </p>
                        {m.url && getMediaThumbnail(m.url) && (
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border animate-pulse",
                            getMediaThumbnail(m.url)?.type === "music" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-primary/10 border-primary/20 text-primary"
                          )}>
                             {getMediaThumbnail(m.url)?.type === "music" ? <Music className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                             <span className="text-[8px] font-black uppercase">
                               {getMediaThumbnail(m.url)?.platform} Detected
                             </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(m.type === "video" || m.url) && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-muted flex items-center justify-center p-1">
                        {getMediaThumbnail(m.url)?.type === "music" ? (
                           <Music className="w-6 h-6 opacity-40 text-black" />
                        ) : (
                          <img 
                            src={getMediaThumbnail(m.url)?.url || m.url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                      </div>
                    )}

                    {m.type === "image" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 text-xs"
                          onClick={() => {
                            const input = document.getElementById(`catalog-gallery-upload-${mi}`) as HTMLInputElement | null;
                            input?.click();
                          }}
                          disabled={galleryUploadingIndex === mi}
                        >
                          {galleryUploadingIndex === mi ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                          Upload
                        </Button>
                        <input
                          id={`catalog-gallery-upload-${mi}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            void handleGalleryImageUpload(e, mi);
                          }}
                        />
                      </>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      onClick={() => setForm((current) => ({ ...current, media: current.media.filter((_, i) => i !== mi) }))}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {form.media.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-border/40 rounded-xl bg-background/20">
              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Gallery Empty</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-primary text-white hover:bg-primary/90 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  Saving Changes...
                </>
              ) : initialData ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update & Publish
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save to Catalog
                </>
              )}
            </Button>
          </div>

      </Card>
    </motion.div>
  );
}
