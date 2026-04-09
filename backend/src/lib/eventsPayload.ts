export interface AnalyticsEventInput {
  event_type: string;
  entity_id: string;
  user_id?: string;
  properties?: Record<string, unknown>;
  occurred_at?: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeSingleEvent = (value: unknown): AnalyticsEventInput | null => {
  if (!isPlainObject(value)) return null;

  const eventType = typeof value.event_type === "string" ? value.event_type.trim() : "";
  const entityId = typeof value.entity_id === "string" ? value.entity_id.trim() : "";
  const userId = typeof value.user_id === "string" ? value.user_id.trim() : undefined;
  const properties = isPlainObject(value.properties) ? value.properties : undefined;

  if (!eventType || !entityId) return null;

  return {
    event_type: eventType,
    entity_id: entityId,
    user_id: userId,
    properties,
    occurred_at: typeof value.occurred_at === "string" ? value.occurred_at : undefined,
  };
};

export const normalizeAnalyticsEvents = (payload: unknown): AnalyticsEventInput[] | null => {
  const values = Array.isArray(payload) ? payload : [payload];
  const normalized = values.map(normalizeSingleEvent).filter((event): event is AnalyticsEventInput => Boolean(event));

  if (normalized.length === 0) return null;

  return normalized.slice(0, 100);
};
