import { z } from "zod";
import { CheckoutStepKey } from "@/lib/commerceConfig";

export type StepKey = CheckoutStepKey;

export const SERVICE_TYPES = new Set(["service", "car", "boat"]);
export const CONTENT_TYPES = new Set(["video", "article", "music", "post", "reel", "blog", "social"]);

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone number is required").max(20),
  notes: z.string().trim().max(500, "Note is too long").optional(),
});

export const stepHeadings: Record<StepKey, { title: string; subtitle: string }> = {
  review: { title: "Review Item", subtitle: "Confirm quantity and pricing" },
  details: { title: "Customer Details", subtitle: "Tell us where to send confirmation" },
  payment: { title: "Secure Payment", subtitle: "Verify summary and place your order" },
  success: { title: "Confirmed", subtitle: "Your request has been submitted" },
};

export const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
export const VIMEO_ID_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/i;

export const toEmbedVideoUrl = (value: string): string | null => {
  const url = (value || "").trim();
  if (!url) return null;

  const youtubeMatch = url.match(YOUTUBE_ID_REGEX);
  if (youtubeMatch?.[1]) {
    const id = youtubeMatch[1];
    const isShort = url.includes("/shorts/");
    const params = isShort ? `?autoplay=1&loop=1&playlist=${id}&mute=1` : "?autoplay=1";
    return `https://www.youtube.com/embed/${id}${params}`;
  }

  const vimeoMatch = url.match(VIMEO_ID_REGEX);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return null;
};

export const isEmbedCode = (value: string): boolean => {
  const lower = value.trim().toLowerCase();
  return lower.startsWith("<") && (lower.includes("<iframe") || lower.includes("<script") || lower.includes("<div"));
};

export const getYouTubeThumbnail = (url: string): string | null => {
  const match = (url || "").match(YOUTUBE_ID_REGEX);
  if (!match?.[1]) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
};

export const isDirectVideoFile = (value: string): boolean => {
  const lower = value.trim().toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.endsWith(".m3u8");
};
