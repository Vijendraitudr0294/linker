const CATEGORY_SEPARATOR = "::";

const cleanSegment = (value: string | null | undefined): string =>
  (value || "").trim().replace(/\s+/g, " ");

export interface ParsedCatalogCategory {
  raw: string;
  primary: string;
  subcategory: string;
}

export const parseCatalogCategory = (value: string | null | undefined): ParsedCatalogCategory => {
  const raw = cleanSegment(value) || "General";
  const [primaryPart, ...rest] = raw.split(CATEGORY_SEPARATOR);
  const primary = cleanSegment(primaryPart) || "General";
  const subcategory = cleanSegment(rest.join(CATEGORY_SEPARATOR));

  return {
    raw,
    primary,
    subcategory,
  };
};

export const joinCatalogCategory = (primaryValue: string, subcategoryValue?: string): string => {
  const primary = cleanSegment(primaryValue) || "General";
  const subcategory = cleanSegment(subcategoryValue);

  return subcategory ? `${primary}${CATEGORY_SEPARATOR}${subcategory}` : primary;
};

