const normalizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim() || "";
  return trimmed ? trimmed.replace(/\/+$/, "") : "";
};

const normalizePath = (value: string) => {
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
};

export const buildBackendUrlFromBase = (baseUrl: string | null | undefined, path: string) => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPath = normalizePath(path);
  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};

export const getBackendBaseUrl = () =>
  normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL as string | undefined);

export const buildBackendUrl = (path: string) => buildBackendUrlFromBase(getBackendBaseUrl(), path);
