import { z } from "zod";

const EMBED_SRC_PATTERN = /<iframe[^>]+src=(?:"([^"]+)"|'([^']+)')[^>]*>/i;
const SPECIAL_SCHEME_PATTERN = /^(mailto:|tel:)/i;

const toUrlCandidate = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const embedMatch = trimmed.match(EMBED_SRC_PATTERN);
  const embedSrc = embedMatch?.[1] || embedMatch?.[2];
  if (embedSrc) {
    return embedSrc.startsWith("//") ? `https:${embedSrc}` : embedSrc.trim();
  }

  if (SPECIAL_SCHEME_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

const isValidUrlInput = (value: string): boolean => {
  const candidate = toUrlCandidate(value);
  if (!candidate) return false;

  if (SPECIAL_SCHEME_PATTERN.test(candidate)) {
    return true;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((value) => isValidUrlInput(value), {
    message: "Please enter a valid URL or iframe embed code",
  });

export const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(100, "Title must be less than 100 characters");

export const linkSchema = z.object({
  title: titleSchema,
  url: urlSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
});

export const normalizeUrl = (url: string): string => {
  return toUrlCandidate(url);
};
