export type BackendRuntimeConfig = {
  supabaseUrl: string;
  supabaseServiceKey: string;
  redisUrl: string | null;
  queuesEnabled: boolean;
  publicSiteUrl: string | null;
  corsOrigins: string[];
};

const readFirstDefined = (env: NodeJS.ProcessEnv, keys: string[]): string | null => {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return null;
};

const readRequired = (env: NodeJS.ProcessEnv, keys: string[]): string => {
  const value = readFirstDefined(env, keys);
  if (!value) {
    throw new Error(`[backend-config] Missing required env: ${keys.join(" or ")}`);
  }
  return value;
};

const parseCorsOrigins = (raw: string | null) =>
  (raw || "http://localhost:8080,http://127.0.0.1:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const resolveBackendRuntimeConfig = (env: NodeJS.ProcessEnv): BackendRuntimeConfig => {
  const supabaseUrl = readRequired(env, ["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const supabaseServiceKey = readRequired(env, ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"]);
  const redisUrl = env.REDIS_URL?.trim() || null;
  const publicSiteUrl = readFirstDefined(env, ["PUBLIC_SITE_URL", "SITE_URL", "FRONTEND_URL", "VITE_SITE_URL"]);
  const corsOrigins = parseCorsOrigins(readFirstDefined(env, ["CORS_ORIGIN", "CORS_ORIGINS"]) || publicSiteUrl);

  return {
    supabaseUrl,
    supabaseServiceKey,
    redisUrl,
    queuesEnabled: Boolean(redisUrl),
    publicSiteUrl,
    corsOrigins,
  };
};
