import { useState, useEffect, useMemo, useRef } from "react";
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
import type { CatalogItem, ItemType, ItemVariant } from "@/stores/catalogStore";
import { usePlatformStore } from "@/stores/platformStore";
import { useCatalogItems, useCatalogMutations } from "@/hooks/useCatalogApi";
import { CatalogFormModal } from "@/components/catalog/CatalogFormModal";
import { CatalogGrid, TYPE_ICONS } from "@/components/catalog/CatalogGrid";
import { CatalogQRCodeModal } from "@/components/catalog/CatalogQRCodeModal";
import { CatalogDemoDataModal } from "@/components/catalog/CatalogDemoDataModal";
import { cn } from "@/lib/utils";
import {
  Plus, ShoppingBag, UtensilsCrossed, Dumbbell, Download, Ship, Car,
  Video, Newspaper, Music, MessageSquare, Clapperboard, Loader2, Activity
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_SERVICES } from "@/data/mockCatalogServices";
import { joinCatalogCategory, parseCatalogCategory } from "@/lib/catalogCategory";
import { readCatalogTaxonomy } from "@/lib/catalogTaxonomy";

const TYPE_OPTIONS: { value: string; label: string; icon: typeof ShoppingBag }[] = [
  { value: "physical", label: "Physical Product", icon: ShoppingBag },
  { value: "food", label: "Food / Menu Item", icon: UtensilsCrossed },
  { value: "service", label: "Service / Package", icon: Dumbbell },
  { value: "digital", label: "Digital Product", icon: Download },
  { value: "boat", label: "Boat / Yacht", icon: Ship },
  { value: "car", label: "Car Rental", icon: Car },
  { value: "video", label: "Video", icon: Video },
  { value: "article", label: "Article / News", icon: Newspaper },
  { value: "music", label: "Music / Audio", icon: Music },
  { value: "post", label: "Post / Shoutout", icon: MessageSquare },
  { value: "reel", label: "Short Reel / Video", icon: Clapperboard },
];

type CatalogMediaInput = { type: "image" | "video"; url: string };
type ItemTypeOption = { value: string; label: string; icon: typeof ShoppingBag };
type CatalogManagerView = "all" | "shop" | "content";

const EMPTY_ITEM_TYPE_VALUE = "__lv_item_type_empty__";
const EMPTY_CATEGORY_VALUE = "__lv_category_empty__";
const EMPTY_SUBCATEGORY_VALUE = "__lv_subcategory_empty__";
const SELLABLE_ITEM_TYPE_KEYS = new Set(["physical", "food", "service", "digital", "boat", "car"]);
const CONTENT_ITEM_TYPE_KEYS = new Set(["video", "article", "music", "post", "reel", "blog", "social"]);

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
const toItemTypeLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

const isSellableItemType = (value: string) => SELLABLE_ITEM_TYPE_KEYS.has(normalizeValue(value));

const CatalogPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: items = [], isLoading: loading } = useCatalogItems(user?.user_id);
  const { addItem, updateItem, deleteItem, toggleItem, bulkAddItems } = useCatalogMutations();
  
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [importingDemo, setImportingDemo] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [managerView, setManagerView] = useState<CatalogManagerView>("all");

  useEffect(() => {
    if (!platformInitialized) {
      void fetchPlatformSettings();
    }
  }, [fetchPlatformSettings, platformInitialized]);

  const demoCatalogPacks = useMemo(() => {
    const rawPacks = platformSettings?.demo_catalog_packs;
    if (!rawPacks || typeof rawPacks !== "object" || Array.isArray(rawPacks)) {
      return MOCK_SERVICES;
    }

    const parsed = Object.entries(rawPacks).reduce<Record<string, Record<string, unknown>[]>>((acc, [key, value]) => {
      if (Array.isArray(value)) {
        const demoItems = value.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null);
        if (demoItems.length > 0) {
          acc[key] = demoItems;
        }
      }
      return acc;
    }, {});

    return Object.keys(parsed).length > 0 ? parsed : MOCK_SERVICES;
  }, [platformSettings?.demo_catalog_packs]);

  const demoCategories = useMemo(() => Object.keys(demoCatalogPacks), [demoCatalogPacks]);

  const taxonomyCategories = useMemo(
    () => readCatalogTaxonomy(platformSettings?.demo_catalog_packs),
    [platformSettings?.demo_catalog_packs]
  );

  const itemTypeOptions = useMemo<ItemTypeOption[]>(() => {
    const baseOptions = TYPE_OPTIONS.map((option) => ({ ...option }));
    const baseKeys = new Set(baseOptions.map((option) => normalizeValue(option.value)));
    const customOptions = new Map<string, ItemTypeOption>();

    const addCustomOption = (value: string) => {
      const clean = value.trim();
      if (!clean) return;

      const key = normalizeValue(clean);
      if (baseKeys.has(key) || customOptions.has(key)) return;

      const icon = (TYPE_ICONS as Record<string, typeof ShoppingBag>)[clean] || ShoppingBag;
      customOptions.set(key, {
        value: clean,
        label: toItemTypeLabel(clean),
        icon,
      });
    };

    items.forEach((item) => addCustomOption(item.item_type));

    return [...baseOptions, ...Array.from(customOptions.values()).sort((a, b) => a.label.localeCompare(b.label))];
  }, [items]);

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();

    taxonomyCategories.forEach((entry) => {
      if (entry.name) unique.add(entry.name);
    });

    items.forEach((item) => {
      const parsed = parseCatalogCategory(item.category);
      if (parsed.primary) unique.add(parsed.primary);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [items, taxonomyCategories]);

  const subcategoryOptions = useMemo(() => {
    const baseCategory = editItem?.category ? parseCatalogCategory(editItem.category).primary.toLowerCase() : "";
    const unique = new Set<string>();

    taxonomyCategories.forEach((entry) => {
      if (baseCategory && entry.name.trim().toLowerCase() !== baseCategory) return;
      entry.subcategories.forEach((sub) => {
        if (sub) unique.add(sub);
      });
    });

    items.forEach((item) => {
      const parsed = parseCatalogCategory(item.category);
      if (!parsed.subcategory) return;
      if (baseCategory && parsed.primary.toLowerCase() !== baseCategory) return;
      unique.add(parsed.subcategory);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [editItem?.category, items, taxonomyCategories]);

  const handleSaveItem = async (payload: any, isEdit: boolean) => {
    setSaving(true);
    try {
      if (isEdit && editItem) {
        await updateItem.mutateAsync({ id: editItem.id, data: payload });
        toast.success("Item updated");
      } else {
        await addItem.mutateAsync(payload);
        toast.success("Item added");
      }

      setEditItem(undefined);
      setShowAdd(false);

      if (!isEdit) {
        if (isSellableItemType(payload.item_type)) {
          if (managerView === "content") setManagerView("all");
        } else {
          if (managerView === "shop") setManagerView("all");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditItem(item);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Item deleted");
    } catch (e) {
      // errors handled by mutation hook
    }
  };

  const handleBulkAdd = async (category: string) => {
    if (!user) return;
    setImportingDemo(true);
    try {
      const mockItems = demoCatalogPacks[category];
      if (!mockItems) throw new Error("Category not found");

      await bulkAddItems.mutateAsync(
        mockItems.map((item) =>
          ({
            ...item,
            enabled: true,
            variants: [],
            track_inventory: false,
            stock_quantity: null,
            allow_order_form: true,
          } as Omit<CatalogItem, "id" | "sort_order" | "user_id">)
        )
      );

      toast.success(`Imported ${mockItems.length} items for ${category}!`);
      setShowDemoDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to import demo data");
    } finally {
      setImportingDemo(false);
    }
  };

  const sellableCount = useMemo(() => items.filter((item) => isSellableItemType(item.item_type)).length, [items]);
  const contentCount = items.length - sellableCount;

  const managedItems = useMemo(() => {
    if (managerView === "shop") {
      return items.filter((item) => isSellableItemType(item.item_type));
    }
    if (managerView === "content") {
      return items.filter((item) => !isSellableItemType(item.item_type));
    }
    return items;
  }, [items, managerView]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const servicesUrl = user ? `${window.location.origin}/p/${user.username}/services` : "";

  return (
    <div className="p-6 md:p-10 lg:p-16 space-y-10 bg-background min-h-screen text-foreground selection:bg-primary selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        .airbnb-shadow { box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04); }
        .store-title { font-family: 'Outfit', sans-serif; }
      `}</style>
      
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-card p-10 md:p-14 lg:p-16 shadow-lg mb-12 airbnb-shadow">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-8">
            <div className="flex items-center gap-2.5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Studio Storefront • Live Sync</span>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight store-title">
                Your <br />
                <span className="text-primary italic font-medium">Collections.</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground/60 font-medium tracking-tight max-w-[500px]">
                Manage your vision with professional simplicity. Every item is optimized for global commerce.
              </p>
            </div>

            <div className="flex items-center gap-6">
               {["Premium Hosting", "Secure Checkout", "Global Reach"].map((tag, i) => (
                 <div key={tag} className="flex items-center gap-2.5">
                    {i > 0 && <div className="w-1 h-1 rounded-full bg-primary/20" />}
                    <span className="text-[11px] font-bold text-muted-foreground/30 whitespace-nowrap">{tag}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <CatalogQRCodeModal username={user?.username || ""} servicesUrl={servicesUrl} />
            <CatalogDemoDataModal
              open={showDemoDialog}
              onOpenChange={setShowDemoDialog}
              demoCategories={demoCategories}
              demoCatalogPacks={demoCatalogPacks}
              importingDemo={importingDemo}
              onBulkAdd={handleBulkAdd}
            />
            <Button 
              onClick={() => {
                setEditItem(undefined);
                setShowAdd(true);
              }}
              className="h-14 px-8 rounded-2xl bg-primary hover:bg-foreground text-white font-bold text-[14px] gap-3 shadow-xl shadow-primary/10 transition-all duration-300 active:scale-95 border-none"
            >
              <Plus className="w-5 h-5" /> Host Item
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-xl overflow-x-auto no-scrollbar scrollbar-hide w-full md:w-auto">
          {[
            { id: "all", label: "All Items", count: items.length },
            { id: "shop", label: "Store", count: sellableCount },
            { id: "content", label: "Media Hub", count: contentCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setManagerView(tab.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all duration-300 flex items-center gap-2 whitespace-nowrap",
                managerView === tab.id 
                  ? "bg-white text-black shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[9px] px-2 py-0.5 rounded-md font-bold",
                managerView === tab.id ? "bg-black/10 text-black" : "bg-white/5 text-muted-foreground/30"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-3 text-[11px] font-bold text-muted-foreground/30">
           <Activity className="w-3.5 h-3.5 text-primary" />
           Storefront active and synced.
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <CatalogFormModal
            initialData={editItem}
            itemTypeOptions={itemTypeOptions}
            categoryOptions={categoryOptions}
            subcategoryOptions={subcategoryOptions}
            onSave={handleSaveItem}
            onCancel={() => {
              setShowAdd(false);
              setEditItem(undefined);
            }}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {items.length === 0 && !showAdd && (
        <Card className="p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Your Catalog is Empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Add products, food menus, or digital items. They'll appear on your public profile for visitors to browse.
            </p>
          </div>
          <Button onClick={() => { setEditItem(undefined); setShowAdd(true); }} size="lg" className="px-8">
            <Plus className="w-5 h-5 mr-2" /> 
            Add Your First Item
          </Button>
        </Card>
      )}

      {items.length > 0 && managedItems.length === 0 && !showAdd && (
        <Card className="p-6 text-center space-y-2 border-border/60">
          <h3 className="text-base font-semibold text-foreground">No items in this view</h3>
          <p className="text-sm text-muted-foreground">
            Switch to another manage view or add a new item.
          </p>
        </Card>
      )}

      {managedItems.length > 0 && (
        <CatalogGrid 
          items={managedItems} 
          onEdit={startEdit} 
          onDelete={handleDelete} 
          onToggle={(id, enabled) => toggleItem.mutateAsync({ id, enabled })} 
        />
      )}
    </div>
  );
};

export default CatalogPage;
