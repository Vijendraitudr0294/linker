export interface CatalogTaxonomyCategory {
  name: string;
  subcategories: string[];
}

const TAXONOMY_KEY = "__catalog_taxonomy";

const sanitizeName = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const sanitizeSubcategories = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  const unique = new Set<string>();
  value.forEach((entry) => {
    const clean = sanitizeName(entry);
    if (clean) unique.add(clean);
  });

  return Array.from(unique);
};

export const readCatalogTaxonomy = (demoCatalogPacks: unknown): CatalogTaxonomyCategory[] => {
  if (!demoCatalogPacks || typeof demoCatalogPacks !== "object" || Array.isArray(demoCatalogPacks)) {
    return [];
  }

  const rawNode = (demoCatalogPacks as Record<string, unknown>)[TAXONOMY_KEY];
  if (!rawNode || typeof rawNode !== "object" || Array.isArray(rawNode)) {
    return [];
  }

  const rawCategories = (rawNode as Record<string, unknown>).categories;
  if (!Array.isArray(rawCategories)) {
    return [];
  }

  const normalized = rawCategories
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const row = entry as Record<string, unknown>;
      const name = sanitizeName(row.name);
      if (!name) return null;

      return {
        name,
        subcategories: sanitizeSubcategories(row.subcategories),
      };
    })
    .filter((entry): entry is CatalogTaxonomyCategory => Boolean(entry));

  normalized.sort((a, b) => a.name.localeCompare(b.name));
  normalized.forEach((entry) => entry.subcategories.sort((a, b) => a.localeCompare(b)));
  return normalized;
};

export const writeCatalogTaxonomy = (
  currentDemoCatalogPacks: unknown,
  categories: CatalogTaxonomyCategory[]
): Record<string, unknown> => {
  const base =
    currentDemoCatalogPacks && typeof currentDemoCatalogPacks === "object" && !Array.isArray(currentDemoCatalogPacks)
      ? { ...(currentDemoCatalogPacks as Record<string, unknown>) }
      : {};

  const normalized = categories
    .map((entry) => ({
      name: sanitizeName(entry.name),
      subcategories: sanitizeSubcategories(entry.subcategories),
    }))
    .filter((entry) => entry.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      name: entry.name,
      subcategories: entry.subcategories.sort((a, b) => a.localeCompare(b)),
    }));

  if (normalized.length === 0) {
    delete base[TAXONOMY_KEY];
    return base;
  }

  base[TAXONOMY_KEY] = { categories: normalized };
  return base;
};
