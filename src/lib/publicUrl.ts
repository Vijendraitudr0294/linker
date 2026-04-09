export const getPublicSiteUrl = () => {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/+$/, "");
  return "";
};
