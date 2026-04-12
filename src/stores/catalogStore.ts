import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate, Json } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activityLogger";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  coercePositiveNumber,
  coerceNonNegativeInteger,
  sanitizeVariants,
  sanitizeMedia,
  toCatalogItem,
  hasMissingMediaColumnError,
  cloneWithoutMedia,
} from "@/lib/catalogUtils";

export type ItemType = "physical" | "food" | "service" | "digital" | "boat" | "car" | "blog" | "social" | "video" | "article" | "post" | "music" | "reel" | "qr" | "map";
export type ItemCategory = string;

export interface ItemVariant {
  label: string;
  options: string[];
}

export interface CatalogItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: ItemType;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  enabled: boolean;
  sort_order: number;
  variants: ItemVariant[];
  track_inventory: boolean;
  stock_quantity: number | null;
  duration: string;
  schedule: string;
  location: string;
  media?: { type: "image" | "video"; url: string }[];
  display_mode?: "minimal" | "full";
  metadata?: Record<string, any>;
  form_id?: string | null;
}

interface CatalogState {
  items: CatalogItem[];
  loading: boolean;
  fetched: boolean;
  fetchItems: (userId: string, force?: boolean) => Promise<void>;
  addItem: (item: Omit<CatalogItem, "id" | "sort_order">) => Promise<boolean>;
  updateItem: (id: string, data: Partial<CatalogItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  toggleItem: (id: string) => Promise<boolean>;
  bulkAddItems: (items: Omit<CatalogItem, "id" | "sort_order" | "user_id">[]) => Promise<boolean>;
}

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  items: [],
  loading: false,
  fetched: false,

  fetchItems: async (userId: string, force = false) => {
    // Prevent redundant fetches if already loading or if we already have items for this user
    if (get().loading && !force) return;
    if (get().fetched && !force) return;
    if (!userId) return;

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch catalog items:", error);
        toast.error("Could not load catalog items");
        return;
      }

      set({
        items: (data || []).map((entry) => toCatalogItem(entry as Record<string, unknown>)),
        fetched: true,
      });
    } catch (err) {
      console.error("Unexpected error fetching items:", err);
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const user = useAuthStore.getState().user;

    if (!user?.user_id) {
      toast.error("Please sign in again to add catalog items");
      return false;
    }

    const sort_order = get().items.length;

    const insertData: TablesInsert<"catalog_items"> = {
      user_id: user.user_id,
      title: item.title.trim(),
      description: item.description?.trim() || "",
      price: coercePositiveNumber(item.price),
      price_label: item.price_label?.trim() || "",
      image_url: item.image_url?.trim() || "",
      category: item.category?.trim() || "General",
      item_type: item.item_type || "physical",
      tags: Array.isArray(item.tags) ? item.tags : [],
      external_url: item.external_url?.trim() || "",
      allow_order_form: Boolean(item.allow_order_form),
      enabled: item.enabled !== false,
      track_inventory: Boolean(item.track_inventory),
      stock_quantity: item.track_inventory ? coerceNonNegativeInteger(item.stock_quantity) : null,
      variants: sanitizeVariants(item.variants) as unknown as Json,
      duration: item.duration?.trim() || "",
      schedule: item.schedule?.trim() || "",
      location: item.location?.trim() || "",
      media: {
        items: sanitizeMedia(item.media),
        display_mode: item.display_mode || "minimal",
        metadata: item.metadata || {},
        form_id: item.form_id || null,
      } as unknown as Json,
      sort_order,
    };

    let { data, error } = await supabase.from("catalog_items").insert(insertData).select("*").single();

    if (error && hasMissingMediaColumnError(error)) {
      const fallbackInsert = cloneWithoutMedia(insertData);
      const fallbackResponse = await supabase.from("catalog_items").insert(fallbackInsert).select("*").single();
      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }

    if (error || !data) {
      console.error("Catalog add failed:", error);
      toast.error(error?.message || "Could not add catalog item");
      return false;
    }

    set({ items: [...get().items, toCatalogItem(data as Record<string, unknown>)] });
    logActivity("catalog_add", `Added item: ${item.title}`);
    return true;
  },

  updateItem: async (id, data) => {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.price !== undefined) updateData.price = coercePositiveNumber(data.price);
    if (data.price_label !== undefined) updateData.price_label = data.price_label.trim();
    if (data.image_url !== undefined) updateData.image_url = data.image_url.trim();
    if (data.category !== undefined) updateData.category = data.category.trim() || "General";
    if (data.item_type !== undefined) updateData.item_type = data.item_type;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.external_url !== undefined) updateData.external_url = data.external_url.trim();
    if (data.allow_order_form !== undefined) updateData.allow_order_form = data.allow_order_form;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.variants !== undefined) updateData.variants = sanitizeVariants(data.variants) as unknown as Json;
    if (data.track_inventory !== undefined) updateData.track_inventory = Boolean(data.track_inventory);
    if (data.stock_quantity !== undefined) updateData.stock_quantity = coerceNonNegativeInteger(data.stock_quantity);
    if (data.duration !== undefined) updateData.duration = data.duration.trim();
    if (data.schedule !== undefined) updateData.schedule = data.schedule.trim();
    if (data.location !== undefined) updateData.location = data.location.trim();
    if (data.media !== undefined || data.display_mode !== undefined || data.metadata !== undefined) {
      const current = get().items.find((item) => item.id === id);
      updateData.media = {
        items: sanitizeMedia(data.media !== undefined ? data.media : current?.media),
        display_mode: data.display_mode !== undefined ? data.display_mode : (current?.display_mode || "minimal"),
        metadata: data.metadata !== undefined ? data.metadata : (current?.metadata || {}),
      } as unknown as Json;
    }

    let { data: updatedData, error } = await supabase
      .from("catalog_items")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error && hasMissingMediaColumnError(error) && Object.prototype.hasOwnProperty.call(updateData, "media")) {
      const fallbackUpdate = cloneWithoutMedia(updateData);
      const fallbackResponse = await supabase
        .from("catalog_items")
        .update(fallbackUpdate)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      updatedData = fallbackResponse.data;
      error = fallbackResponse.error;
    }

    if (error) {
      console.error("Catalog update failed:", error);
      toast.error(error.message || "Could not update catalog item");
      return false;
    }

    const merged = updatedData
      ? toCatalogItem(updatedData as Record<string, unknown>)
      : get().items.find((item) => item.id === id)
        ? {
            ...get().items.find((item) => item.id === id)!,
            ...data,
          }
        : null;

    if (!merged) {
      console.error("Catalog update failed: Item disappeared during update");
      return false;
    }

    set({
      items: get().items.map((item) => (item.id === id ? (merged as CatalogItem) : item)),
    });

    const current = get().items.find((item) => item.id === id);
    logActivity("catalog_edit", `Updated item: ${current?.title || id}`);
    return true;
  },

  deleteItem: async (id) => {
    const item = get().items.find((entry) => entry.id === id);
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);

    if (error) {
      console.error("Catalog delete failed:", error);
      toast.error(error.message || "Could not delete catalog item");
      return false;
    }

    set({ items: get().items.filter((entry) => entry.id !== id) });
    logActivity("catalog_delete", `Deleted item: ${item?.title || id}`);
    return true;
  },

  toggleItem: async (id) => {
    const item = get().items.find((entry) => entry.id === id);
    if (!item) {
      return false;
    }

    const enabled = !item.enabled;
    const { error } = await supabase.from("catalog_items").update({ enabled }).eq("id", id);

    if (error) {
      console.error("Catalog toggle failed:", error);
      toast.error(error.message || "Could not update item status");
      return false;
    }

    set({
      items: get().items.map((entry) => (entry.id === id ? { ...entry, enabled } : entry)),
    });

    return true;
  },

  bulkAddItems: async (items) => {
    const user = useAuthStore.getState().user;

    if (!user?.user_id) {
      toast.error("Please sign in again to import catalog items");
      return false;
    }

    set({ loading: true });

    try {
      let lastSortOrder = get().items.length;
      const insertData = items.map((item) => ({
        user_id: user.user_id,
        title: item.title,
        description: item.description || "",
        price: coercePositiveNumber(item.price),
        price_label: item.price_label || "",
        image_url: item.image_url || "",
        category: item.category || "General",
        item_type: item.item_type || "physical",
        tags: Array.isArray(item.tags) ? item.tags : [],
        external_url: item.external_url || "",
        allow_order_form: item.allow_order_form || false,
        enabled: true,
        track_inventory: item.track_inventory || false,
        stock_quantity: item.track_inventory ? coerceNonNegativeInteger(item.stock_quantity) : null,
        variants: sanitizeVariants(item.variants) as unknown as Json,
        duration: item.duration || "",
        schedule: item.schedule || "",
        location: item.location || "",
        media: sanitizeMedia(item.media) as unknown as Json,
        sort_order: lastSortOrder++,
      }));

      let { error } = await supabase.from("catalog_items").insert(insertData as any);

      if (error && hasMissingMediaColumnError(error)) {
        const fallbackRows = insertData.map((entry) => cloneWithoutMedia(entry));
        const fallbackInsert = await supabase.from("catalog_items").insert(fallbackRows as any);
        error = fallbackInsert.error;
      }

      if (error) {
        console.error("Bulk add error details:", error);
        toast.error(error.message || "Could not import demo catalog");
        return false;
      }

      await get().fetchItems(user.user_id, true);
      logActivity("catalog_bulk_add", `Added ${items.length} items`);
      return true;
    } catch (err) {
      console.error("Bulk add failure:", err);
      toast.error("Could not import demo catalog");
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));

