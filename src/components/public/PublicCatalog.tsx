import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, UtensilsCrossed, Dumbbell, Download, Store, Ship, Car, Layout, Music, Search, ArrowUpDown, PlayCircle, Newspaper, ExternalLink, Video, MessageSquare, Clapperboard, Play, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CatalogItemDetail from "./CatalogItemDetail";
import { usePlatformStore } from "@/stores/platformStore";
import { resolveCategoryLabel, resolveItemCtaLabel, resolveItemTypeLabel } from "@/lib/commerceConfig";
import { parseCatalogCategory } from "@/lib/catalogCategory";

import { 
  CatalogItemData, 
  SortOption, 
  ContentFilter, 
  ContentKind, 
  CatalogDisplayItem, 
  ContentCardItem, 
  SELLABLE_ITEM_TYPES, 
  VIDEO_ITEM_TYPE_HINTS, 
  NEWS_KEYWORDS, 
  RECIPE_KEYWORDS, 
  TYPE_ICONS, 
  inferPlatformLabel, 
  getYouTubeThumbnail, 
  isLikelyVideoUrl, 
  containsKeyword, 
  pickContentSourceUrl, 
  toContentCard, 
  hexToRgb, 
  shiftHex, 
  contrastText 
} from "./catalog/CatalogUtils";
import { CatalogCard } from "./catalog/CatalogCard";
import { CatalogFilters } from "./catalog/CatalogFilters";
import { ContentCard } from "./catalog/ContentCard";
import { useCatalog } from "@/hooks/useCatalog";

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
  compact?: boolean;
}


const PublicCatalog = ({ items, profileUserId, textColor, buttonBg, buttonText, buttonStyle, catalogCardBg, cardBorder, hasPhoto, upiId, compact = false }: PublicCatalogProps) => {
  const settings = usePlatformStore((s) => s.settings);
  const initialized = usePlatformStore((s) => s.initialized);
  const fetchSettings = usePlatformStore((s) => s.fetchSettings);
  const { formatPrice } = useCurrency();

  // 1. Core State Hook Isolation
  const {
    selectedItem, setSelectedItem,
    activeCategory, setActiveCategory,
    activeSubcategory, setActiveSubcategory,
    activeItemType, setActiveItemType,
    sortBy, setSortBy,
    contentFilter, setContentFilter,
    shopPanel, setShopPanel,
    normalizedItems, sellableItems, contentCards,
    hasProducts, hasContent, showContentMode,
    categories, subcategories, itemTypes,
    displayItems, filteredContentCards, contentStats,
    trackEvent
  } = useCatalog(items, profileUserId);

  useEffect(() => {
    if (!initialized) {
      void fetchSettings();
    }
  }, [fetchSettings, initialized]);


  if (normalizedItems.length === 0) return null;

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
  const chipGradientA = buttonBg;
  const chipGradientB = shiftHex(buttonBg, 6);

  return (
    <>
      <div className="w-full"> {/* REDESIGN: Removed bulky outer container */}
        {showContentMode ? (
          <>
            <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-hide", compact && "gap-1.5")}>
              {[
                { key: "all", label: "All", count: contentCards.length },
                { key: "video", label: "Video", count: contentStats.video },
                { key: "reel", label: "Shorts", count: contentStats.reel },
                { key: "news", label: "News", count: contentStats.news },
                { key: "recipe", label: "Recipes", count: contentStats.recipe },
                { key: "music", label: "Music", count: contentStats.music },
                { key: "post", label: "Posts", count: contentStats.post },
                { key: "other", label: "More", count: contentStats.other },
              ].filter(option => option.count > 0).map((option) => (
                <button
                  key={option.key}
                  onClick={() => setContentFilter(option.key as ContentFilter)}
                  className={cn(
                    "font-bold uppercase tracking-widest transition-all shrink-0 border rounded-xl", 
                    compact ? "px-3 py-1.5 text-[9px]" : "px-4 py-2 text-[11px]",
                    getBtnRadius()
                  )}
                  style={{
                    background: contentFilter === option.key ? `linear-gradient(135deg, ${chipGradientA}, ${chipGradientB})` : "rgba(255,255,255,0.04)",
                    color: contentFilter === option.key ? chipTextColor : textColor,
                    borderColor: contentFilter === option.key ? `${buttonBg}80` : `${textColor}10`,
                    boxShadow: contentFilter === option.key ? `0 8px 16px -8px ${buttonBg}66` : "none",
                    opacity: contentFilter === option.key ? 1 : 0.6
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {contentStats.reel > 0 && (contentFilter === "all" || contentFilter === "reel") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className={cn("font-black uppercase tracking-[0.14em]", compact ? "text-[11px]" : "text-sm")} style={{ color: textColor, opacity: 0.9 }}>
                    Reels & Shorts
                  </h3>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-25" />
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
                    {contentCards.filter(c => c.kind === "reel" || (c.kind === "video" && c.title.toLowerCase().includes("reel"))).map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                         const rawItem = normalizedItems.find(i => i.id === item.id);
                         if (rawItem) {
                           void trackEvent(item.id, "click");
                           setSelectedItem(rawItem);
                         }
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "relative shrink-0 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl snap-center group border border-white/10",
                        compact ? "w-[140px]" : "w-[180px] md:w-[220px]"
                      )}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-card/40 backdrop-blur-md">
                          <Clapperboard className={cn("w-12 h-12 text-white/50", compact && "w-8 h-8")} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className={cn(
                           "rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30",
                           compact ? "w-10 h-10" : "w-12 h-12"
                         )}>
                           <Play className="fill-white w-4 h-4 ml-0.5" />
                         </div>
                      </div>
                      <div className={cn("absolute bottom-4 left-4 right-4 text-left", compact && "bottom-3 left-3 right-3")}>
                        <h4 className={cn("text-white text-sm font-bold line-clamp-2 leading-snug drop-shadow-md", compact && "text-[11px]")}>{item.title}</h4>
                        <div className="flex items-center gap-1.5 mt-2 opacity-80">
                           <Clapperboard className={cn("w-3 h-3 text-white", compact && "w-2 h-2")} />
                           <span className={cn("text-[10px] text-white font-bold uppercase tracking-wider", compact && "text-[7px]")}>Watch Reel</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {filteredContentCards.filter(c => c.kind !== "reel").length === 0 && filteredContentCards.length > 0 ? null : filteredContentCards.length === 0 ? (
              <div className="rounded-xl border px-4 py-5 text-sm font-medium" style={{ borderColor: `${textColor}22`, color: `${textColor}B5`, backgroundColor: `${textColor}06` }}>
                No cards in this section yet.
              </div>
            ) : (
              <div className={cn(
                "grid gap-4",
                compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {filteredContentCards.filter(c => c.kind !== "reel").map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    index={index}
                    textColor={textColor}
                    catalogCardBg={catalogCardBg}
                    cardBorder={cardBorder}
                    hasPhoto={hasPhoto}
                    buttonBg={buttonBg}
                    compact={compact}
                    onClick={() => {
                      const rawItem = normalizedItems.find(i => i.id === item.id);
                      if (rawItem) {
                        void trackEvent(item.id, "click");
                        setSelectedItem(rawItem);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <CatalogFilters
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              subcategories={subcategories}
              activeSubcategory={activeSubcategory}
              setActiveSubcategory={setActiveSubcategory}
              itemTypes={itemTypes}
              activeItemType={activeItemType}
              setActiveItemType={setActiveItemType}
              chipGradientA={chipGradientA}
              chipGradientB={chipGradientB}
              chipTextColor={chipTextColor}
              textColor={textColor}
              buttonBg={buttonBg}
              getBtnRadius={getBtnRadius}
              settings={settings}
              compact={compact}
            />

            {displayItems.length === 0 ? (
              <div className="rounded-xl border px-4 py-5 text-sm font-medium" style={{ borderColor: `${textColor}22`, color: `${textColor}B5`, backgroundColor: `${textColor}06` }}>
                No sellable products available yet.
              </div>
            ) : (
              <div 
                className={cn(
                   "grid w-full product-grid items-start", /* CARD EMERGENCY FIX */
                   compact ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3" /* CARD EMERGENCY FIX: 2 col mobile */
                )} 
                style={{ width: '100%' }} /* CARD EMERGENCY FIX: Force fill */
              >
                {displayItems.map((item, index) => (
                  <CatalogCard
                    key={item.id}
                    item={item}
                    index={index}
                    textColor={textColor}
                    catalogCardBg={catalogCardBg}
                    cardBorder={cardBorder}
                    hasPhoto={hasPhoto}
                    chipGradientB={chipGradientB}
                    buttonBg={buttonBg}
                    buttonText={buttonText}
                    settings={settings}
                    formatPrice={formatPrice}
                    compact={compact}
                    onClick={() => {
                      void trackEvent(item.id, "click");
                      setSelectedItem(item);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
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
            onTrackClick={(id) => void trackEvent(id, "click")}
            upiId={upiId}
            cardBg={catalogCardBg}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicCatalog;
