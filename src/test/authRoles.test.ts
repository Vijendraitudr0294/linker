import { describe, expect, it } from "vitest";
import { isAdminRole, isAdminUser } from "@/lib/authRoles";

describe("authRoles", () => {
  it("treats admin and superadmin as admin roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("superadmin")).toBe(true);
  });

  it("rejects non-admin roles", () => {
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole("")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it("reads the role from user-shaped objects", () => {
    expect(isAdminUser({ role: "admin" })).toBe(true);
    expect(isAdminUser({ role: "superadmin" })).toBe(true);
    expect(isAdminUser({ role: "user" })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});
