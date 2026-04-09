export interface ParsedScheduledAt {
  scheduledAtMs: number;
  scheduledAtIso: string;
}

export interface SanitizedPostPayload {
  content: string;
  platforms: string[];
  scheduledAt: ParsedScheduledAt | null;
}

export const parseScheduledAt = (value: unknown): ParsedScheduledAt | null => {
  if (value === null || value === undefined || value === "") return null;

  let timestamp: number;

  if (value instanceof Date) {
    timestamp = value.getTime();
  } else if (typeof value === "number") {
    timestamp = value;
  } else if (typeof value === "string") {
    timestamp = Date.parse(value);
  } else {
    return null;
  }

  if (!Number.isFinite(timestamp)) return null;

  return {
    scheduledAtMs: timestamp,
    scheduledAtIso: new Date(timestamp).toISOString(),
  };
};

export const sanitizePostPayload = (payload: unknown): SanitizedPostPayload | null => {
  if (typeof payload !== "object" || payload === null) return null;

  const source = payload as Record<string, unknown>;
  const content = typeof source.content === "string" ? source.content.trim() : "";
  const platforms = Array.isArray(source.platforms)
    ? source.platforms.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)
    : [];
  const scheduledAt =
    source.scheduledAt === undefined ? null : parseScheduledAt(source.scheduledAt);

  if (!content || platforms.length === 0) return null;
  if (source.scheduledAt !== undefined && source.scheduledAt !== null && !scheduledAt) return null;

  return {
    content,
    platforms,
    scheduledAt,
  };
};
