import { describe, expect, it } from "vitest";
import { resolveBackendRuntimeConfig } from "../../backend/src/lib/runtimeConfig";

describe("resolveBackendRuntimeConfig", () => {
  it("throws when SUPABASE_URL is missing", () => {
    expect(() =>
      resolveBackendRuntimeConfig({
        SUPABASE_SERVICE_KEY: "svc-key",
      } as NodeJS.ProcessEnv)
    ).toThrow(/SUPABASE_URL/i);
  });

  it("accepts VITE_SUPABASE_URL as a fallback source", () => {
    const config = resolveBackendRuntimeConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "svc-role-key",
    } as NodeJS.ProcessEnv);

    expect(config.supabaseUrl).toBe("https://example.supabase.co");
  });

  it("throws when neither service key env is set", () => {
    expect(() =>
      resolveBackendRuntimeConfig({
        SUPABASE_URL: "https://example.supabase.co",
      } as NodeJS.ProcessEnv)
    ).toThrow(/SUPABASE_SERVICE/i);
  });

  it("enables queues only when REDIS_URL is present", () => {
    const withoutRedis = resolveBackendRuntimeConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_KEY: "svc-key",
    } as NodeJS.ProcessEnv);
    expect(withoutRedis.queuesEnabled).toBe(false);

    const withRedis = resolveBackendRuntimeConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "svc-role-key",
      REDIS_URL: "redis://127.0.0.1:6379",
    } as NodeJS.ProcessEnv);
    expect(withRedis.queuesEnabled).toBe(true);
  });

  it("uses public site URL as a default allowed origin", () => {
    const config = resolveBackendRuntimeConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_KEY: "svc-key",
      PUBLIC_SITE_URL: "https://biotra.example.com",
    } as NodeJS.ProcessEnv);

    expect(config.publicSiteUrl).toBe("https://biotra.example.com");
    expect(config.corsOrigins).toEqual(["https://biotra.example.com"]);
  });
});
