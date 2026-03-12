export type CheckoutStepKey = "review" | "details" | "payment" | "success";

export const DEFAULT_CHECKOUT_STEP_LABELS: Record<CheckoutStepKey, string> = {
  review: "Review",
  details: "Details",
  payment: "Payment",
  success: "Success",
};

export const DEFAULT_CTA_LABELS: Record<string, string> = {
  physical_product: "Add to Cart",
  physical: "Add to Cart",
  digital_product: "Buy Now",
  digital: "Buy Now",
  service_booking: "Book Now",
  food: "Order Now",
  appointment: "Schedule",
  event_ticket: "Get Ticket",
  course: "Enroll",
  subscription: "Subscribe",
  donation: "Donate",
  lead_form: "Contact",
  video: "Watch",
  music: "Listen",
  external_link: "Open",
  service: "Book Now",
  car: "Book Now",
  boat: "Book Now",
};

export const DEFAULT_ITEM_TYPE_LABELS: Record<string, string> = {
  physical_product: "Physical Product",
  physical: "Physical",
  digital_product: "Digital Product",
  digital: "Digital",
  service_booking: "Service Booking",
  service: "Service",
  appointment: "Appointment",
  event_ticket: "Event Ticket",
  course: "Course",
  subscription: "Subscription",
  donation: "Donation",
  lead_form: "Lead Form",
  video: "Video",
  music: "Music",
  external_link: "External Link",
  food: "Food",
  car: "Car",
  boat: "Boat",
};

const sanitizeStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, raw]) => {
    if (typeof raw === "string" && raw.trim().length > 0) {
      acc[key] = raw.trim();
    }
    return acc;
  }, {});
};

export const getCheckoutStepLabels = (settings: unknown): Record<CheckoutStepKey, string> => {
  const parsed = sanitizeStringRecord((settings as Record<string, unknown> | null)?.checkout_step_labels);
  return {
    review: parsed.review || DEFAULT_CHECKOUT_STEP_LABELS.review,
    details: parsed.details || DEFAULT_CHECKOUT_STEP_LABELS.details,
    payment: parsed.payment || DEFAULT_CHECKOUT_STEP_LABELS.payment,
    success: parsed.success || DEFAULT_CHECKOUT_STEP_LABELS.success,
  };
};

export const getCtaLabels = (settings: unknown): Record<string, string> => ({
  ...DEFAULT_CTA_LABELS,
  ...sanitizeStringRecord((settings as Record<string, unknown> | null)?.cta_label_overrides),
});

export const getCategoryLabels = (settings: unknown): Record<string, string> =>
  sanitizeStringRecord((settings as Record<string, unknown> | null)?.category_label_overrides);

export const getItemTypeLabels = (settings: unknown): Record<string, string> => ({
  ...DEFAULT_ITEM_TYPE_LABELS,
  ...sanitizeStringRecord((settings as Record<string, unknown> | null)?.item_type_label_overrides),
});

const prettifyLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

const resolveFromMap = (map: Record<string, string>, key: string): string | null => {
  if (!key) return null;
  const exact = map[key];
  if (exact) return exact;
  const lower = map[key.toLowerCase()];
  if (lower) return lower;
  const byInsensitiveKey = Object.entries(map).find(([k]) => k.toLowerCase() === key.toLowerCase());
  return byInsensitiveKey?.[1] || null;
};

const CTA_TYPE_ALIASES: Record<string, string> = {
  physical: "physical_product",
  digital: "digital_product",
  service: "service_booking",
  appointment: "appointment",
  event: "event_ticket",
  ticket: "event_ticket",
  course: "course",
  subscription: "subscription",
  donation: "donation",
  lead: "lead_form",
  video: "video",
  music: "music",
  external: "external_link",
  link: "external_link",
  boat: "boat",
  car: "car",
};

export const resolveItemCtaLabel = (itemType: string, settings: unknown, fallback = "Buy Now"): string => {
  const labels = getCtaLabels(settings);
  const normalized = (itemType || "").toLowerCase();
  if (labels[normalized]) return labels[normalized];
  const alias = CTA_TYPE_ALIASES[normalized];
  if (alias && labels[alias]) return labels[alias];
  return fallback;
};

export const resolveCategoryLabel = (category: string, settings: unknown): string => {
  const labels = getCategoryLabels(settings);
  return resolveFromMap(labels, category) || prettifyLabel(category);
};

export const resolveItemTypeLabel = (itemType: string, settings: unknown): string => {
  const labels = getItemTypeLabels(settings);
  const normalized = (itemType || "").toLowerCase();
  const direct = resolveFromMap(labels, normalized) || resolveFromMap(labels, itemType);
  if (direct) return direct;
  const alias = CTA_TYPE_ALIASES[normalized];
  if (alias) {
    const aliasLabel = resolveFromMap(labels, alias);
    if (aliasLabel) return aliasLabel;
  }
  return prettifyLabel(itemType);
};
