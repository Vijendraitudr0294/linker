import { describe, expect, it } from "vitest";
import { normalizeAnalyticsEvents } from "../../backend/src/lib/eventsPayload";

describe("normalizeAnalyticsEvents", () => {
  it("accepts a single event object and wraps it in a batch", () => {
    const result = normalizeAnalyticsEvents({
      event_type: "link_click",
      entity_id: "abc123",
      user_id: "user-1",
    });

    expect(result).toHaveLength(1);
    expect(result?.[0]).toMatchObject({
      event_type: "link_click",
      entity_id: "abc123",
      user_id: "user-1",
    });
  });

  it("filters out malformed events and enforces the batch limit", () => {
    const result = normalizeAnalyticsEvents([
      { event_type: "link_click", entity_id: "one" },
      { event_type: "", entity_id: "two" },
      { entity_id: "three" },
    ]);

    expect(result).toHaveLength(1);
    expect(result?.[0]?.entity_id).toBe("one");
  });

  it("returns null when nothing valid is left", () => {
    expect(normalizeAnalyticsEvents([])).toBeNull();
    expect(normalizeAnalyticsEvents({ nope: true })).toBeNull();
  });
});
