import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { logActivity } from "@/lib/activityLogger";
import type { CatalogItem, ItemType, ItemVariant } from "@/stores/catalogStore";

// Bring in coercions from catalogStore or duplicate them for the API layer to avoid circular deps
const coercePositiveNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
};

const coerceNonNegativeInteger = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
};

const sanitizeVariants = (value: unknown): ItemVariant[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const label = typeof row.label === "string" ? row.label.trim() : "";
      const options = Array.isArray(row.options)
        ? row.options
            .map((option) => (typeof option === "string" ? option.trim() : ""))
            .filter(Boolean)
        : [];
      return { label, options };
    })
    .filter((variant) => variant.label && variant.options.length > 0);
};

const sanitizeMedia = (value: unknown): { type: "image" | "video"; url: string }[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const type = row.type === "video" ? "video" : "image";
      const url = typeof row.url === "string" ? row.url.trim() : "";
      return { type: type as "image" | "video", url };
    })
    .filter((entry) => entry.url.length > 0);
};

export const toCatalogItem = (row: Record<string, unknown>): CatalogItem => ({
  id: (row.id as string) || "",
  user_id: (row.user_id as string) || "",
  title: (row.title as string) || "",
  description: (row.description as string) || "",
  price: coercePositiveNumber(row.price),
  price_label: (row.price_label as string) || "",
  image_url: (row.image_url as string) || "",
  category: (row.category as string) || "General",
  item_type: (row.item_type as ItemType) || "physical",
  tags: Array.isArray(row.tags) ? (row.tags as string[]).filter((tag) => typeof tag === "string") : [],
  external_url: (row.external_url as string) || "",
  allow_order_form: Boolean(row.allow_order_form),
  enabled: row.enabled !== false,
  sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
  variants: sanitizeVariants(row.variants),
  track_inventory: Boolean(row.track_inventory),
  stock_quantity: coerceNonNegativeInteger(row.stock_quantity),
  duration: (row.duration as string) || "",
  schedule: (row.schedule as string) || "",
  location: (row.location as string) || "",
  media: sanitizeMedia(row.media),
});

const hasMissingMediaColumnError = (error: { message?: string | null; details?: string | null } | null): boolean => {
  const detailText = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return detailText.includes("media") && (detailText.includes("column") || detailText.includes("schema cache"));
};

const cloneWithoutMedia = <T extends Record<string, unknown>>(value: T): T => {
  if (!Object.prototype.hasOwnProperty.call(value, "media")) return value;
  const cloned = { ...value };
  delete cloned.media;
  return cloned as T;
};

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
        media: sanitizeMedia(item.media),
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
      if (data.media !== undefined) updateData.media = sanitizeMedia(data.media);

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
        media: sanitizeMedia(item.media),
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
