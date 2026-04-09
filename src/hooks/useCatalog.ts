import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseCatalogCategory } from "@/lib/catalogCategory";
import { 
  CatalogItemData, 
  CatalogDisplayItem, 
  ContentCardItem, 
  SELLABLE_ITEM_TYPES, 
  toContentCard, 
  SortOption, 
  ContentFilter 
} from "@/components/public/catalog/CatalogUtils";

export const useCatalog = (items: CatalogItemData[], profileUserId: string) => {
  const [selectedItem, setSelectedItem] = useState<CatalogItemData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");
  const [shopPanel, setShopPanel] = useState<"products" | "content">("products");
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());

  const normalizedItems = useMemo<CatalogDisplayItem[]>(() => {
    return items.map((item) => {
      const parsed = parseCatalogCategory(item.category);
      return {
        ...item,
        primaryCategory: parsed.primary,
        subcategory: parsed.subcategory,
      };
    });
  }, [items]);

  const sellableItems = useMemo(
    () => normalizedItems.filter((item) => SELLABLE_ITEM_TYPES.has(item.item_type.toLowerCase())),
    [normalizedItems]
  );

  const contentCards = useMemo(
    () => normalizedItems.filter((item) => !SELLABLE_ITEM_TYPES.has(item.item_type.toLowerCase())).map(toContentCard).filter((item): item is ContentCardItem => Boolean(item)),
    [normalizedItems]
  );

  const hasProducts = sellableItems.length > 0;
  const hasContent = contentCards.length > 0;
  const showContentMode = hasContent && (!hasProducts || shopPanel === "content");

  const trackEvent = async (itemId: string, eventType: "view" | "click") => {
    if (eventType === "view" && trackedViews.has(itemId)) return;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileUserId);
    if (!isUuid) return;

    await supabase.from("catalog_analytics").insert({
      item_id: itemId,
      profile_user_id: profileUserId,
      event_type: eventType,
    });

    if (eventType === "view") {
      setTrackedViews((current) => new Set(current).add(itemId));
    }
  };

  // View tracking is deferred to component-level IntersectionObserver or on explicit interaction.
  // Do NOT eagerly track all items on mount — it causes N concurrent DB inserts.

  const categories = useMemo(() => [...new Set(sellableItems.map((item) => item.primaryCategory))], [sellableItems]);

  const subcategories = useMemo(() => {
    const scoped = activeCategory ? sellableItems.filter((item) => item.primaryCategory === activeCategory) : sellableItems;
    return [...new Set(scoped.map((item) => (item as any).subcategory).filter(Boolean) as string[])];
  }, [sellableItems, activeCategory]);

  const itemTypes = useMemo(() => {
    let scoped = activeCategory ? sellableItems.filter((item) => item.primaryCategory === activeCategory) : sellableItems;
    scoped = activeSubcategory ? scoped.filter((item) => (item as any).subcategory === activeSubcategory) : scoped;
    return [...new Set(scoped.map((item) => item.item_type).filter(Boolean))];
  }, [sellableItems, activeCategory, activeSubcategory]);

  useEffect(() => {
    if (activeItemType && !itemTypes.includes(activeItemType)) {
      setActiveItemType(null);
    }
  }, [activeItemType, itemTypes]);

  useEffect(() => {
    if (activeSubcategory && !subcategories.includes(activeSubcategory)) {
      setActiveSubcategory(null);
    }
  }, [activeSubcategory, subcategories]);

  useEffect(() => {
    if (!hasProducts && hasContent) {
      setShopPanel("content");
    }
    if (!hasContent) {
      setShopPanel("products");
      setContentFilter("all");
    }
  }, [hasProducts, hasContent]);

  useEffect(() => {
    if (showContentMode) {
      setActiveCategory(null);
      setActiveSubcategory(null);
      setActiveItemType(null);
      setSortBy("default");
    }
  }, [showContentMode]);

  const displayItems = useMemo(() => {
    let filtered = activeCategory ? sellableItems.filter((item) => item.primaryCategory === activeCategory) : sellableItems;
    filtered = activeSubcategory ? filtered.filter((item) => (item as any).subcategory === activeSubcategory) : filtered;
    filtered = activeItemType ? filtered.filter((item) => item.item_type === activeItemType) : filtered;

    if (sortBy === "price-asc") {
      filtered = [...filtered].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    if (sortBy === "price-desc") {
      filtered = [...filtered].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return filtered;
  }, [sellableItems, activeCategory, activeSubcategory, activeItemType, sortBy]);

  const filteredContentCards = useMemo(() => {
    if (contentFilter === "all") return contentCards;
    return contentCards.filter((item) => item.kind === contentFilter);
  }, [contentCards, contentFilter]);

  const contentStats = useMemo(
    () => ({
      video: contentCards.filter((item) => item.kind === "video").length,
      news: contentCards.filter((item) => item.kind === "news").length,
      recipe: contentCards.filter((item) => item.kind === "recipe").length,
      music: contentCards.filter((item) => item.kind === "music").length,
      reel: contentCards.filter((item) => item.kind === "reel").length,
      post: contentCards.filter((item) => item.kind === "post").length,
      other: contentCards.filter((item) => item.kind === "other").length,
    }),
    [contentCards]
  );

  return {
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
  };
};
