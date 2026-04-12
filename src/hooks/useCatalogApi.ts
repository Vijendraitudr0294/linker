import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { logActivity } from "@/lib/activityLogger";
import type { CatalogItem, ItemType, ItemVariant } from "@/stores/catalogStore";
import {
  coercePositiveNumber,
  coerceNonNegativeInteger,
  sanitizeVariants,
  sanitizeMedia,
  toCatalogItem,
  hasMissingMediaColumnError,
  cloneWithoutMedia,
} from "@/lib/catalogUtils";

// Re-export toCatalogItem for consumers that imported it from this module
export { toCatalogItem } from "@/lib/catalogUtils";

export const useCatalogItems = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["catalogItems", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("catalog_items")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch catalog items:", error);
        throw error;
      }
      return (data || []).map((entry) => toCatalogItem(entry as Record<string, unknown>));
    },
    enabled: !!userId,
  });
};

export const useCatalogMutations = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["catalogItems", user?.user_id] });

  const addItem = useMutation({
    mutationFn: async (item: Omit<CatalogItem, "id" | "sort_order">) => {
      if (!user?.user_id) throw new Error("Please sign in again");
      
      const currentItems = queryClient.getQueryData<CatalogItem[]>(["catalogItems", user.user_id]) || [];
      const sort_order = currentItems.length;

      const insertData: Record<string, unknown> = {
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
        variants: sanitizeVariants(item.variants),
        duration: item.duration?.trim() || "",
        schedule: item.schedule?.trim() || "",
        location: item.location?.trim() || "",
        media: {
           items: sanitizeMedia(item.media),
           display_mode: item.display_mode || "minimal",
           metadata: item.metadata || {},
        },
        sort_order,
      };

      let { data, error } = await supabase.from("catalog_items").insert(insertData as any).select("*").single();

      if (error && hasMissingMediaColumnError(error)) {
        const fallbackInsert = cloneWithoutMedia(insertData);
        const fallbackResponse = await supabase.from("catalog_items").insert(fallbackInsert as any).select("*").single();
        data = fallbackResponse.data;
        error = fallbackResponse.error;
      }

      if (error || !data) throw new Error(error?.message || "Could not add catalog item");
      
      logActivity("catalog_add", `Added item: ${item.title}`);
      return toCatalogItem(data as Record<string, unknown>);
    },
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message)
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CatalogItem> }) => {
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
      if (data.variants !== undefined) updateData.variants = sanitizeVariants(data.variants);
      if (data.track_inventory !== undefined) updateData.track_inventory = Boolean(data.track_inventory);
      if (data.stock_quantity !== undefined) updateData.stock_quantity = coerceNonNegativeInteger(data.stock_quantity);
      if (data.duration !== undefined) updateData.duration = data.duration.trim();
      if (data.schedule !== undefined) updateData.schedule = data.schedule.trim();
      if (data.location !== undefined) updateData.location = data.location.trim();
      
      if (data.media !== undefined || data.display_mode !== undefined || data.metadata !== undefined) {
        const currentItems = queryClient.getQueryData<CatalogItem[]>(["catalogItems", user?.user_id]) || [];
        const current = currentItems.find(i => i.id === id);
        updateData.media = {
          items: sanitizeMedia(data.media !== undefined ? data.media : current?.media),
          display_mode: data.display_mode !== undefined ? data.display_mode : (current?.display_mode || "minimal"),
          metadata: data.metadata !== undefined ? data.metadata : (current?.metadata || {}),
        };
      }

      let { data: updatedData, error } = await supabase
        .from("catalog_items")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error && hasMissingMediaColumnError(error) && Object.prototype.hasOwnProperty.call(updateData, "media")) {
        const fallbackUpdate = cloneWithoutMedia(updateData);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("catalog_items")
          .update(fallbackUpdate)
          .eq("id", id)
          .select("*")
          .maybeSingle();
        updatedData = fallbackData;
        error = fallbackError;
      }

      if (error || !updatedData) throw new Error(error?.message || "Could not update catalog item");

      logActivity("catalog_edit", `Updated item: ${data.title || id}`);
      return toCatalogItem(updatedData as Record<string, unknown>);
    },
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message)
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalog_items").delete().eq("id", id);
      if (error) throw new Error(error.message || "Could not delete catalog item");
      logActivity("catalog_delete", `Deleted item: ${id}`);
    },
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message)
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("catalog_items").update({ enabled }).eq("id", id);
      if (error) throw new Error(error.message || "Could not update item status");
      return { id, enabled };
    },
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message)
  });

  const bulkAddItems = useMutation({
    mutationFn: async (items: Omit<CatalogItem, "id" | "sort_order" | "user_id">[]) => {
      if (!user?.user_id) throw new Error("Please sign in again");
      
      const currentItems = queryClient.getQueryData<CatalogItem[]>(["catalogItems", user.user_id]) || [];
      let lastSortOrder = currentItems.length;

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
        variants: sanitizeVariants(item.variants),
        duration: item.duration || "",
        schedule: item.schedule || "",
        location: item.location || "",
        media: {
           items: sanitizeMedia(item.media),
           display_mode: (item as any).display_mode || "minimal",
           metadata: (item as any).metadata || {},
        },
        sort_order: lastSortOrder++,
      }));

      let { error } = await supabase.from("catalog_items").insert(insertData as any);

      if (error && hasMissingMediaColumnError(error)) {
        const fallbackRows = insertData.map((entry) => cloneWithoutMedia(entry));
        const { error: fallbackError } = await supabase.from("catalog_items").insert(fallbackRows as any);
        error = fallbackError;
      }

      if (error) throw new Error(error.message || "Could not import catalog");

      logActivity("catalog_bulk_add", `Added ${items.length} items`);
    },
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(error.message)
  });

  return { addItem, updateItem, deleteItem, toggleItem, bulkAddItems };
};
