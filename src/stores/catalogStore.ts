import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { toast } from "sonner";

export type ItemType = "physical" | "food" | "service" | "digital" | "boat" | "car" | "blog" | "social";
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
  media?: { type: 'image' | 'video', url: string }[];
}

interface CatalogState {
  items: CatalogItem[];
  loading: boolean;
  fetchItems: (userId: string) => Promise<void>;
  addItem: (item: Omit<CatalogItem, "id" | "sort_order">) => Promise<void>;
  updateItem: (id: string, data: Partial<CatalogItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  bulkAddItems: (items: Omit<CatalogItem, "id" | "sort_order" | "user_id">[]) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    if (data) {
      set({
        items: data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          user_id: d.user_id as string,
          title: d.title as string,
          description: (d.description as string) || "",
          price: d.price as number | null,
          price_label: (d.price_label as string) || "",
          image_url: (d.image_url as string) || "",
          category: (d.category as string) || "product",
          item_type: (d.item_type as ItemType) || "physical",
          tags: (d.tags as string[]) || [],
          external_url: (d.external_url as string) || "",
          allow_order_form: (d.allow_order_form as boolean) || false,
          enabled: d.enabled as boolean,
          sort_order: d.sort_order as number,
          variants: (d.variants as ItemVariant[]) || [],
          track_inventory: (d.track_inventory as boolean) || false,
          stock_quantity: d.stock_quantity as number | null,
          duration: (d.duration as string) || "",
          schedule: (d.schedule as string) || "",
          location: (d.location as string) || "",
          media: (d.media as any[]) || [],
        })),
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const sort_order = get().items.length;

    const insertData = {
      user_id: user.id,
      title: item.title,
      description: item.description,
      price: item.price,
      price_label: item.price_label,
      image_url: item.image_url,
      category: item.category,
      item_type: item.item_type,
      tags: item.tags,
      external_url: item.external_url,
      allow_order_form: item.allow_order_form,
      enabled: item.enabled,
      track_inventory: item.track_inventory || false,
      stock_quantity: item.stock_quantity ?? null,
      variants: JSON.parse(JSON.stringify(item.variants || [])),
      media: JSON.parse(JSON.stringify(item.media || [])),
      sort_order,
    };

    const { data, error } = await supabase
      .from("catalog_items")
      .insert(insertData)
      .select()
      .single();

    if (data && !error) {
      const d = data as Record<string, unknown>;
      set({
        items: [...get().items, {
          id: d.id as string,
          user_id: d.user_id as string,
          title: d.title as string,
          description: (d.description as string) || "",
          price: d.price as number | null,
          price_label: (d.price_label as string) || "",
          image_url: (d.image_url as string) || "",
          category: (d.category as string) || "product",
          item_type: (d.item_type as ItemType) || "physical",
          tags: (d.tags as string[]) || [],
          external_url: (d.external_url as string) || "",
          allow_order_form: (d.allow_order_form as boolean) || false,
          enabled: d.enabled as boolean,
          sort_order: d.sort_order as number,
          variants: (d.variants as ItemVariant[]) || [],
          track_inventory: (d.track_inventory as boolean) || false,
          stock_quantity: d.stock_quantity as number | null,
          duration: (d.duration as string) || "",
          schedule: (d.schedule as string) || "",
          location: (d.location as string) || "",
          media: (d.media as any[]) || [],
        }],
      });
      logActivity("catalog_add", `Added item: ${item.title}`);
    }
  },

  updateItem: async (id, data) => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.price_label !== undefined) updateData.price_label = data.price_label;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.item_type !== undefined) updateData.item_type = data.item_type;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.external_url !== undefined) updateData.external_url = data.external_url;
    if (data.allow_order_form !== undefined) updateData.allow_order_form = data.allow_order_form;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.variants !== undefined) updateData.variants = data.variants;
    if (data.track_inventory !== undefined) updateData.track_inventory = data.track_inventory;
    if (data.stock_quantity !== undefined) updateData.stock_quantity = data.stock_quantity;
    if (data.media !== undefined) updateData.media = data.media;

    await supabase.from("catalog_items").update(updateData).eq("id", id);
    set({ items: get().items.map((i) => (i.id === id ? { ...i, ...data } : i)) });
    const item = get().items.find((i) => i.id === id);
    logActivity("catalog_edit", `Updated item: ${item?.title || id}`);
  },

  deleteItem: async (id) => {
    const item = get().items.find((i) => i.id === id);
    await supabase.from("catalog_items").delete().eq("id", id);
    set({ items: get().items.filter((i) => i.id !== id) });
    logActivity("catalog_delete", `Deleted item: ${item?.title || id}`);
  },

  toggleItem: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const enabled = !item.enabled;
    await supabase.from("catalog_items").update({ enabled }).eq("id", id);
    set({ items: get().items.map((i) => (i.id === id ? { ...i, enabled } : i)) });
  },

  bulkAddItems: async (items) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not found in session");
      return;
    }
    set({ loading: true });

    try {
      let lastSortOrder = get().items.length;
      const insertData = items.map(item => ({
        user_id: user.id,
        title: item.title,
        description: item.description,
        price: item.price,
        price_label: item.price_label,
        image_url: item.image_url,
        category: item.category,
        item_type: item.item_type,
        tags: item.tags,
        external_url: item.external_url || "",
        allow_order_form: item.allow_order_form || false,
        enabled: true,
        track_inventory: item.track_inventory || false,
        stock_quantity: item.stock_quantity ?? null,
        variants: JSON.parse(JSON.stringify(item.variants || [])),
        duration: item.duration || "",
        schedule: item.schedule || "",
        location: item.location || "",
        sort_order: lastSortOrder++,
      }));

      console.log("Inserting items:", insertData);

      const { error } = await supabase
        .from("catalog_items")
        .insert(insertData);

      if (error) {
        console.error("Bulk add error details:", error);
        toast.error(`Database error: ${error.message}`);
        throw error;
      }

      await get().fetchItems(user.id);
      logActivity("catalog_bulk_add", `Added ${items.length} items`);
    } catch (err) {
      console.error("Bulk add failure:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
