import { describe, expect, it } from "vitest";
import { parseScheduledAt, sanitizePostPayload } from "../../backend/src/lib/postScheduling";

describe("parseScheduledAt", () => {
  it("accepts ISO strings and timestamps", () => {
    const fromIso = parseScheduledAt("2026-04-08T10:30:00.000Z");
    const fromNumber = parseScheduledAt(1775644200000);

    expect(fromIso?.scheduledAtIso).toBe("2026-04-08T10:30:00.000Z");
    expect(fromNumber?.scheduledAtMs).toBe(1775644200000);
  });

  it("rejects empty and invalid values", () => {
    expect(parseScheduledAt("")).toBeNull();
    expect(parseScheduledAt("not-a-date")).toBeNull();
    expect(parseScheduledAt(undefined)).toBeNull();
  });
});

describe("sanitizePostPayload", () => {
  it("normalizes valid post payloads", () => {
    const result = sanitizePostPayload({
      content: "  Ship it  ",
      platforms: ["instagram", "", "linkedin"],
      scheduledAt: "2026-04-08T10:30:00.000Z",
    });

    expect(result).toMatchObject({
      content: "Ship it",
      platforms: ["instagram", "linkedin"],
    });
    expect(result?.scheduledAt.scheduledAtIso).toBe("2026-04-08T10:30:00.000Z");
  });

  it("returns null for incomplete payloads", () => {
    expect(sanitizePostPayload({ content: "", platforms: ["instagram"] })).toBeNull();
    expect(sanitizePostPayload({ content: "Hello", platforms: [] })).toBeNull();
    expect(
      sanitizePostPayload({
        content: "Hello",
        platforms: ["instagram"],
        scheduledAt: "invalid",
      })
    ).toBeNull();
  });
});
