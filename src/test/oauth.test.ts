import { describe, expect, it, vi } from "vitest";
import { beginOAuthSignIn, buildOAuthRedirectUrl, getOAuthErrorMessage } from "@/lib/oauth";

describe("oauth helpers", () => {
  it("builds dashboard redirect URLs without duplicate slashes", () => {
    expect(buildOAuthRedirectUrl("https://biotra.example.com/")).toBe("https://biotra.example.com/dashboard");
    expect(buildOAuthRedirectUrl("https://biotra.example.com")).toBe("https://biotra.example.com/dashboard");
  });

  it("requests OAuth without immediate browser redirect", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://supabase.example.com/auth/v1/authorize?provider=google" },
      error: null,
    });

    const url = await beginOAuthSignIn({
      authClient: { signInWithOAuth },
      provider: "google",
      redirectTo: "https://biotra.example.com/dashboard",
    });

    expect(url).toBe("https://supabase.example.com/auth/v1/authorize?provider=google");
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://biotra.example.com/dashboard",
        skipBrowserRedirect: true,
      },
    });
  });

  it("returns a friendly message when the provider is not enabled", () => {
    const message = getOAuthErrorMessage("Google", new Error("Unsupported provider: provider is not enabled"));

    expect(message).toMatch(/google login isn't enabled/i);
    expect(message).toMatch(/supabase/i);
  });
});
