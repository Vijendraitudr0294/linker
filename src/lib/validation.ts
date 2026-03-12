import { z } from "zod";

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(
    (url) => {
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      // Also allow mailto: and tel: links
      const specialPattern = /^(mailto:|tel:).+/i;
      return urlPattern.test(url) || specialPattern.test(url);
    },
    { message: "Please enter a valid URL (e.g., https://example.com)" }
  );

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
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  
  // Don't modify mailto: or tel: links
  if (trimmed.match(/^(mailto:|tel:)/i)) {
    return trimmed;
  }
  
  // Add https:// if no protocol specified
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
};
