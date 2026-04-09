import type { CatalogItem, ItemType, ItemVariant } from "@/stores/catalogStore";

// ────────────────────────────────────────────────────────
// Shared catalog utility functions
// Extracted to eliminate duplication between catalogStore.ts and useCatalogApi.ts
// ────────────────────────────────────────────────────────

export const coercePositiveNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
};

export const coerceNonNegativeInteger = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
};

export const sanitizeVariants = (value: unknown): ItemVariant[] => {
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

export const sanitizeMedia = (value: unknown): { type: "image" | "video"; url: string }[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const type = row.type === "video" ? "video" : "image";
      const url = typeof row.url === "string" ? row.url.trim() : "";

      return {
        type: type as "image" | "video",
        url,
      };
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

export const hasMissingMediaColumnError = (error: { message?: string | null; details?: string | null } | null): boolean => {
  const detailText = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return detailText.includes("media") && (detailText.includes("column") || detailText.includes("schema cache"));
};

export const cloneWithoutMedia = <T extends Record<string, unknown>>(value: T): T => {
  if (!Object.prototype.hasOwnProperty.call(value, "media")) {
    return value;
  }

  const cloned = { ...value };
  delete cloned.media;
  return cloned as T;
};
