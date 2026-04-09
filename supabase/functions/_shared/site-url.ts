export const getPublicSiteUrl = () => {
  const raw =
    Deno.env.get("PUBLIC_SITE_URL") ||
    Deno.env.get("SITE_URL") ||
    Deno.env.get("VITE_SITE_URL") ||
    "";

  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
};
