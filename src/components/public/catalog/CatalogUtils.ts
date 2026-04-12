import { ShoppingBag, UtensilsCrossed, Dumbbell, Download, Ship, Car, Layout, Video, Search, Newspaper, Music, MessageSquare, Clapperboard, QrCode, MapPin } from "lucide-react";

export interface CatalogItemData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  variants?: { label: string; options: string[] }[];
  track_inventory?: boolean;
  stock_quantity?: number | null;
  media?: { type: "image" | "video"; url: string }[];
  display_mode?: "minimal" | "full";
  metadata?: Record<string, any>;
}

export const TYPE_ICONS: Record<string, typeof ShoppingBag> = {
  physical: ShoppingBag,
  food: UtensilsCrossed,
  service: Dumbbell,
  digital: Download,
  boat: Ship,
  car: Car,
  blog: Layout,
  video: Video,
  social: Search,
  article: Newspaper,
  music: Music,
  post: MessageSquare,
  reel: Clapperboard,
  qr: QrCode,
  map: MapPin,
};

export type SortOption = "default" | "price-asc" | "price-desc";
export type ContentFilter = "all" | "video" | "news" | "recipe" | "music" | "reel" | "post" | "other" | "itinerary";
export type ContentKind = Exclude<ContentFilter, "all">;

export type CatalogDisplayItem = CatalogItemData & {
  primaryCategory: string;
  subcategory: string;
};

export type ContentCardItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  platformLabel: string;
  kind: ContentKind;
  displayMode: "minimal" | "full";
  metadata: Record<string, any>;
};

export const SELLABLE_ITEM_TYPES = new Set(["physical", "food", "service", "digital", "boat", "car"]);
export const VIDEO_ITEM_TYPE_HINTS = new Set(["video", "social", "media", "music", "podcast", "reel", "shorts", "clapperboard"]);
export const NEWS_KEYWORDS = ["news", "report", "article", "press", "update", "blog", "newsletter"];
export const RECIPE_KEYWORDS = ["recipe", "cook", "dish", "meal", "kitchen", "food"];

export const inferPlatformLabel = (url: string) => {
  const value = url.toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "YouTube";
  if (value.includes("instagram.com")) return "Instagram";
  if (value.includes("tiktok.com")) return "TikTok";
  if (value.includes("facebook.com") || value.includes("fb.watch")) return "Facebook";
  if (value.includes("twitter.com") || value.includes("x.com")) return "X";
  if (value.includes("vimeo.com")) return "Vimeo";
  if (value.includes("google.com/maps") || value.includes("goo.gl/maps")) return "Google Maps";
  if (value.includes("apple.com/maps")) return "Apple Maps";
  if (value.includes("spotify.com") || value.includes("music.apple.com")) return "Music";
  if (value.includes("play.google.com/store/apps")) return "Play Store";
  if (value.includes("apps.apple.com")) return "App Store";
  return "Web";
};

export const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

export const getYouTubeThumbnail = (url: string) => {
  const match = (url || "").match(YOUTUBE_ID_REGEX);
  if (!match?.[1]) return "";
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
};

export const isLikelyVideoUrl = (value: string) => {
  const url = value.toLowerCase();
  if (!url) return false;
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("instagram.com") ||
    url.includes("tiktok.com") ||
    url.includes("facebook.com") ||
    url.includes("fb.watch") ||
    url.includes("twitter.com") ||
    url.includes("x.com") ||
    url.endsWith(".mp4") ||
    url.endsWith(".webm") ||
    url.endsWith(".mov")
  );
};

export const containsKeyword = (value: string, keywords: string[]) => {
  const haystack = value.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
};

export const pickContentSourceUrl = (item: CatalogDisplayItem) => {
  const external = item.external_url?.trim() || "";
  if (external) return external;
  const mediaVideo = item.media?.find((entry) => entry.type === "video" && entry.url?.trim());
  if (mediaVideo?.url) return mediaVideo.url.trim();
  const mediaAny = item.media?.find((entry) => entry.url?.trim());
  if (mediaAny?.url) return mediaAny.url.trim();
  return "";
};

export const toContentCard = (item: CatalogDisplayItem): ContentCardItem | null => {
  const sourceUrl = pickContentSourceUrl(item);
  const tagsText = (item.tags || []).join(" ");
  const descriptor = `${item.item_type} ${item.title} ${item.description} ${item.primaryCategory} ${item.subcategory} ${tagsText}`.toLowerCase();
  
  const isRecipe = containsKeyword(descriptor, RECIPE_KEYWORDS);
  const isNews = containsKeyword(descriptor, NEWS_KEYWORDS);
  const isVideo = isLikelyVideoUrl(sourceUrl) || (item.media || []).some((entry) => entry.type === "video") || VIDEO_ITEM_TYPE_HINTS.has(item.item_type.toLowerCase());
  const isReel = item.item_type === "reel" || containsKeyword(descriptor, ["reel", "shorts", "vertical"]);
  const isPost = item.item_type === "post" || containsKeyword(descriptor, ["post", "tweet", "shoutout"]);
  const isMusic = item.item_type === "music" || containsKeyword(descriptor, ["music", "song", "audio", "spotify", "soundcloud", "apple music"]);
  const isMap = item.item_type === "map" || containsKeyword(descriptor, ["map", "location", "coordinates", "google maps", "apple maps"]);
  const isQr = item.item_type === "qr" || containsKeyword(descriptor, ["qr", "scan", "code"]);

  const kind: ContentKind = isReel ? "reel" : isMusic ? "music" : isPost ? "post" : isRecipe ? "recipe" : isNews ? "news" : isMap ? "itinerary" : isQr ? "other" : isVideo ? "video" : "other";
  const thumbnailFromSource = getYouTubeThumbnail(sourceUrl);
  const imageUrl = thumbnailFromSource || item.image_url || "";

  if (!sourceUrl && !imageUrl) {
    return null;
  }

  return {
    id: item.id,
    title: item.title || "Untitled",
    description: item.description || "",
    imageUrl,
    sourceUrl,
    platformLabel: sourceUrl ? inferPlatformLabel(sourceUrl) : "Card",
    kind,
    displayMode: item.display_mode || "minimal",
    metadata: item.metadata || {},
  };
};

export const hexToRgb = (hex: string | null | undefined) => {
  if (!hex || typeof hex !== 'string') return null;
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const n = Number.parseInt(normalized, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export const shiftHex = (hex: string | null | undefined, amount: number) => {
  if (!hex) return "#000000";
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r + amount)}${toHex(rgb.g + amount)}${toHex(rgb.b + amount)}`;
};

export const contrastText = (bg: string | null | undefined, fallback: string) => {
  const rgb = hexToRgb(bg);
  if (!rgb) return fallback;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? "#0f1115" : "#ffffff";
};
