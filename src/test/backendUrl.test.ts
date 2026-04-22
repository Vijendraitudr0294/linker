import { describe, expect, it } from "vitest";
import { buildBackendUrlFromBase } from "@/lib/backendUrl";

describe("buildBackendUrlFromBase", () => {
  it("keeps same-origin paths when no backend base URL is configured", () => {
    expect(buildBackendUrlFromBase("", "/api/v1/forms")).toBe("/api/v1/forms");
    expect(buildBackendUrlFromBase(undefined, "api/v1/forms")).toBe("/api/v1/forms");
  });

  it("joins configured backend URLs without double slashes", () => {
    expect(buildBackendUrlFromBase("https://api.example.com/", "/api/v1/forms")).toBe("https://api.example.com/api/v1/forms");
    expect(buildBackendUrlFromBase("https://api.example.com", "api/v1/forms")).toBe("https://api.example.com/api/v1/forms");
  });
});
