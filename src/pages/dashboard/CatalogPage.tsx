import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useCatalogStore, type CatalogItem, type ItemType, type ItemVariant } from "@/stores/catalogStore";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Trash2, Pencil, Check, X, ShoppingBag, UtensilsCrossed,
  Dumbbell, Download, ImageIcon, Upload, Loader2, ExternalLink, FileText, Tags,
  QrCode, Copy, Printer, Sparkles, Database, Ship, Car, Users
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { MOCK_CATEGORIES, MOCK_SERVICES } from "@/data/mockCatalogServices";

const TYPE_OPTIONS: { value: ItemType; label: string; icon: typeof ShoppingBag }[] = [
  { value: "physical", label: "Physical Product", icon: ShoppingBag },
  { value: "food", label: "Food / Menu Item", icon: UtensilsCrossed },
  { value: "service", label: "Service / Package", icon: Dumbbell },
  { value: "digital", label: "Digital Product", icon: Download },
  { value: "boat", label: "Boat / Yacht", icon: Ship },
  { value: "car", label: "Car Rental", icon: Car },
];

const TYPE_ICONS: Record<ItemType, typeof ShoppingBag> = {
  physical: ShoppingBag,
  food: UtensilsCrossed,
  service: Dumbbell,
  digital: Download,
  boat: Ship,
  car: Car,
  social: Users,
  blog: FileText,
};

const CatalogPage = () => {
  const user = useAuthStore((s) => s.user);
  const { items, loading, fetchItems, addItem, updateItem, deleteItem, toggleItem, bulkAddItems } = useCatalogStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [importingDemo, setImportingDemo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    price_label: "",
    image_url: "",
    category: "",
    item_type: "physical" as ItemType,
    external_url: "",
    allow_order_form: false,
    tags: "",
    variants: [] as ItemVariant[],
    media: [] as { type: 'image' | 'video', url: string }[],
    track_inventory: false,
    stock_quantity: "",
    duration: "",
    schedule: "",
    location: "",
  });

  useEffect(() => {
    if (user) fetchItems(user.user_id);
  }, [user]);

  const resetForm = () => {
    setForm({
      title: "", description: "", price: "", price_label: "", image_url: "",
      category: "", item_type: "physical", external_url: "", allow_order_form: false, tags: "",
      variants: [], track_inventory: false, stock_quantity: "",
      duration: "", schedule: "", location: "",
      media: [],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.user_id}/catalog-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (form.title.trim().length > 100) { toast.error("Title must be less than 100 characters"); return; }
    if (form.price && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)) { toast.error("Price must be a valid positive number"); return; }
    if (form.stock_quantity && (isNaN(parseInt(form.stock_quantity)) || parseInt(form.stock_quantity) < 0)) { toast.error("Stock quantity must be a valid positive number"); return; }
    const item = {
      user_id: user!.user_id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price ? parseFloat(form.price) : null,
      price_label: form.price_label.trim(),
      image_url: form.image_url,
      category: form.category.trim() || "General",
      item_type: form.item_type,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      external_url: form.external_url.trim(),
      allow_order_form: form.allow_order_form,
      variants: form.variants.filter((v) => v.label.trim() && v.options.length > 0),
      media: form.media,
      track_inventory: form.track_inventory,
      stock_quantity: form.track_inventory && form.stock_quantity ? parseInt(form.stock_quantity) : null,
      enabled: true,
      duration: form.duration.trim(),
      schedule: form.schedule.trim(),
      location: form.location.trim(),
    };

    if (editingId) {
      updateItem(editingId, item);
      setEditingId(null);
      toast.success("Item updated!");
    } else {
      addItem(item);
      toast.success("Item added!");
    }
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      price: item.price?.toString() || "",
      price_label: item.price_label,
      image_url: item.image_url,
      category: item.category,
      item_type: item.item_type,
      external_url: item.external_url,
      allow_order_form: item.allow_order_form,
      tags: item.tags.join(", "),
      variants: item.variants || [],
      media: item.media || [],
      track_inventory: item.track_inventory,
      stock_quantity: item.stock_quantity?.toString() || "",
      duration: item.duration || "",
      schedule: item.schedule || "",
      location: item.location || "",
    });
    setShowAdd(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    toast.success("Item deleted");
  };

  const handleBulkAdd = async (category: string) => {
    if (!user) return;
    setImportingDemo(true);
    try {
      const mockItems = MOCK_SERVICES[category];
      if (!mockItems) throw new Error("Category not found");
      
      await bulkAddItems(mockItems.map(item => ({
        ...item,
        enabled: true,
        variants: [],
        track_inventory: false,
        stock_quantity: null,
        allow_order_form: true,
      } as any)));
      
      toast.success(`Imported ${mockItems.length} items for ${category}!`);
      setShowDemoDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to import demo data");
    } finally {
      setImportingDemo(false);
    }
  };

  // Group items by category
  const categories = [...new Set(items.map((i) => i.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const servicesUrl = user ? `${window.location.origin}/p/${user.username}/services` : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Catalog & Menu
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add products, food menus, services, or digital items to your profile
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* QR Code Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <QrCode className="w-4 h-4" /> QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" /> Services QR Code
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="p-6 bg-white rounded-2xl shadow-lg" id="qr-code-container">
                  <QRCodeSVG
                    value={servicesUrl}
                    size={220}
                    level="H"
                    includeMargin
                    fgColor="#1a1a1a"
                    bgColor="#ffffff"
                  />
                  <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                    Scan to view {user?.username}'s catalog
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Input value={servicesUrl} readOnly className="text-xs" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(servicesUrl);
                      toast.success("Link copied!");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const svg = document.querySelector("#qr-code-container svg");
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement("canvas");
                      canvas.width = 440; canvas.height = 440;
                      const ctx = canvas.getContext("2d");
                      const img = new Image();
                      img.onload = () => {
                        ctx?.drawImage(img, 0, 0);
                        const a = document.createElement("a");
                        a.download = `${user?.username}-qr-code.png`;
                        a.href = canvas.toDataURL("image/png");
                        a.click();
                      };
                      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PNG
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (!printWindow) return;
                      const svg = document.querySelector("#qr-code-container")?.innerHTML || "";
                      printWindow.document.write(`
                        <html><head><title>QR Code - ${user?.username}</title>
                        <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif}
                        .container{text-align:center;padding:40px}p{font-size:14px;color:#666;margin-top:16px}</style></head>
                        <body><div class="container">${svg}<p>Scan to view catalog · linkvertex.com/p/${user?.username}/services</p></div></body></html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Print this QR code and display it at your store, gym, or restaurant. Customers can scan it to see your full menu/services.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={() => { resetForm(); setEditingId(null); setShowAdd(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>

          <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 hover:bg-primary/5 text-primary">
                <Sparkles className="w-4 h-4" /> Load Demo Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" /> Load Sample Catalog
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose a niche to pre-populate your catalog with 15 high-quality sample items including images, descriptions, and prices.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {MOCK_CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant="outline"
                      className="justify-start h-12 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      onClick={() => handleBulkAdd(cat)}
                      disabled={importingDemo}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">15 Items</span>
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                {importingDemo && (
                  <div className="flex items-center justify-center gap-2 text-primary text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Importing catalog...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-5 space-y-4 border-primary/30 border-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <Select value={form.item_type} onValueChange={(v) => setForm((f) => ({ ...f, item_type: v as ItemType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="w-4 h-4" /> {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g. Appetizers, Premium Plan, T-Shirts..."
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Item name" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe this item..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" placeholder="29.99" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Price Label (optional)</Label>
                  <Input placeholder="e.g. /month, Starting at, Free" value={form.price_label} onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))} />
                </div>
              </div>

              {/* Service-specific fields */}
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

              {/* Image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image</Label>
                <div className="flex gap-2 items-center">
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  )}
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                    Upload
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="flex-1 h-9 text-xs" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Commerce options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> External Buy Link</Label>
                  <Input placeholder="https://shop.example.com/..." value={form.external_url} onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.allow_order_form} onCheckedChange={(v) => setForm((f) => ({ ...f, allow_order_form: v }))} />
                  <div>
                    <Label className="text-sm">Enable Order Form</Label>
                    <p className="text-[10px] text-muted-foreground">Visitors can submit orders directly</p>
                  </div>
                </div>
              </div>

              {/* Inventory tracking */}
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

              {/* Variants editor */}
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

              {/* Media Gallery Editor */}
              <div className="space-y-4 p-5 rounded-2xl bg-muted/30 border border-primary/10 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-sm font-bold tracking-tight">
                      <ImageIcon className="w-4 h-4 text-primary" /> Visual Gallery
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Add up to 10 images or videos for an auto-scrolling carousel.</p>
                  </div>
                  <Button 
                    size="sm" variant="outline" className="h-8 rounded-xl border-primary/20 hover:bg-primary/5 text-xs"
                    onClick={() => setForm(f => ({ ...f, media: [...f.media, { type: 'image', url: '' }] }))}
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
                        className="flex gap-3 items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm"
                      >
                        <div className="shrink-0">
                          <Select 
                            value={m.type} 
                            onValueChange={(v) => {
                              const updated = [...form.media];
                              updated[mi] = { ...updated[mi], type: v as 'image' | 'video' };
                              setForm(f => ({ ...f, media: updated }));
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
                        <Input 
                          placeholder={m.type === 'image' ? "Image URL (direct link)" : "Video URL (YouTube, Vimeo, or mp4)"}
                          value={m.url} 
                          onChange={(e) => {
                            const updated = [...form.media];
                            updated[mi] = { ...updated[mi], url: e.target.value };
                            setForm(f => ({ ...f, media: updated }));
                          }}
                          className="flex-1 h-9 rounded-lg text-xs border-border/40 focus-visible:ring-primary/20"
                        />
                        <Button 
                          size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          onClick={() => setForm(f => ({ ...f, media: f.media.filter((_, i) => i !== mi) }))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-1" /> {editingId ? "Update" : "Add Item"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); resetForm(); setEditingId(null); }}>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grouped by category */}
      {categories.length === 0 && !showAdd && (
        <Card className="p-8 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Your catalog is empty</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              Add products, food menus, gym packages, or digital items here. They'll automatically appear on your <strong>public profile</strong> for visitors to browse and order.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full"><UtensilsCrossed className="w-3.5 h-3.5" /> Food menus</span>
            <span className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full"><Dumbbell className="w-3.5 h-3.5" /> Service packages</span>
            <span className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full"><ShoppingBag className="w-3.5 h-3.5" /> Products</span>
            <span className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full"><Download className="w-3.5 h-3.5" /> Digital items</span>
          </div>
          <Button onClick={() => { resetForm(); setEditingId(null); setShowAdd(true); }} className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Add Your First Item
          </Button>
        </Card>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        return (
          <div key={cat} className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">{cat}</h2>
            <div className="space-y-2">
              {catItems.map((item) => {
                const Icon = TYPE_ICONS[item.item_type] || ShoppingBag;
                return (
                  <Card
                    key={item.id}
                    className={`p-4 flex items-center gap-4 transition-opacity ${!item.enabled ? "opacity-50" : ""}`}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                        {item.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.price !== null && (
                          <span className="text-sm font-semibold text-primary">
                            ${item.price.toFixed(2)}{item.price_label && ` ${item.price_label}`}
                          </span>
                        )}
                        {item.price === null && item.price_label && (
                          <span className="text-sm font-medium text-muted-foreground">{item.price_label}</span>
                        )}
                        {item.allow_order_form && (
                          <Badge variant="outline" className="text-[10px]"><FileText className="w-3 h-3 mr-1" /> Order Form</Badge>
                        )}
                        {item.external_url && (
                          <Badge variant="outline" className="text-[10px]"><ExternalLink className="w-3 h-3 mr-1" /> Buy Link</Badge>
                        )}
                        {item.track_inventory && (
                          <Badge variant={item.stock_quantity === 0 ? "destructive" : "outline"} className="text-[10px]">
                            {item.stock_quantity === 0 ? "Out of Stock" : `Stock: ${item.stock_quantity}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(item)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3 h-3" /></Button>
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-9 h-5 rounded-full transition-colors ${item.enabled ? "bg-primary" : "bg-muted"} relative`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${item.enabled ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CatalogPage;
