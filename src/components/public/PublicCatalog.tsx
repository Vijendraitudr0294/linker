import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, UtensilsCrossed, Dumbbell, Download, Store, Ship, Car, Layout, Music, Search, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CatalogItemDetail from "./CatalogItemDetail";
import { usePlatformStore } from "@/stores/platformStore";
import { resolveCategoryLabel, resolveItemCtaLabel, resolveItemTypeLabel } from "@/lib/commerceConfig";

interface CatalogItemData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  variants?: { label: string; options: string[] }[];
  track_inventory?: boolean;
  stock_quantity?: number | null;
}

interface PublicCatalogProps {
  items: CatalogItemData[];
  profileUserId: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  buttonStyle: string;
  hasPhoto: boolean;
  upiId?: string;
  catalogCardBg?: string;
  cardBorder?: string;
}

const TYPE_ICONS: Record<string, typeof ShoppingBag> = {
  physical: ShoppingBag,
  food: UtensilsCrossed,
  service: Dumbbell,
  digital: Download,
  boat: Ship,
  car: Car,
  blog: Layout,
  video: Music,
  social: Search,
};

type SortOption = "default" | "price-asc" | "price-desc";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const n = Number.parseInt(normalized, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const shiftHex = (hex: string, amount: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r + amount)}${toHex(rgb.g + amount)}${toHex(rgb.b + amount)}`;
};

const contrastText = (bg: string, fallback: string) => {
  const rgb = hexToRgb(bg);
  if (!rgb) return fallback;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? "#0f1115" : "#ffffff";
};

const PublicCatalog = ({ items, profileUserId, textColor, buttonBg, buttonText, buttonStyle, hasPhoto, upiId, catalogCardBg, cardBorder }: PublicCatalogProps) => {
  const settings = usePlatformStore((s) => s.settings);
  const initialized = usePlatformStore((s) => s.initialized);
  const fetchSettings = usePlatformStore((s) => s.fetchSettings);
  const { formatPrice } = useCurrency();
  const [selectedItem, setSelectedItem] = useState<CatalogItemData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());

  const trackEvent = async (itemId: string, eventType: "view" | "click") => {
    if (eventType === "view" && trackedViews.has(itemId)) return;
    await supabase.from("catalog_analytics").insert({
      item_id: itemId,
      profile_user_id: profileUserId,
      event_type: eventType,
    });
    if (eventType === "view") setTrackedViews((s) => new Set(s).add(itemId));
  };

  useEffect(() => {
    items.forEach((item) => trackEvent(item.id, "view"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (!initialized) {
      void fetchSettings();
    }
  }, [fetchSettings, initialized]);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const itemTypes = useMemo(() => {
    const scoped = activeCategory ? items.filter((i) => i.category === activeCategory) : items;
    return [...new Set(scoped.map((i) => i.item_type).filter(Boolean))];
  }, [items, activeCategory]);

  useEffect(() => {
    if (activeItemType && !itemTypes.includes(activeItemType)) {
      setActiveItemType(null);
    }
  }, [activeItemType, itemTypes]);

  const displayItems = useMemo(() => {
    let filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items;
    filtered = activeItemType ? filtered.filter((i) => i.item_type === activeItemType) : filtered;
    if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return filtered;
  }, [items, activeCategory, activeItemType, sortBy]);

  if (items.length === 0) return null;

  const getBtnRadius = () => {
    switch (buttonStyle) {
      case "pill":
        return "rounded-full";
      case "square":
        return "rounded-none";
      default:
        return "rounded-xl";
    }
  };

  const cycleSortBy = () => {
    setSortBy((prev) => {
      if (prev === "default") return "price-asc";
      if (prev === "price-asc") return "price-desc";
      return "default";
    });
  };

  const sortLabel = sortBy === "price-asc" ? "Price: Low to High" : sortBy === "price-desc" ? "Price: High to Low" : "Default";
  const chipTextColor = contrastText(buttonBg, buttonText);
  const chipGradientA = shiftHex(buttonBg, -8);
  const chipGradientB = shiftHex(buttonBg, 20);

  return (
    <>
      <div
        className="w-full space-y-3 rounded-[1.1rem] border p-3 md:p-3.5 backdrop-blur-xl shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)]"
        style={{
          backgroundColor: hasPhoto ? "rgba(8,12,25,0.2)" : `${buttonBg}0A`,
          borderColor: `${textColor}15`,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Store className="w-4 h-4" style={{ color: textColor, opacity: 0.7 }} />
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.12em] whitespace-nowrap" style={{ color: textColor, opacity: 0.8 }}>
              {categories.length === 1 && items[0]?.item_type === "food" ? "Menu" :
                categories.length === 1 && items[0]?.item_type === "service" ? "Services" : "Shop"}
            </h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0" style={{ backgroundColor: `${buttonBg}20`, color: textColor, borderColor: `${textColor}22` }}>
              {displayItems.length} {displayItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          <button
            onClick={cycleSortBy}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all shrink-0 border rounded-full shadow-sm", getBtnRadius())}
            style={{
              backgroundColor: sortBy !== "default" ? `${buttonBg}12` : "rgba(255,255,255,0.04)",
              color: textColor,
              borderColor: `${textColor}20`,
              opacity: 0.9,
            }}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortLabel}
          </button>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn("px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border rounded-full", getBtnRadius())}
              style={{
                background: !activeCategory ? `linear-gradient(135deg, ${chipGradientA}, ${chipGradientB})` : "rgba(255,255,255,0.06)",
                color: !activeCategory ? chipTextColor : textColor,
                borderColor: !activeCategory ? `${buttonBg}AA` : `${textColor}14`,
                boxShadow: !activeCategory ? `0 6px 18px -10px ${buttonBg}` : "none",
              }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn("px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border rounded-full", getBtnRadius())}
                style={{
                  background: activeCategory === cat ? `linear-gradient(135deg, ${chipGradientA}, ${chipGradientB})` : "rgba(255,255,255,0.06)",
                  color: activeCategory === cat ? chipTextColor : textColor,
                  borderColor: activeCategory === cat ? `${buttonBg}AA` : `${textColor}14`,
                  boxShadow: activeCategory === cat ? `0 6px 18px -10px ${buttonBg}` : "none",
                }}
                >
                  {resolveCategoryLabel(cat, settings)}
                </button>
              ))}
            </div>
        )}

        {itemTypes.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveItemType(null)}
              className={cn("px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border rounded-full", getBtnRadius())}
              style={{
                background: !activeItemType ? `linear-gradient(135deg, ${chipGradientA}, ${chipGradientB})` : "rgba(255,255,255,0.06)",
                color: !activeItemType ? chipTextColor : textColor,
                borderColor: !activeItemType ? `${buttonBg}AA` : `${textColor}14`,
                boxShadow: !activeItemType ? `0 6px 18px -10px ${buttonBg}` : "none",
              }}
            >
              All Types
            </button>
            {itemTypes.map((itemType) => (
              <button
                key={itemType}
                onClick={() => setActiveItemType(itemType)}
                className={cn("px-3.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border rounded-full", getBtnRadius())}
                style={{
                  background: activeItemType === itemType ? `linear-gradient(135deg, ${chipGradientA}, ${chipGradientB})` : "rgba(255,255,255,0.06)",
                  color: activeItemType === itemType ? chipTextColor : textColor,
                  borderColor: activeItemType === itemType ? `${buttonBg}AA` : `${textColor}14`,
                  boxShadow: activeItemType === itemType ? `0 6px 18px -10px ${buttonBg}` : "none",
                }}
              >
                {resolveItemTypeLabel(itemType, settings)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
          {displayItems.map((item, i) => {
            const Icon = TYPE_ICONS[item.item_type] || ShoppingBag;
            const isOutOfStock = item.track_inventory && item.stock_quantity !== null && item.stock_quantity !== undefined && item.stock_quantity <= 0;
            const ctaLabel = resolveItemCtaLabel(item.item_type, settings, item.external_url ? "Open" : "View");
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                onClick={() => {
                  trackEvent(item.id, "click");
                  setSelectedItem(item);
                }}
                className="text-left rounded-[1rem] overflow-hidden transition-all duration-200 hover:-translate-y-1.5 active:scale-[0.98] border group relative flex flex-col"
                style={{
                  backgroundColor: catalogCardBg || (hasPhoto ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.03)"),
                  borderColor: cardBorder || `${textColor}12`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-muted/20">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title as string} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <Icon className="w-10 h-10 md:w-14 md:h-14" style={{ color: textColor }} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-3 w-full space-y-1 text-left">
                  <h3 className="text-[13px] md:text-[15px] font-semibold tracking-[0.3px] line-clamp-1" style={{ color: textColor }}>
                    {item.title as string}
                  </h3>
                  <div className="flex flex-col items-start gap-0.5">
                    {item.price != null && (
                      <span className="text-lg md:text-xl font-bold" style={{ color: chipGradientB }}>
                        {formatPrice(item.price)}
                      </span>
                    )}
                    {item.price_label && !item.price && (
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: textColor }}>
                        {item.price_label}
                      </span>
                    )}
                  </div>
                  <div className="pt-1.5">
                    <span
                      className="inline-flex px-2.5 py-1 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-[0.12em]"
                      style={{
                        borderColor: `${textColor}22`,
                        backgroundColor: `${buttonBg}14`,
                        color: textColor,
                        opacity: isOutOfStock ? 0.55 : 0.9,
                      }}
                    >
                      {isOutOfStock ? "Out of Stock" : ctaLabel}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <CatalogItemDetail
            item={selectedItem}
            profileUserId={profileUserId}
            textColor={textColor}
            buttonBg={buttonBg}
            buttonText={buttonText}
            buttonStyle={buttonStyle}
            hasPhoto={hasPhoto}
            onClose={() => setSelectedItem(null)}
            onTrackClick={(id) => trackEvent(id, "click")}
            upiId={upiId}
            cardBg={catalogCardBg}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicCatalog;
